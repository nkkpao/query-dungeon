import {describe, expect, it} from 'vitest';
import {
  advancedVariants,
  canonicalAntiPatternTags,
  challenges,
  getChallengeForVariant,
} from '../src/challenges/registry.js';

describe('challenge registry', () => {
  it('contains exactly 13 challenges with required metadata', () => {
    expect(challenges).toHaveLength(13);
    for (const challenge of challenges) {
      expect(challenge.id).toMatch(/^\d{2}-/);
      expect(challenge.title).toBeTruthy();
      expect(['easy', 'medium', 'hard', 'boss']).toContain(challenge.difficulty);
      expect(challenge.antiPatternTags.length).toBeGreaterThan(0);
      expect(challenge.planSymptoms.length).toBeGreaterThan(0);
      expect(challenge.challengePath).toContain(challenge.id);
      expect(challenge.baselineSqlPath).toContain(challenge.id);
      expect(challenge.expectedResultPath).toContain(challenge.id);
      expect(challenge.hintsPath).toContain(challenge.id);
      expect(challenge.hintsRuPath).toContain(challenge.id);
      expect(challenge.optionalBaselineExplainPath).toContain(challenge.id);
      expect(challenge).not.toHaveProperty('solutionIndexes');
    }
  });

  it('covers all canonical tags', () => {
    const covered = new Set(challenges.flatMap((challenge) => challenge.antiPatternTags));
    expect(canonicalAntiPatternTags.every((tag) => covered.has(tag))).toBe(true);
  });

  it('registers advanced variants additively without changing baseline IDs', () => {
    expect(challenges).toHaveLength(13);
    expect(advancedVariants()).toHaveLength(3);

    for (const variant of advancedVariants()) {
      const parent = challenges.find((challenge) => challenge.id === variant.parentChallengeId);
      expect(parent, variant.id).toBeDefined();
      expect(variant.id).toBe('advanced');
      expect(variant.baselineSqlPath).toContain(`${variant.parentChallengeId}/variants/advanced/baseline.sql`);
      expect(variant.challengePath).toContain(`${variant.parentChallengeId}/variants/advanced/challenge.md`);
      expect(variant.recordedPlanPath).toContain('recorded-plan.medium.txt');
      expect(variant.optionalOfficialSolutionSqlPath).toContain('/variants/advanced/optional/');
      expect(variant.optionalOfficialIndexesSqlPath).toContain('/variants/advanced/optional/');
    }
  });

  it('keeps default challenge lookup on the baseline unless a variant is explicit', () => {
    const baseline = getChallengeForVariant('04-offset-pagination');
    const advanced = getChallengeForVariant('04-offset-pagination', 'advanced');

    expect(baseline.id).toBe('04-offset-pagination');
    expect(baseline.baselineSqlPath).toContain('04-offset-pagination/baseline.sql');
    expect(baseline.baselineSqlPath).not.toContain('/variants/');
    expect(advanced.id).toBe('04-offset-pagination');
    expect(advanced.baselineSqlPath).toContain('04-offset-pagination/variants/advanced/baseline.sql');
  });
});
