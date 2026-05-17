import {writeFile, mkdtemp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {readSqlFile} from '../src/db/sql-files.js';

describe('manual workflow SQL files', () => {
  it('allows participant-selected SQL files', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'dungeon-sql-'));
    const file = path.join(dir, 'attempt.sql');
    await writeFile(file, 'SELECT 1 AS ok');
    await expect(readSqlFile(file)).resolves.toContain('SELECT 1');
  });

  it('rejects empty participant SQL files clearly', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'dungeon-sql-'));
    const file = path.join(dir, 'empty.sql');
    await writeFile(file, '   ');
    await expect(readSqlFile(file)).rejects.toThrow(/SQL_FILE_EMPTY/);
  });
});
