CREATE INDEX IF NOT EXISTS idx_solution_order_items_product_order ON order_items(product_id, order_id);

-- query
SELECT u.country, count(DISTINCT o.id) AS orders_count
FROM users u
JOIN orders o ON o.user_id = u.id
WHERE o.status IN ('paid', 'shipped', 'delivered')
GROUP BY u.country
ORDER BY orders_count DESC, u.country
