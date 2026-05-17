import {describe, expect, it} from 'vitest';
import {parseExpectedResult} from '../src/challenges/expected-result.js';
import {diffRows, validateRows} from '../src/db/result-compare.js';

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
});
