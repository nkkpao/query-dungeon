# Hints

## 1. What to inspect in EXPLAIN

Start with the loop counts on subplans. A moderately expensive scan becomes the main problem when it runs once per seller. Then check `Buffers`, `Rows Removed by Filter`, sort memory, and whether the final row count is tiny compared with the work done upstream.

## 2. Which repeated scans look suspicious

Look for repeated access to `orders`, `order_items`, `payments`, `reviews`, `support_tickets`, `inventory_movements`, `shipments`, `payouts`, and `user_events`. The dashboard computes many seller-level metrics, but the large tables do not need to be scanned separately for every seller.

## 3. Which predicates are index candidates

The obvious candidates are date plus status filters on orders and shipments, `seller_id` joins through products, refunded payments, successful payouts, `lower(email)` and `lower(name)`, and JSONB metadata filters on `user_events`.

## 4. Which subqueries can be pre-aggregated

Try building one CTE or derived table for order totals per seller/order, one for refunds, one for shipments, one for support tickets, one for reviews, one for inventory, one for traffic, and one for latest payouts. Join those small aggregated results to the filtered seller set.

## 5. Which indexes might be useful

Composite indexes help when equality or low-cardinality filters combine with date ranges and joins. Partial indexes are useful for refunded payments, successful payouts, failed payouts, and late-shipment candidates. Expression indexes can support `lower(...)` search and extracted JSONB seller IDs. A GIN index can help JSONB containment when the predicate is selective enough.

## 6. How to think about pagination

OFFSET is acceptable for a small page number, but it still requires producing and sorting all preceding rows. After you have a stable deterministic sort key, consider whether a keyset predicate on `dashboard_score` plus `seller_id` would fit the dashboard API.

## 7. How to validate equivalence

Validate after each rewrite. Keep the same parameter values, output columns, rounding, NULL behavior, and tie-break order. Use `make validate-file` first, then `make diff-results` against the baseline when a mismatch appears.
