import {describe, expect, it} from 'vitest';
import {challenges} from '../src/challenges/registry.js';

describe('reset-solutions metadata', () => {
  it('knows which solution indexes are resettable', () => {
    expect(challenges.every((challenge) => challenge.solutionIndexes.length > 0)).toBe(true);
  });
});
