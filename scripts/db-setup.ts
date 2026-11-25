import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config();

async function main() {
  const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
    charset: 'utf8mb4',
  });

  try {
    console.log('Executing database/schema.sql...');
    await conn.query(sql);
    console.log('Database schema applied successfully.');
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error('Database setup failed:', err);
  process.exit(1);
});
