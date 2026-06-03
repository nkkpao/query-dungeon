import {describe, expect, it} from 'vitest';
import {withClient} from '../src/db/connection.js';
import {SubmissionRepository} from '../src/server/repositories/submission-repository.js';
import {EvaluationResultRepository} from '../src/server/repositories/evaluation-result-repository.js';

const runDbTests = process.env.RUN_DB_TESTS === '1';

describe.skipIf(!runDbTests)('submission repositories', () => {
  it('stores submissions, results, and leaderboard rows', async () => {
    await withClient({}, async (client) => {
      const submissions = new SubmissionRepository(client);
      const results = new EvaluationResultRepository(client);
      const submission = await submissions.create({
        challengeId: '01-user-orders-missing-index',
        participantName: 'Ada',
        sqlText: 'SELECT 1',
        sqlHash: 'hash',
      });
      await submissions.updateStatus(submission.id, 'completed');
      await results.create({
        submissionId: submission.id,
        correct: true,
        rowCount: 1,
        latencyMs: 2,
        executionTimeMs: 1,
        errorCode: null,
        explainMetrics: {
          planningTimeMs: 0.1,
          executionTimeMs: 1,
          actualRows: 1,
          sharedHitBlocks: 1,
          sharedReadBlocks: 0,
          tempReadBlocks: 0,
          tempWrittenBlocks: 0,
        },
      });
      const found = await submissions.findById(submission.id);
      expect(found?.result?.correct).toBe(true);
      expect(found?.result?.errorCode).toBeNull();
      expect(found?.result?.explainMetrics?.actualRows).toBe(1);
      const leaderboard = await submissions.leaderboard('01-user-orders-missing-index');
      expect(leaderboard.some((entry) => entry.submissionId === submission.id)).toBe(true);
    });
  });

  it('orders leaderboard by execution time, latency, then submitted time and filters failures', async () => {
    await withClient({}, async (client) => {
      const submissions = new SubmissionRepository(client);
      const results = new EvaluationResultRepository(client);
      const slow = await submissions.create({challengeId: '01-user-orders-missing-index', participantName: 'Slow', sqlText: 'SELECT 1', sqlHash: 'slow'});
      const fast = await submissions.create({challengeId: '01-user-orders-missing-index', participantName: 'Fast', sqlText: 'SELECT 1', sqlHash: 'fast'});
      const incorrect = await submissions.create({challengeId: '01-user-orders-missing-index', participantName: 'Wrong', sqlText: 'SELECT 2', sqlHash: 'wrong'});

      await submissions.updateStatus(slow.id, 'completed');
      await submissions.updateStatus(fast.id, 'completed');
      await submissions.updateStatus(incorrect.id, 'completed');
      await results.create({submissionId: slow.id, correct: true, rowCount: 1, latencyMs: 5, executionTimeMs: 1});
      await results.create({submissionId: fast.id, correct: true, rowCount: 1, latencyMs: 2, executionTimeMs: 1});
      await results.create({submissionId: incorrect.id, correct: false, rowCount: 1, errorCode: 'result_mismatch'});

      const leaderboard = await submissions.leaderboard('01-user-orders-missing-index');
      const ids = leaderboard.map((entry) => entry.submissionId);
      expect(ids.indexOf(fast.id)).toBeLessThan(ids.indexOf(slow.id));
      expect(ids).not.toContain(incorrect.id);
    });
  });
});
