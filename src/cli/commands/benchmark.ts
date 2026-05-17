import {Command} from 'commander';
import {getChallenge} from '../../challenges/registry.js';
import {benchmarkQuery} from '../../db/benchmark.js';
import {assertSeeded, withClient} from '../../db/connection.js';
import {seedScale, timeoutMs} from '../options.js';
import {loadChallengeQuery} from '../query-loader.js';

export function benchmarkCommand(): Command {
  return new Command('benchmark')
    .description('Benchmark bad and solution query variants')
    .argument('<challenge-id>')
    .option('--iterations <n>', 'iterations', '3')
    .action(async function (this: Command, challengeId: string, localOptions) {
      const options = {...(this.parent?.opts() ?? {}), ...localOptions};
      const challenge = getChallenge(challengeId);
      const iterations = Number(localOptions.iterations);
      await withClient({databaseUrl: options.databaseUrl, timeoutMs: timeoutMs(options)}, async (client) => {
        await assertSeeded(client);
        const badSql = await loadChallengeQuery(challenge, 'bad');
        const solutionSql = await loadChallengeQuery(challenge, 'solution');
        const results = [
          await benchmarkQuery(client, challenge, 'bad', seedScale(options), badSql, iterations),
          await benchmarkQuery(client, challenge, 'solution', seedScale(options), solutionSql, iterations),
        ];
        if (options.json) {
          console.log(JSON.stringify(results, null, 2));
          return;
        }
        console.log('Absolute timings vary by machine. Compare variants on the same seed.');
        console.table(results.map((result) => ({
          variant: result.variant,
          latencyMs: result.latencyMs.toFixed(2),
          rows: result.rows,
          planningTimeMs: result.planningTimeMs,
          executionTimeMs: result.executionTimeMs,
          sharedHitBlocks: result.sharedHitBlocks,
          sharedReadBlocks: result.sharedReadBlocks,
          tempReadBlocks: result.tempReadBlocks,
          tempWrittenBlocks: result.tempWrittenBlocks,
        })));
      });
    });
}
