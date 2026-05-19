# 13 Boss Fight: Marketplace Operations Dashboard

Capture the baseline plan yourself with `make explain-file`.

Business task: An operations manager needs a dashboard showing the most problematic active marketplace sellers for the recent operating window. The dashboard combines seller profile data, paid orders, revenue, refunds, buyer reach, late shipments, support load, reviews, payout recency, inventory risk, and recent traffic/conversion events stored in JSONB metadata.

Expected output:

- `seller_id`
- `seller_name`
- `seller_email`
- `paid_orders_count`
- `gross_revenue`
- `refunded_revenue`
- `avg_order_value`
- `unique_buyers_count`
- `late_shipments_count`
- `support_tickets_count`
- `avg_review_rating`
- `negative_reviews_count`
- `latest_successful_payout_at`
- `inventory_risk_score`
- `recent_product_views`
- `recent_add_to_cart_events`
- `conversion_rate`
- `dashboard_score`

Symptoms to investigate:

- Multiple correlated subqueries scan the same large tables repeatedly.
- Seller search applies `lower(...)` to profile columns.
- JSONB metadata filters scan user events by containment and extracted seller attributes.
- Low-selectivity status filters combine with date predicates on large tables.
- A materialized CTE, unnecessary `DISTINCT`, broad `GROUP BY`, and noisy `LEFT JOIN`s clean up row multiplication after the fact.
- The final page uses `OFFSET` after sorting by a computed score.
- Refunds, payouts, shipments, reviews, support tickets, and inventory each suggest different composite, partial, expression, covering, or GIN index trade-offs.

Constraints:

- You may rewrite the SQL in your own scratch file.
- You may create experimental indexes manually in your local database or in `workspace/indexes/`.
- You may adjust the parameter values inside your scratch SQL while investigating, but the final validated attempt must keep the same business semantics and output columns.
- Do not change seed data to make the query faster.
- Do not edit the expected result contract.
- Do not use the optional reference solution until you intentionally leave the exercise flow.

Success criterion: Your rewritten SQL returns the same rows and columns as the baseline for the same parameters, and your measured plan shows materially less repeated scanning, sorting, row multiplication, and buffer pressure. Exact timing is not the criterion.

Manual workflow:

```bash
make seed SEED_SCALE=medium
make run-sql CHALLENGE=13-boss-fight-marketplace-operations-dashboard \
  SQL=sql/challenges/13-boss-fight-marketplace-operations-dashboard/baseline.sql
make explain-file CHALLENGE=13-boss-fight-marketplace-operations-dashboard \
  SQL=sql/challenges/13-boss-fight-marketplace-operations-dashboard/baseline.sql
cp sql/challenges/13-boss-fight-marketplace-operations-dashboard/baseline.sql \
  workspace/sql/13-boss-fight-attempt-1.sql
make validate-file CHALLENGE=13-boss-fight-marketplace-operations-dashboard \
  SQL=workspace/sql/13-boss-fight-attempt-1.sql
make benchmark-file CHALLENGE=13-boss-fight-marketplace-operations-dashboard \
  SQL=workspace/sql/13-boss-fight-attempt-1.sql ITERATIONS=3
```

Recommended investigation workflow:

1. Run `EXPLAIN (ANALYZE, BUFFERS)` on the baseline and mark the largest repeated scans.
2. Identify which subqueries can become one aggregation per fact table.
3. Check whether joins are multiplying rows before `DISTINCT` or `GROUP BY` removes duplicates.
4. Test indexes one at a time and compare plans before keeping them.
5. Rewrite the query in stages, validating after each stage.
6. Compare your final attempt with the baseline using `diff-results` if you want to inspect row-level differences.

Hints: see `hints/hints.md`.

Solution access: suggested solutions are in `optional/` and are outside the default exercise flow. Use them only through the explicit `compare-with-suggested-solution` command after your own investigation.

Docs: see `docs/how-to-explain.md`, `docs/indexing-cheatsheet.md`, and `docs/query-optimization-workflow.md`.
