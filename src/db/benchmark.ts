import {performance} from 'node:perf_hooks';
import type pg from 'pg';
import type {BenchmarkResult, Challenge, QueryVariant} from '../challenges/types.js';
import {explainAnalyze} from './explain.js';

export async function benchmarkQuery(
  client: pg.PoolClient,
  challenge: Challenge,
  variant: QueryVariant,
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
  return {...parsed, challengeId: challenge.id, variant, seedScale, latencyMs};
}
