CREATE INDEX IF NOT EXISTS idx_solution_orders_created_id ON orders(created_at DESC, id DESC);

-- query
WITH anchor AS (
  SELECT created_at, id
  FROM orders
  ORDER BY created_at DESC, id DESC
  OFFSET 1000
  LIMIT 1
)
SELECT o.id, o.user_id, o.status, o.created_at, o.total_cents
FROM orders o, anchor a
WHERE (o.created_at, o.id) <= (a.created_at, a.id)
ORDER BY o.created_at DESC, o.id DESC
LIMIT 25
