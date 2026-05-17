SELECT id, user_id, status, created_at, total_cents
FROM orders
WHERE status = 'unpaid'
ORDER BY created_at DESC, id DESC
LIMIT 50
