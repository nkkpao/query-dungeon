#!/usr/bin/env node
import 'dotenv/config';
import {Command} from 'commander';
import {applySolutionCommand} from './commands/apply-solution.js';
import {benchmarkCommand} from './commands/benchmark.js';
import {compareCommand} from './commands/compare.js';
import {explainCommand} from './commands/explain.js';
import {listCommand} from './commands/list.js';
import {resetSolutionsCommand} from './commands/reset-solutions.js';
import {runCommand} from './commands/run.js';
import {seedCommand} from './commands/seed.js';

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
  .addCommand(runCommand())
  .addCommand(explainCommand())
  .addCommand(benchmarkCommand())
  .addCommand(compareCommand())
  .addCommand(applySolutionCommand())
  .addCommand(resetSolutionsCommand());

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
