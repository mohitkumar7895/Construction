import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { diagnoseDbError, execute, getDbConnectionConfig, queryOne } from '@/lib/db';
import { createAdminSession, getClientIp, hashPassword, setSessionCookie } from '@/lib/auth';

export const runtime = 'nodejs';

const setupAdminSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(150),
  email: z.string().trim().email('Valid email is required').max(191),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  setupKey: z.string().optional(),
});

async function bootstrapSchemaIfMissing(): Promise<void> {
  try {
    await queryOne(`SELECT id FROM admin_users LIMIT 1`);
    return; // Tables already exist
  } catch (err: any) {
    if (err?.code !== 'ER_NO_SUCH_TABLE') throw err;
  }

  const cfg = getDbConnectionConfig();
  const schemaSql = fs
    .readFileSync(path.join(process.cwd(), 'database', 'schema.sql'), 'utf8')
    .replace(/CREATE DATABASE IF NOT EXISTS `construction`[\s\S]*?;/i, '')
    .replace(/USE `construction`;/i, '');
  const seedSql = fs
    .readFileSync(path.join(process.cwd(), 'database', 'seed.sql'), 'utf8')
    .replace(/USE `construction`;/i, '');

  const conn = await mysql.createConnection({
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    password: cfg.password,
    database: cfg.database,
    multipleStatements: true,
    charset: 'utf8mb4',
    ...(cfg.sslEnabled ? { ssl: { rejectUnauthorized: false } } : {}),
  });

  try {
    await conn.query(schemaSql);
    await conn.query(seedSql);
  } finally {
    await conn.end();
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = setupAdminSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid admin setup input' },
        { status: 400 }
      );
    }

    // 1. Auto-create tables + seed data if this is a brand-new empty MySQL database
    await bootstrapSchemaIfMissing();

    // 2. Check if any active admin already exists
    const countRow = await queryOne<{ cnt: number }>(
      `SELECT COUNT(*) AS cnt FROM admin_users WHERE deleted_at IS NULL`
    );
    const existingAdmins = Number(countRow?.cnt ?? 0);

    // If an admin already exists, require AUTH_SECRET as setupKey to create/reset another Super Admin
    if (existingAdmins > 0) {
      const configuredSecret = process.env.AUTH_SECRET?.trim();
      if (!configuredSecret || parsed.data.setupKey?.trim() !== configuredSecret) {
        return NextResponse.json(
          {
            error:
              'An admin account already exists. Enter your AUTH_SECRET in the Setup Key field to create or reset a Super Admin.',
          },
          { status: 403 }
        );
      }
    }

    // Ensure Super Admin role exists
    await execute(
      `INSERT IGNORE INTO roles (id, name, slug, description)
       VALUES (1, 'Super Admin', 'super_admin', 'Full unrestricted access')`
    );

    const { name, email, password } = parsed.data;
    const passwordHash = await hashPassword(password);

    const existing = await queryOne<{ id: number }>(
      `SELECT id FROM admin_users WHERE email = ? LIMIT 1`,
      [email]
    );

    let adminId: number;
    if (existing) {
      await execute(
        `UPDATE admin_users
         SET name = ?, role_id = 1, password_hash = ?, is_active = 1, deleted_at = NULL,
             failed_login_attempts = 0, locked_until = NULL
         WHERE id = ?`,
        [name, passwordHash, existing.id]
      );
      adminId = existing.id;
    } else {
      const res = await execute(
        `INSERT INTO admin_users (role_id, name, email, password_hash, phone, is_active)
         VALUES (1, ?, ?, ?, '+91 9897300398', 1)`,
        [name, email, passwordHash]
      );
      adminId = res.insertId;
    }

    // Immediately sign the new Super Admin in
    const ip = getClientIp(request);
    const userAgent = request.headers.get('user-agent');
    const { token, expiresAt } = await createAdminSession(adminId, ip, userAgent);
    await setSessionCookie(token, expiresAt);

    return NextResponse.json({
      success: true,
      message: 'Super Admin created and signed in successfully!',
      user: { id: adminId, name, email, roleSlug: 'super_admin' },
    });
  } catch (error) {
    console.error('Admin setup error:', error);
    const diag = diagnoseDbError(error);
    return NextResponse.json({ error: diag.message, code: diag.code }, { status: diag.status });
  }
}
