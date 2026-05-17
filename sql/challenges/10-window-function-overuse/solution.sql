CREATE INDEX IF NOT EXISTS idx_solution_orders_user_total ON orders(user_id, total_cents DESC, id DESC);

-- query
WITH best AS (
  SELECT DISTINCT ON (user_id) user_id, id AS order_id, total_cents
  FROM orders
  WHERE status IN ('paid', 'shipped', 'delivered')
  ORDER BY user_id, total_cents DESC, id DESC
)
SELECT user_id, order_id, total_cents
FROM best
ORDER BY total_cents DESC, user_id
LIMIT 50
