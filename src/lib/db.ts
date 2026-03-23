// PostgreSQL connection pool for CIVION V1.2

import { Pool } from 'pg';

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL client', err);
    });
  }
  return pool;
}

export async function query(text: string, params?: unknown[]) {
  const client = getPool();
  const start = Date.now();
  try {
    const result = await client.query(text, params);
    console.log('[DB] query executed', {
      ms: Date.now() - start,
      rows: result.rowCount,
    });
    return result;
  } catch (error) {
    console.error('[DB] query error', { text, error });
    throw error;
  }
}

export async function getClient() {
  return getPool().connect();
}
