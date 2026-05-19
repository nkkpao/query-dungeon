import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {Command} from 'commander';
import {advancedVariants} from '../../challenges/registry.js';
import {assertSeeded, withClient} from '../../db/connection.js';
import {explainAnalyzeText} from '../../db/explain.js';
import {readSqlFile} from '../../db/sql-files.js';
import {seedScale, timeoutMs, validateSeedScale} from '../options.js';

export function recordPlansCommand(): Command {
  return new Command('record-plans')
    .description('Maintainer-only: regenerate advanced variant recorded plans for an explicit seed scale')
    .option('--scale <small|medium|large>', 'seed scale for plan capture')
    .action(async function (this: Command, localOptions: {scale?: string}) {
      const options: any = {...(this.parent?.opts() ?? {}), ...localOptions};
      const scale = seedScale(options);
      validateSeedScale(scale);
      if (scale !== 'medium') {
        throw new Error('RECORDED_PLAN_SCALE_REQUIRED: recorded advanced plans must be regenerated with --scale medium.');
      }
      await withClient({databaseUrl: options.databaseUrl, timeoutMs: timeoutMs(options)}, async (client) => {
        await assertSeeded(client);
        for (const variant of advancedVariants()) {
          const sql = await readSqlFile(variant.baselineSqlPath);
          const plan = await explainAnalyzeText(client, sql);
          const output = [
            `Captured with SEED_SCALE=medium for ${variant.parentChallengeId}:${variant.id}`,
            'Command: EXPLAIN (ANALYZE, BUFFERS)',
            'QUERY PLAN',
            plan,
            '',
          ].join('\n');
          await mkdir(path.dirname(variant.recordedPlanPath), {recursive: true});
          await writeFile(variant.recordedPlanPath, output);
          console.log(`recorded ${variant.recordedPlanPath}`);
        }
      });
    });
}
