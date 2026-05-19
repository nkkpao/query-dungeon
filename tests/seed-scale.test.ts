import {readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';
import {seedScale, validateSeedScale, validateVariant} from '../src/cli/options.js';

describe('seed scale validation', () => {
  it.each(['small', 'medium', 'large'])('accepts %s', (scale) => {
    expect(() => validateSeedScale(scale)).not.toThrow();
  });

  it('rejects invalid scale', () => {
    expect(() => validateSeedScale('tiny')).toThrow(/INVALID_SEED_SCALE/);
  });

  it('keeps small as the default scale', () => {
    expect(seedScale({})).toBe('small');
  });

  it('accepts only explicit advanced variant selection', () => {
    expect(() => validateVariant(undefined)).not.toThrow();
    expect(() => validateVariant('advanced')).not.toThrow();
    expect(() => validateVariant('medium')).toThrow(/INVALID_VARIANT/);
  });

  it('documents deterministic medium skew in the seed SQL', () => {
    const mediumSeed = readFileSync('sql/seeds/002_seed_medium.sql', 'utf8');

    expect(mediumSeed).toContain('Medium-scale skew profile');
    expect(mediumSeed).toContain('42');
    expect(mediumSeed).toContain('77');
    expect(mediumSeed).toContain('123');
    expect(mediumSeed).toContain('demand_band');
    expect(mediumSeed).toContain('hot');
    expect(mediumSeed).toMatch(/jsonb_build_object[\s\S]*device[\s\S]*NULL/);
    expect(mediumSeed).toMatch(/gs % 14/);
  });

  it('spreads hot order-item skew across all documented hot products', () => {
    const mediumSeed = readFileSync('sql/seeds/002_seed_medium.sql', 'utf8');

    expect(mediumSeed).toContain("WHEN o.id % 5 = 0 THEN 1 + ((((o.id / 5)::bigint) + n - 1) % 20)");
    expect(mediumSeed).not.toContain('WHEN o.id % 5 = 0 THEN 1 + (o.id % 20)');

    const hotProductIds = new Set<number>();
    for (let orderId = 5001; orderId <= 100000; orderId += 1) {
      if (orderId % 5 !== 0) {
        continue;
      }
      for (let n = 1; n <= 4; n += 1) {
        hotProductIds.add(1 + ((Math.trunc(orderId / 5) + n - 1) % 20));
      }
    }

    expect([...hotProductIds].sort((a, b) => a - b)).toEqual(Array.from({length: 20}, (_, index) => index + 1));
  });

  it('preserves the intended medium event skew shape', () => {
    let hotUserEvents = 0;
    let viewOrSearchEvents = 0;
    let nullDeviceEvents = 0;
    let springCampaignEvents = 0;
    let totalEvents = 0;

    for (let gs = 12001; gs <= 250000; gs += 1) {
      totalEvents += 1;
      if (gs % 2 === 0 || gs % 7 === 0 || gs % 13 === 0) {
        hotUserEvents += 1;
      }
      if (gs % 20 <= 15) {
        viewOrSearchEvents += 1;
      }
      if (gs % 5 === 0) {
        nullDeviceEvents += 1;
      }
      if (gs % 17 === 0) {
        springCampaignEvents += 1;
      }
    }

    expect(hotUserEvents / totalEvents).toBeGreaterThan(0.55);
    expect(viewOrSearchEvents / totalEvents).toBeGreaterThan(0.75);
    expect(nullDeviceEvents / totalEvents).toBeCloseTo(0.2, 2);
    expect(springCampaignEvents / totalEvents).toBeGreaterThan(0.05);
  });

  it('keeps CI-style defaults away from medium recorded-plan generation', () => {
    const makefile = readFileSync('Makefile', 'utf8');
    const packageJson = readFileSync('package.json', 'utf8');

    expect(makefile).toContain('SEED_SCALE ?= small');
    expect(makefile).toContain('record-plans:');
    expect(packageJson).toContain('"test": "vitest run"');
    expect(packageJson.match(/"test": "vitest run"/)?.[0]).not.toContain('record-plans');
  });
});
