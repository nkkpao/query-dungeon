import {Command} from 'commander';
import {getChallenge} from '../../challenges/registry.js';
import type {QueryVariant} from '../../challenges/types.js';
import {assertSeeded, withClient} from '../../db/connection.js';
import {timeoutMs} from '../options.js';
import {loadChallengeQuery} from '../query-loader.js';

export function runCommand(): Command {
  return new Command('run')
    .description('Run a challenge query')
    .argument('<challenge-id>')
    .option('--variant <bad|solution>', 'query variant', 'bad')
    .action(async function (this: Command, challengeId: string, localOptions) {
      const options = {...(this.parent?.opts() ?? {}), ...localOptions};
      const challenge = getChallenge(challengeId);
      const variant = options.variant as QueryVariant;
      const querySql = await loadChallengeQuery(challenge, variant);
      await withClient({databaseUrl: options.databaseUrl, timeoutMs: timeoutMs(options)}, async (client) => {
        await assertSeeded(client);
        const result = await client.query(querySql);
        if (options.json) {
          console.log(JSON.stringify(result.rows, null, 2));
        } else {
          console.table(result.rows);
        }
      });
    });
}
