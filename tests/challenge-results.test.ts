import {describe, expect, it} from 'vitest';
import {loadExpectedResult} from '../src/challenges/expected-result.js';
import {challenges} from '../src/challenges/registry.js';
import {loadBaselineQuery} from '../src/cli/query-loader.js';
import {withClient} from '../src/db/connection.js';
import {validateRows} from '../src/db/result-compare.js';

const runDbTests = process.env.RUN_DB_TESTS === '1';

describe.skipIf(!runDbTests)('challenge result equivalence', () => {
  it('baseline queries match expected-result rows for all challenges', async () => {
    await withClient({}, async (client) => {
      for (const challenge of challenges) {
        const baseline = await client.query(await loadBaselineQuery(challenge));
        const expected = await loadExpectedResult(challenge.expectedResultPath);
        expect(validateRows(baseline.rows, expected).equal, `${challenge.id} baseline`).toBe(true);
      }
    });
  });
});
