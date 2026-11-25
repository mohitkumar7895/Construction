import { NextResponse } from 'next/server';
import { execute, queryOne } from '@/lib/db';
import {
  getClientIp,
  hashPassword,
  logActivity,
  requireAdmin,
  verifyPassword,
} from '@/lib/auth';
import { changePasswordSchema } from '@/lib/validation';

export async function POST(request: Request) {
  const { user, error } = await requireAdmin();
  if (error || !user) return error!;

  try {
    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid password input' },
        { status: 400 }
      );
    }

    const dbUser = await queryOne<{ password_hash: string }>(
      `SELECT password_hash FROM admin_users WHERE id = ? LIMIT 1`,
      [user.id]
    );
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const matches = await verifyPassword(parsed.data.currentPassword, dbUser.password_hash);
    if (!matches) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    const newHash = await hashPassword(parsed.data.newPassword);
    await execute(`UPDATE admin_users SET password_hash = ? WHERE id = ?`, [newHash, user.id]);

    await logActivity({
      adminUserId: user.id,
      action: 'change_password',
      module: 'auth',
      entityId: user.id,
      description: 'Admin changed account password',
      ipAddress: getClientIp(request),
    });

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
  }
}
