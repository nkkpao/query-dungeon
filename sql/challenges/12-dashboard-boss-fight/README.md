# 12 Marketplace Dashboard Boss Fight

Baseline plan: regenerate with make explain CHALLENGE=12-dashboard-boss-fight.

Business task: build a dashboard slice with order page, campaign events, and open support tickets.

Hints: inspect each section of the plan separately: page selection, per-row counts, JSONB filtering, and row-estimate quality.

Trade-offs: the reference solution is more maintainable as a report query, but each added index has write and storage cost.

Docs: see `docs/how-to-explain.md`, `docs/indexing-cheatsheet.md`, and `docs/query-optimization-workflow.md`.
