# 09 Unpaid Orders Partial Index

Baseline plan: regenerate with make explain CHALLENGE=09-unpaid-orders-partial-index.

Business task: triage recent unpaid orders.

Hints: a partial index can target the sparse status.

Trade-offs: partial indexes are compact, but only queries matching the predicate benefit.

Docs: see `docs/how-to-explain.md`, `docs/indexing-cheatsheet.md`, and `docs/query-optimization-workflow.md`.
