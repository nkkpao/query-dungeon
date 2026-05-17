SELECT o.id, o.user_id, o.status, o.created_at, o.total_cents
FROM orders o
WHERE o.user_id = 42
ORDER BY o.created_at DESC, o.id DESC
LIMIT 20
