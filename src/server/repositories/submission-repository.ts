import {randomUUID} from 'node:crypto';
import type pg from 'pg';
import type {LeaderboardEntryResponse, SubmissionRecord, SubmissionStatus, SubmissionWithResult} from '../types.js';

interface SubmissionRow {
  id: string;
  challenge_id: string;
  variant: string | null;
  participant_name: string | null;
  participant_id: string | null;
  sql_text: string;
  sql_hash: string;
  notes: string | null;
  status: SubmissionStatus;
  validation_error: string | null;
  submitted_at: Date | string;
  started_at: Date | string | null;
  completed_at: Date | string | null;
}

interface JoinedSubmissionRow extends SubmissionRow {
  result_id: string | null;
  correct: boolean | null;
  row_count: number | null;
  latency_ms: number | null;
  execution_time_ms: number | null;
  planning_time_ms: number | null;
  error_message: string | null;
  diff_summary: unknown | null;
  result_created_at: Date | string | null;
}

export interface CreateSubmissionInput {
  challengeId: string;
  variant?: string | null;
  participantName?: string | null;
  participantId?: string | null;
  sqlText: string;
  sqlHash: string;
  notes?: string | null;
}

export class SubmissionRepository {
  constructor(private readonly client: pg.PoolClient | pg.Pool) {}

  async create(input: CreateSubmissionInput): Promise<SubmissionRecord> {
    const result = await this.client.query<SubmissionRow>(
      `INSERT INTO submissions (
        id, challenge_id, variant, participant_name, participant_id, sql_text, sql_hash, notes, status, submitted_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', now())
      RETURNING *`,
      [
        randomUUID(),
        input.challengeId,
        input.variant ?? null,
        input.participantName ?? null,
        input.participantId ?? null,
        input.sqlText,
        input.sqlHash,
        input.notes ?? null,
      ],
    );
    return mapSubmission(result.rows[0]!);
  }

  async updateStatus(id: string, status: SubmissionStatus, validationError?: string | null): Promise<SubmissionRecord> {
    const result = await this.client.query<SubmissionRow>(
      `UPDATE submissions
       SET status = $2,
           validation_error = COALESCE($3, validation_error),
           started_at = CASE WHEN $2 = 'running' AND started_at IS NULL THEN now() ELSE started_at END,
           completed_at = CASE WHEN $2 IN ('completed', 'failed') THEN now() ELSE completed_at END
       WHERE id = $1
       RETURNING *`,
      [id, status, validationError ?? null],
    );
    return mapSubmission(result.rows[0]!);
  }

  async findById(id: string): Promise<SubmissionWithResult | null> {
    const result = await this.client.query<JoinedSubmissionRow>(
      `SELECT
         s.*,
         er.id AS result_id,
         er.correct,
         er.row_count,
         er.latency_ms,
         er.execution_time_ms,
         er.planning_time_ms,
         er.error_message,
         er.diff_summary,
         er.created_at AS result_created_at
       FROM submissions s
       LEFT JOIN evaluation_results er ON er.submission_id = s.id
       WHERE s.id = $1`,
      [id],
    );
    const row = result.rows[0];
    if (!row) return null;
    return {
      submission: mapSubmission(row),
      result: row.result_id
        ? {
            id: row.result_id,
            submissionId: row.id,
            correct: Boolean(row.correct),
            rowCount: row.row_count,
            latencyMs: row.latency_ms,
            executionTimeMs: row.execution_time_ms,
            planningTimeMs: row.planning_time_ms,
            errorMessage: row.error_message,
            diffSummary: row.diff_summary,
            createdAt: toIso(row.result_created_at),
          }
        : null,
    };
  }

  async leaderboard(challengeId: string, variant?: string | null): Promise<LeaderboardEntryResponse[]> {
    const result = await this.client.query<{
      submission_id: string;
      participant_name: string | null;
      participant_id: string | null;
      latency_ms: number | null;
      execution_time_ms: number | null;
      planning_time_ms: number | null;
      row_count: number;
      submitted_at: Date | string;
      completed_at: Date | string | null;
    }>(
      `SELECT
         s.id AS submission_id,
         s.participant_name,
         s.participant_id,
         er.latency_ms,
         er.execution_time_ms,
         er.planning_time_ms,
         COALESCE(er.row_count, 0) AS row_count,
         s.submitted_at,
         s.completed_at
       FROM submissions s
       JOIN evaluation_results er ON er.submission_id = s.id
       WHERE s.challenge_id = $1
         AND COALESCE(s.variant, '') = COALESCE($2, '')
         AND s.status = 'completed'
         AND er.correct = true
       ORDER BY er.execution_time_ms ASC NULLS LAST, er.latency_ms ASC NULLS LAST, s.submitted_at ASC`,
      [challengeId, variant ?? null],
    );
    return result.rows.map((row) => ({
      submissionId: row.submission_id,
      participantName: row.participant_name,
      participantId: row.participant_id,
      latencyMs: row.latency_ms,
      executionTimeMs: row.execution_time_ms,
      planningTimeMs: row.planning_time_ms,
      rowsReturned: row.row_count,
      submittedAt: toIso(row.submitted_at),
      completedAt: row.completed_at ? toIso(row.completed_at) : null,
    }));
  }
}

function mapSubmission(row: SubmissionRow): SubmissionRecord {
  return {
    id: row.id,
    challengeId: row.challenge_id,
    variant: row.variant,
    participantName: row.participant_name,
    participantId: row.participant_id,
    sqlText: row.sql_text,
    sqlHash: row.sql_hash,
    notes: row.notes,
    status: row.status,
    validationError: row.validation_error,
    submittedAt: toIso(row.submitted_at),
    startedAt: row.started_at ? toIso(row.started_at) : null,
    completedAt: row.completed_at ? toIso(row.completed_at) : null,
  };
}

function toIso(value: Date | string | null): string {
  if (!value) return new Date(0).toISOString();
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}
