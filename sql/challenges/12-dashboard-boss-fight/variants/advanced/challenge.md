# Advanced: dashboard aggregation over skewed orders

Business task: produce a product dashboard that ranks high-revenue products by recent paid activity.

Expected output: `product_id`, `product_name`, `order_count`, `units_sold`, `gross_cents`.

Data skew assumptions:

- hot products receive a disproportionate share of `order_items`
- long-tail products exist but appear rarely
- common order statuses are low-selectivity filters
- category distribution is intentionally uneven

Symptoms to investigate:

- large join inputs
- `Hash Join` or `Nested Loop` behavior under skew
- bad row estimates
- high shared buffer usage
- expensive grouping and sorting

Constraints:

- Keep the baseline bad query as the starting point.
- Do not use optional official solution files unless explicitly comparing.
- Benchmark learner attempts manually.

Success criterion: preserve the dashboard result while reducing unnecessary join and aggregation work.

Manual workflow:

1. Load medium data with `SEED_SCALE=medium make seed`.
2. Explain the advanced baseline or your own SQL with `--variant advanced`.
3. Inspect join order, row estimates, buffers, and sort/group costs.
