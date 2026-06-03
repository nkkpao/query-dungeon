import pg from 'pg';
import {SubmissionRepository} from '../repositories/submission-repository.js';
import type {EvaluationErrorCode, SubmissionCreateRequest, SubmissionResponse, SubmissionWithResult} from '../types.js';
import {ChallengeCatalog} from './challenge-catalog.js';
import {SubmissionEvaluator} from './submission-evaluator.js';
import {sqlHash} from './sql-safety.js';

export interface EvaluationServiceOptions {
  databaseUrl: string;
  queryTimeoutMs: number;
  sqlMaxBytes: number;
  pool?: pg.Pool;
  challengeCatalog?: ChallengeCatalog;
  submissionEvaluator?: SubmissionEvaluator;
}

export class EvaluationService {
  private readonly pool: pg.Pool;
  private readonly ownsPool: boolean;
  private readonly challengeCatalog: ChallengeCatalog;
  // API facade only: SubmissionEvaluator owns safety, transaction, correctness, and metrics work.
  private readonly submissionEvaluator: SubmissionEvaluator;

  constructor(private readonly options: EvaluationServiceOptions) {
    this.pool = options.pool ?? new pg.Pool({connectionString: options.databaseUrl});
    this.ownsPool = !options.pool;
    this.challengeCatalog = options.challengeCatalog ?? new ChallengeCatalog();
    this.submissionEvaluator = options.submissionEvaluator ?? new SubmissionEvaluator({
      pool: this.pool,
      queryTimeoutMs: options.queryTimeoutMs,
      sqlMaxBytes: options.sqlMaxBytes,
      challengeCatalog: this.challengeCatalog,
    });
  }

  async close(): Promise<void> {
    if (this.ownsPool) await this.pool.end();
  }

  async submit(request: SubmissionCreateRequest): Promise<SubmissionResponse> {
    const challenge = this.challengeCatalog.resolve(request.challengeId, request.variant);
    const client = await this.pool.connect();
    let submissionId: string;
    try {
      const submissions = new SubmissionRepository(client);
      const submission = await submissions.create({
        challengeId: challenge.id,
        variant: request.variant ?? null,
        participantName: request.participantName ?? null,
        participantId: request.participantId ?? null,
        sqlText: request.sql,
        sqlHash: sqlHash(request.sql),
        notes: request.notes ?? null,
      });
      submissionId = submission.id;
    } finally {
      client.release();
    }
    const result = await this.submissionEvaluator.evaluate({submissionId});
    return this.responseFromEvaluation(result);
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

  private responseFromEvaluation(result: {
    submissionId: string;
    status: SubmissionResponse['status'];
    correct: boolean | null;
    errorCode: EvaluationErrorCode | null;
    latencyMs: number | null;
    executionTimeMs: number | null;
    planningTimeMs: number | null;
    rowCount: number | null;
    errorMessage: string | null;
  }): SubmissionResponse {
    return {
      submissionId: result.submissionId,
      status: result.status,
      correctness: result.correct,
      errorCode: result.errorCode,
      latencyMs: result.latencyMs,
      executionTimeMs: result.executionTimeMs,
      planningTimeMs: result.planningTimeMs,
      rowsReturned: result.rowCount,
      errorMessage: result.errorMessage,
    };
  }

  private response(record: SubmissionWithResult): SubmissionResponse {
    return {
      submissionId: record.submission.id,
      status: record.submission.status,
      correctness: record.result?.correct ?? null,
      errorCode: record.result?.errorCode ?? null,
      latencyMs: record.result?.latencyMs ?? null,
      executionTimeMs: record.result?.executionTimeMs ?? null,
      planningTimeMs: record.result?.planningTimeMs ?? null,
      rowsReturned: record.result?.rowCount ?? null,
      errorMessage: record.result?.errorMessage ?? record.submission.validationError,
    };
  }
}
