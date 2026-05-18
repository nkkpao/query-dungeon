# 02 Sales Report With Over-Joining

Capture the baseline plan yourself with `make explain-file`.

Business task: Analytics ranks categories by paid revenue.

Expected output: `category_id`, `category_name`, `paid_orders`, `revenue_cents`; highest revenue first.

Symptoms to investigate:

- Track row counts before aggregation.
- Find joins that multiply rows without changing the requested metric.
- Check whether sort or aggregate nodes spill to temp files.

Constraints:

- Revenue must still come from paid, shipped, and delivered orders only.
- Do not remove a table unless you can prove it does not affect the answer.
- Measure after each rewrite before adding indexes.

Success criterion: The plan aggregates fewer unnecessary rows while preserving category revenue and paid-order counts.

Manual workflow:

```bash
make run-sql CHALLENGE=02-sales-report-over-joining SQL=sql/challenges/02-sales-report-over-joining/baseline.sql
make explain-file CHALLENGE=02-sales-report-over-joining SQL=sql/challenges/02-sales-report-over-joining/baseline.sql
cp sql/challenges/02-sales-report-over-joining/baseline.sql workspace/sql/02-sales-report-over-joining-attempt-1.sql
make validate-file CHALLENGE=02-sales-report-over-joining SQL=workspace/sql/02-sales-report-over-joining-attempt-1.sql
make benchmark-file CHALLENGE=02-sales-report-over-joining SQL=workspace/sql/02-sales-report-over-joining-attempt-1.sql ITERATIONS=3
```

Hints: see `hints/hints.md`.

Solution access: suggested solutions are in `optional/` and are outside the default exercise flow. Use them only through the explicit `compare-with-official-solution` command after your own investigation.

Docs: see `docs/how-to-explain.md`, `docs/indexing-cheatsheet.md`, and `docs/query-optimization-workflow.md`.
