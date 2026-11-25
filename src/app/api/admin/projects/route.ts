import { NextResponse } from 'next/server';
import { execute, query } from '@/lib/db';
import { getClientIp, logActivity, requireAdmin } from '@/lib/auth';
import { projectSchema } from '@/lib/validation';
import { sanitizeRichHtml } from '@/lib/sanitize';
import { slugify } from '@/lib/utils';
import { revalidatePublicSite } from '@/lib/revalidate';

export async function GET(request: Request) {
  const { error } = await requireAdmin('content.manage');
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const search = (searchParams.get('q') || '').trim();
  const projectStatus = searchParams.get('project_status') || '';

  const conds = [`p.deleted_at IS NULL`];
  const params: unknown[] = [];

  if (search) {
    conds.push(`(p.title LIKE ? OR p.location LIKE ?)`);
    params.push(`%${search}%`, `%${search}%`);
  }
  if (['upcoming', 'ongoing', 'completed'].includes(projectStatus)) {
    conds.push(`p.project_status = ?`);
    params.push(projectStatus);
  }

  const [projects, categories] = await Promise.all([
    query(
      `SELECT p.*, c.name AS category_name
       FROM projects p
       LEFT JOIN project_categories c ON c.id = p.category_id
       WHERE ${conds.join(' AND ')}
       ORDER BY p.display_order ASC, p.id DESC`,
      params
    ),
    query(`SELECT * FROM project_categories ORDER BY display_order ASC, id ASC`),
  ]);

  return NextResponse.json({ projects, categories });
}

export async function POST(request: Request) {
  const { user, error } = await requireAdmin('content.manage');
  if (error || !user) return error!;

  try {
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

    const res = await execute(
      `INSERT INTO projects (
        category_id, title, slug, location, client_name, show_client_name,
        project_status, is_concept, duration, construction_area, start_date, completion_date,
        short_description, full_description, specifications_json, featured_image,
        before_image, after_image, is_featured, status, display_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        d.category_id ?? null,
        d.title,
        slug,
        d.location,
        d.client_name || null,
        d.show_client_name ? 1 : 0,
        d.project_status,
        d.is_concept !== undefined ? (d.is_concept ? 1 : 0) : 0,
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
      ]
    );

    await logActivity({
      adminUserId: user.id,
      action: 'create',
      module: 'projects',
      entityId: res.insertId,
      description: `Created project: ${d.title}`,
      ipAddress: getClientIp(request),
    });

    revalidatePublicSite(['/projects', `/projects/${slug}`]);
    return NextResponse.json({ success: true, id: res.insertId, slug }, { status: 201 });
  } catch (err: any) {
    if (err?.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'A project with this slug already exists' }, { status: 409 });
    }
    console.error('Projects POST error:', err);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
