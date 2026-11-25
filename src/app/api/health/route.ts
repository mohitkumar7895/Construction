import { NextResponse } from 'next/server';
import { diagnoseDbError, getDbConnectionConfig, queryOne } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const cfg = getDbConnectionConfig();

  try {
    await queryOne(`SELECT 1 AS ok`);

    let tablesReady = false;
    let adminCount = 0;

    try {
      const row = await queryOne<{ cnt: number }>(
        `SELECT COUNT(*) AS cnt FROM admin_users WHERE deleted_at IS NULL`
      );
      tablesReady = true;
      adminCount = Number(row?.cnt ?? 0);
    } catch {
      tablesReady = false;
    }

    return NextResponse.json({
      ok: tablesReady,
      database: {
        connected: true,
        hostType: cfg.isConfiguredForRemote ? 'remote' : 'local',
        sslEnabled: cfg.sslEnabled,
        databaseName: cfg.database,
        tablesReady,
        adminInitialized: adminCount > 0 || Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_INITIAL_PASSWORD),
        hint: !tablesReady
          ? 'Connected to MySQL, but tables are not created yet. Import database/schema.sql and database/seed.sql.'
          : adminCount === 0 && !process.env.ADMIN_EMAIL
            ? 'No admin users exist yet. Run npm run admin:init or set ADMIN_EMAIL and ADMIN_INITIAL_PASSWORD.'
            : 'Healthy',
      },
    });
  } catch (error) {
    const diag = diagnoseDbError(error);
    const rawMsg = String((error as { sqlMessage?: string; message?: string })?.sqlMessage || (error as { message?: string })?.message || '');
    const safeMysqlDetail = rawMsg.replace(/password\s*=\s*\S+/gi, 'password=***').slice(0, 220);
    return NextResponse.json(
      {
        ok: false,
        database: {
          connected: false,
          configSource: process.env.DATABASE_URL || process.env.MYSQL_URL ? 'DATABASE_URL' : 'DB_*',
          hostType: cfg.isConfiguredForRemote ? 'remote' : 'local',
          sslEnabled: cfg.sslEnabled,
          databaseName: cfg.database,
          userPreview: cfg.user ? `${cfg.user.slice(0, 6)}... (len:${cfg.user.length})` : '(empty)',
          hasPassword: cfg.password.length > 0,
          passwordLength: cfg.password.length,
          code: diag.code,
          mysqlDetail: safeMysqlDetail,
          hint: diag.message,
        },
      },
      { status: 503 }
    );
  }
}
