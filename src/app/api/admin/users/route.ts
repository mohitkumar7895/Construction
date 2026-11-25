import { NextResponse } from 'next/server';
import { execute, query } from '@/lib/db';
import { getClientIp, hashPassword, logActivity, requireAdmin } from '@/lib/auth';
import { adminUserCreateSchema } from '@/lib/validation';

export async function GET() {
  const { error } = await requireAdmin('users.manage');
  if (error) return error;

  const [users, roles] = await Promise.all([
    query(`
      SELECT u.id, u.role_id, u.name, u.email, u.phone, u.is_active, u.last_login_at, u.created_at,
             r.name AS role_name, r.slug AS role_slug
      FROM admin_users u
      INNER JOIN roles r ON r.id = u.role_id
      WHERE u.deleted_at IS NULL
      ORDER BY u.id ASC
    `),
    query(`SELECT * FROM roles ORDER BY id ASC`),
  ]);

  return NextResponse.json({ users, roles });
}

export async function POST(request: Request) {
  const { user, error } = await requireAdmin('users.manage');
  if (error || !user) return error!;

  try {
    const body = await request.json();
    const parsed = adminUserCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid user payload' },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const hash = await hashPassword(d.password);
    const res = await execute(
      `INSERT INTO admin_users (role_id, name, email, password_hash, phone, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [d.role_id, d.name, d.email, hash, d.phone || null, d.is_active !== false ? 1 : 0]
    );

    await logActivity({
      adminUserId: user.id,
      action: 'create',
      module: 'admin_users',
      entityId: res.insertId,
      description: `Created admin user ${d.email}`,
      ipAddress: getClientIp(request),
    });

    return NextResponse.json({ success: true, id: res.insertId }, { status: 201 });
  } catch (err: any) {
    if (err?.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Email is already registered' }, { status: 409 });
    }
    console.error('Admin user create error:', err);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
