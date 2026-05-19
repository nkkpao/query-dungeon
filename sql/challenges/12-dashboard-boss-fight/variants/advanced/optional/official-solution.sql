-- Reference approach: reduce the hot/warm product set before touching the
-- skewed order_items table, then join only paid-like orders.
-- Trade-off: the expression index is specific to this dashboard's demand-band
-- predicate and adds write overhead for product attribute updates.
WITH dashboard_products AS (
  SELECT id, name
  FROM products
  WHERE attributes->>'demand_band' IN ('hot', 'warm')
),
paid_orders AS (
  SELECT id
  FROM orders
  WHERE status IN ('paid', 'shipped', 'delivered')
)
SELECT p.id AS product_id,
       p.name AS product_name,
       count(DISTINCT o.id) AS order_count,
       sum(oi.quantity) AS units_sold,
       sum(oi.quantity * oi.unit_price_cents) AS gross_cents
FROM dashboard_products p
JOIN order_items oi ON oi.product_id = p.id
JOIN paid_orders o ON o.id = oi.order_id
GROUP BY p.id, p.name
ORDER BY gross_cents DESC, p.id
LIMIT 25
