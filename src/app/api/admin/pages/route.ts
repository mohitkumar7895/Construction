import { NextResponse } from 'next/server';
import { execute, query } from '@/lib/db';
import { getClientIp, logActivity, requireAdmin } from '@/lib/auth';
import { pageSchema } from '@/lib/validation';
import { sanitizeRichHtml } from '@/lib/sanitize';
import { slugify } from '@/lib/utils';
import { revalidatePublicSite } from '@/lib/revalidate';

export async function GET() {
  const { error } = await requireAdmin('content.manage');
  if (error) return error;

  const pages = await query(
    `SELECT * FROM pages WHERE deleted_at IS NULL ORDER BY display_order ASC, id ASC`
  );
  return NextResponse.json({ pages });
}

export async function POST(request: Request) {
  const { user, error } = await requireAdmin('content.manage');
  if (error || !user) return error!;

  try {
    const body = await request.json();
    const parsed = pageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid page data' },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const slug = slugify(d.slug || d.title);
    const sanitizedContent = sanitizeRichHtml(d.content);

    const res = await execute(
      `INSERT INTO pages (
        title, slug, page_type, hero_title, hero_subtitle, hero_image_url,
        content, status, is_indexable, display_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        d.title,
        slug,
        d.page_type,
        d.hero_title || d.title,
        d.hero_subtitle || null,
        d.hero_image_url || null,
        sanitizedContent,
        d.status,
        d.is_indexable !== undefined ? (d.is_indexable ? 1 : 0) : 1,
        d.display_order,
      ]
    );

    await logActivity({
      adminUserId: user.id,
      action: 'create',
      module: 'pages',
      entityId: res.insertId,
      description: `Created page: ${d.title} (/${slug})`,
      ipAddress: getClientIp(request),
    });

    revalidatePublicSite([`/${slug}`]);
    return NextResponse.json({ success: true, id: res.insertId, slug }, { status: 201 });
  } catch (err: any) {
    if (err?.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'A page with this URL slug already exists' }, { status: 409 });
    }
    console.error('Pages POST error:', err);
    return NextResponse.json({ error: 'Failed to create page' }, { status: 500 });
  }
}
