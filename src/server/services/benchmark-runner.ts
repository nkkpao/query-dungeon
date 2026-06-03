import {performance} from 'node:perf_hooks';
import type pg from 'pg';

export interface BenchmarkRunResult {
  rows: Record<string, unknown>[];
  rowCount: number;
  latencyMs: number;
}

export class BenchmarkRunner {
  async run(client: pg.PoolClient, sql: string): Promise<BenchmarkRunResult> {
    const start = performance.now();
    const result = await client.query(sql);
    return {
      rows: result.rows as Record<string, unknown>[],
      rowCount: result.rowCount ?? result.rows.length,
      latencyMs: performance.now() - start,
    };
  }
}
