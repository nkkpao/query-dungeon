import {Command} from 'commander';
import {loadExpectedResult} from '../../challenges/expected-result.js';
import {getChallenge} from '../../challenges/registry.js';
import {assertSeeded, withClient} from '../../db/connection.js';
import {validateRows} from '../../db/result-compare.js';
import {timeoutMs} from '../options.js';
import {loadParticipantSql} from '../query-loader.js';

export function validateFileCommand(): Command {
  return new Command('validate-file')
    .description('Validate a participant-selected SQL file against expected-result.json')
    .argument('<challenge-id>')
    .requiredOption('--file <path>', 'SQL file to validate')
    .action(async function (this: Command, challengeId: string, localOptions: {file: string}) {
      const options: any = {...(this.parent?.opts() ?? {}), ...localOptions};
      const challenge = getChallenge(challengeId);
      const [querySql, expected] = await Promise.all([
        loadParticipantSql(localOptions.file),
        loadExpectedResult(challenge.expectedResultPath),
      ]);
      await withClient({databaseUrl: options.databaseUrl, timeoutMs: timeoutMs(options)}, async (client) => {
        await assertSeeded(client);
        const [result, fixture] = await Promise.all([
          client.query(querySql),
          expected.rows.length === 0 && expected.fixtureSqlPath
            ? client.query(await loadParticipantSql(expected.fixtureSqlPath))
            : Promise.resolve(null),
        ]);
        const diff = validateRows(result.rows, {...expected, rows: fixture?.rows ?? expected.rows});
        if (!diff.equal) {
          throw new Error(`RESULT_MISMATCH: ${challenge.id} output differs from expected-result.json.\n${JSON.stringify(diff, null, 2)}`);
        }
        if (options.json) {
          console.log(JSON.stringify({ok: true, challengeId: challenge.id, rows: result.rowCount}, null, 2));
        } else {
          console.log(`OK: ${challenge.id} matched expected-result.json (${result.rowCount} rows).`);
        }
      });
    });
}
