import {Command} from 'commander';
import {challenges, getChallenge} from '../../challenges/registry.js';
import {assertSeeded, withClient} from '../../db/connection.js';
import {timeoutMs} from '../options.js';

export function resetSolutionsCommand(): Command {
  return new Command('reset-solutions')
    .description('Drop solution-only indexes and clear solution state')
    .argument('[challenge-id]')
    .action(async function (this: Command, challengeId?: string) {
      const options = this.parent?.opts() ?? {};
      const selected = challengeId ? [getChallenge(challengeId)] : challenges;
      await withClient({databaseUrl: options.databaseUrl, timeoutMs: timeoutMs(options)}, async (client) => {
        await assertSeeded(client);
        for (const challenge of selected) {
          for (const indexName of challenge.solutionIndexes) {
            await client.query(`DROP INDEX IF EXISTS ${indexName}`);
          }
          await client.query('DELETE FROM solution_state WHERE challenge_id = $1', [challenge.id]);
        }
        console.log(`Reset ${selected.length} challenge solution state(s).`);
      });
    });
}
