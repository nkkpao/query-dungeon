import {randomUUID} from 'node:crypto';
import type pg from 'pg';
import type {EvaluationResultRecord} from '../types.js';

interface EvaluationResultRow {
  id: string;
  submission_id: string;
  correct: boolean;
  row_count: number | null;
  latency_ms: number | null;
  execution_time_ms: number | null;
  planning_time_ms: number | null;
  error_message: string | null;
  diff_summary: unknown | null;
  created_at: Date | string;
}

export interface CreateEvaluationResultInput {
  submissionId: string;
  correct: boolean;
  rowCount?: number | null;
  latencyMs?: number | null;
  executionTimeMs?: number | null;
  planningTimeMs?: number | null;
  errorMessage?: string | null;
  diffSummary?: unknown | null;
}

export class EvaluationResultRepository {
  constructor(private readonly client: pg.PoolClient | pg.Pool) {}

  async create(input: CreateEvaluationResultInput): Promise<EvaluationResultRecord> {
    const result = await this.client.query<EvaluationResultRow>(
      `INSERT INTO evaluation_results (
         id, submission_id, correct, row_count, latency_ms, execution_time_ms,
         planning_time_ms, error_message, diff_summary, created_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now())
       RETURNING *`,
      [
        randomUUID(),
        input.submissionId,
        input.correct,
        input.rowCount ?? null,
        input.latencyMs ?? null,
        input.executionTimeMs ?? null,
        input.planningTimeMs ?? null,
        input.errorMessage ?? null,
        input.diffSummary ? JSON.stringify(input.diffSummary) : null,
      ],
    );
    return mapResult(result.rows[0]!);
  }
}

function mapResult(row: EvaluationResultRow): EvaluationResultRecord {
  return {
    id: row.id,
    submissionId: row.submission_id,
    correct: row.correct,
    rowCount: row.row_count,
    latencyMs: row.latency_ms,
    executionTimeMs: row.execution_time_ms,
    planningTimeMs: row.planning_time_ms,
    errorMessage: row.error_message,
    diffSummary: row.diff_summary,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : new Date(row.created_at).toISOString(),
  };
}
