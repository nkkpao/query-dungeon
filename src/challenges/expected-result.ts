import {readFile} from 'node:fs/promises';
import path from 'node:path';
import type {ExpectedResultContract} from './types.js';

const root = process.cwd();

export async function loadExpectedResult(relativePath: string): Promise<ExpectedResultContract> {
  const resolved = path.resolve(root, relativePath);
  if (!resolved.startsWith(root + path.sep)) {
    throw new Error(`PATH_OUTSIDE_REPO: Refusing to read ${relativePath}`);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(await readFile(resolved, 'utf8'));
  } catch (error) {
    throw new Error(`INVALID_EXPECTED_RESULT: Cannot parse ${relativePath}. ${error instanceof Error ? error.message : String(error)}`);
  }
  return parseExpectedResult(parsed, relativePath);
}

export function parseExpectedResult(value: unknown, source = 'expected-result.json'): ExpectedResultContract {
  if (!value || typeof value !== 'object') {
    throw new Error(`INVALID_EXPECTED_RESULT: ${source} must be a JSON object.`);
  }
  const candidate = value as Partial<ExpectedResultContract>;
  if (!Array.isArray(candidate.columns) || !candidate.columns.every((column) => typeof column === 'string')) {
    throw new Error(`INVALID_EXPECTED_RESULT: ${source} must define string columns.`);
  }
  if (!Array.isArray(candidate.rows) || !candidate.rows.every((row) => row && typeof row === 'object' && !Array.isArray(row))) {
    throw new Error(`INVALID_EXPECTED_RESULT: ${source} must define object rows.`);
  }
  return {
    columns: candidate.columns,
    rows: candidate.rows as Record<string, unknown>[],
    fixtureSqlPath: typeof candidate.fixtureSqlPath === 'string' ? candidate.fixtureSqlPath : undefined,
    orderSensitive: Boolean(candidate.orderSensitive),
    numericTolerance: typeof candidate.numericTolerance === 'number' ? candidate.numericTolerance : undefined,
    normalization: candidate.normalization,
  };
}
