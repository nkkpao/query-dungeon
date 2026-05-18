# 04 Large Table OFFSET Pagination

Capture the baseline plan yourself with `make explain-file`.

Business task: An admin screen fetches a deep page of orders.

Expected output: `id`, `user_id`, `status`, `created_at`, `total_cents`; same page ordering as the baseline.

Symptoms to investigate:

- Observe how many ordered rows PostgreSQL must visit before returning the page.
- Compare top-N sort behavior with an ordered index path.
- Reason about cursor/keyset pagination versus arbitrary page numbers.

Constraints:

- Keep ordering stable on `created_at DESC, id DESC`.
- If you introduce a cursor, document how the cursor value is obtained.
- Do not hide work in application code.

Success criterion: The attempt makes page navigation depend on an ordered access path instead of repeatedly walking skipped rows.

Manual workflow:

```bash
make run-sql CHALLENGE=04-offset-pagination SQL=sql/challenges/04-offset-pagination/baseline.sql
make explain-file CHALLENGE=04-offset-pagination SQL=sql/challenges/04-offset-pagination/baseline.sql
cp sql/challenges/04-offset-pagination/baseline.sql workspace/sql/04-offset-pagination-attempt-1.sql
make validate-file CHALLENGE=04-offset-pagination SQL=workspace/sql/04-offset-pagination-attempt-1.sql
make benchmark-file CHALLENGE=04-offset-pagination SQL=workspace/sql/04-offset-pagination-attempt-1.sql ITERATIONS=3
```

Hints: see `hints/hints.md`.

Solution access: suggested solutions are in `optional/` and are outside the default exercise flow. Use them only through the explicit `compare-with-suggested-solution` command after your own investigation.

Docs: see `docs/how-to-explain.md`, `docs/indexing-cheatsheet.md`, and `docs/query-optimization-workflow.md`.
