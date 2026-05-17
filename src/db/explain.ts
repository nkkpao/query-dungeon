import type pg from 'pg';
import type {ParsedExplain} from '../challenges/types.js';

export function parseExplainText(planText: string): ParsedExplain {
  const planningTimeMs = numberMatch(planText, /Planning Time:\s*([\d.]+)\s*ms/i);
  const executionTimeMs = numberMatch(planText, /Execution Time:\s*([\d.]+)\s*ms/i);
  const rows = numberMatch(planText, /rows=(\d+)/i);
  const buffers = planText.split('\n').filter((line) => line.includes('Buffers:'));
  let sharedHitBlocks = 0;
  let sharedReadBlocks = 0;
  let tempReadBlocks = 0;
  let tempWrittenBlocks = 0;
  for (const line of buffers) {
    sharedHitBlocks += numberMatch(line, /shared hit=(\d+)/i) ?? 0;
    sharedReadBlocks += numberMatch(line, /(?:shared )?read=(\d+)/i) ?? 0;
    tempReadBlocks += numberMatch(line, /temp read=(\d+)/i) ?? 0;
    tempWrittenBlocks += numberMatch(line, /written=(\d+)/i) ?? 0;
  }
  return {planningTimeMs, executionTimeMs, rows, sharedHitBlocks, sharedReadBlocks, tempReadBlocks, tempWrittenBlocks, planText};
}

export async function explainAnalyze(client: pg.PoolClient, querySql: string): Promise<ParsedExplain> {
  const result = await client.query<{['QUERY PLAN']: string}>(`EXPLAIN (ANALYZE, BUFFERS) ${querySql}`);
  return parseExplainText(result.rows.map((row) => row['QUERY PLAN']).join('\n'));
}

function numberMatch(text: string, regex: RegExp): number | null {
  const match = text.match(regex);
  return match ? Number(match[1]) : null;
}
