import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { execute, query, queryOne } from '@/lib/db';
import type { AdminUserSession } from '@/types';

export const SESSION_COOKIE_NAME = 'sartaj_admin_session';
const SESSION_DURATION_DAYS = 7;
const BCRYPT_ROUNDS = 12;

export function hashToken(token: string): string {
  const secret = process.env.AUTH_SECRET || 'fallback-dev-secret-change-in-prod';
  return crypto.createHmac('sha256', secret).update(token).digest('hex');
}

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/**
 * Automatically bootstraps the initial Super Admin when a freshly imported remote MySQL
 * database has 0 admin_users and ADMIN_EMAIL + ADMIN_INITIAL_PASSWORD are configured in env.
 */
export async function ensureInitialAdminIfEmpty(): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.trim();
  const initialPassword = process.env.ADMIN_INITIAL_PASSWORD;
  if (!email || !initialPassword || initialPassword.length < 8) return;

  const row = await queryOne<{ cnt: number }>(
    `SELECT COUNT(*) AS cnt FROM admin_users WHERE deleted_at IS NULL`
  );
  if (row && Number(row.cnt) > 0) return;

  // Ensure Super Admin role exists before inserting
  await execute(
    `INSERT IGNORE INTO roles (id, name, slug, description)
     VALUES (1, 'Super Admin', 'super_admin', 'Full unrestricted access')`
  );

  const hash = await hashPassword(initialPassword);
  await execute(
    `INSERT INTO admin_users (role_id, name, email, password_hash, phone, is_active)
     VALUES (1, 'Sartaj Hussain', ?, ?, '+91 9897300398', 1)
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), is_active = 1, deleted_at = NULL`,
    [email, hash]
  );
}

export async function createAdminSession(
  adminUserId: number,
  ipAddress: string | null,
  userAgent: string | null
): Promise<{ token: string; expiresAt: Date }> {
  const token = generateSessionToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);

  // Use MySQL NOW() + INTERVAL so session expiry always matches database server clock
  await execute(
    `INSERT INTO admin_sessions (admin_user_id, token_hash, ip_address, user_agent, expires_at)
     VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? DAY))`,
    [adminUserId, tokenHash, ipAddress, userAgent ? userAgent.slice(0, 490) : null, SESSION_DURATION_DAYS]
  );

  await execute(`DELETE FROM admin_sessions WHERE expires_at < NOW()`).catch(() => {});

  return { token, expiresAt };
}

export async function setSessionCookie(token: string, expiresAt: Date): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (existing) {
    const tokenHash = hashToken(existing);
    await execute(`DELETE FROM admin_sessions WHERE token_hash = ?`, [tokenHash]).catch(() => {});
  }
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

export async function getAdminSession(): Promise<AdminUserSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const tokenHash = hashToken(token);
    const row = await queryOne<{
      id: number;
      name: string;
      email: string;
      role_id: number;
      role_slug: string;
      role_name: string;
      avatar_url: string | null;
      is_active: number;
    }>(
      `SELECT u.id, u.name, u.email, u.role_id, r.slug AS role_slug, r.name AS role_name, u.avatar_url, u.is_active
       FROM admin_sessions s
       INNER JOIN admin_users u ON u.id = s.admin_user_id
       INNER JOIN roles r ON r.id = u.role_id
       WHERE s.token_hash = ?
         AND s.expires_at > NOW()
         AND u.deleted_at IS NULL
         AND u.is_active = 1
       LIMIT 1`,
      [tokenHash]
    );

    if (!row) return null;

    const permRows = await query<{ slug: string }>(
      `SELECT p.slug
       FROM role_permissions rp
       INNER JOIN permissions p ON p.id = rp.permission_id
       WHERE rp.role_id = ?`,
      [row.role_id]
    );

    return {
      id: row.id,
      name: row.name,
      email: row.email,
      roleId: row.role_id,
      roleSlug: row.role_slug,
      roleName: row.role_name,
      permissions: permRows.map((p) => p.slug),
      avatarUrl: row.avatar_url,
    };
  } catch {
    return null;
  }
}

export async function requireAdmin(
  requiredPermission?: string
): Promise<{ user: AdminUserSession | null; error: NextResponse | null }> {
  const user = await getAdminSession();
  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: 'Authentication required' }, { status: 401 }),
    };
  }

  if (
    requiredPermission &&
    user.roleSlug !== 'super_admin' &&
    !user.permissions.includes(requiredPermission)
  ) {
    return {
      user: null,
      error: NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 }),
    };
  }

  return { user, error: null };
}

export async function logActivity(params: {
  adminUserId?: number | null;
  action: string;
  module: string;
  entityId?: string | number | null;
  description?: string | null;
  ipAddress?: string | null;
}): Promise<void> {
  try {
    await execute(
      `INSERT INTO activity_logs (admin_user_id, action, module, entity_id, description, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        params.adminUserId ?? null,
        params.action,
        params.module,
        params.entityId != null ? String(params.entityId) : null,
        params.description ?? null,
        params.ipAddress ?? null,
      ]
    );
  } catch {
    // Non-blocking audit log write
  }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || '127.0.0.1';
}
