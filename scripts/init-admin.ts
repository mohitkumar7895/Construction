import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import { getDbConnectionConfig } from '../src/lib/db';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_INITIAL_PASSWORD;

  if (!email || !password) {
    console.error('Missing ADMIN_EMAIL or ADMIN_INITIAL_PASSWORD in environment variables.');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('ADMIN_INITIAL_PASSWORD must be at least 8 characters long.');
    process.exit(1);
  }

  const cfg = getDbConnectionConfig();
  const conn = await mysql.createConnection({
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    password: cfg.password,
    database: cfg.database,
    charset: 'utf8mb4',
    ...(cfg.sslEnabled ? { ssl: { rejectUnauthorized: false } } : {}),
  });

  try {
    const hash = await bcrypt.hash(password, 12);
    const [existing] = await conn.execute<mysql.RowDataPacket[]>(
      `SELECT id FROM admin_users WHERE email = ? LIMIT 1`,
      [email]
    );

    if (existing.length > 0) {
      await conn.execute(
        `UPDATE admin_users SET password_hash = ?, is_active = 1, deleted_at = NULL, failed_login_attempts = 0, locked_until = NULL WHERE email = ?`,
        [hash, email]
      );
      console.log(`Super Admin account updated for ${email} on ${cfg.host}/${cfg.database}`);
    } else {
      await conn.execute(
        `INSERT INTO admin_users (role_id, name, email, password_hash, phone, is_active)
         VALUES (1, 'Sartaj Hussain', ?, ?, '+91 9897300398', 1)`,
        [email, hash]
      );
      console.log(`Super Admin account initialized for ${email} on ${cfg.host}/${cfg.database}`);
    }
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error('Admin initialization failed:', err);
  process.exit(1);
});
