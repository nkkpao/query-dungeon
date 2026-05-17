import {readFile} from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();

export async function readSqlFile(relativePath: string): Promise<string> {
  const resolved = path.resolve(root, relativePath);
  if (!resolved.startsWith(root + path.sep)) {
    throw new Error(`SQL_PATH_OUTSIDE_REPO: Refusing to read ${relativePath}`);
  }
  return readFile(resolved, 'utf8');
}

export function splitSqlStatements(sql: string): string[] {
  return sql
    .split(/;\s*(?:\n|$)/)
    .map((statement) => statement.trim())
    .filter(Boolean);
}

export function extractSolutionParts(sql: string): {migrationSql: string; querySql: string} {
  const marker = '-- query';
  const index = sql.toLowerCase().indexOf(marker);
  if (index === -1) {
    return {migrationSql: '', querySql: sql.trim()};
  }
  return {
    migrationSql: sql.slice(0, index).trim(),
    querySql: sql.slice(index).replace(/^-- query:?/i, '').trim(),
  };
}
