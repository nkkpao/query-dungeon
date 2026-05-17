# 10 Window Function Overuse

Baseline plan: regenerate with make explain CHALLENGE=10-window-function-overuse.

Business task: find each user's largest paid order.

Hints: not every top-per-group query needs several window functions.

Trade-offs: `DISTINCT ON` is PostgreSQL-specific and depends on careful ordering.

Docs: see `docs/how-to-explain.md`, `docs/indexing-cheatsheet.md`, and `docs/query-optimization-workflow.md`.
