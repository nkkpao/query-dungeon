WITH paid_order_items AS (
  SELECT oi.product_id,
         oi.order_id,
         oi.quantity,
         oi.unit_price_cents
  FROM order_items oi
  WHERE EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.id = oi.order_id
      AND o.status IN ('paid', 'shipped', 'delivered')
  )
),
product_totals AS (
  SELECT product_id,
         count(DISTINCT order_id) AS order_count,
         sum(quantity) AS units_sold,
         sum(quantity * unit_price_cents) AS gross_cents
  FROM paid_order_items
  GROUP BY product_id
)
SELECT p.id AS product_id,
       p.name AS product_name,
       pt.order_count,
       pt.units_sold,
       pt.gross_cents
FROM products p
JOIN product_totals pt ON pt.product_id = p.id
WHERE p.attributes->>'demand_band' IN ('hot', 'warm')
ORDER BY pt.gross_cents DESC, p.id
LIMIT 25
