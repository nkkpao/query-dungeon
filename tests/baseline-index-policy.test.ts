import {readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';

describe('baseline index policy', () => {
  it('does not include lesson solution indexes', () => {
    const sql = readFileSync('sql/schema/002_baseline_indexes.sql', 'utf8').toLowerCase();
    expect(sql).not.toMatch(/orders\s*\(\s*user_id/);
    expect(sql).not.toContain('lower(email)');
    expect(sql).not.toMatch(/using\s+gin\s*\(\s*(attributes|metadata)/);
    expect(sql).not.toMatch(/where\s+status\s*=\s*'unpaid'/);
  });
});
