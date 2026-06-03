import type pg from 'pg';
import {explainAnalyze} from '../../db/explain.js';
import type {ExplainMetrics} from '../types.js';

export class ExplainRunner {
  async run(client: pg.PoolClient, sql: string): Promise<ExplainMetrics> {
    const parsed = await explainAnalyze(client, sql);
    return {
      planningTimeMs: parsed.planningTimeMs,
      executionTimeMs: parsed.executionTimeMs,
      actualRows: parsed.rows,
      sharedHitBlocks: parsed.sharedHitBlocks,
      sharedReadBlocks: parsed.sharedReadBlocks,
      tempReadBlocks: parsed.tempReadBlocks,
      tempWrittenBlocks: parsed.tempWrittenBlocks,
      planText: parsed.planText,
    };
  }
}
