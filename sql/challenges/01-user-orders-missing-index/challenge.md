# 01 User Orders Without Index

Capture the baseline plan yourself with `make explain-file`.

Business task: Support needs the latest orders for one customer while investigating a ticket.

Expected output: `id`, `user_id`, `status`, `created_at`, `total_cents`; newest orders first.

Symptoms to investigate:

- Look for whether PostgreSQL can narrow to one user before sorting.
- Compare rows returned with rows removed by the filter.
- Use buffers to decide whether the query is reading far more data than the answer needs.

Constraints:

- Keep ordering deterministic on `created_at DESC, id DESC`.
- Do not change the business filter or limit.
- Index experiments belong in `workspace/indexes/` and should be run manually.

Success criterion: The query stays correct and avoids scanning most `orders` rows for one-user lookups.

Manual workflow:

```bash
make run-sql CHALLENGE=01-user-orders-missing-index SQL=sql/challenges/01-user-orders-missing-index/baseline.sql
make explain-file CHALLENGE=01-user-orders-missing-index SQL=sql/challenges/01-user-orders-missing-index/baseline.sql
cp sql/challenges/01-user-orders-missing-index/baseline.sql workspace/sql/01-user-orders-missing-index-attempt-1.sql
make validate-file CHALLENGE=01-user-orders-missing-index SQL=workspace/sql/01-user-orders-missing-index-attempt-1.sql
make benchmark-file CHALLENGE=01-user-orders-missing-index SQL=workspace/sql/01-user-orders-missing-index-attempt-1.sql ITERATIONS=3
```

Hints: see `hints/hints.md`.

Solution access: suggested solutions are in `optional/` and are outside the default exercise flow. Use them only through the explicit `compare-with-official-solution` command after your own investigation.

Docs: see `docs/how-to-explain.md`, `docs/indexing-cheatsheet.md`, and `docs/query-optimization-workflow.md`.
