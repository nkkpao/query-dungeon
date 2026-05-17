import {describe, expect, it} from 'vitest';
import {extractSolutionParts} from '../src/db/sql-files.js';

describe('apply-solution convention', () => {
  it('splits migration SQL from query SQL', () => {
    const parts = extractSolutionParts('CREATE INDEX idx ON t(id);\n\n-- query\nSELECT * FROM t');
    expect(parts.migrationSql).toContain('CREATE INDEX');
    expect(parts.querySql).toBe('SELECT * FROM t');
  });
});
