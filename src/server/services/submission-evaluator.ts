import pg from 'pg';
import type {Challenge} from '../../challenges/types.js';
import {EvaluationResultRepository} from '../repositories/evaluation-result-repository.js';
import {SubmissionRepository} from '../repositories/submission-repository.js';
import type {
  EvaluateExplicitInput,
  EvaluationErrorCode,
  EvaluationInput,
  EvaluationResult,
  ExplainMetrics,
  SubmissionRecord,
} from '../types.js';
import {BenchmarkRunner} from './benchmark-runner.js';
import {ChallengeCatalog} from './challenge-catalog.js';
import {CorrectnessValidator} from './correctness-validator.js';
import {ExplainRunner} from './explain-runner.js';
import {SqlSafetyValidator, sqlHash} from './sql-safety-validator.js';

export interface SubmissionEvaluatorOptions {
  pool: pg.Pool;
  queryTimeoutMs: number;
  sqlMaxBytes: number;
  challengeCatalog?: ChallengeCatalog;
  sqlSafetyValidator?: SqlSafetyValidator;
  correctnessValidator?: CorrectnessValidator;
  benchmarkRunner?: BenchmarkRunner;
  explainRunner?: ExplainRunner;
}

interface EvaluationContext {
  submission: SubmissionRecord;
  challenge: Challenge;
  sql: string;
}

export class SubmissionEvaluator {
  private readonly challengeCatalog: ChallengeCatalog;
  private readonly sqlSafetyValidator: SqlSafetyValidator;
  private readonly correctnessValidator: CorrectnessValidator;
  private readonly benchmarkRunner: BenchmarkRunner;
  private readonly explainRunner: ExplainRunner;
  private readonly queryTimeoutMs: number;

  constructor(private readonly options: SubmissionEvaluatorOptions) {
    this.queryTimeoutMs = normalizeStatementTimeoutMs(options.queryTimeoutMs);
    this.challengeCatalog = options.challengeCatalog ?? new ChallengeCatalog();
    this.sqlSafetyValidator = options.sqlSafetyValidator ?? new SqlSafetyValidator();
    this.correctnessValidator = options.correctnessValidator ?? new CorrectnessValidator();
    this.benchmarkRunner = options.benchmarkRunner ?? new BenchmarkRunner();
    this.explainRunner = options.explainRunner ?? new ExplainRunner();
  }

  async evaluate(input: EvaluationInput): Promise<EvaluationResult> {
    const client = await this.options.pool.connect();
    let submissionIdForFailure: string | null = 'submissionId' in input ? input.submissionId ?? null : null;
    let clientReleased = false;
    let releaseError: Error | undefined;
    const releaseClient = (error?: Error): void => {
      if (clientReleased) return;
      clientReleased = true;
      client.release(error);
    };
    try {
      const submissions = new SubmissionRepository(client);
      const results = new EvaluationResultRepository(client);
      const context = await this.resolveContext(input, submissions);
      submissionIdForFailure = context.submission.id;
      const expected = await this.challengeCatalog.expectedResult(context.challenge);
      const safety = this.sqlSafetyValidator.validate(context.sql, {maxBytes: this.options.sqlMaxBytes});

      if (!safety.ok) {
        const message = safety.errorMessage ?? 'SQL rejected by safety validator.';
        await submissions.markFailed(context.submission.id, message);
        const record = await results.create({
          submissionId: context.submission.id,
          correct: false,
          errorCode: 'safety_rejected',
          errorMessage: message,
        });
        return toEvaluationResult(context.submission.id, 'failed', record);
      }

      await submissions.markRunning(context.submission.id);

      let transactionStarted = false;
      let finalStatus: 'completed' | 'failed' = 'failed';
      let correct = false;
      let rowCount: number | null = null;
      let latencyMs: number | null = null;
      let explainMetrics: ExplainMetrics | null = null;
      let errorCode: EvaluationErrorCode | null = null;
      let errorMessage: string | null = null;
      let diffSummary: unknown | null = null;
      let rollbackError: Error | null = null;

      try {
        await client.query('BEGIN READ ONLY');
        transactionStarted = true;
        await client.query(`SET LOCAL statement_timeout = ${this.queryTimeoutMs}`);

        const benchmark = await this.benchmarkRunner.run(client, context.sql);
        rowCount = benchmark.rowCount;
        latencyMs = benchmark.latencyMs;

        const correctness = await this.correctnessValidator.validate(client, benchmark.rows, expected);
        correct = correctness.correct;
        if (correct) {
          const explain = await this.safeExplain(client, context.sql);
          explainMetrics = explain.metrics;
          errorMessage = explain.warning;
        } else {
          errorCode = 'result_mismatch';
          errorMessage = 'RESULT_MISMATCH: Submitted SQL output differs from expected-result.json.';
          diffSummary = correctness.diffSummary;
        }
        finalStatus = 'completed';
      } catch (error) {
        const classified = classifyError(error);
        errorCode = classified.errorCode;
        errorMessage = classified.errorMessage;
        finalStatus = 'failed';
      } finally {
        if (transactionStarted) {
          try {
            await client.query('ROLLBACK');
          } catch (error) {
            rollbackError = toError(error);
          }
        }
      }

      if (rollbackError) {
        releaseError = rollbackError;
        releaseClient(rollbackError);
        finalStatus = 'failed';
        correct = false;
        errorCode = 'internal_error';
        errorMessage = `ROLLBACK_FAILED: ${participantSafeError(rollbackError.message)}`;
        explainMetrics = null;
        diffSummary = null;
      }

      const persistenceSubmissions = rollbackError ? new SubmissionRepository(this.options.pool) : submissions;
      const persistenceResults = rollbackError ? new EvaluationResultRepository(this.options.pool) : results;
      if (finalStatus === 'completed') {
        await persistenceSubmissions.markCompleted(context.submission.id);
      } else {
        await persistenceSubmissions.markFailed(context.submission.id, errorMessage);
      }

      const record = await persistenceResults.create({
        submissionId: context.submission.id,
        correct,
        rowCount,
        latencyMs,
        executionTimeMs: explainMetrics?.executionTimeMs ?? null,
        planningTimeMs: explainMetrics?.planningTimeMs ?? null,
        errorCode,
        errorMessage,
        diffSummary,
        explainMetrics,
      });

      return toEvaluationResult(context.submission.id, finalStatus, record);
    } catch (error) {
      const submissionId = submissionIdForFailure;
      if (!submissionId) throw error;
      const message = participantSafeError(error instanceof Error ? error.message : String(error));
      const submissions = new SubmissionRepository(clientReleased ? this.options.pool : client);
      const results = new EvaluationResultRepository(clientReleased ? this.options.pool : client);
      await submissions.markFailed(submissionId, message).catch(() => undefined);
      const record = await results.create({
        submissionId,
        correct: false,
        errorCode: 'internal_error',
        errorMessage: message,
      });
      return toEvaluationResult(submissionId, 'failed', record);
    } finally {
      if (!clientReleased) {
        await resetSession(client);
        releaseClient(releaseError);
      }
    }
  }

