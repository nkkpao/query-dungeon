import {describe, expect, it} from 'vitest';
import {canonicalAntiPatternTags, challenges} from '../src/challenges/registry.js';

describe('challenge registry', () => {
  it('contains exactly 12 challenges with required metadata', () => {
    expect(challenges).toHaveLength(12);
    for (const challenge of challenges) {
      expect(challenge.id).toMatch(/^\d{2}-/);
      expect(challenge.title).toBeTruthy();
      expect(['easy', 'medium', 'hard', 'boss']).toContain(challenge.difficulty);
      expect(challenge.antiPatternTags.length).toBeGreaterThan(0);
      expect(challenge.planSymptoms.length).toBeGreaterThan(0);
      expect(challenge.badSqlPath).toContain(challenge.id);
      expect(challenge.solutionSqlPath).toContain(challenge.id);
      expect(challenge.expectedSqlPath).toContain(challenge.id);
      expect(challenge.baselinePlanPath).toContain(challenge.id);
    }
  });

  it('covers all canonical tags', () => {
    const covered = new Set(challenges.flatMap((challenge) => challenge.antiPatternTags));
    expect(canonicalAntiPatternTags.every((tag) => covered.has(tag))).toBe(true);
  });
});
