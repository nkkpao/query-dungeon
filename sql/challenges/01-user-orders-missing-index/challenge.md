# 01 User Orders Without Index

Capture the baseline plan yourself with `make explain-file`.

Business task: support needs the latest orders for a single user.

Manual workflow:

```bash
make run-sql CHALLENGE=01-user-orders-missing-index SQL=sql/challenges/01-user-orders-missing-index/baseline.sql
make explain-file CHALLENGE=01-user-orders-missing-index SQL=sql/challenges/01-user-orders-missing-index/baseline.sql
cp sql/challenges/01-user-orders-missing-index/baseline.sql workspace/sql/01-user-orders-missing-index-attempt-1.sql
make validate-file CHALLENGE=01-user-orders-missing-index SQL=workspace/sql/01-user-orders-missing-index-attempt-1.sql
make benchmark-file CHALLENGE=01-user-orders-missing-index SQL=workspace/sql/01-user-orders-missing-index-attempt-1.sql ITERATIONS=3
```

Hints:

- Look for a scan over `orders`.
- Compare the filter columns with the sort columns.
- Design the narrowest access path for this support lookup.

Solution access: official reference material is in `optional/` and is outside the default exercise flow. Use it only through the explicit `compare-with-official-solution` command after your own investigation.

Docs: see `docs/how-to-explain.md`, `docs/indexing-cheatsheet.md`, and `docs/query-optimization-workflow.md`.
