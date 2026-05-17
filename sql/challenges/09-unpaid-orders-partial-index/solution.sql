CREATE INDEX IF NOT EXISTS idx_solution_orders_unpaid_created ON orders(created_at DESC, id DESC) WHERE status = 'unpaid';

-- query
SELECT id, user_id, status, created_at, total_cents
FROM orders
WHERE status = 'unpaid'
ORDER BY created_at DESC, id DESC
LIMIT 50
