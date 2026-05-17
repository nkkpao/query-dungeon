import {performance} from 'node:perf_hooks';
import type pg from 'pg';
import type {BenchmarkResult, Challenge} from '../challenges/types.js';
import {explainAnalyze} from './explain.js';

export async function benchmarkQuery(
  client: pg.PoolClient,
  challenge: Challenge,
  label: string,
  sqlPath: string,
  seedScale: string,
  querySql: string,
  iterations: number,
): Promise<BenchmarkResult> {
  await client.query(querySql);
  const timings: number[] = [];
  for (let i = 0; i < iterations; i += 1) {
    const start = performance.now();
    await client.query(querySql);
    timings.push(performance.now() - start);
  }
  const parsed = await explainAnalyze(client, querySql);
  const latencyMs = timings.reduce((sum, value) => sum + value, 0) / timings.length;
  return {...parsed, challengeId: challenge.id, label, sqlPath, seedScale, latencyMs};
}
