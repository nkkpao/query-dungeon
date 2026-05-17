SELECT id, user_id, status, created_at, total_cents
FROM orders
ORDER BY created_at DESC, id DESC
OFFSET 1000
LIMIT 25
