import {getDatabaseUrl} from '../db/connection.js';

export interface ServerConfig {
  databaseUrl: string;
  queryTimeoutMs: number;
  port: number;
  sqlMaxBytes: number;
}

export function loadServerConfig(env: NodeJS.ProcessEnv = process.env): ServerConfig {
  return {
    databaseUrl: getDatabaseUrl(env.DATABASE_URL),
    queryTimeoutMs: Number(env.QUERY_TIMEOUT_MS ?? 15000),
    port: Number(env.SERVER_PORT ?? 3000),
    sqlMaxBytes: Number(env.SERVER_SQL_MAX_BYTES ?? 65536),
  };
}
