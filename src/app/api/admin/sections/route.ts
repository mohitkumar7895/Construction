import { NextResponse } from 'next/server';
import { execute, query, withTransaction } from '@/lib/db';
import { getClientIp, logActivity, requireAdmin } from '@/lib/auth';
import { pageSectionSchema } from '@/lib/validation';
import { sanitizeRichHtml } from '@/lib/sanitize';
import { revalidatePublicSite } from '@/lib/revalidate';

export async function GET(request: Request) {
  const { error } = await requireAdmin('content.manage');
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const pageId = Number(searchParams.get('pageId') || 1);

  const sections = await query(
    `SELECT * FROM page_sections WHERE page_id = ? ORDER BY display_order ASC, id ASC`,
    [pageId]
  );
  return NextResponse.json({ sections });
}

export async function POST(request: Request) {
  const { user, error } = await requireAdmin('content.manage');
  if (error || !user) return error!;

  try {
    const body = await request.json();

    // Handle bulk reorder
    if (body.action === 'reorder' && Array.isArray(body.orderedIds)) {
      await withTransaction(async (conn) => {
        for (let i = 0; i < body.orderedIds.length; i++) {
          await conn.execute(
            `UPDATE page_sections SET display_order = ? WHERE id = ?`,
            [i + 1, Number(body.orderedIds[i])]
          );
        }
      });
      await logActivity({
        adminUserId: user.id,
        action: 'reorder',
        module: 'page_sections',
        description: `Reordered ${body.orderedIds.length} page sections`,
        ipAddress: getClientIp(request),
      });
      revalidatePublicSite();
      return NextResponse.json({ success: true });
    }

    // Handle duplicate section
    if (body.action === 'duplicate' && body.sectionId) {
      const [orig] = await query<any>(`SELECT * FROM page_sections WHERE id = ? LIMIT 1`, [
        Number(body.sectionId),
      ]);
      if (!orig) return NextResponse.json({ error: 'Section not found' }, { status: 404 });

      const res = await execute(
        `INSERT INTO page_sections (
          page_id, section_key, section_type, heading, subheading, description, content_json,
          image_url, background_color, background_image_url, button_text, button_link,
          secondary_button_text, secondary_button_link, layout_variant, animation_type,
          is_visible, status, display_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?)`,
        [
          orig.page_id,
          `${orig.section_key}_copy_${Date.now().toString().slice(-4)}`,
          orig.section_type,
          `${orig.heading || 'Section'} (Copy)`,
          orig.subheading,
          orig.description,
          orig.content_json,
          orig.image_url,
          orig.background_color,
          orig.background_image_url,
          orig.button_text,
          orig.button_link,
          orig.secondary_button_text,
          orig.secondary_button_link,
          orig.layout_variant,
          orig.animation_type,
          orig.is_visible,
          orig.display_order + 1,
        ]
      );
      revalidatePublicSite();
      return NextResponse.json({ success: true, id: res.insertId }, { status: 201 });
    }

    const parsed = pageSectionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid section payload' },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const safeDesc = d.section_type === 'rich_text' ? sanitizeRichHtml(d.description) : d.description || null;

    const res = await execute(
      `INSERT INTO page_sections (
        page_id, section_key, section_type, heading, subheading, description, content_json,
        image_url, background_color, background_image_url, button_text, button_link,
        secondary_button_text, secondary_button_link, layout_variant, animation_type,
        is_visible, status, display_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        d.page_id,
        d.section_key,
        d.section_type,
        d.heading || null,
        d.subheading || null,
        safeDesc,
        d.content_json || null,
        d.image_url || null,
        d.background_color || null,
        d.background_image_url || null,
        d.button_text || null,
        d.button_link || null,
        d.secondary_button_text || null,
        d.secondary_button_link || null,
        d.layout_variant || 'default',
        d.animation_type || 'fade-up',
        d.is_visible !== undefined ? (d.is_visible ? 1 : 0) : 1,
        d.status,
        d.display_order,
      ]
    );

    await logActivity({
      adminUserId: user.id,
      action: 'create',
      module: 'page_sections',
      entityId: res.insertId,
      description: `Added section ${d.section_type} to page #${d.page_id}`,
      ipAddress: getClientIp(request),
    });

    revalidatePublicSite();
    return NextResponse.json({ success: true, id: res.insertId }, { status: 201 });
  } catch (err) {
    console.error('Page section POST error:', err);
    return NextResponse.json({ error: 'Failed to create section' }, { status: 500 });
  }
}
