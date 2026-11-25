import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { getDbConnectionConfig } from '../src/lib/db';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config();

async function main() {
  const cfg = getDbConnectionConfig();
  const seedPath = path.join(process.cwd(), 'database', 'seed.sql');
  let sql = fs.readFileSync(seedPath, 'utf8');

  if (cfg.database && cfg.database !== 'construction') {
    sql = sql.replace(/USE `construction`;/i, `USE \`${cfg.database}\`;`);
  }

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
    console.log(`Executing database/seed.sql on ${cfg.host}/${cfg.database}...`);
    await conn.query(sql);
    console.log('Database seed data applied successfully.');
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error('Database seed failed:', err);
  process.exit(1);
});
