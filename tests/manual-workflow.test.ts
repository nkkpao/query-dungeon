import {writeFile, mkdtemp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {advancedVariants, getChallengeForVariant} from '../src/challenges/registry.js';
import {loadParticipantSql} from '../src/cli/query-loader.js';
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

  it('requires explicit variant selection for advanced baselines', () => {
    const baseline = getChallengeForVariant('06-jsonb-filter-gin-index');
    const advanced = getChallengeForVariant('06-jsonb-filter-gin-index', 'advanced');

    expect(baseline.baselineSqlPath).not.toContain('/variants/');
    expect(advanced.baselineSqlPath).toContain('/variants/advanced/');
  });

  it('does not accept optional official solutions as participant SQL files', async () => {
    for (const variant of advancedVariants()) {
      await expect(loadParticipantSql(variant.optionalOfficialSolutionSqlPath)).rejects.toThrow(
        /SOLUTION_PATH_FORBIDDEN/,
      );
    }
  });
});
