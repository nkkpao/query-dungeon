import {describe, expect, it} from 'vitest';
import {SubmissionRepository} from '../src/server/repositories/submission-repository.js';
import {sqlHash} from '../src/server/services/sql-safety.js';
import {SubmissionEvaluator} from '../src/server/services/submission-evaluator.js';
import {FakePool, fakeCatalog, makeEvaluationService, makeSubmissionEvaluator} from './helpers/evaluation-fakes.js';

describe('submission evaluation service', () => {
  it('stores failed unsafe submissions with an id and structured error code', async () => {
    const service = makeEvaluationService();
    const result = await service.submit({
      challengeId: '01-user-orders-missing-index',
      participantName: 'Ada',
      sql: 'DROP TABLE users',
    });
    expect(result).toMatchObject({
      status: 'failed',
      correctness: false,
      errorCode: 'safety_rejected',
    });
    expect(result.submissionId).toBeTruthy();
    expect(result.errorMessage).toContain('DROP');
  });

  it('marks correct and incorrect submissions using expected-result rows', async () => {
    const service = makeEvaluationService();
    const correct = await service.submit({challengeId: '01-user-orders-missing-index', participantName: 'Ada', sql: 'SELECT 1 AS id'});
    const incorrect = await service.submit({challengeId: '01-user-orders-missing-index', participantName: 'Ada', sql: 'SELECT 2 AS id'});

    expect(correct).toMatchObject({
      status: 'completed',
      correctness: true,
      errorCode: null,
      rowsReturned: 1,
      executionTimeMs: expect.any(Number),
      planningTimeMs: expect.any(Number),
    });
    expect(incorrect).toMatchObject({
      status: 'completed',
      correctness: false,
      errorCode: 'result_mismatch',
      rowsReturned: 1,
    });
  });

  it('evaluates inside a read-only transaction with local timeout and resets pooled session state', async () => {
    const pool = new FakePool();
    const service = makeEvaluationService(pool);
    await service.submit({challengeId: '01-user-orders-missing-index', participantName: 'Ada', sql: 'SELECT 1 AS id'});

    expect(pool.client.queries).toContain('BEGIN READ ONLY');
    expect(pool.client.queries.some((query) => query.startsWith('SET LOCAL statement_timeout'))).toBe(true);
    expect(pool.client.queries).toContain('ROLLBACK');
    expect(pool.client.queries).toContain('RESET ALL');
    expect(pool.client.queries).toContain('SELECT pg_advisory_unlock_all()');
  });

  it('stores expected-result load failures as internal errors', async () => {
    const service = makeEvaluationService(new FakePool(), fakeCatalog({throwExpected: true}));
    const result = await service.submit({challengeId: '01-user-orders-missing-index', participantName: 'Ada', sql: 'SELECT 1 AS id'});

    expect(result).toMatchObject({
      status: 'failed',
      correctness: false,
      errorCode: 'internal_error',
    });
  });
});

