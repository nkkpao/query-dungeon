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
      expect(challenge.challengePath).toContain(challenge.id);
      expect(challenge.baselineSqlPath).toContain(challenge.id);
      expect(challenge.expectedResultPath).toContain(challenge.id);
      expect(challenge.hintsPath).toContain(challenge.id);
      expect(challenge).not.toHaveProperty('solutionIndexes');
    }
  });

  it('covers all canonical tags', () => {
    const covered = new Set(challenges.flatMap((challenge) => challenge.antiPatternTags));
    expect(canonicalAntiPatternTags.every((tag) => covered.has(tag))).toBe(true);
  });
});
