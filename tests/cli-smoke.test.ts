import {describe, expect, it} from 'vitest';
import {challenges} from '../src/challenges/registry.js';

describe('CLI smoke', () => {
  it('lists challenge 01', () => {
    const output = challenges.map((challenge) => `${challenge.id} | ${challenge.title}`).join('\n');
    expect(output).toContain('01-user-orders-missing-index');
  });
});
