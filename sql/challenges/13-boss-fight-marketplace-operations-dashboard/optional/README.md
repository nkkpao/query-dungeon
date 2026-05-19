# Optional Reference Material

These files are intentionally outside the default challenge workflow.

- `suggested-solution.sql` shows one reference rewrite that pre-aggregates large fact tables once and joins seller-level metrics.
- `suggested-indexes.sql` lists index ideas to test manually, including composite, partial, expression, covering, and JSONB GIN indexes.
- `baseline-explain.txt` stores captured broad baseline-plan evidence for maintainers.

Use these only after you have inspected the baseline plan, tried your own rewrite, and validated correctness.
