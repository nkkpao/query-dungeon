import type {Challenge, QueryVariant} from '../challenges/types.js';
import {extractSolutionParts, readSqlFile} from '../db/sql-files.js';

export async function loadChallengeQuery(challenge: Challenge, variant: QueryVariant): Promise<string> {
  if (variant === 'bad') {
    return readSqlFile(challenge.badSqlPath);
  }
  const sql = await readSqlFile(challenge.solutionSqlPath);
  return extractSolutionParts(sql).querySql;
}

export async function loadExpectedQuery(challenge: Challenge): Promise<string> {
  return readSqlFile(challenge.expectedSqlPath);
}

export async function loadSolutionMigration(challenge: Challenge): Promise<string> {
  const sql = await readSqlFile(challenge.solutionSqlPath);
  return extractSolutionParts(sql).migrationSql;
}
