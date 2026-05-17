import {describe, expect, it} from 'vitest';
import {challenges} from '../src/challenges/registry.js';
import {withClient} from '../src/db/connection.js';
import {loadChallengeQuery} from '../src/cli/query-loader.js';
import {normalizeRows} from '../src/cli/commands/compare.js';

const runDbTests = process.env.RUN_DB_TESTS === '1';

describe.skipIf(!runDbTests)('challenge result equivalence', () => {
  it('bad and solution queries return equivalent rows for all challenges', async () => {
    await withClient({}, async (client) => {
      for (const challenge of challenges) {
        const bad = await client.query(await loadChallengeQuery(challenge, 'bad'));
        const solution = await client.query(await loadChallengeQuery(challenge, 'solution'));
        expect(normalizeRows(bad.rows), challenge.id).toEqual(normalizeRows(solution.rows));
      }
    });
  });
});
