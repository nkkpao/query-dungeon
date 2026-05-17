# 04 Large Table OFFSET Pagination

Baseline plan: regenerate with make explain CHALLENGE=04-offset-pagination.

Business task: fetch a deep page of orders.

Hints: OFFSET still walks skipped rows; keyset pagination needs a stable cursor.

Trade-offs: keyset pagination changes API shape because clients must carry a cursor.

Docs: see `docs/how-to-explain.md`, `docs/indexing-cheatsheet.md`, and `docs/query-optimization-workflow.md`.
