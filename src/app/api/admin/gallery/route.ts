import { NextResponse } from 'next/server';
import { execute, query, withTransaction } from '@/lib/db';
import { getClientIp, logActivity, requireAdmin } from '@/lib/auth';
import { galleryItemSchema } from '@/lib/validation';
import { revalidatePublicSite } from '@/lib/revalidate';

export async function GET() {
  const { error } = await requireAdmin('content.manage');
  if (error) return error;

  const [images, categories, projects] = await Promise.all([
    query(`
      SELECT g.*, c.name AS category_name, p.title AS project_title
      FROM gallery_images g
      LEFT JOIN gallery_categories c ON c.id = g.category_id
      LEFT JOIN projects p ON p.id = g.project_id
      WHERE g.deleted_at IS NULL
      ORDER BY g.display_order ASC, g.id DESC
    `),
    query(`SELECT * FROM gallery_categories ORDER BY display_order ASC, id ASC`),
    query(`SELECT id, title FROM projects WHERE deleted_at IS NULL ORDER BY title ASC`),
  ]);

  return NextResponse.json({ images, categories, projects });
}

export async function POST(request: Request) {
  const { user, error } = await requireAdmin('content.manage');
  if (error || !user) return error!;

  try {
    const body = await request.json();

    if (body.action === 'reorder' && Array.isArray(body.orderedIds)) {
      await withTransaction(async (conn) => {
        for (let i = 0; i < body.orderedIds.length; i++) {
          await conn.execute(`UPDATE gallery_images SET display_order = ? WHERE id = ?`, [
            i + 1,
            Number(body.orderedIds[i]),
          ]);
        }
      });
      revalidatePublicSite(['/gallery']);
      return NextResponse.json({ success: true });
    }

    // Supports both single item or bulk array of items
    const items = Array.isArray(body.items) ? body.items : [body];
    const insertedIds: number[] = [];

    for (const raw of items) {
      const parsed = galleryItemSchema.safeParse(raw);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0]?.message || 'Invalid gallery item' },
          { status: 400 }
        );
      }
      const d = parsed.data;
      const res = await execute(
        `INSERT INTO gallery_images (
          category_id, project_id, title, caption, alt_text,
          media_type, media_url, thumbnail_url, is_concept, is_featured, status, display_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          d.category_id ?? null,
          d.project_id ?? null,
          d.title,
          d.caption || null,
          d.alt_text || d.title,
          d.media_type,
          d.media_url,
          d.thumbnail_url || d.media_url,
          d.is_concept ? 1 : 0,
          d.is_featured ? 1 : 0,
          d.status,
          d.display_order,
        ]
      );
      insertedIds.push(res.insertId);
    }

    await logActivity({
      adminUserId: user.id,
      action: 'create',
      module: 'gallery',
      entityId: insertedIds.join(','),
      description: `Added ${insertedIds.length} gallery item(s)`,
      ipAddress: getClientIp(request),
    });

    revalidatePublicSite(['/gallery']);
    return NextResponse.json({ success: true, ids: insertedIds }, { status: 201 });
  } catch (err) {
    console.error('Gallery POST error:', err);
    return NextResponse.json({ error: 'Failed to add gallery items' }, { status: 500 });
  }
}
