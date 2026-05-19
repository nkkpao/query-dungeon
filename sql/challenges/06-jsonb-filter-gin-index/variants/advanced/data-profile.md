# Data Profile: Advanced JSONB Event Filtering

Canonical scale: `SEED_SCALE=medium`

This variant is materially different from the parent `06-jsonb-filter-gin-index`
challenge because it filters high-volume `user_events` JSONB metadata with
skewed event types and NULL-heavy optional keys instead of counting product
attributes.

Skew requirements:

- skewed event types: `view` and `search` dominate
- NULL-heavy metadata: `device`, `experiment`, and `region` can be JSON null
- campaign skew: most rows are `organic`, with smaller `spring` and `flash`
  groups
- hot users: high-volume users add repeated metadata patterns

Expected planner symptoms:

- `Seq Scan`
- `Rows Removed by Filter`
- bad row estimates
- high `Buffers: shared` counts
