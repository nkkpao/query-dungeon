import {existsSync, readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';
import {challenges} from '../src/challenges/registry.js';

describe('challenge files', () => {
  it('has learner-facing and optional artifacts for every challenge', () => {
    for (const challenge of challenges) {
      for (const file of [
        challenge.challengePath,
        challenge.baselineSqlPath,
        challenge.expectedResultPath,
        challenge.hintsPath,
        challenge.optionalSolutionSqlPath,
        challenge.optionalIndexesSqlPath,
        challenge.optionalExplainPath,
      ]) {
        expect(existsSync(file), file).toBe(true);
      }
    }
  });

  it('stores captured EXPLAIN ANALYZE evidence outside learner-facing files', () => {
    for (const challenge of challenges) {
      const plan = readFileSync(challenge.optionalExplainPath, 'utf8');
      expect(plan, challenge.id).toContain('Execution Time:');
      expect(plan, challenge.id).toContain('Planning Time:');
      expect(plan, challenge.id).toContain('Buffers:');
      expect(plan, challenge.id).not.toMatch(/^Regenerate with:/);
    }
  });
});
