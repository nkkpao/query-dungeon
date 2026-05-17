# 11 Inventory Aggregation Mistake

Baseline plan: regenerate with make explain CHALLENGE=11-inventory-aggregation.

Business task: find products with the lowest stock on hand.

Hints: the stock metric is computed before an unrelated detail join expands the intermediate rows.

Trade-offs: removing the join preserves the stock metric, but a report that truly needs item-level sales dimensions should aggregate those dimensions separately.

Docs: see `docs/how-to-explain.md`, `docs/indexing-cheatsheet.md`, and `docs/query-optimization-workflow.md`.
