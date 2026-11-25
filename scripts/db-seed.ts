import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config();

async function main() {
  const seedPath = path.join(process.cwd(), 'database', 'seed.sql');
  const sql = fs.readFileSync(seedPath, 'utf8');

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'construction',
    multipleStatements: true,
    charset: 'utf8mb4',
  });

  try {
    console.log('Executing database/seed.sql...');
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
