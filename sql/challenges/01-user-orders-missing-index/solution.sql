CREATE INDEX IF NOT EXISTS idx_solution_orders_user_created ON orders(user_id, created_at DESC, id DESC);

-- query
SELECT o.id, o.user_id, o.status, o.created_at, o.total_cents
FROM orders o
WHERE o.user_id = 424
ORDER BY o.created_at DESC, o.id DESC
LIMIT 20
