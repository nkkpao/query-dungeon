import {describe, expect, it} from 'vitest';
import {advancedVariants, challenges} from '../src/challenges/registry.js';
import {benchmarkFileCommand} from '../src/cli/commands/benchmark-file.js';
import {diffResultsCommand} from '../src/cli/commands/diff-results.js';
import {explainFileCommand} from '../src/cli/commands/explain-file.js';
import {runSqlCommand} from '../src/cli/commands/run-sql.js';
import {validateFileCommand} from '../src/cli/commands/validate-file.js';

describe('CLI smoke', () => {
  it('lists challenge 01', () => {
    const output = challenges.map((challenge) => `${challenge.id} | ${challenge.title}`).join('\n');
    expect(output).toContain('01-user-orders-missing-index');
  });

  it('keeps advanced variants out of the default list representation', () => {
    const output = challenges.map((challenge) => `${challenge.id} | ${challenge.title}`).join('\n');
    const variantOutput = advancedVariants()
      .map((variant) => `${variant.parentChallengeId}/${variant.id} | ${variant.title}`)
      .join('\n');

    expect(output).not.toContain('/advanced');
    expect(variantOutput).toContain('04-offset-pagination/advanced');
  });

  it('keeps recorded-plan generation outside the normal learner command set', () => {
    const learnerCommands = [
      runSqlCommand().name(),
      explainFileCommand().name(),
      benchmarkFileCommand().name(),
      validateFileCommand().name(),
      diffResultsCommand().name(),
    ];

    expect(learnerCommands).not.toContain('record-plans');
    expect(learnerCommands).not.toContain('validate-recorded-plans');
  });

  it('does not require server modules to construct learner commands', async () => {
    const command = runSqlCommand();
    expect(command.name()).toBe('run-sql');
    const server = await import('../src/server/app.js');
    expect(typeof server.buildApp).toBe('function');
  });
});
