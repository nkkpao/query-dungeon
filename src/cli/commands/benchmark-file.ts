import {Command} from 'commander';
import {getChallengeForVariant} from '../../challenges/registry.js';
import {benchmarkQuery} from '../../db/benchmark.js';
import {assertSeeded, withClient} from '../../db/connection.js';
import {seedScale, timeoutMs, validateVariant} from '../options.js';
import {loadBaselineQuery, loadParticipantSql} from '../query-loader.js';

export function benchmarkFileCommand(): Command {
  return new Command('benchmark-file')
    .description('Benchmark a participant-selected SQL file')
    .argument('<challenge-id>')
    .requiredOption('--file <path>', 'SQL file to benchmark')
    .option('--baseline', 'also benchmark the challenge baseline')
    .option('--iterations <n>', 'iterations', '3')
    .option('--variant <variant>', 'challenge variant, e.g. advanced')
    .action(async function (
      this: Command,
      challengeId: string,
      localOptions: {file: string; baseline?: boolean; iterations: string; variant?: string},
    ) {
      const options: any = {...(this.parent?.opts() ?? {}), ...localOptions};
      validateVariant(localOptions.variant);
      const challenge = getChallengeForVariant(challengeId, localOptions.variant);
      const iterations = Number(localOptions.iterations);
      if (!Number.isInteger(iterations) || iterations < 1) {
        throw new Error('INVALID_ITERATIONS: --iterations must be a positive integer.');
      }
      const participantSql = await loadParticipantSql(localOptions.file);
      await withClient({databaseUrl: options.databaseUrl, timeoutMs: timeoutMs(options)}, async (client) => {
        await assertSeeded(client);
        const results = [];
        if (localOptions.baseline) {
          results.push(await benchmarkQuery(client, challenge, 'baseline', challenge.baselineSqlPath, seedScale(options), await loadBaselineQuery(challenge), iterations));
        }
        results.push(await benchmarkQuery(client, challenge, 'participant', localOptions.file, seedScale(options), participantSql, iterations));
        if (options.json) {
          console.log(JSON.stringify(results, null, 2));
          return;
        }
        console.log('Absolute timings vary by machine. Compare attempts on the same seed and machine.');
        console.table(results.map((result) => ({
          label: result.label,
          sqlPath: result.sqlPath,
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
