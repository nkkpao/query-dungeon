import {describe, expect, it} from 'vitest';
import {validateSeedScale} from '../src/cli/options.js';

describe('seed scale validation', () => {
  it.each(['small', 'medium', 'large'])('accepts %s', (scale) => {
    expect(() => validateSeedScale(scale)).not.toThrow();
  });

  it('rejects invalid scale', () => {
    expect(() => validateSeedScale('tiny')).toThrow(/INVALID_SEED_SCALE/);
  });
});
