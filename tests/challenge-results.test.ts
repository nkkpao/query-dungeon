import {describe, expect, it} from 'vitest';
import {challenges} from '../src/challenges/registry.js';
import {withClient} from '../src/db/connection.js';
import {loadChallengeQuery, loadExpectedQuery} from '../src/cli/query-loader.js';
import {normalizeRows} from '../src/cli/commands/compare.js';

const runDbTests = process.env.RUN_DB_TESTS === '1';

describe.skipIf(!runDbTests)('challenge result equivalence', () => {
  it('bad and solution queries match expected rows for all challenges', async () => {
    await withClient({}, async (client) => {
      for (const challenge of challenges) {
        const bad = await client.query(await loadChallengeQuery(challenge, 'bad'));
        const solution = await client.query(await loadChallengeQuery(challenge, 'solution'));
        const expected = await client.query(await loadExpectedQuery(challenge));
        const expectedRows = normalizeRows(expected.rows);
        expect(normalizeRows(bad.rows), `${challenge.id} bad`).toEqual(expectedRows);
        expect(normalizeRows(solution.rows), `${challenge.id} solution`).toEqual(expectedRows);
      }
    });
  });
});
