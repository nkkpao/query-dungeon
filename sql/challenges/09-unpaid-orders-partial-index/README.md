# 09 Unpaid Orders Partial Index

Baseline plan: regenerate with make explain CHALLENGE=09-unpaid-orders-partial-index.

Business task: triage recent unpaid orders.

Hints: check how many rows match the status and whether a full-table access path is wasteful.

Trade-offs: partial indexes are compact, but only queries matching the predicate benefit.

Docs: see `docs/how-to-explain.md`, `docs/indexing-cheatsheet.md`, and `docs/query-optimization-workflow.md`.
