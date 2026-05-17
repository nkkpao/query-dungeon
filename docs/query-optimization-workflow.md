# Query Optimization Workflow

1. Read `challenge.md` and identify the business answer the query must return.
2. Run `baseline.sql` with `run-sql`; save a note about row count and shape.
3. Capture `EXPLAIN (ANALYZE, BUFFERS)` with `explain-file`.
4. Name the dominant symptom: scan, join, sort, aggregate, repeated subquery,
   row-estimate error, or buffer pressure.
5. Copy the baseline into `workspace/sql/` and change one hypothesis at a time.
6. Put manual index experiments in `workspace/indexes/`; run them explicitly.
7. Validate your attempt with `validate-file` before trusting speed numbers.
8. Benchmark with `benchmark-file --baseline --iterations 3` on the same seed.
9. Compare your own attempts with `diff-results`.
10. Record the trade-off: storage, write cost, specificity, maintenance, and
    cases where the idea may not help.

Official solutions are reference material for deliberate review. They are not
part of the investigation loop.
