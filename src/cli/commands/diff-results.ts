import {Command} from 'commander';
import {getChallengeForVariant} from '../../challenges/registry.js';
import {assertSeeded, withClient} from '../../db/connection.js';
import {diffRows} from '../../db/result-compare.js';
import {timeoutMs, validateVariant} from '../options.js';
import {loadParticipantSql} from '../query-loader.js';

export function diffResultsCommand(): Command {
  return new Command('diff-results')
    .description('Compare result sets from two participant-selected SQL files')
    .argument('<challenge-id>')
    .requiredOption('--left <path>', 'left SQL file')
    .requiredOption('--right <path>', 'right SQL file')
    .option('--variant <variant>', 'challenge variant, e.g. advanced')
    .action(async function (this: Command, challengeId: string, localOptions: {left: string; right: string; variant?: string}) {
      const options: any = {...(this.parent?.opts() ?? {}), ...localOptions};
      validateVariant(localOptions.variant);
      getChallengeForVariant(challengeId, localOptions.variant);
      const [leftSql, rightSql] = await Promise.all([
        loadParticipantSql(localOptions.left),
        loadParticipantSql(localOptions.right),
      ]);
      await withClient({databaseUrl: options.databaseUrl, timeoutMs: timeoutMs(options)}, async (client) => {
        await assertSeeded(client);
        const [left, right] = await Promise.all([client.query(leftSql), client.query(rightSql)]);
        const diff = diffRows(left.rows, right.rows);
        if (options.json) {
          console.log(JSON.stringify(diff, null, 2));
        } else if (diff.equal) {
          console.log('OK: participant SQL files return the same normalized rows.');
        } else {
          console.log(`DIFF: ${diff.missingRows.length} missing, ${diff.extraRows.length} extra, ${diff.changedRows.length} changed rows.`);
          console.log(JSON.stringify(diff, null, 2));
        }
      });
    });
}
