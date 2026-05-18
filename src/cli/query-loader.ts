import type {Challenge} from '../challenges/types.js';
import {readSqlFile} from '../db/sql-files.js';

export async function loadBaselineQuery(challenge: Challenge): Promise<string> {
  return readSqlFile(challenge.baselineSqlPath);
}

export async function loadParticipantSql(sqlPath: string): Promise<string> {
  return readSqlFile(sqlPath);
}

export async function loadSuggestedSolutionQuery(challenge: Challenge): Promise<string> {
  return readSqlFile(challenge.optionalSuggestedSolutionSqlPath);
}

export async function loadSuggestedSolutionIndexes(challenge: Challenge): Promise<string> {
  return readSqlFile(challenge.optionalSuggestedIndexesSqlPath);
}
