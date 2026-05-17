import {Command} from 'commander';
import {getChallenge} from '../../challenges/registry.js';
import {assertSeeded, withClient} from '../../db/connection.js';
import {timeoutMs} from '../options.js';
import {loadChallengeQuery} from '../query-loader.js';

export function compareCommand(): Command {
  return new Command('compare')
    .description('Compare bad and solution results')
    .argument('<challenge-id>')
    .action(async function (this: Command, challengeId: string) {
      const options = this.parent?.opts() ?? {};
      const challenge = getChallenge(challengeId);
      await withClient({databaseUrl: options.databaseUrl, timeoutMs: timeoutMs(options)}, async (client) => {
        await assertSeeded(client);
        const [bad, solution] = await Promise.all([
          client.query(await loadChallengeQuery(challenge, 'bad')),
          client.query(await loadChallengeQuery(challenge, 'solution')),
        ]);
        const badRows = normalizeRows(bad.rows);
        const solutionRows = normalizeRows(solution.rows);
        if (JSON.stringify(badRows) !== JSON.stringify(solutionRows)) {
          throw new Error(`RESULT_MISMATCH: ${challenge.id} bad and solution results differ.`);
        }
        console.log(`OK: ${challenge.id} bad and solution results are equivalent (${badRows.length} rows).`);
      });
    });
}

export function normalizeRows(rows: unknown[]): unknown[] {
  return rows
    .map((row) => normalizeValue(row))
    .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
}

function normalizeValue(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(normalizeValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, item]) => [key, normalizeValue(item)]),
    );
  }
  if (typeof value === 'string' && /^-?\d+(?:\.\d+)?$/.test(value)) return Number(value);
  return value;
}
