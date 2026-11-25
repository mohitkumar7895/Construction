import mysql, { Pool, PoolConnection, PoolOptions, ResultSetHeader, RowDataPacket } from 'mysql2/promise';

declare global {
  var __mysqlPool: Pool | undefined;
}

function isLocalHost(host: string): boolean {
  const h = host.trim().toLowerCase();
  return h === 'localhost' || h === '127.0.0.1' || h === '::1';
}

function isSslRequiredCloudHost(host: string): boolean {
  const h = host.trim().toLowerCase();
  return (
    h.includes('tidbcloud.com') ||
    h.includes('aivencloud.com') ||
    h.includes('psdb.cloud') ||
    h.includes('rds.amazonaws.com') ||
    h.includes('ondigitalocean.com') ||
    h.includes('azure.com') ||
    h.includes('filess.io')
  );
}

function cleanEnv(val: string | undefined, fallback = ''): string {
  if (!val) return fallback;
  return val.trim().replace(/^['"]|['"]$/g, '');
}

export function getDbConnectionConfig(): {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  sslEnabled: boolean;
  isConfiguredForRemote: boolean;
} {
  const databaseUrl = cleanEnv(process.env.DATABASE_URL || process.env.MYSQL_URL);

  if (databaseUrl) {
    try {
      const parsed = new URL(databaseUrl);
      const host = parsed.hostname || 'localhost';
      const port = Number(parsed.port || 3306);
      const user = decodeURIComponent(parsed.username || 'root');
      const password = decodeURIComponent(parsed.password || '');
      const database = parsed.pathname.replace(/^\/+/, '') || cleanEnv(process.env.DB_NAME, 'construction');
      const sslParam = parsed.searchParams.get('ssl-mode') || parsed.searchParams.get('ssl');
      const explicitDisable =
        process.env.DB_SSL === 'false' || sslParam?.toLowerCase() === 'disabled' || sslParam === 'false';
      const explicitEnable = process.env.DB_SSL === 'true' || Boolean(sslParam);
      const sslEnabled = !explicitDisable && (explicitEnable || isSslRequiredCloudHost(host));

      return {
        host,
        port,
        user,
        password,
        database,
        sslEnabled,
        isConfiguredForRemote: !isLocalHost(host),
      };
    } catch {
      // Fallback to individual DB_* variables
    }
  }

  const host = cleanEnv(process.env.DB_HOST, 'localhost');
  const port = Number(cleanEnv(process.env.DB_PORT, '3306')) || 3306;
  const user = cleanEnv(process.env.DB_USER, 'root');
  const password = (process.env.DB_PASSWORD ?? '').replace(/^['"]|['"]$/g, '');
  const database = cleanEnv(process.env.DB_NAME, 'construction');

  const explicitDisable = process.env.DB_SSL === 'false';
  const explicitEnable = process.env.DB_SSL === 'true';
  const sslEnabled = !explicitDisable && (explicitEnable || isSslRequiredCloudHost(host));

  return {
    host,
    port,
    user,
    password,
    database,
    sslEnabled,
    isConfiguredForRemote: !isLocalHost(host),
  };
}

function createPool(): Pool {
    const cfg = getDbConnectionConfig();
    const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

    const options: PoolOptions = {
      host: cfg.host,
      port: cfg.port,
      user: cfg.user,
      password: cfg.password,
      database: cfg.database,
      waitForConnections: true,
      connectionLimit: isServerless ? 5 : 12,
      maxIdle: isServerless ? 2 : 6,
      idleTimeout: 30000,
      connectTimeout: 10000,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
      charset: 'utf8mb4',
      dateStrings: true,
      namedPlaceholders: false,
};

if (cfg.sslEnabled) {
  options.ssl = process.env.DB_SSL_CA
    ? { ca: process.env.DB_SSL_CA.replace(/\\n/g, '\n'), rejectUnauthorized: true }
    : { rejectUnauthorized: false };
}

return mysql.createPool(options);
}

export const db: Pool = global.__mysqlPool ?? createPool();
global.__mysqlPool = db;

export async function query<T = RowDataPacket>(
  sql: string,
  params: any[] = []
): Promise<T[]> {
  const [rows] = await db.execute<RowDataPacket[]>(sql, params);
  return rows as unknown as T[];
}

export async function queryOne<T = RowDataPacket>(
  sql: string,
  params: any[] = []
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

export async function execute(
  sql: string,
  params: any[] = []
): Promise<ResultSetHeader> {
  const [result] = await db.execute<ResultSetHeader>(sql, params);
  return result;
}

export async function withTransaction<T>(
  callback: (conn: PoolConnection) => Promise<T>
): Promise<T> {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const result = await callback(conn);
    await conn.commit();
    return result;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await db.query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}

export function diagnoseDbError(error: unknown): {
  status: number;
  message: string;
  code: string;
} {
  const err = error as { code?: string; errno?: number; message?: string } | null;
  const code = err?.code || 'UNKNOWN';
  const cfg = getDbConnectionConfig();

  if (
    code === 'ECONNREFUSED' ||
    code === 'ENOTFOUND' ||
    code === 'ETIMEDOUT' ||
    code === 'ECONNRESET' ||
    code === 'PROTOCOL_CONNECTION_LOST'
  ) {
    if (process.env.VERCEL && !cfg.isConfiguredForRemote) {
      return {
        status: 503,
        code,
        message:
          'MySQL database is not configured on Vercel (currently pointing to localhost). Set DATABASE_URL or DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME in Vercel Project Settings → Environment Variables and redeploy.',
      };
    }
    return {
      status: 503,
      code,
      message:
        'Unable to connect to MySQL database. Verify DB_HOST/DATABASE_URL, firewall allowlist, and SSL settings.',
    };
  }

  if (code === 'ER_ACCESS_DENIED_ERROR') {
    return {
      status: 503,
      code,
      message:
        'MySQL authentication failed (ER_ACCESS_DENIED_ERROR). On Hostinger: enable Remote MySQL for Any Host (%) on this database, verify full prefixed DB_USER & DB_PASSWORD (prefer separate DB_* vars over DATABASE_URL if password has @/#/% symbols), and redeploy.',
    };
  }

  if (code === 'ER_BAD_DB_ERROR') {
    return {
      status: 503,
      code,
      message: `MySQL database "${cfg.database}" does not exist. Create it and import database/schema.sql.`,
    };
  }

  if (code === 'ER_NO_SUCH_TABLE') {
    return {
      status: 503,
      code,
      message:
        'Database tables are missing. Import database/schema.sql and database/seed.sql into your MySQL database.',
    };
  }

  if (code === 'ER_SECURE_TRANSPORT_REQUIRED' || code === 'HANDSHAKE_NO_SSL_SUPPORT') {
    return {
      status: 503,
      code,
      message:
        'MySQL SSL/TLS mismatch. Set DB_SSL=true (for cloud MySQL) or DB_SSL=false (for non-SSL servers).',
    };
  }

  return {
    status: 500,
    code,
    message: 'Database request failed. Check server logs or /api/health for diagnostics.',
  };
}
