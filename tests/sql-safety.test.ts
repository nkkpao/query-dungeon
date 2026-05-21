import {describe, expect, it} from 'vitest';
import {validateSqlSafety} from '../src/server/services/sql-safety.js';

const maxBytes = 100;

describe('SQL safety validation', () => {
  it('allows one SELECT statement', () => {
    expect(validateSqlSafety('SELECT id FROM users LIMIT 1', maxBytes).ok).toBe(true);
  });

  it.each([
    'SELECT 1; SELECT 2',
    'CREATE TABLE x(id int)',
    'INSERT INTO users(id) VALUES (1)',
    'UPDATE users SET email = email',
    'DELETE FROM users',
    'BEGIN; SELECT 1',
    'COPY users TO STDOUT',
    'CALL refresh_stats()',
    'DO $$ BEGIN END $$',
    'GRANT SELECT ON users TO public',
    'REVOKE SELECT ON users FROM public',
    'SELECT * INTO temp_users FROM users',
    'WITH changed AS (UPDATE users SET email = email RETURNING id) SELECT * FROM changed',
    'SELECT 1; -- SELECT only?',
    "SELECT 'drop table users'",
    'SELECT 1 /* delete from users */',
  ])('rejects unsafe SQL: %s', (sql) => {
    expect(validateSqlSafety(sql, 1000).ok).toBe(false);
  });

  it('enforces max SQL size', () => {
    expect(validateSqlSafety(`SELECT '${'x'.repeat(120)}'`, maxBytes).ok).toBe(false);
  });
});
