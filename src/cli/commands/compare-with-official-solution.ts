import {Command} from 'commander';
import {getChallenge} from '../../challenges/registry.js';
import {benchmarkQuery} from '../../db/benchmark.js';
import {assertSeeded, withClient} from '../../db/connection.js';
import {splitSqlStatements} from '../../db/sql-files.js';
import {seedScale, timeoutMs} from '../options.js';
import {
  loadBaselineQuery,
  loadOfficialSolutionIndexes,
  loadOfficialSolutionQuery,
  loadParticipantSql,
} from '../query-loader.js';

export function compareWithOfficialSolutionCommand(): Command {
  return new Command('compare-with-official-solution')
    .description('Explicitly compare participant SQL with official solution material')
    .argument('<challenge-id>')
    .requiredOption('--file <path>', 'participant SQL file')
    .option('--benchmark', 'benchmark participant, baseline, and official solution inside a rolled-back transaction')
    .option('--show-sql', 'print official SQL')
    .option('--iterations <n>', 'benchmark iterations', '3')
    .action(async function (
      this: Command,
      challengeId: string,
      localOptions: {file: string; benchmark?: boolean; showSql?: boolean; iterations: string},
    ) {
      const options: any = {...(this.parent?.opts() ?? {}), ...localOptions};
      const challenge = getChallenge(challengeId);
      const [participantSql, officialSql, officialIndexes] = await Promise.all([
        loadParticipantSql(localOptions.file),
        loadOfficialSolutionQuery(challenge),
        loadOfficialSolutionIndexes(challenge),
      ]);

      console.warn('SOLUTION_ACCESS_OPT_IN: You are leaving the default exercise flow and reading official solution material.');
      if (localOptions.showSql) {
        console.log('\n-- official-indexes.sql');
        console.log(officialIndexes.trim());
        console.log('\n-- official-solution.sql');
        console.log(officialSql.trim());
      }
      if (!localOptions.benchmark) {
        console.log('Use --benchmark to measure your file against the baseline and official reference.');
        return;
      }

      const iterations = Number(localOptions.iterations);
      await withClient({databaseUrl: options.databaseUrl, timeoutMs: timeoutMs(options)}, async (client) => {
        await assertSeeded(client);
        const results = [];
        await client.query('BEGIN');
        try {
          results.push(await benchmarkQuery(client, challenge, 'baseline', challenge.baselineSqlPath, seedScale(options), await loadBaselineQuery(challenge), iterations));
          results.push(await benchmarkQuery(client, challenge, 'participant', localOptions.file, seedScale(options), participantSql, iterations));
          for (const statement of splitSqlStatements(officialIndexes)) {
            await client.query(statement);
          }
          results.push(await benchmarkQuery(client, challenge, 'official-solution', challenge.optionalSolutionSqlPath, seedScale(options), officialSql, iterations));
        } finally {
          await client.query('ROLLBACK');
        }
        if (options.json) {
          console.log(JSON.stringify(results, null, 2));
        } else {
          console.table(results.map((result) => ({
            label: result.label,
            latencyMs: result.latencyMs.toFixed(2),
            rows: result.rows,
            planningTimeMs: result.planningTimeMs,
            executionTimeMs: result.executionTimeMs,
          })));
        }
      });
    });
}
