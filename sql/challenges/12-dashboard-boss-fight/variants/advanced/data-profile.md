# Data Profile: Advanced Dashboard

Canonical scale: `SEED_SCALE=medium`

This variant is materially different from the parent dashboard boss fight
because it emphasizes hot-product and long-tail skew in `order_items` and
`products`, not only correlated subqueries and pagination.

Skew requirements:

- hot products: product IDs `1` through `20` all appear disproportionately often
- long-tail products: most products appear rarely
- heavy categories: early categories hold many hot and warm products
- low-selectivity statuses: `paid`, `shipped`, and `delivered` match most orders
- uneven order volumes: hot products dominate recent revenue

Expected planner symptoms:

- `Hash Join`
- possible `Nested Loop` pressure
- bad row estimates around hot products
- high `Buffers: shared` counts
- expensive grouping or sorting
