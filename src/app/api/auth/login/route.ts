import { NextResponse } from 'next/server';
import { execute, queryOne } from '@/lib/db';
import {
  createAdminSession,
  getClientIp,
  logActivity,
  setSessionCookie,
  verifyPassword,
} from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { loginSchema } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rate = checkRateLimit(`login:${ip}`, 10, 15 * 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: `Too many login attempts. Try again in ${rate.retryAfterSeconds}s.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid credentials format' },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const user = await queryOne<{
      id: number;
      role_id: number;
      name: string;
      email: string;
      password_hash: string;
      is_active: number;
      failed_login_attempts: number;
      locked_until: string | null;
      role_slug: string;
      role_name: string;
    }>(
      `SELECT u.*, r.slug AS role_slug, r.name AS role_name
       FROM admin_users u
       INNER JOIN roles r ON r.id = u.role_id
       WHERE u.email = ? AND u.deleted_at IS NULL
       LIMIT 1`,
      [email]
    );

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (!user.is_active) {
      return NextResponse.json({ error: 'Account is deactivated. Contact Super Admin.' }, { status: 403 });
    }

    if (user.locked_until && new Date(user.locked_until).getTime() > Date.now()) {
      return NextResponse.json(
        { error: 'Account temporarily locked due to repeated failed attempts.' },
        { status: 423 }
      );
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      const nextAttempts = user.failed_login_attempts + 1;
      const lockUntil = nextAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
      await execute(
        `UPDATE admin_users SET failed_login_attempts = ?, locked_until = ? WHERE id = ?`,
        [nextAttempts, lockUntil, user.id]
      );
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    await execute(
      `UPDATE admin_users SET failed_login_attempts = 0, locked_until = NULL, last_login_at = NOW() WHERE id = ?`,
      [user.id]
    );

    const userAgent = request.headers.get('user-agent');
    const { token, expiresAt } = await createAdminSession(user.id, ip, userAgent);
    await setSessionCookie(token, expiresAt);

    await logActivity({
      adminUserId: user.id,
      action: 'login',
      module: 'auth',
      entityId: user.id,
      description: `Admin signed in: ${user.email}`,
      ipAddress: ip,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roleSlug: user.role_slug,
        roleName: user.role_name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Authentication service unavailable' }, { status: 500 });
  }
}
