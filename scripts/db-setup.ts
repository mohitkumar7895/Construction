import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { getDbConnectionConfig } from '../src/lib/db';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config();

async function main() {
  const cfg = getDbConnectionConfig();
  const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
  let sql = fs.readFileSync(schemaPath, 'utf8');

  // When running against a managed cloud MySQL DB with a fixed database name,
  // replace hardcoded `construction` database name with the configured target DB name.
  if (cfg.database && cfg.database !== 'construction') {
    sql = sql
      .replace(/CREATE DATABASE IF NOT EXISTS `construction`[\s\S]*?;/i, '')
      .replace(/USE `construction`;/i, `USE \`${cfg.database}\`;`);
  }

  const conn = await mysql.createConnection({
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    password: cfg.password,
    database: cfg.isConfiguredForRemote ? cfg.database : undefined,
    multipleStatements: true,
    charset: 'utf8mb4',
    ...(cfg.sslEnabled ? { ssl: { rejectUnauthorized: false } } : {}),
  });

  try {
    console.log(`Executing database/schema.sql on ${cfg.host}/${cfg.database}...`);
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
