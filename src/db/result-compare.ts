import type {ExpectedResultContract} from '../challenges/types.js';

export interface ResultDiff {
  equal: boolean;
  missingRows: unknown[];
  extraRows: unknown[];
  changedRows: Array<{expected: unknown; actual: unknown}>;
}

export function validateRows(actualRows: Record<string, unknown>[], expected: ExpectedResultContract): ResultDiff {
  const actualColumns = Object.keys(actualRows[0] ?? {});
  for (const column of expected.columns) {
    if (!actualColumns.includes(column) && actualRows.length > 0) {
      return {equal: false, missingRows: [], extraRows: [], changedRows: [{expected: `column ${column}`, actual: actualColumns}]};
    }
  }
  return diffRows(expected.rows, actualRows, expected);
}

export function diffRows(
  leftRows: Record<string, unknown>[],
  rightRows: Record<string, unknown>[],
  options: Pick<ExpectedResultContract, 'orderSensitive' | 'numericTolerance' | 'normalization'> = {orderSensitive: false},
): ResultDiff {
  const left = normalizeRows(leftRows, options);
  const right = normalizeRows(rightRows, options);
  const max = Math.max(left.length, right.length);
  const missingRows: unknown[] = [];
  const extraRows: unknown[] = [];
  const changedRows: Array<{expected: unknown; actual: unknown}> = [];
  for (let index = 0; index < max; index += 1) {
    if (index >= right.length) {
      missingRows.push(left[index]);
    } else if (index >= left.length) {
      extraRows.push(right[index]);
    } else if (!valuesEqual(left[index], right[index], options.numericTolerance ?? 0)) {
      changedRows.push({expected: left[index], actual: right[index]});
    }
  }
  return {
    equal: missingRows.length === 0 && extraRows.length === 0 && changedRows.length === 0,
    missingRows,
    extraRows,
    changedRows,
  };
}

export function normalizeRows(
  rows: Record<string, unknown>[],
  options: Pick<ExpectedResultContract, 'orderSensitive' | 'normalization'> = {orderSensitive: false},
): unknown[] {
  const normalized = rows.map((row) => normalizeValue(row, options));
  if (options.orderSensitive) return normalized;
  return normalized.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
}

function normalizeValue(value: unknown, options: Pick<ExpectedResultContract, 'normalization'>): unknown {
  if (value instanceof Date) return options.normalization?.datesToIso === false ? value : value.toISOString();
  if (Array.isArray(value)) return value.map((item) => normalizeValue(item, options));
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, item]) => [key, normalizeValue(item, options)]),
    );
  }
  if (options.normalization?.numericStrings !== false && typeof value === 'string' && /^-?\d+(?:\.\d+)?$/.test(value)) {
    return Number(value);
  }
  return value;
}

function valuesEqual(left: unknown, right: unknown, tolerance: number): boolean {
  if (typeof left === 'number' && typeof right === 'number') {
    return Math.abs(left - right) <= tolerance;
  }
  return JSON.stringify(left) === JSON.stringify(right);
}
