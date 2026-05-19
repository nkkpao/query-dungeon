import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {loadExpectedResult} from '../src/challenges/expected-result.js';
import {advancedVariants, challenges} from '../src/challenges/registry.js';

describe('advanced challenge variants', () => {
  it('ships complete advanced variant packets', async () => {
    for (const variant of advancedVariants()) {
      for (const file of [
        variant.challengePath,
        variant.baselineSqlPath,
        variant.expectedResultPath,
        variant.dataProfilePath,
        variant.hintsPath,
        variant.recordedPlanPath,
        variant.optionalOfficialSolutionSqlPath,
        variant.optionalOfficialIndexesSqlPath,
      ]) {
        expect(existsSync(file), `${variant.parentChallengeId}/${variant.id}: ${file}`).toBe(true);
      }

      const expected = await loadExpectedResult(variant.expectedResultPath);
      expect(expected.fixtureSqlPath, variant.parentChallengeId).toContain('/variants/advanced/result-fixture.sql');
      expect(existsSync(expected.fixtureSqlPath!), `${variant.parentChallengeId}: ${expected.fixtureSqlPath}`).toBe(true);
      expect(path.basename(expected.fixtureSqlPath!), variant.parentChallengeId).not.toBe('baseline.sql');
    }
  });

  it('keeps advanced baselines distinct from baseline challenges without optimizing them away', () => {
    for (const variant of advancedVariants()) {
      const parent = challenges.find((challenge) => challenge.id === variant.parentChallengeId)!;
      const parentSql = readFileSync(parent.baselineSqlPath, 'utf8').trim();
      const advancedSql = readFileSync(variant.baselineSqlPath, 'utf8').trim();

      expect(advancedSql, variant.parentChallengeId).not.toBe(parentSql);
      expect(advancedSql, variant.parentChallengeId).toMatch(/^SELECT/i);
      expect(advancedSql, variant.parentChallengeId).not.toMatch(/CREATE\s+INDEX/i);
    }
  });

  it('keeps advanced official solutions distinct and documents trade-offs', () => {
    for (const variant of advancedVariants()) {
      const advancedSql = readFileSync(variant.baselineSqlPath, 'utf8').trim();
      const solutionSql = readFileSync(variant.optionalOfficialSolutionSqlPath, 'utf8').trim();

      expect(solutionSql, variant.parentChallengeId).not.toBe(advancedSql);
      expect(solutionSql, variant.parentChallengeId).toMatch(/\bTrade-off:/i);
    }
  });

  it('documents medium-scale skew assumptions and planner symptoms', () => {
    for (const variant of advancedVariants()) {
      const challenge = readFileSync(variant.challengePath, 'utf8');
      const profile = readFileSync(variant.dataProfilePath, 'utf8');
      const combined = `${challenge}\n${profile}`;

      expect(combined, variant.parentChallengeId).toContain('SEED_SCALE=medium');
      expect(combined, variant.parentChallengeId).toMatch(/skew|hot|long-tail|low-selectivity|NULL/i);
      expect(combined, variant.parentChallengeId).toMatch(/Seq Scan|Sort|Hash Join|Nested Loop|Rows Removed by Filter|Buffers/);
    }
  });
});
