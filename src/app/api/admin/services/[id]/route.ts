import { NextResponse } from 'next/server';
import { execute, queryOne } from '@/lib/db';
import { getClientIp, logActivity, requireAdmin } from '@/lib/auth';
import { serviceSchema } from '@/lib/validation';
import { sanitizeRichHtml } from '@/lib/sanitize';
import { slugify } from '@/lib/utils';
import { revalidatePublicSite } from '@/lib/revalidate';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin('content.manage');
  if (error) return error;

  const { id } = await context.params;
  const service = await queryOne(`SELECT * FROM services WHERE id = ? AND deleted_at IS NULL LIMIT 1`, [
    Number(id),
  ]);
  if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 });
  return NextResponse.json({ service });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAdmin('content.manage');
  if (error || !user) return error!;

  try {
    const { id } = await context.params;
    const serviceId = Number(id);
    const body = await request.json();
    const parsed = serviceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid service data' },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const slug = slugify(d.slug || d.title);

    await execute(
      `UPDATE services SET
        category_id = ?, title = ?, slug = ?, icon = ?, short_description = ?,
        detailed_content = ?, featured_image = ?, banner_image = ?,
        benefits_json = ?, work_process_json = ?, faqs_json = ?,
        is_featured = ?, status = ?, display_order = ?
       WHERE id = ? AND deleted_at IS NULL`,
      [
        d.category_id ?? null,
        d.title,
        slug,
        d.icon || 'Building2',
        d.short_description,
        sanitizeRichHtml(d.detailed_content),
        d.featured_image || null,
        d.banner_image || null,
        d.benefits_json || '[]',
        d.work_process_json || '[]',
        d.faqs_json || '[]',
        d.is_featured ? 1 : 0,
        d.status,
        d.display_order,
        serviceId,
      ]
    );

    await logActivity({
      adminUserId: user.id,
      action: 'update',
      module: 'services',
      entityId: serviceId,
      description: `Updated service: ${d.title}`,
      ipAddress: getClientIp(request),
    });

    revalidatePublicSite(['/services', `/services/${slug}`]);
    return NextResponse.json({ success: true, slug });
  } catch (err: any) {
    if (err?.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Slug already in use by another service' }, { status: 409 });
    }
    console.error('Service PATCH error:', err);
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAdmin('content.manage');
  if (error || !user) return error!;

  const { id } = await context.params;
  const serviceId = Number(id);
  await execute(`UPDATE services SET deleted_at = NOW() WHERE id = ?`, [serviceId]);

  await logActivity({
    adminUserId: user.id,
    action: 'delete',
    module: 'services',
    entityId: serviceId,
    description: `Deleted service #${serviceId}`,
    ipAddress: getClientIp(request),
  });

  revalidatePublicSite(['/services']);
  return NextResponse.json({ success: true });
}
