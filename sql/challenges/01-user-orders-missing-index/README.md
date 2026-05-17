# 01 User Orders Without Index

Baseline plan: regenerate with make explain CHALLENGE=01-user-orders-missing-index.

Business task: support needs the latest orders for a single user.

Run:

```bash
make run CHALLENGE=01-user-orders-missing-index
make explain CHALLENGE=01-user-orders-missing-index
make compare CHALLENGE=01-user-orders-missing-index
```

Hints:

- Look for a scan over `orders`.
- Compare the filter columns with the sort columns.
- Design the narrowest access path for this support lookup.

Trade-offs: the reference index speeds this lookup but adds write and storage cost on every order insert.

Docs: see `docs/how-to-explain.md`, `docs/indexing-cheatsheet.md`, and `docs/query-optimization-workflow.md`.
