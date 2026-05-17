import {Command} from 'commander';
import {getChallenge} from '../../challenges/registry.js';
import {assertSeeded, withClient} from '../../db/connection.js';
import {splitSqlStatements} from '../../db/sql-files.js';
import {timeoutMs} from '../options.js';
import {loadSolutionMigration} from '../query-loader.js';

export function applySolutionCommand(): Command {
  return new Command('apply-solution')
    .description('Apply solution migration for a challenge')
    .argument('<challenge-id>')
    .action(async function (this: Command, challengeId: string) {
      const options = this.parent?.opts() ?? {};
      const challenge = getChallenge(challengeId);
      await withClient({databaseUrl: options.databaseUrl, timeoutMs: timeoutMs(options)}, async (client) => {
        await assertSeeded(client);
        const existing = await client.query('SELECT 1 FROM solution_state WHERE challenge_id = $1', [challenge.id]);
        if (existing.rowCount) {
          throw new Error(`SOLUTION_ALREADY_APPLIED: ${challenge.id} is already applied. Run "make reset-solutions" to replay.`);
        }
        const migrationSql = await loadSolutionMigration(challenge);
        for (const statement of splitSqlStatements(migrationSql)) {
          await client.query(statement);
        }
        await client.query('INSERT INTO solution_state (challenge_id) VALUES ($1)', [challenge.id]);
        console.log(`Applied solution for ${challenge.id}.`);
      });
    });
}
