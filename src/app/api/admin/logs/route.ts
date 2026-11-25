import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  const { error } = await requireAdmin('logs.view');
  if (error) return error;

  const logs = await query(`
    SELECT l.*, u.name AS admin_name, u.email AS admin_email
    FROM activity_logs l
    LEFT JOIN admin_users u ON u.id = l.admin_user_id
    ORDER BY l.created_at DESC
    LIMIT 150
  `);

  return NextResponse.json({ logs });
}
