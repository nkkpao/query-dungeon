import {describe, expect, it} from 'vitest';
import {loadExpectedResult, parseExpectedResult} from '../src/challenges/expected-result.js';
import {advancedVariants} from '../src/challenges/registry.js';
import {diffRows, validateRows} from '../src/db/result-compare.js';
import {CorrectnessValidator} from '../src/server/services/correctness-validator.js';

describe('result validation', () => {
  it('parses expected-result contracts', () => {
    const contract = parseExpectedResult({
      columns: ['id', 'total'],
      rows: [{id: 1, total: '10'}],
      orderSensitive: false,
      numericTolerance: 0.01,
      normalization: {numericStrings: true},
    });
    expect(contract.columns).toEqual(['id', 'total']);
    expect(contract.numericTolerance).toBe(0.01);
  });

  it('normalizes numeric strings and unordered rows', () => {
    const diff = validateRows([
      {id: '2', total: '20'},
      {id: '1', total: '10'},
    ], {
      columns: ['id', 'total'],
      rows: [{id: 1, total: 10}, {id: 2, total: 20}],
      orderSensitive: false,
      normalization: {numericStrings: true},
    });
    expect(diff.equal).toBe(true);
  });

  it('reports missing and extra participant rows', () => {
    const diff = diffRows([{id: 1}, {id: 2}], [{id: 1}, {id: 3}], {orderSensitive: false});
    expect(diff.equal).toBe(false);
    expect(diff.changedRows.length + diff.missingRows.length + diff.extraRows.length).toBeGreaterThan(0);
  });

  it('reuses validateRows normalization inside CorrectnessValidator', async () => {
    const result = await new CorrectnessValidator().validate({query: async () => ({rows: []})} as any, [
      {id: '2', total: '20'},
      {id: '1', total: '10'},
    ], {
      columns: ['id', 'total'],
      rows: [{id: 1, total: 10}, {id: 2, total: 20}],
      orderSensitive: false,
      normalization: {numericStrings: true},
    });

    expect(result.correct).toBe(true);
    expect(result.diff.equal).toBe(true);
    expect(result.diffSummary).toBeNull();
  });

  it('uses independent advanced variant correctness fixtures', async () => {
    for (const variant of advancedVariants()) {
      const expected = await loadExpectedResult(variant.expectedResultPath);
      expect(expected.fixtureSqlPath, variant.parentChallengeId).not.toBe(variant.baselineSqlPath);
      expect(expected.fixtureSqlPath, variant.parentChallengeId).toContain('/variants/advanced/result-fixture.sql');
      expect(expected.columns.length, variant.parentChallengeId).toBeGreaterThan(0);
    }
  });
});
