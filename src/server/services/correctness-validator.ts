import type pg from 'pg';
import type {ExpectedResultContract} from '../../challenges/types.js';
import type {ResultDiff} from '../../db/result-compare.js';
import {validateRows} from '../../db/result-compare.js';
import {readSqlFile} from '../../db/sql-files.js';

export interface CorrectnessValidationResult {
  correct: boolean;
  diff: ResultDiff;
  diffSummary: unknown | null;
  normalizedExpectedRows: Record<string, unknown>[];
}

export class CorrectnessValidator {
  async validate(
    client: pg.PoolClient,
    actualRows: Record<string, unknown>[],
    expected: ExpectedResultContract,
  ): Promise<CorrectnessValidationResult> {
    const expectedRows = expected.rows.length === 0 && expected.fixtureSqlPath
      ? (await client.query(await readSqlFile(expected.fixtureSqlPath))).rows
      : expected.rows;
    const diff = validateRows(actualRows, {...expected, rows: expectedRows});
    return {
      correct: diff.equal,
      diff,
      diffSummary: diff.equal ? null : summarizeDiff(diff),
      normalizedExpectedRows: expectedRows,
    };
  }
}

function summarizeDiff(diff: ResultDiff): unknown {
  return {
    missingRows: diff.missingRows.slice(0, 5),
    extraRows: diff.extraRows.slice(0, 5),
    changedRows: diff.changedRows.slice(0, 5),
  };
}
