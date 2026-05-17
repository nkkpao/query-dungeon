import {Command} from 'commander';
import {withClient} from '../../db/connection.js';
import {readSqlFile, splitSqlStatements} from '../../db/sql-files.js';
import {seedScale, timeoutMs, validateSeedScale} from '../options.js';

export function seedCommand(): Command {
  return new Command('seed')
    .description('Reset schema and load deterministic seed data')
    .option('--scale <small|medium|large>', 'seed scale')
    .action(async function (this: Command, localOptions) {
      const options = {...(this.parent?.opts() ?? {}), ...localOptions};
      const scale = seedScale(options);
      validateSeedScale(scale);
      await withClient({databaseUrl: options.databaseUrl, timeoutMs: timeoutMs(options)}, async (client) => {
        const files = [
          'sql/seeds/000_reset.sql',
          'sql/schema/001_tables.sql',
          'sql/schema/002_baseline_indexes.sql',
          'sql/schema/003_solution_state.sql',
          'sql/seeds/001_seed_small.sql',
        ];
        if (scale === 'medium' || scale === 'large') files.push('sql/seeds/002_seed_medium.sql');
        if (scale === 'large') files.push('sql/seeds/003_seed_large.sql');
        for (const file of files) {
          let sql = await readSqlFile(file);
          sql = sql.replace(/^\\i .+$/gm, '');
          for (const statement of splitSqlStatements(sql)) {
            await client.query(statement);
          }
        }
        const counts = await client.query<{table_name: string; estimate: string}>(`
          SELECT relname AS table_name, n_live_tup::text AS estimate
          FROM pg_stat_user_tables
          ORDER BY relname
        `);
        console.log(`Seeded ${scale} dataset.`);
        for (const row of counts.rows) {
          console.log(`${row.table_name}: ${row.estimate}`);
        }
      });
    });
}
