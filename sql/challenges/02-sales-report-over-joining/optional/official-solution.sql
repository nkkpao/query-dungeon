SELECT c.id AS category_id,
       c.name AS category_name,
       count(DISTINCT o.id) AS paid_orders,
       sum(oi.quantity * oi.unit_price_cents) AS revenue_cents
FROM categories c
JOIN products p ON p.category_id = c.id
JOIN order_items oi ON oi.product_id = p.id
JOIN orders o ON o.id = oi.order_id
WHERE o.status IN ('paid', 'shipped', 'delivered')
GROUP BY c.id, c.name
ORDER BY revenue_cents DESC, c.id
LIMIT 10
