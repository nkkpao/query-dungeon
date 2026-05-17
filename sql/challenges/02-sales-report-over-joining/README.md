# 02 Sales Report With Over-Joining

Baseline plan: regenerate with make explain CHALLENGE=02-sales-report-over-joining.

Business task: rank categories by paid revenue.

Run:

```bash
make explain CHALLENGE=02-sales-report-over-joining
```

Hints:

- The baseline joins a table that does not change the requested metric.
- Watch row counts before aggregation.
- Remove nonessential joins before choosing indexes.

Trade-offs: the reference status index helps paid-order reporting, but it adds write cost and has low value for broad status filters.

Docs: see `docs/how-to-explain.md`, `docs/indexing-cheatsheet.md`, and `docs/query-optimization-workflow.md`.
