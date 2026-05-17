# 03 Latest Payment Correlated Subquery

Baseline plan: regenerate with make explain CHALLENGE=03-latest-payment-correlated-subquery.

Business task: show the latest payment state for recent non-cancelled orders.

Hints: repeated subplans are the smell; check whether two correlated lookups can become one lateral lookup.

Trade-offs: the reference index adds write overhead to payments but supports latest-by-order reads.

Docs: see `docs/how-to-explain.md`, `docs/indexing-cheatsheet.md`, and `docs/query-optimization-workflow.md`.
