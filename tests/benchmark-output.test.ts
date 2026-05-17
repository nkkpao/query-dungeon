import {describe, expect, it} from 'vitest';
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
});
