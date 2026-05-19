import {describe, expect, it} from 'vitest';
import {loadExpectedResult} from '../src/challenges/expected-result.js';
import {challenges} from '../src/challenges/registry.js';
import {loadBaselineQuery} from '../src/cli/query-loader.js';
import {readSqlFile} from '../src/db/sql-files.js';
import {withClient} from '../src/db/connection.js';
import {validateRows} from '../src/db/result-compare.js';

const runDbTests = process.env.RUN_DB_TESTS === '1';

describe.skipIf(!runDbTests)('challenge result equivalence', () => {
  it('baseline queries match expected-result rows for all challenges', async () => {
    await withClient({}, async (client) => {
      for (const challenge of challenges) {
        const baseline = await client.query(await loadBaselineQuery(challenge));
        const expected = await loadExpectedResult(challenge.expectedResultPath);
        const fixture = expected.rows.length === 0 && expected.fixtureSqlPath
          ? await client.query(await readSqlFile(expected.fixtureSqlPath))
          : null;
        expect(validateRows(baseline.rows, {...expected, rows: fixture?.rows ?? expected.rows}).equal, `${challenge.id} baseline`).toBe(true);
      }
    });
  });
});
