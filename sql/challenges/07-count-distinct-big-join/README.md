# 07 COUNT DISTINCT Over Big Join

Baseline plan: regenerate with make explain CHALLENGE=07-count-distinct-big-join.

Business task: count paid orders by country.

Hints: ask which joined tables affect the final answer.

Trade-offs: reducing joins improves this report but may omit dimensions needed by future variants.

Docs: see `docs/how-to-explain.md`, `docs/indexing-cheatsheet.md`, and `docs/query-optimization-workflow.md`.
