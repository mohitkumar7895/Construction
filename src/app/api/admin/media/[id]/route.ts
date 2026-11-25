import fs from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';
import { execute, queryOne } from '@/lib/db';
import { getClientIp, logActivity, requireAdmin } from '@/lib/auth';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAdmin('media.manage');
  if (error || !user) return error!;

  const { id } = await context.params;
  const mediaId = Number(id);
  const d = await request.json();

  await execute(
    `UPDATE media_library SET title = ?, alt_text = ?, caption = ?, folder = ? WHERE id = ?`,
    [d.title || null, d.alt_text || null, d.caption || null, d.folder || 'general', mediaId]
  );

  await logActivity({
    adminUserId: user.id,
    action: 'update',
    module: 'media_library',
    entityId: mediaId,
    description: `Updated media metadata #${mediaId}`,
    ipAddress: getClientIp(request),
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAdmin('media.manage');
  if (error || !user) return error!;

  const { id } = await context.params;
  const mediaId = Number(id);

  const item = await queryOne<{ url: string; webp_url: string | null }>(
    `SELECT url, webp_url FROM media_library WHERE id = ? LIMIT 1`,
    [mediaId]
  );

  if (!item) {
    return NextResponse.json({ error: 'Media item not found' }, { status: 404 });
  }

  await execute(`UPDATE media_library SET deleted_at = NOW() WHERE id = ?`, [mediaId]);

  // Only delete files physically inside /uploads/ (preserve seeded /images/ assets)
  if (item.url.startsWith('/uploads/')) {
    const filePath = path.join(process.cwd(), 'public', item.url);
    await fs.unlink(filePath).catch(() => {});
  }

  await logActivity({
    adminUserId: user.id,
    action: 'delete',
    module: 'media_library',
    entityId: mediaId,
    description: `Deleted media #${mediaId} (${item.url})`,
    ipAddress: getClientIp(request),
  });

  return NextResponse.json({ success: true });
}
