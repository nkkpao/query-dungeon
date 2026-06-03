import {describe, expect, it} from 'vitest';
import {validateSqlSafety} from '../src/server/services/sql-safety.js';

const maxBytes = 100;

describe('SQL safety validation', () => {
  it('allows one SELECT statement', () => {
    expect(validateSqlSafety('SELECT id FROM users LIMIT 1', maxBytes).ok).toBe(true);
  });

  it.each([
    'SELECT 1; SELECT 2',
    'EXPLAIN SELECT 1',
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
    "SELECT set_config('statement_timeout', '0', false)",
    "SELECT nextval('orders_id_seq')",
    "SELECT setval('orders_id_seq', 1)",
    'SELECT pg_sleep(10)',
    "SELECT pg_advisory_lock(42)",
    "SELECT pg_notify('submissions', 'done')",
    "SELECT pg_catalog.set_config('statement_timeout', '0', false)",
    "SELECT pg_read_file('/etc/passwd')",
  ])('rejects unsafe SQL: %s', (sql) => {
    const result = validateSqlSafety(sql, 1000);
    expect(result.ok).toBe(false);
    expect(result.errorCode).toBe('safety_rejected');
  });

  it('enforces max SQL size', () => {
    const result = validateSqlSafety(`SELECT '${'x'.repeat(120)}'`, maxBytes);
    expect(result.ok).toBe(false);
    expect(result.errorCode).toBe('safety_rejected');
  });
});
