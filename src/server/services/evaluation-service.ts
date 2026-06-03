import {performance} from 'node:perf_hooks';
import pg from 'pg';
import type {ResultDiff} from '../../db/result-compare.js';
import {validateRows} from '../../db/result-compare.js';
import {explainAnalyze} from '../../db/explain.js';
import {readSqlFile} from '../../db/sql-files.js';
import {EvaluationResultRepository} from '../repositories/evaluation-result-repository.js';
import {SubmissionRepository} from '../repositories/submission-repository.js';
import type {SubmissionCreateRequest, SubmissionResponse, SubmissionWithResult} from '../types.js';
import {ChallengeCatalog} from './challenge-catalog.js';
import {sqlHash, validateSqlSafety} from './sql-safety.js';

export interface EvaluationServiceOptions {
  databaseUrl: string;
  queryTimeoutMs: number;
  sqlMaxBytes: number;
  pool?: pg.Pool;
  challengeCatalog?: ChallengeCatalog;
}

export class EvaluationService {
  private readonly pool: pg.Pool;
  private readonly ownsPool: boolean;
  private readonly challengeCatalog: ChallengeCatalog;

  constructor(private readonly options: EvaluationServiceOptions) {
    this.pool = options.pool ?? new pg.Pool({connectionString: options.databaseUrl});
    this.ownsPool = !options.pool;
    this.challengeCatalog = options.challengeCatalog ?? new ChallengeCatalog();
  }

  async close(): Promise<void> {
    if (this.ownsPool) await this.pool.end();
  }

  async submit(request: SubmissionCreateRequest): Promise<SubmissionResponse> {
    const challenge = this.challengeCatalog.resolve(request.challengeId, request.variant);
    const expected = await this.challengeCatalog.expectedResult(challenge);
    const initialHash = sqlHash(request.sql);

    const client = await this.pool.connect();
    const submissions = new SubmissionRepository(client);
    const results = new EvaluationResultRepository(client);

    try {
      const submission = await submissions.create({
        challengeId: challenge.id,
        variant: request.variant ?? null,
        participantName: request.participantName ?? null,
        participantId: request.participantId ?? null,
        sqlText: request.sql,
        sqlHash: initialHash,
        notes: request.notes ?? null,
      });

      const safety = validateSqlSafety(request.sql, this.options.sqlMaxBytes);
      if (!safety.ok) {
        await submissions.updateStatus(submission.id, 'failed', safety.errorMessage);
        await results.create({
          submissionId: submission.id,
          correct: false,
          errorMessage: safety.errorMessage,
        });
        return this.response((await submissions.findById(submission.id))!);
      }

      await submissions.updateStatus(submission.id, 'running');
      let transactionStarted = false;
      try {
        await client.query('BEGIN READ ONLY');
        transactionStarted = true;
        await client.query('SELECT set_config($1, $2, true)', ['statement_timeout', String(this.options.queryTimeoutMs)]);

        const start = performance.now();
        const queryResult = await client.query(request.sql);
        const expectedRows = expected.rows.length === 0 && expected.fixtureSqlPath
          ? (await client.query(await readSqlFile(expected.fixtureSqlPath))).rows
          : expected.rows;
        const latencyMs = performance.now() - start;
        const diff = validateRows(queryResult.rows, {...expected, rows: expectedRows});
        const explain = await this.safeExplain(client, request.sql);

        await client.query('ROLLBACK');
        transactionStarted = false;

        await submissions.updateStatus(submission.id, 'completed');
        await results.create({
          submissionId: submission.id,
          correct: diff.equal,
          rowCount: queryResult.rowCount ?? queryResult.rows.length,
          latencyMs,
          executionTimeMs: explain.executionTimeMs,
          planningTimeMs: explain.planningTimeMs,
          errorMessage: diff.equal ? null : 'RESULT_MISMATCH: Submitted SQL output differs from expected-result.json.',
          diffSummary: diff.equal ? null : summarizeDiff(diff),
        });
      } catch (error) {
        if (transactionStarted) {
          await client.query('ROLLBACK').catch(() => undefined);
        }
        const message = error instanceof Error ? error.message : String(error);
        await submissions.updateStatus(submission.id, 'failed', participantSafeError(message));
        await results.create({
          submissionId: submission.id,
          correct: false,
          errorMessage: participantSafeError(message),
        });
      }

      return this.response((await submissions.findById(submission.id))!);
    } finally {
      await resetSession(client);
      client.release();
    }
  }

  async findById(id: string): Promise<SubmissionResponse | null> {
    const client = await this.pool.connect();
    try {
      const found = await new SubmissionRepository(client).findById(id);
      return found ? this.response(found) : null;
    } finally {
      client.release();
    }
  }

  private response(record: SubmissionWithResult): SubmissionResponse {
    return {
      submissionId: record.submission.id,
      status: record.submission.status,
      correctness: record.result?.correct ?? null,
      latencyMs: record.result?.latencyMs ?? null,
      executionTimeMs: record.result?.executionTimeMs ?? null,
      planningTimeMs: record.result?.planningTimeMs ?? null,
      rowsReturned: record.result?.rowCount ?? null,
      errorMessage: record.result?.errorMessage ?? record.submission.validationError,
    };
  }

  private async safeExplain(client: pg.PoolClient, sql: string): Promise<{executionTimeMs: number | null; planningTimeMs: number | null}> {
    try {
      const parsed = await explainAnalyze(client, sql);
      return {executionTimeMs: parsed.executionTimeMs, planningTimeMs: parsed.planningTimeMs};
    } catch {
      return {executionTimeMs: null, planningTimeMs: null};
    }
  }
}

function summarizeDiff(diff: ResultDiff): unknown {
  return {
    missingRows: diff.missingRows.slice(0, 5),
    extraRows: diff.extraRows.slice(0, 5),
    changedRows: diff.changedRows.slice(0, 5),
  };
}

function participantSafeError(message: string): string {
  if (/statement timeout|QUERY_TIMEOUT/i.test(message)) {
    return 'QUERY_TIMEOUT: Query exceeded the configured statement timeout.';
  }
  if (/syntax error/i.test(message)) {
    return 'SQL_SYNTAX_ERROR: Submitted SQL has a syntax error.';
  }
  return message.replace(/\s+/g, ' ').slice(0, 500);
}

async function resetSession(client: pg.PoolClient): Promise<void> {
  await client.query('RESET ALL').catch(() => undefined);
  await client.query('SELECT pg_advisory_unlock_all()').catch(() => undefined);
}
