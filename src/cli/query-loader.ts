import type {Challenge} from '../challenges/types.js';
import {readSqlFile} from '../db/sql-files.js';

export function assertNotOptionalSolutionPath(sqlPath: string): void {
  if (/\/?variants\/advanced\/optional\//.test(sqlPath) || /\/?optional\/suggested-(solution|indexes)\.sql$/.test(sqlPath)) {
    throw new Error('SOLUTION_PATH_FORBIDDEN: Default learner workflow cannot read official solution SQL. Use compare-with-suggested-solution explicitly.');
  }
}

export async function loadBaselineQuery(challenge: Challenge): Promise<string> {
  return readSqlFile(challenge.baselineSqlPath);
}

export async function loadParticipantSql(sqlPath: string): Promise<string> {
  assertNotOptionalSolutionPath(sqlPath);
  return readSqlFile(sqlPath);
}

export async function loadSuggestedSolutionQuery(challenge: Challenge): Promise<string> {
  return readSqlFile(challenge.optionalSuggestedSolutionSqlPath);
}

export async function loadSuggestedSolutionIndexes(challenge: Challenge): Promise<string> {
  return readSqlFile(challenge.optionalSuggestedIndexesSqlPath);
}
