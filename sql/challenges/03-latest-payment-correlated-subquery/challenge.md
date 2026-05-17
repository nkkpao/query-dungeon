# 03 Latest Payment Correlated Subquery

Capture the baseline plan yourself with `make explain-file`.

Business task: show the latest payment state for recent non-cancelled orders.

Hints: repeated subplans are the smell; check whether two correlated lookups can become one lateral lookup.

Solution access: official reference material is in `optional/` and is outside the default exercise flow. Use it only through the explicit `compare-with-official-solution` command after your own investigation.

Docs: see `docs/how-to-explain.md`, `docs/indexing-cheatsheet.md`, and `docs/query-optimization-workflow.md`.
