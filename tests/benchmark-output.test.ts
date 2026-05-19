import {describe, expect, it} from 'vitest';
import {advancedVariants} from '../src/challenges/registry.js';
import type {BenchmarkResult} from '../src/challenges/types.js';

describe('benchmark output shape', () => {
  it('contains required metrics', () => {
    const result: BenchmarkResult = {
      challengeId: '01-user-orders-missing-index',
      label: 'participant',
      sqlPath: 'workspace/sql/attempt.sql',
      seedScale: 'small',
      latencyMs: 1,
      planningTimeMs: 0.1,
      executionTimeMs: 0.9,
      rows: 20,
      sharedHitBlocks: 1,
      sharedReadBlocks: 2,
      tempReadBlocks: 0,
      tempWrittenBlocks: 0,
      planText: 'plan',
    };
    expect(Object.keys(result)).toEqual(expect.arrayContaining([
      'latencyMs',
      'rows',
      'sharedHitBlocks',
      'sharedReadBlocks',
      'planningTimeMs',
      'executionTimeMs',
    ]));
  });

  it('can represent advanced variant learner benchmark attempts without solution paths', () => {
    for (const variant of advancedVariants()) {
      const result: BenchmarkResult = {
        challengeId: variant.parentChallengeId,
        label: 'participant',
        sqlPath: variant.baselineSqlPath,
        seedScale: 'medium',
        latencyMs: 1,
        planningTimeMs: 0.1,
        executionTimeMs: 0.9,
        rows: 20,
        sharedHitBlocks: 1,
        sharedReadBlocks: 2,
        tempReadBlocks: 0,
        tempWrittenBlocks: 0,
        planText: 'QUERY PLAN',
      };

      expect(result.sqlPath).toContain('/variants/advanced/baseline.sql');
      expect(result.sqlPath).not.toContain('/optional/');
    }
  });
});
