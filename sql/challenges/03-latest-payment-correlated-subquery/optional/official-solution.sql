SELECT o.id AS order_id, o.user_id, p.status AS latest_payment_status, p.created_at AS latest_payment_at
FROM orders o
LEFT JOIN LATERAL (
  SELECT status, created_at
  FROM payments p
  WHERE p.order_id = o.id
  ORDER BY p.created_at DESC, p.id DESC
  LIMIT 1
) p ON true
WHERE o.status <> 'cancelled'
ORDER BY o.created_at DESC, o.id DESC
LIMIT 50
