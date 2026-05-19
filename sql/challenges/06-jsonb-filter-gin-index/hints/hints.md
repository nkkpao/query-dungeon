# Hints

- Check how many products match both JSONB keys, not just `tier`.
- Compare a default GIN index with `jsonb_path_ops` for containment-only predicates.
- Re-run `EXPLAIN (ANALYZE, BUFFERS)` after indexing to confirm the scan type changed.

These hints stop short of the suggested SQL. Use them to decide what to measure next.
