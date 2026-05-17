import {describe, expect, it} from 'vitest';
import {challenges} from '../src/challenges/registry.js';

describe('reset-solutions metadata', () => {
  it('keeps solution index names out of active challenge metadata', () => {
    expect(challenges.every((challenge) => !('solutionIndexes' in challenge))).toBe(true);
  });
});
