import { NextResponse } from 'next/server';
import { execute, query, queryOne } from '@/lib/db';
import { getClientIp, logActivity, requireAdmin } from '@/lib/auth';
import { projectSchema } from '@/lib/validation';
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
  const project = await queryOne(`SELECT * FROM projects WHERE id = ? AND deleted_at IS NULL LIMIT 1`, [
    Number(id),
  ]);
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  const images = await query(
    `SELECT * FROM project_images WHERE project_id = ? ORDER BY display_order ASC`,
    [Number(id)]
  );
  return NextResponse.json({ project, images });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAdmin('content.manage');
  if (error || !user) return error!;

  try {
    const { id } = await context.params;
    const projectId = Number(id);
    const body = await request.json();
    const parsed = projectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid project data' },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const slug = slugify(d.slug || d.title);

    await execute(
      `UPDATE projects SET
        category_id = ?, title = ?, slug = ?, location = ?, client_name = ?, show_client_name = ?,
        project_status = ?, is_concept = ?, duration = ?, construction_area = ?,
        start_date = ?, completion_date = ?, short_description = ?, full_description = ?,
        specifications_json = ?, featured_image = ?, before_image = ?, after_image = ?,
        is_featured = ?, status = ?, display_order = ?
       WHERE id = ? AND deleted_at IS NULL`,
      [
        d.category_id ?? null,
        d.title,
        slug,
        d.location,
        d.client_name || null,
        d.show_client_name ? 1 : 0,
        d.project_status,
        d.is_concept ? 1 : 0,
        d.duration || null,
        d.construction_area || null,
        d.start_date || null,
        d.completion_date || null,
        d.short_description,
        sanitizeRichHtml(d.full_description),
        d.specifications_json || '{}',
        d.featured_image || null,
        d.before_image || null,
        d.after_image || null,
        d.is_featured ? 1 : 0,
        d.status,
        d.display_order,
        projectId,
      ]
    );

    await logActivity({
      adminUserId: user.id,
      action: 'update',
      module: 'projects',
      entityId: projectId,
      description: `Updated project: ${d.title}`,
      ipAddress: getClientIp(request),
    });

    revalidatePublicSite(['/projects', `/projects/${slug}`]);
    return NextResponse.json({ success: true, slug });
  } catch (err: any) {
    if (err?.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Slug already in use by another project' }, { status: 409 });
    }
    console.error('Project PATCH error:', err);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAdmin('content.manage');
  if (error || !user) return error!;

  const { id } = await context.params;
  const projectId = Number(id);
  await execute(`UPDATE projects SET deleted_at = NOW() WHERE id = ?`, [projectId]);

  await logActivity({
    adminUserId: user.id,
    action: 'delete',
    module: 'projects',
    entityId: projectId,
    description: `Deleted project #${projectId}`,
    ipAddress: getClientIp(request),
  });

  revalidatePublicSite(['/projects']);
  return NextResponse.json({ success: true });
}
