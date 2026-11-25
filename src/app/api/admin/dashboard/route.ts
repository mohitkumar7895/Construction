import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  const { error } = await requireAdmin('dashboard.view');
  if (error) return error;

  try {
    const [
      counts,
      monthlyInquiries,
      recentInquiries,
      recentActivity,
    ] = await Promise.all([
      queryOne<{
        total_services: number;
        total_projects: number;
        completed_projects: number;
        ongoing_projects: number;
        total_gallery: number;
        total_inquiries: number;
        new_inquiries: number;
        published_pages: number;
        total_media: number;
      }>(`
        SELECT
          (SELECT COUNT(*) FROM services WHERE deleted_at IS NULL) AS total_services,
          (SELECT COUNT(*) FROM projects WHERE deleted_at IS NULL) AS total_projects,
          (SELECT COUNT(*) FROM projects WHERE deleted_at IS NULL AND project_status = 'completed') AS completed_projects,
          (SELECT COUNT(*) FROM projects WHERE deleted_at IS NULL AND project_status = 'ongoing') AS ongoing_projects,
          (SELECT COUNT(*) FROM gallery_images WHERE deleted_at IS NULL) AS total_gallery,
          (SELECT COUNT(*) FROM inquiries WHERE deleted_at IS NULL) AS total_inquiries,
          (SELECT COUNT(*) FROM inquiries WHERE deleted_at IS NULL AND status = 'new') AS new_inquiries,
          (SELECT COUNT(*) FROM pages WHERE deleted_at IS NULL AND status = 'published') AS published_pages,
          (SELECT COUNT(*) FROM media_library WHERE deleted_at IS NULL) AS total_media
      `),
      query<{ month: string; count: number }>(`
        SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS count
        FROM inquiries
        WHERE deleted_at IS NULL
          AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month ASC
      `),
      query(`
        SELECT id, full_name, phone, email, service_required, project_location, status, created_at
        FROM inquiries
        WHERE deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT 8
      `),
      query(`
        SELECT l.id, l.action, l.module, l.entity_id, l.description, l.ip_address, l.created_at,
               u.name AS admin_name, u.email AS admin_email
        FROM activity_logs l
        LEFT JOIN admin_users u ON u.id = l.admin_user_id
        ORDER BY l.created_at DESC
        LIMIT 12
      `),
    ]);

    return NextResponse.json({
      counts: counts ?? {
        total_services: 0,
        total_projects: 0,
        completed_projects: 0,
        ongoing_projects: 0,
        total_gallery: 0,
        total_inquiries: 0,
        new_inquiries: 0,
        published_pages: 0,
        total_media: 0,
      },
      monthlyInquiries,
      recentInquiries,
      recentActivity,
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    return NextResponse.json({ error: 'Failed to load dashboard data' }, { status: 500 });
  }
}
