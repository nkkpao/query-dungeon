# How to Read EXPLAIN

Use `EXPLAIN (ANALYZE, BUFFERS)` to compare what PostgreSQL planned with what actually happened.

Run it against the exact file you are investigating:

```bash
make explain-file CHALLENGE=01-user-orders-missing-index \
  SQL=workspace/sql/01-user-orders-attempt-1.sql
```

- Seq Scan: PostgreSQL read a table directly. This can be fine for tiny or broad scans, and suspicious for selective lookups.
- Nested Loop: useful for small outer inputs, painful when repeated many times against large inner scans.
- Hash Join: often good for equality joins, but check build size and row estimates.
- Bitmap Scan: often appears when PostgreSQL combines index selectivity with heap access.
- Sort Spill: temp read/write buffers suggest the sort or hash work exceeded memory.
- Buffers: shared hit means cache, shared read means disk/page reads, temp read/write means work files.
- Planning Time and Execution Time: planning is optimizer overhead; execution is the query work.

Always compare result correctness before treating a faster query as better.
Use `validate-file` for correctness and `benchmark-file` for repeated timing on
the same seed scale.
