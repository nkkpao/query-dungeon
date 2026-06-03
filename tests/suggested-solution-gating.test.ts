import {readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';
import {advancedVariants, challenges} from '../src/challenges/registry.js';
import {listCommand} from '../src/cli/commands/list.js';
import {benchmarkFileCommand} from '../src/cli/commands/benchmark-file.js';
import {diffResultsCommand} from '../src/cli/commands/diff-results.js';
import {explainFileCommand} from '../src/cli/commands/explain-file.js';
import {runSqlCommand} from '../src/cli/commands/run-sql.js';
import {validateFileCommand} from '../src/cli/commands/validate-file.js';
import {FakePool, makeSubmissionEvaluator} from './helpers/evaluation-fakes.js';

describe('suggested solution gating', () => {
  it('keeps suggested paths out of active challenge metadata', () => {
    for (const challenge of challenges) {
      expect(challenge).not.toHaveProperty('solutionSqlPath');
      expect(challenge).not.toHaveProperty('solutionIndexes');
      expect(challenge).not.toHaveProperty('badSqlPath');
    }
  });

  it('keeps advanced official solutions in optional-only paths', () => {
    for (const variant of advancedVariants()) {
      expect(variant.baselineSqlPath, variant.parentChallengeId).not.toContain('/optional/');
      expect(variant.challengePath, variant.parentChallengeId).not.toContain('/optional/');
      expect(variant.optionalOfficialSolutionSqlPath, variant.parentChallengeId).toContain('/optional/');
      expect(variant.optionalOfficialIndexesSqlPath, variant.parentChallengeId).toContain('/optional/');
    }
  });

  it('does not register solution commands in the default CLI command set', () => {
    const commandNames = [
      listCommand().name(),
      runSqlCommand().name(),
      explainFileCommand().name(),
      benchmarkFileCommand().name(),
      validateFileCommand().name(),
      diffResultsCommand().name(),
    ];
    expect(commandNames).not.toContain('apply-solution');
    expect(commandNames).not.toContain('reset-solutions');
  });

  it('keeps README and Makefile normal path focused on participant files', () => {
    const docs = [
      readFileSync('README.md', 'utf8'),
      readFileSync('README_RU.md', 'utf8'),
      readFileSync('Makefile', 'utf8'),
    ].join('\n');
    expect(docs).toContain('run-sql');
    expect(docs).toContain('explain-file');
    expect(docs).toContain('benchmark-file');
    expect(docs).not.toContain('apply-solution');
  });

  it('does not read suggested solution fields during server evaluation', async () => {
    const challenge = {
      id: '01-user-orders-missing-index',
      expectedResultPath: 'expected-result.json',
      get optionalOfficialSolutionSqlPath() {
        throw new Error('suggested solution SQL must not be read');
      },
      get optionalOfficialIndexesSqlPath() {
        throw new Error('suggested indexes must not be read');
      },
    };
    const catalog = {
      resolve: () => challenge,
      expectedResult: async () => ({columns: ['id'], rows: [{id: 1}], orderSensitive: true}),
    };
    const result = await makeSubmissionEvaluator(new FakePool(), catalog as any).evaluate({
      challengeId: '01-user-orders-missing-index',
      participantName: 'Ada',
      sql: 'SELECT 1 AS id',
    });

    expect(result.correct).toBe(true);
  });
});
