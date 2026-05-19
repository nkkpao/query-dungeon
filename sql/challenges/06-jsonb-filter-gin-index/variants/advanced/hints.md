# Hints

1. Check how many events match the event type filter before JSONB predicates.
2. Inspect whether PostgreSQL can estimate the JSONB containment selectivity well.
3. Look for `Rows Removed by Filter`.
4. Consider the difference between a broad JSONB index and a targeted expression or partial index.
