import {Command} from 'commander';
import {getChallenge} from '../../challenges/registry.js';
import {benchmarkQuery} from '../../db/benchmark.js';
import {assertSeeded, withClient} from '../../db/connection.js';
import {splitSqlStatements} from '../../db/sql-files.js';
import {seedScale, timeoutMs} from '../options.js';
import {
  loadBaselineQuery,
  loadSuggestedSolutionIndexes,
  loadSuggestedSolutionQuery,
  loadParticipantSql,
} from '../query-loader.js';

export function compareWithSuggestedSolutionCommand(): Command {
  return new Command('compare-with-suggested-solution')
    .description('Explicitly compare participant SQL with suggested solution material')
    .argument('<challenge-id>')
    .requiredOption('--file <path>', 'participant SQL file')
    .option('--benchmark', 'benchmark participant, baseline, and suggested solution inside a rolled-back transaction')
    .option('--show-sql', 'print suggested SQL')
    .option('--iterations <n>', 'benchmark iterations', '3')
    .action(async function (
      this: Command,
      challengeId: string,
      localOptions: {file: string; benchmark?: boolean; showSql?: boolean; iterations: string},
    ) {
      const options: any = {...(this.parent?.opts() ?? {}), ...localOptions};
      const challenge = getChallenge(challengeId);
      console.warn('SOLUTION_ACCESS_OPT_IN: You are leaving the default exercise flow and reading suggested solution material.');
      const [participantSql, suggestedSql, suggestedIndexes] = await Promise.all([
        loadParticipantSql(localOptions.file),
        loadSuggestedSolutionQuery(challenge),
        loadSuggestedSolutionIndexes(challenge),
      ]);

      if (localOptions.showSql) {
        console.log('\n-- suggested-indexes.sql');
        console.log(suggestedIndexes.trim());
        console.log('\n-- suggested-solution.sql');
        console.log(suggestedSql.trim());
      }
      if (!localOptions.benchmark) {
        console.log('Use --benchmark to measure your file against the baseline and suggested reference.');
        return;
      }

      const iterations = Number(localOptions.iterations);
      if (!Number.isInteger(iterations) || iterations < 1) {
        throw new Error('INVALID_ITERATIONS: --iterations must be a positive integer.');
      }
      await withClient({databaseUrl: options.databaseUrl, timeoutMs: timeoutMs(options)}, async (client) => {
        await assertSeeded(client);
        const results = [];
        await client.query('BEGIN');
        try {
          results.push(await benchmarkQuery(client, challenge, 'baseline', challenge.baselineSqlPath, seedScale(options), await loadBaselineQuery(challenge), iterations));
          results.push(await benchmarkQuery(client, challenge, 'participant', localOptions.file, seedScale(options), participantSql, iterations));
          for (const statement of splitSqlStatements(suggestedIndexes)) {
            await client.query(statement);
          }
          results.push(await benchmarkQuery(client, challenge, 'suggested-solution', challenge.optionalSuggestedSolutionSqlPath, seedScale(options), suggestedSql, iterations));
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
