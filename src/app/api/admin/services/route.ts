import { NextResponse } from 'next/server';
import { execute, query } from '@/lib/db';
import { getClientIp, logActivity, requireAdmin } from '@/lib/auth';
import { serviceSchema } from '@/lib/validation';
import { sanitizeRichHtml } from '@/lib/sanitize';
import { slugify } from '@/lib/utils';
import { revalidatePublicSite } from '@/lib/revalidate';

export async function GET(request: Request) {
  const { error } = await requireAdmin('content.manage');
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const search = (searchParams.get('q') || '').trim();
  const status = searchParams.get('status') || '';

  const conds = [`s.deleted_at IS NULL`];
  const params: unknown[] = [];

  if (search) {
    conds.push(`(s.title LIKE ? OR s.short_description LIKE ?)`);
    params.push(`%${search}%`, `%${search}%`);
  }
  if (status === 'draft' || status === 'published') {
    conds.push(`s.status = ?`);
    params.push(status);
  }

  const [services, categories] = await Promise.all([
    query(
      `SELECT s.*, c.name AS category_name
       FROM services s
       LEFT JOIN service_categories c ON c.id = s.category_id
       WHERE ${conds.join(' AND ')}
       ORDER BY s.display_order ASC, s.id DESC`,
      params
    ),
    query(`SELECT * FROM service_categories ORDER BY display_order ASC, id ASC`),
  ]);

  return NextResponse.json({ services, categories });
}

export async function POST(request: Request) {
  const { user, error } = await requireAdmin('content.manage');
  if (error || !user) return error!;

  try {
    const body = await request.json();
    const parsed = serviceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid service payload' },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const slug = slugify(d.slug || d.title);

    const res = await execute(
      `INSERT INTO services (
        category_id, title, slug, icon, short_description, detailed_content,
        featured_image, banner_image, benefits_json, work_process_json, faqs_json,
        is_featured, status, display_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      ]
    );

    await logActivity({
      adminUserId: user.id,
      action: 'create',
      module: 'services',
      entityId: res.insertId,
      description: `Created service: ${d.title}`,
      ipAddress: getClientIp(request),
    });

    revalidatePublicSite(['/services', `/services/${slug}`]);
    return NextResponse.json({ success: true, id: res.insertId, slug }, { status: 201 });
  } catch (err: any) {
    if (err?.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'A service with this slug already exists' }, { status: 409 });
    }
    console.error('Services POST error:', err);
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
  }
}
