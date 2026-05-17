import {readFile} from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();

export async function readSqlFile(relativePath: string): Promise<string> {
  const resolved = path.resolve(root, relativePath);
  const sql = await readFile(resolved, 'utf8').catch((error: unknown) => {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      throw new Error(`SQL_FILE_NOT_FOUND: Cannot find SQL file "${relativePath}". Check the path and try again.`);
    }
    throw error;
  });
  if (!sql.trim()) {
    throw new Error(`SQL_FILE_EMPTY: SQL file "${relativePath}" is empty. Add a query or choose another file.`);
  }
  return sql;
}

export async function readTextFile(relativePath: string): Promise<string> {
  const resolved = path.resolve(root, relativePath);
  if (!resolved.startsWith(root + path.sep)) {
    throw new Error(`PATH_OUTSIDE_REPO: Refusing to read ${relativePath}`);
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
