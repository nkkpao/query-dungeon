# Query Optimization Workflow

1. Run the bad query and save its result.
2. Capture `EXPLAIN (ANALYZE, BUFFERS)`.
3. Identify the dominant symptom: scan, join, sort, aggregation, or repeated subquery.
4. Rewrite the SQL only when the rewrite preserves the business answer.
5. Add an index only when the query shape and data distribution justify it.
6. Compare bad and solution results.
7. Benchmark both variants on the same seed scale.
8. Explain the trade-off: storage, write cost, specificity, and maintenance.