describe('submission evaluator', () => {
  it('evaluates a stored submission id and returns leaderboard eligibility', async () => {
    const pool = new FakePool();
    const submission = await new SubmissionRepository(pool.client as any).create({
      challengeId: '01-user-orders-missing-index',
      participantName: 'Ada',
      sqlText: 'SELECT 1 AS id',
      sqlHash: sqlHash('SELECT 1 AS id'),
    });
    const result = await makeSubmissionEvaluator(pool).evaluate({submissionId: submission.id});

    expect(result).toMatchObject({
      submissionId: submission.id,
      status: 'completed',
      correct: true,
      errorCode: null,
      rowCount: 1,
      leaderboardEligible: true,
      executionTimeMs: expect.any(Number),
      planningTimeMs: expect.any(Number),
    });
    expect(result.explainMetrics).toMatchObject({
      actualRows: 1,
      sharedHitBlocks: 2,
      sharedReadBlocks: 1,
    });
  });

  it('evaluates explicit input without HTTP handlers', async () => {
    const result = await makeSubmissionEvaluator().evaluate({
      challengeId: '01-user-orders-missing-index',
      participantName: 'Ada',
      sql: 'SELECT 1 AS id',
    });

    expect(result.status).toBe('completed');
    expect(result.correct).toBe(true);
    expect(result.leaderboardEligible).toBe(true);
  });

  it('records explain capture failure without changing correctness', async () => {
    const result = await new SubmissionEvaluator({
      pool: new FakePool() as any,
      queryTimeoutMs: 15000,
      sqlMaxBytes: 65536,
      challengeCatalog: fakeCatalog(),
      explainRunner: {run: async () => { throw new Error('explain boom'); }} as any,
    }).evaluate({
      challengeId: '01-user-orders-missing-index',
      participantName: 'Ada',
      sql: 'SELECT 1 AS id',
    });

    expect(result).toMatchObject({
      status: 'completed',
      correct: true,
      errorCode: null,
      executionTimeMs: null,
      planningTimeMs: null,
      leaderboardEligible: true,
    });
    expect(result.errorMessage).toContain('EXPLAIN_CAPTURE_FAILED');
  });

  it('produces comparable results for repeated evaluation of the same SQL', async () => {
    const evaluator = makeSubmissionEvaluator();
    const runs = [];
    for (let index = 0; index < 10; index += 1) {
      runs.push(await evaluator.evaluate({
        challengeId: '01-user-orders-missing-index',
        participantName: 'Ada',
        sql: 'SELECT 1 AS id',
      }));
    }

    expect(runs.every((run) => run.correct === true)).toBe(true);
    expect(runs.map((run) => run.rowCount)).toEqual(Array(10).fill(1));
    expect(runs.every((run) => typeof run.latencyMs === 'number')).toBe(true);
    expect(runs.every((run) => typeof run.executionTimeMs === 'number')).toBe(true);
    expect(runs.every((run) => typeof run.planningTimeMs === 'number')).toBe(true);
  });

  it.each([
    ['syntax_error', 'SELECT FROM users'],
    ['timeout', 'SELECT timeout AS id'],
    ['execution_error', 'SELECT runtime_error AS id'],
    ['result_mismatch', 'SELECT 2 AS id'],
    ['safety_rejected', 'DELETE FROM users'],
  ] as const)('classifies %s failures', async (errorCode, sql) => {
    const result = await makeSubmissionEvaluator().evaluate({
      challengeId: '01-user-orders-missing-index',
      participantName: 'Ada',
      sql,
    });

    expect(result.errorCode).toBe(errorCode);
    expect(result.correct).toBe(false);
    expect(result.leaderboardEligible).toBe(false);
  });

  it('rolls back every executable evaluator path and skips execution for safety rejection', async () => {
    const pool = new FakePool();
    const evaluator = makeSubmissionEvaluator(pool);

    await evaluator.evaluate({challengeId: '01-user-orders-missing-index', participantName: 'Ada', sql: 'SELECT 1 AS id'});
    await evaluator.evaluate({challengeId: '01-user-orders-missing-index', participantName: 'Ada', sql: 'SELECT 2 AS id'});
    await evaluator.evaluate({challengeId: '01-user-orders-missing-index', participantName: 'Ada', sql: 'SELECT FROM users'});
    await evaluator.evaluate({challengeId: '01-user-orders-missing-index', participantName: 'Ada', sql: 'SELECT timeout AS id'});
    await evaluator.evaluate({challengeId: '01-user-orders-missing-index', participantName: 'Ada', sql: 'DELETE FROM users'});

    expect(pool.client.countQuery('BEGIN READ ONLY')).toBe(4);
    expect(pool.client.countQuery('SET LOCAL statement_timeout')).toBe(4);
    expect(pool.client.countQuery('ROLLBACK')).toBe(4);
  });

  it('fails the evaluation and discards the connection when rollback fails', async () => {
    const pool = new FakePool();
    pool.client.failRollback = true;
    const result = await makeSubmissionEvaluator(pool).evaluate({
      challengeId: '01-user-orders-missing-index',
      participantName: 'Ada',
      sql: 'SELECT 1 AS id',
    });

    expect(result).toMatchObject({
      status: 'failed',
      correct: false,
      errorCode: 'internal_error',
      leaderboardEligible: false,
    });
    expect(result.errorMessage).toContain('ROLLBACK_FAILED');
    expect(pool.client.releaseErrors).toHaveLength(1);
    expect(pool.client.queries).not.toContain('RESET ALL');
  });
});
