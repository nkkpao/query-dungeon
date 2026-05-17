import {existsSync} from 'node:fs';
import {describe, expect, it} from 'vitest';
import {challenges} from '../src/challenges/registry.js';

describe('challenge files', () => {
  it('has README, bad SQL, solution SQL, expected SQL, and baseline plan for every challenge', () => {
    for (const challenge of challenges) {
      for (const file of [
        challenge.readmePath,
        challenge.badSqlPath,
        challenge.solutionSqlPath,
        challenge.expectedSqlPath,
        challenge.baselinePlanPath,
      ]) {
        expect(existsSync(file), file).toBe(true);
      }
    }
  });
});
