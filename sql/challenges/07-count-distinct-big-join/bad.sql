WITH expanded AS MATERIALIZED (
  SELECT u.country, o.id AS order_id, oi.product_id, r.id AS review_id
  FROM users u
  JOIN orders o ON o.user_id = u.id
  JOIN order_items oi ON oi.order_id = o.id
  LEFT JOIN reviews r ON r.product_id = oi.product_id
  WHERE o.status IN ('paid', 'shipped', 'delivered')
)
SELECT country, count(DISTINCT order_id) AS orders_count
FROM expanded
GROUP BY country
ORDER BY orders_count DESC, country
