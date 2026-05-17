import {Command} from 'commander';
import {getChallenge} from '../../challenges/registry.js';
import {assertSeeded, withClient} from '../../db/connection.js';
import {timeoutMs} from '../options.js';
import {loadParticipantSql} from '../query-loader.js';

export function runSqlCommand(): Command {
  return new Command('run-sql')
    .description('Run a participant-selected SQL file')
    .argument('<challenge-id>')
    .requiredOption('--file <path>', 'SQL file to run')
    .action(async function (this: Command, challengeId: string, localOptions: {file: string}) {
      const options: any = {...(this.parent?.opts() ?? {}), ...localOptions};
      getChallenge(challengeId);
      const querySql = await loadParticipantSql(localOptions.file);
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
