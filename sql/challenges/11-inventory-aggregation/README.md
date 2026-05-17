# 11 Inventory Aggregation Mistake

Baseline plan: regenerate with make explain CHALLENGE=11-inventory-aggregation.

Business task: find products with the lowest stock on hand.

Hints: unrelated detail joins can multiply inventory rows.

Trade-offs: removing the join preserves the metric but may not satisfy reports that need item-level sales dimensions.

Docs: see `docs/how-to-explain.md`, `docs/indexing-cheatsheet.md`, and `docs/query-optimization-workflow.md`.
