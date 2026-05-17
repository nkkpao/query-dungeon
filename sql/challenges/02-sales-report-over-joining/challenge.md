# 02 Sales Report With Over-Joining

Capture the baseline plan yourself with `make explain-file`.

Business task: rank categories by paid revenue.

Manual workflow:

```bash
make run-sql CHALLENGE=02-sales-report-over-joining SQL=sql/challenges/02-sales-report-over-joining/baseline.sql
make explain-file CHALLENGE=02-sales-report-over-joining SQL=sql/challenges/02-sales-report-over-joining/baseline.sql
cp sql/challenges/02-sales-report-over-joining/baseline.sql workspace/sql/02-sales-report-over-joining-attempt-1.sql
make validate-file CHALLENGE=02-sales-report-over-joining SQL=workspace/sql/02-sales-report-over-joining-attempt-1.sql
make benchmark-file CHALLENGE=02-sales-report-over-joining SQL=workspace/sql/02-sales-report-over-joining-attempt-1.sql ITERATIONS=3
```

Hints:

- The baseline joins a table that does not change the requested metric.
- Watch row counts before aggregation.
- Remove nonessential joins before choosing indexes.

Solution access: official reference material is in `optional/` and is outside the default exercise flow. Use it only through the explicit `compare-with-official-solution` command after your own investigation.

Docs: see `docs/how-to-explain.md`, `docs/indexing-cheatsheet.md`, and `docs/query-optimization-workflow.md`.
