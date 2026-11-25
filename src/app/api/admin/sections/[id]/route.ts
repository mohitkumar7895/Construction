import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { getClientIp, logActivity, requireAdmin } from '@/lib/auth';
import { sanitizeRichHtml } from '@/lib/sanitize';
import { revalidatePublicSite } from '@/lib/revalidate';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAdmin('content.manage');
  if (error || !user) return error!;

  try {
    const { id } = await context.params;
    const sectionId = Number(id);
    const d = await request.json();
    const safeDesc = d.section_type === 'rich_text' ? sanitizeRichHtml(d.description) : d.description || null;

    await execute(
      `UPDATE page_sections SET
        heading = ?, subheading = ?, description = ?, content_json = ?,
        image_url = ?, background_color = ?, background_image_url = ?,
        button_text = ?, button_link = ?, secondary_button_text = ?, secondary_button_link = ?,
        layout_variant = ?, animation_type = ?, is_visible = ?, status = ?, display_order = ?
       WHERE id = ?`,
      [
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
        d.is_visible ? 1 : 0,
        d.status === 'draft' ? 'draft' : 'published',
        Number(d.display_order ?? 0),
        sectionId,
      ]
    );

    await logActivity({
      adminUserId: user.id,
      action: 'update',
      module: 'page_sections',
      entityId: sectionId,
      description: `Updated page section #${sectionId}`,
      ipAddress: getClientIp(request),
    });

    revalidatePublicSite();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Section PATCH error:', err);
    return NextResponse.json({ error: 'Failed to update section' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAdmin('content.manage');
  if (error || !user) return error!;

  const { id } = await context.params;
  const sectionId = Number(id);
  await execute(`DELETE FROM page_sections WHERE id = ?`, [sectionId]);

  await logActivity({
    adminUserId: user.id,
    action: 'delete',
    module: 'page_sections',
    entityId: sectionId,
    description: `Deleted page section #${sectionId}`,
    ipAddress: getClientIp(request),
  });

  revalidatePublicSite();
  return NextResponse.json({ success: true });
}
