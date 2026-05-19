import {Command} from 'commander';
import {getChallengeForVariant} from '../../challenges/registry.js';
import {assertSeeded, withClient} from '../../db/connection.js';
import {explainAnalyze} from '../../db/explain.js';
import {timeoutMs, validateVariant} from '../options.js';
import {loadParticipantSql} from '../query-loader.js';

export function explainFileCommand(): Command {
  return new Command('explain-file')
    .description('Run EXPLAIN (ANALYZE, BUFFERS) for a participant-selected SQL file')
    .argument('<challenge-id>')
    .requiredOption('--file <path>', 'SQL file to explain')
    .option('--variant <variant>', 'challenge variant, e.g. advanced')
    .action(async function (this: Command, challengeId: string, localOptions: {file: string; variant?: string}) {
      const options: any = {...(this.parent?.opts() ?? {}), ...localOptions};
      validateVariant(localOptions.variant);
      getChallengeForVariant(challengeId, localOptions.variant);
      const querySql = await loadParticipantSql(localOptions.file);
      await withClient({databaseUrl: options.databaseUrl, timeoutMs: timeoutMs(options)}, async (client) => {
        await assertSeeded(client);
        const parsed = await explainAnalyze(client, querySql);
        if (options.json) {
          console.log(JSON.stringify(parsed, null, 2));
        } else {
          console.log(parsed.planText);
        }
      });
    });
}
