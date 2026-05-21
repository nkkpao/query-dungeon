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
      await results.create({submissionId: submission.id, correct: true, rowCount: 1, latencyMs: 2, executionTimeMs: 1});
      const found = await submissions.findById(submission.id);
      expect(found?.result?.correct).toBe(true);
      const leaderboard = await submissions.leaderboard('01-user-orders-missing-index');
      expect(leaderboard.some((entry) => entry.submissionId === submission.id)).toBe(true);
    });
  });
});
