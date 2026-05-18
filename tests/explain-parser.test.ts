import {describe, expect, it} from 'vitest';
import {parseExplainText} from '../src/db/explain.js';

describe('EXPLAIN parser', () => {
  it('parses timing, rows, and buffers', () => {
    const parsed = parseExplainText(`
Seq Scan on orders  (cost=0.00..10.00 rows=42 width=8) (actual time=0.010..0.020 rows=20 loops=1)
  Buffers: shared hit=7 read=3
  ->  Index Scan on users  (cost=0.00..1.00 rows=1 width=8) (actual time=0.001..0.002 rows=1 loops=20)
        Buffers: shared hit=99 read=99
Planning Time: 0.123 ms
Execution Time: 4.567 ms
`);
    expect(parsed.rows).toBe(42);
    expect(parsed.planningTimeMs).toBe(0.123);
    expect(parsed.executionTimeMs).toBe(4.567);
    expect(parsed.sharedHitBlocks).toBe(7);
    expect(parsed.sharedReadBlocks).toBe(3);
  });
});
