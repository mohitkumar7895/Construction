import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { getClientIp, logActivity, requireAdmin } from '@/lib/auth';
import { revalidatePublicSite } from '@/lib/revalidate';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAdmin('content.manage');
  if (error || !user) return error!;

  const { id } = await context.params;
  const itemId = Number(id);
  const d = await request.json();

  await execute(
    `UPDATE gallery_images SET
      category_id = ?, project_id = ?, title = ?, caption = ?, alt_text = ?,
      media_type = ?, media_url = ?, thumbnail_url = ?, is_concept = ?, is_featured = ?,
      status = ?, display_order = ?
     WHERE id = ? AND deleted_at IS NULL`,
    [
      d.category_id ?? null,
      d.project_id ?? null,
      d.title,
      d.caption || null,
      d.alt_text || d.title,
      d.media_type === 'video' ? 'video' : 'image',
      d.media_url,
      d.thumbnail_url || d.media_url,
      d.is_concept ? 1 : 0,
      d.is_featured ? 1 : 0,
      d.status === 'draft' ? 'draft' : 'published',
      Number(d.display_order ?? 0),
      itemId,
    ]
  );

  await logActivity({
    adminUserId: user.id,
    action: 'update',
    module: 'gallery',
    entityId: itemId,
    description: `Updated gallery item #${itemId}`,
    ipAddress: getClientIp(request),
  });

  revalidatePublicSite(['/gallery']);
  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAdmin('content.manage');
  if (error || !user) return error!;

  const { id } = await context.params;
  const itemId = Number(id);
  await execute(`UPDATE gallery_images SET deleted_at = NOW() WHERE id = ?`, [itemId]);

  await logActivity({
    adminUserId: user.id,
    action: 'delete',
    module: 'gallery',
    entityId: itemId,
    description: `Deleted gallery item #${itemId}`,
    ipAddress: getClientIp(request),
  });

  revalidatePublicSite(['/gallery']);
  return NextResponse.json({ success: true });
}
