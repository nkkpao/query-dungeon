import {createHash} from 'node:crypto';

export interface SqlSafetyResult {
  ok: boolean;
  sqlHash: string;
  errorMessage: string | null;
}

const forbidden = [
  'alter',
  'call',
  'copy',
  'create',
  'delete',
  'do',
  'drop',
  'grant',
  'insert',
  'revoke',
  'truncate',
  'update',
  'begin',
  'commit',
  'rollback',
  'savepoint',
  'release',
  'vacuum',
  'analyze',
  'lock',
];

const sideEffectingFunctions = [
  'dblink',
  'lo_export',
  'lo_import',
  'nextval',
  'pg_advisory_lock',
  'pg_advisory_xact_lock',
  'pg_cancel_backend',
  'pg_export_snapshot',
  'pg_logdir_ls',
  'pg_ls_dir',
  'pg_notify',
  'pg_read_binary_file',
  'pg_read_file',
  'pg_reload_conf',
  'pg_sleep',
  'pg_stat_file',
  'pg_terminate_backend',
  'set_config',
  'setval',
];

export function sqlHash(sql: string): string {
  return createHash('sha256').update(sql).digest('hex');
}

export function validateSqlSafety(sql: string, maxBytes: number): SqlSafetyResult {
  const hash = sqlHash(sql);
  const byteLength = Buffer.byteLength(sql, 'utf8');
  if (byteLength > maxBytes) {
    return fail(hash, `SQL_SIZE_LIMIT: SQL exceeds the ${maxBytes} byte limit.`);
  }

  const trimmed = sql.trim();
  if (!trimmed) {
    return fail(hash, 'SQL_EMPTY: SQL must not be empty.');
  }
  if (hasMultipleStatements(trimmed)) {
    return fail(hash, 'SQL_MULTIPLE_STATEMENTS: Submit exactly one SELECT statement.');
  }

  const lowerRaw = trimmed.toLowerCase();
  for (const keyword of forbidden) {
    if (new RegExp(`\\b${keyword}\\b`, 'i').test(lowerRaw)) {
      return fail(hash, `SQL_FORBIDDEN_STATEMENT: "${keyword.toUpperCase()}" is not allowed.`);
    }
  }
  if (/\bselect\b[\s\S]+\binto\b/i.test(lowerRaw)) {
    return fail(hash, 'SQL_FORBIDDEN_STATEMENT: SELECT INTO is not allowed.');
  }

  const normalized = stripCommentsAndStrings(trimmed).trimStart().toLowerCase();
  if (!/^(select|with)\b/.test(normalized)) {
    return fail(hash, 'SQL_NOT_SELECT: Submit a single SELECT statement.');
  }
  if (/\bwith\b[\s\S]*\b(insert|update|delete|merge)\b/i.test(normalized)) {
    return fail(hash, 'SQL_FORBIDDEN_STATEMENT: Data-modifying CTEs are not allowed.');
  }
  for (const functionName of sideEffectingFunctions) {
    if (new RegExp(`(?:\\b|\\.)${functionName}\\s*\\(`, 'i').test(normalized)) {
      return fail(hash, `SQL_FORBIDDEN_FUNCTION: "${functionName}" is not allowed.`);
    }
  }

  return {ok: true, sqlHash: hash, errorMessage: null};
}

function fail(hash: string, errorMessage: string): SqlSafetyResult {
  return {ok: false, sqlHash: hash, errorMessage};
}

function hasMultipleStatements(sql: string): boolean {
  const withoutTrailing = sql.replace(/;\s*$/, '');
  return withoutTrailing.includes(';');
}

function stripCommentsAndStrings(sql: string): string {
  return sql
    .replace(/--.*$/gm, ' ')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/'(?:''|[^'])*'/g, "''")
    .replace(/"(?:\"\"|[^"])*"/g, '""');
}
