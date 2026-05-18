import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {challenges} from '../src/challenges/registry.js';
import {loadExpectedResult} from '../src/challenges/expected-result.js';

describe('challenge files', () => {
  it('has learner-facing and optional artifacts for every challenge', () => {
    for (const challenge of challenges) {
      for (const file of [
        challenge.challengePath,
        challenge.baselineSqlPath,
        challenge.expectedResultPath,
        challenge.hintsPath,
        challenge.hintsRuPath,
        challenge.optionalSolutionSqlPath,
        challenge.optionalIndexesSqlPath,
        challenge.optionalBaselineExplainPath,
      ]) {
        expect(existsSync(file), file).toBe(true);
      }
    }
  });

  it('keeps hint bodies in dedicated hint files', () => {
    for (const challenge of challenges) {
      const challengeText = readFileSync(challenge.challengePath, 'utf8');
      const challengeRuText = readFileSync(challenge.challengePath.replace(/\.md$/, '_RU.md'), 'utf8');
      const hintsText = readFileSync(challenge.hintsPath, 'utf8');
      const hintsRuText = readFileSync(challenge.hintsRuPath, 'utf8');

      expect(challenge.hintsPath, challenge.id).toContain('/hints/');
      expect(challenge.hintsRuPath, challenge.id).toContain('/hints/');
      expect(challengeText, challenge.id).toContain('Hints: see `hints/hints.md`.');
      expect(challengeRuText, challenge.id).toContain('Подсказки: см. `hints/hints_RU.md`.');
      expect(challengeText, challenge.id).not.toMatch(/Hints:\n\n-/);
      expect(challengeRuText, challenge.id).not.toMatch(/Подсказки:\n\n-/);
      expect(hintsText, challenge.id).toMatch(/^# Hints/);
      expect(hintsRuText, challenge.id).toMatch(/^# Подсказки/);
    }
  });

  it('keeps challenge prompts complete enough for investigation', () => {
    const requiredEnglishSections = [
      'Business task:',
      'Expected output:',
      'Symptoms to investigate:',
      'Constraints:',
      'Success criterion:',
      'Manual workflow:',
    ];
    const requiredRussianSections = [
      'Бизнес-задача:',
      'Ожидаемый результат:',
      'Симптомы для исследования:',
      'Ограничения:',
      'Критерий успеха:',
      'Ручной workflow:',
    ];

    for (const challenge of challenges) {
      const challengeText = readFileSync(challenge.challengePath, 'utf8');
      const challengeRuText = readFileSync(challenge.challengePath.replace(/\.md$/, '_RU.md'), 'utf8');
      for (const section of requiredEnglishSections) {
        expect(challengeText, `${challenge.id} ${section}`).toContain(section);
      }
      for (const section of requiredRussianSections) {
        expect(challengeRuText, `${challenge.id} ${section}`).toContain(section);
      }
    }
  });

  it('uses public baseline SQL as the executable correctness fixture', async () => {
    for (const challenge of challenges) {
      const expected = await loadExpectedResult(challenge.expectedResultPath);
      expect(expected.fixtureSqlPath, challenge.id).toBe(challenge.baselineSqlPath);
      const fixtureSql = readFileSync(expected.fixtureSqlPath!, 'utf8').trim();
      const officialSql = readFileSync(challenge.optionalSolutionSqlPath, 'utf8').trim();
      if (path.basename(expected.fixtureSqlPath!) !== 'baseline.sql') {
        expect(fixtureSql, challenge.id).not.toBe(officialSql);
      }
    }
  });

  it('stores captured EXPLAIN ANALYZE evidence outside learner-facing files', () => {
    for (const challenge of challenges) {
      expect(challenge.optionalBaselineExplainPath, challenge.id).toContain('baseline-explain.txt');
      const plan = readFileSync(challenge.optionalBaselineExplainPath, 'utf8');
      expect(plan, challenge.id).toContain('Execution Time:');
      expect(plan, challenge.id).toContain('Planning Time:');
      expect(plan, challenge.id).toContain('Buffers:');
      expect(plan, challenge.id).not.toMatch(/^Regenerate with:/);
    }
  });
});
