SELECT p.id AS product_id,
       p.name AS product_name,
       count(DISTINCT o.id) AS order_count,
       sum(oi.quantity) AS units_sold,
       sum(oi.quantity * oi.unit_price_cents) AS gross_cents
FROM products p
JOIN order_items oi ON oi.product_id = p.id
JOIN orders o ON o.id = oi.order_id
WHERE o.status IN ('paid', 'shipped', 'delivered')
  AND p.attributes->>'demand_band' IN ('hot', 'warm')
GROUP BY p.id, p.name
ORDER BY gross_cents DESC, p.id
LIMIT 25
