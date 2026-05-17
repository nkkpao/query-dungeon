#!/usr/bin/env node
import 'dotenv/config';
import {Command} from 'commander';
import {benchmarkFileCommand} from './commands/benchmark-file.js';
import {compareWithOfficialSolutionCommand} from './commands/compare-with-official-solution.js';
import {diffResultsCommand} from './commands/diff-results.js';
import {explainFileCommand} from './commands/explain-file.js';
import {listCommand} from './commands/list.js';
import {runSqlCommand} from './commands/run-sql.js';
import {seedCommand} from './commands/seed.js';
import {validateFileCommand} from './commands/validate-file.js';

const program = new Command()
  .name('dungeon')
  .description('Postgres Query Dungeon CLI')
  .option('--database-url <url>', 'PostgreSQL connection URL')
  .option('--scale <small|medium|large>', 'seed scale')
  .option('--timeout-ms <number>', 'per-query statement timeout')
  .option('--json', 'emit JSON where supported');

program
  .addCommand(seedCommand())
  .addCommand(listCommand())
  .addCommand(runSqlCommand())
  .addCommand(explainFileCommand())
  .addCommand(benchmarkFileCommand())
  .addCommand(validateFileCommand())
  .addCommand(diffResultsCommand())
  .addCommand(compareWithOfficialSolutionCommand());

program.parseAsync(process.argv).catch((error: unknown) => {
  let message = error instanceof Error && error.message ? error.message : String(error);
  if (error instanceof AggregateError) {
    message = error.errors
      .map((item) => item instanceof Error ? item.message : String(item))
      .filter(Boolean)
      .join('\n');
  }
  if (/ECONNREFUSED|connect/i.test(message)) {
    message = `DATABASE_UNAVAILABLE: Cannot connect to PostgreSQL. Run "docker compose up -d" or "make setup" first.\n${message}`;
  }
  console.error(message);
  process.exitCode = 1;
});
