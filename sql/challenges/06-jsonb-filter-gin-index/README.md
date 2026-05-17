# 06 JSONB Filter Without GIN

Baseline plan: regenerate with make explain CHALLENGE=06-jsonb-filter-gin-index.

Business task: find premium products stored in JSONB attributes.

Hints: inspect JSONB containment and the scan type.

Trade-offs: GIN indexes can be large and slower to maintain on writes.

Docs: see `docs/how-to-explain.md`, `docs/indexing-cheatsheet.md`, and `docs/query-optimization-workflow.md`.
