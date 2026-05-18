# 12 Marketplace Dashboard Boss Fight

Capture the baseline plan yourself with `make explain-file`.

Business task: A dashboard combines an order page with campaign-event and open-ticket counts.

Expected output: `id`, `user_id`, `total_cents`, `spring_events`, `open_tickets`; same order page ordering.

Symptoms to investigate:

- Break the plan into page selection, event counts, and ticket counts.
- Look for repeated scans under per-row subqueries.
- Check JSONB filtering and row estimates separately.

Constraints:

- Keep the dashboard page and both counts semantically equivalent.
- Do not cache or precompute outside PostgreSQL.
- Optimize one section at a time and validate after each change.

Success criterion: The plan first identifies the page, then computes related counts without repeatedly scanning large tables.

Manual workflow:

```bash
make run-sql CHALLENGE=12-dashboard-boss-fight SQL=sql/challenges/12-dashboard-boss-fight/baseline.sql
make explain-file CHALLENGE=12-dashboard-boss-fight SQL=sql/challenges/12-dashboard-boss-fight/baseline.sql
cp sql/challenges/12-dashboard-boss-fight/baseline.sql workspace/sql/12-dashboard-boss-fight-attempt-1.sql
make validate-file CHALLENGE=12-dashboard-boss-fight SQL=workspace/sql/12-dashboard-boss-fight-attempt-1.sql
make benchmark-file CHALLENGE=12-dashboard-boss-fight SQL=workspace/sql/12-dashboard-boss-fight-attempt-1.sql ITERATIONS=3
```

Hints: see `hints/hints.md`.

Solution access: suggested solutions are in `optional/` and are outside the default exercise flow. Use them only through the explicit `compare-with-official-solution` command after your own investigation.

Docs: see `docs/how-to-explain.md`, `docs/indexing-cheatsheet.md`, and `docs/query-optimization-workflow.md`.