  private async resolveContext(input: EvaluationInput, submissions: SubmissionRepository): Promise<EvaluationContext> {
    if ('sql' in input) {
      return this.resolveExplicitInput(input, submissions);
    }

    const found = await submissions.findById(input.submissionId);
    if (!found) {
      throw new Error(`SUBMISSION_NOT_FOUND: ${input.submissionId}`);
    }
    const challenge = this.challengeCatalog.resolve(found.submission.challengeId, found.submission.variant ?? undefined);
    return {submission: found.submission, challenge, sql: found.submission.sqlText};
  }

  private async resolveExplicitInput(input: EvaluateExplicitInput, submissions: SubmissionRepository): Promise<EvaluationContext> {
    const challenge = this.challengeCatalog.resolve(input.challengeId, input.variant ?? undefined);
    if (input.submissionId) {
      const found = await submissions.findById(input.submissionId);
      if (!found) {
        throw new Error(`SUBMISSION_NOT_FOUND: ${input.submissionId}`);
      }
      return {submission: found.submission, challenge, sql: input.sql};
    }

    const submission = await submissions.create({
      challengeId: challenge.id,
      variant: input.variant ?? null,
      participantName: input.participantName ?? 'direct-evaluator',
      participantId: input.participantId ?? null,
      sqlText: input.sql,
      sqlHash: sqlHash(input.sql),
      notes: null,
    });
    return {submission, challenge, sql: input.sql};
  }

  private async safeExplain(client: pg.PoolClient, sql: string): Promise<{metrics: ExplainMetrics | null; warning: string | null}> {
    try {
      return {metrics: await this.explainRunner.run(client, sql), warning: null};
    } catch (error) {
      return {
        metrics: null,
        warning: `EXPLAIN_CAPTURE_FAILED: ${participantSafeError(toError(error).message)}`,
      };
    }
  }
}

function toEvaluationResult(
  submissionId: string,
  status: 'completed' | 'failed',
  record: Awaited<ReturnType<EvaluationResultRepository['create']>>,
): EvaluationResult {
  return {
    submissionId,
    status,
    correct: record.correct,
    errorCode: record.errorCode,
    errorMessage: record.errorMessage,
    latencyMs: record.latencyMs,
    executionTimeMs: record.executionTimeMs,
    planningTimeMs: record.planningTimeMs,
    rowCount: record.rowCount,
    diffSummary: record.diffSummary,
    explainMetrics: record.explainMetrics,
    leaderboardEligible: status === 'completed' && record.correct,
  };
}

function classifyError(error: unknown): {errorCode: EvaluationErrorCode; errorMessage: string} {
  const anyError = error as {code?: string; message?: string};
  const message = anyError?.message ?? String(error);
  if (anyError?.code === '57014' || /statement timeout|QUERY_TIMEOUT|canceling statement due to statement timeout/i.test(message)) {
    return {errorCode: 'timeout', errorMessage: 'QUERY_TIMEOUT: Query exceeded the configured statement timeout.'};
  }
  if (anyError?.code === '42601' || /syntax error/i.test(message)) {
    return {errorCode: 'syntax_error', errorMessage: 'SQL_SYNTAX_ERROR: Submitted SQL has a syntax error.'};
  }
  return {errorCode: 'execution_error', errorMessage: participantSafeError(message)};
}

function participantSafeError(message: string): string {
  return message.replace(/\s+/g, ' ').slice(0, 500);
}

function normalizeStatementTimeoutMs(value: number): number {
  if (!Number.isFinite(value) || value <= 0 || !Number.isInteger(value)) {
    throw new Error('INVALID_QUERY_TIMEOUT_MS: queryTimeoutMs must be a positive integer.');
  }
  return value;
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

async function resetSession(client: pg.PoolClient): Promise<void> {
  await client.query('RESET ALL').catch(() => undefined);
  await client.query('SELECT pg_advisory_unlock_all()').catch(() => undefined);
}
