import { NextResponse } from 'next/server';
import { execute, queryOne } from '@/lib/db';
import { getClientIp, logActivity, requireAdmin } from '@/lib/auth';
import { pageSchema } from '@/lib/validation';
import { sanitizeRichHtml } from '@/lib/sanitize';
import { slugify } from '@/lib/utils';
import { revalidatePublicSite } from '@/lib/revalidate';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAdmin('content.manage');
  if (error || !user) return error!;

  try {
    const { id } = await context.params;
    const pageId = Number(id);
    const body = await request.json();
    const parsed = pageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid page data' },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const existing = await queryOne<{ slug: string; page_type: string }>(
      `SELECT slug, page_type FROM pages WHERE id = ? LIMIT 1`,
      [pageId]
    );
    if (!existing) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    const slug = existing.page_type === 'system' ? existing.slug : slugify(d.slug || d.title);
    const sanitizedContent = sanitizeRichHtml(d.content);

    await execute(
      `UPDATE pages SET
        title = ?, slug = ?, hero_title = ?, hero_subtitle = ?, hero_image_url = ?,
        content = ?, status = ?, is_indexable = ?, display_order = ?
       WHERE id = ?`,
      [
        d.title,
        slug,
        d.hero_title || d.title,
        d.hero_subtitle || null,
        d.hero_image_url || null,
        sanitizedContent,
        d.status,
        d.is_indexable !== undefined ? (d.is_indexable ? 1 : 0) : 1,
        d.display_order,
        pageId,
      ]
    );

    await logActivity({
      adminUserId: user.id,
      action: 'update',
      module: 'pages',
      entityId: pageId,
      description: `Updated page: ${d.title}`,
      ipAddress: getClientIp(request),
    });

    revalidatePublicSite([`/${slug}`]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Page PATCH error:', err);
    return NextResponse.json({ error: 'Failed to update page' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAdmin('content.manage');
  if (error || !user) return error!;

  const { id } = await context.params;
  const pageId = Number(id);
  const existing = await queryOne<{ page_type: string; slug: string }>(
    `SELECT page_type, slug FROM pages WHERE id = ? LIMIT 1`,
    [pageId]
  );

  if (!existing) {
    return NextResponse.json({ error: 'Page not found' }, { status: 404 });
  }
  if (existing.page_type === 'system') {
    return NextResponse.json({ error: 'System pages cannot be deleted' }, { status: 400 });
  }

  await execute(`UPDATE pages SET deleted_at = NOW() WHERE id = ?`, [pageId]);

  await logActivity({
    adminUserId: user.id,
    action: 'delete',
    module: 'pages',
    entityId: pageId,
    description: `Soft-deleted custom page /${existing.slug}`,
    ipAddress: getClientIp(request),
  });

  revalidatePublicSite([`/${existing.slug}`]);
  return NextResponse.json({ success: true });
}
