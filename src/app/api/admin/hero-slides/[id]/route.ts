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

  try {
    const { id } = await context.params;
    const slideId = Number(id);
    const d = await request.json();

    await execute(
      `UPDATE hero_slides SET
        eyebrow = ?, heading = ?, description = ?, image_url = ?, image_alt = ?,
        primary_cta_label = ?, primary_cta_link = ?, secondary_cta_label = ?, secondary_cta_link = ?,
        show_whatsapp_cta = ?, overlay_opacity = ?, animation_preset = ?, is_active = ?, display_order = ?
       WHERE id = ?`,
      [
        d.eyebrow || null,
        d.heading,
        d.description || null,
        d.image_url,
        d.image_alt || d.heading,
        d.primary_cta_label || null,
        d.primary_cta_link || null,
        d.secondary_cta_label || null,
        d.secondary_cta_link || null,
        d.show_whatsapp_cta ? 1 : 0,
        Number(d.overlay_opacity ?? 0.55),
        d.animation_preset || 'zoom-reveal',
        d.is_active ? 1 : 0,
        Number(d.display_order ?? 0),
        slideId,
      ]
    );

    await logActivity({
      adminUserId: user.id,
      action: 'update',
      module: 'hero_slides',
      entityId: slideId,
      description: `Updated hero slide #${slideId}`,
      ipAddress: getClientIp(request),
    });

    revalidatePublicSite(['/']);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Hero slide PATCH error:', err);
    return NextResponse.json({ error: 'Failed to update hero slide' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAdmin('content.manage');
  if (error || !user) return error!;

  const { id } = await context.params;
  const slideId = Number(id);
  await execute(`DELETE FROM hero_slides WHERE id = ?`, [slideId]);

  await logActivity({
    adminUserId: user.id,
    action: 'delete',
    module: 'hero_slides',
    entityId: slideId,
    description: `Deleted hero slide #${slideId}`,
    ipAddress: getClientIp(request),
  });

  revalidatePublicSite(['/']);
  return NextResponse.json({ success: true });
}
