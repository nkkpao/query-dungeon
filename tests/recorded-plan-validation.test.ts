import {readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';
import {validateRecordedPlans} from '../src/challenges/recorded-plan-validation.js';
import {advancedVariants} from '../src/challenges/registry.js';

describe('recorded plan artifacts', () => {
  it('validates medium-scale recorded plans by structural markers', async () => {
    const results = await validateRecordedPlans(advancedVariants());
    expect(results).toHaveLength(3);
    expect(results.every((result) => result.ok)).toBe(true);
  });

  it('contains EXPLAIN ANALYZE and BUFFERS evidence without placeholders', () => {
    for (const variant of advancedVariants()) {
      const plan = readFileSync(variant.recordedPlanPath, 'utf8');
      expect(plan, variant.parentChallengeId).toContain('EXPLAIN (ANALYZE, BUFFERS)');
      expect(plan, variant.parentChallengeId).toContain('QUERY PLAN');
      expect(plan, variant.parentChallengeId).toContain('actual time');
      expect(plan, variant.parentChallengeId).toContain('Buffers:');
      expect(plan, variant.parentChallengeId).not.toMatch(/TODO|PLACEHOLDER/i);
    }
  });

  it('does not validate exact timing equality', () => {
    const validator = readFileSync('src/challenges/recorded-plan-validation.ts', 'utf8');
    expect(validator).not.toMatch(/Execution Time:\s*\\d/);
    expect(validator).not.toMatch(/actual time=.*equals/i);
  });

  it('records advanced baselines without executing official solution SQL', () => {
    const command = readFileSync('src/cli/commands/record-plans.ts', 'utf8');
    expect(command).toContain('readSqlFile(variant.baselineSqlPath)');
    expect(command).not.toContain('loadSuggestedSolutionQuery');
    expect(command).not.toContain('optionalOfficialSolutionSqlPath');
  });
});
