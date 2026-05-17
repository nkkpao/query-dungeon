SELECT o.id AS order_id,
       o.user_id,
       (SELECT p.status FROM payments p WHERE p.order_id = o.id ORDER BY p.created_at DESC, p.id DESC LIMIT 1) AS latest_payment_status,
       (SELECT p.created_at FROM payments p WHERE p.order_id = o.id ORDER BY p.created_at DESC, p.id DESC LIMIT 1) AS latest_payment_at
FROM orders o
WHERE o.status <> 'cancelled'
ORDER BY o.created_at DESC, o.id DESC
LIMIT 50
