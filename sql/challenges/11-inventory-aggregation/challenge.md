# 11 Inventory Aggregation Mistake

Capture the baseline plan yourself with `make explain-file`.

Business task: Operations needs products with the lowest stock on hand.

Expected output: `product_id`, `name`, `on_hand`; lowest stock first.

Symptoms to investigate:

- Look for joins after stock aggregation that multiply rows without changing stock.
- Compare grouped rows with joined rows.
- Check whether the aggregate can happen closer to the table that owns the metric.

Constraints:

- Stock is the sum of inventory movement deltas.
- Do not let order-item history change the stock metric.
- Keep deterministic ordering by `on_hand`, then product id.

Success criterion: The plan computes stock from inventory movements without unrelated detail-row expansion.

Manual workflow:

```bash
make run-sql CHALLENGE=11-inventory-aggregation SQL=sql/challenges/11-inventory-aggregation/baseline.sql
make explain-file CHALLENGE=11-inventory-aggregation SQL=sql/challenges/11-inventory-aggregation/baseline.sql
cp sql/challenges/11-inventory-aggregation/baseline.sql workspace/sql/11-inventory-aggregation-attempt-1.sql
make validate-file CHALLENGE=11-inventory-aggregation SQL=workspace/sql/11-inventory-aggregation-attempt-1.sql
make benchmark-file CHALLENGE=11-inventory-aggregation SQL=workspace/sql/11-inventory-aggregation-attempt-1.sql ITERATIONS=3
```

Hints: see `hints/hints.md`.

Solution access: suggested solutions are in `optional/` and are outside the default exercise flow. Use them only through the explicit `compare-with-official-solution` command after your own investigation.

Docs: see `docs/how-to-explain.md`, `docs/indexing-cheatsheet.md`, and `docs/query-optimization-workflow.md`.
