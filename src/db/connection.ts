import 'dotenv/config';
import pg from 'pg';

const {Pool} = pg;

export interface DbOptions {
  databaseUrl?: string;
  timeoutMs?: number;
}

export function getDatabaseUrl(databaseUrl?: string): string {
  return databaseUrl ?? process.env.DATABASE_URL ?? 'postgresql://dungeon:dungeon@localhost:54329/dungeon';
}

export function createPool(options: DbOptions = {}): pg.Pool {
  return new Pool({connectionString: getDatabaseUrl(options.databaseUrl)});
}

export async function withClient<T>(
  options: DbOptions,
  fn: (client: pg.PoolClient) => Promise<T>,
): Promise<T> {
  const pool = createPool(options);
  const client = await pool.connect();
  try {
    const timeoutMs = options.timeoutMs ?? Number(process.env.QUERY_TIMEOUT_MS ?? 15000);
    await client.query('SELECT set_config($1, $2, false)', ['statement_timeout', String(timeoutMs)]);
    return await fn(client);
  } catch (error) {
    if (error instanceof Error && /statement timeout/i.test(error.message)) {
      throw new Error(`QUERY_TIMEOUT: Query exceeded the configured timeout. Try SEED_SCALE=small or raise QUERY_TIMEOUT_MS.`);
    }
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

export async function assertSeeded(client: pg.PoolClient): Promise<void> {
  const result = await client.query<{count: string}>("SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders'");
  if (Number(result.rows[0]?.count ?? 0) === 0) {
    throw new Error('DATABASE_NOT_SEEDED: Run "make seed SEED_SCALE=small" before running challenges.');
  }
}
