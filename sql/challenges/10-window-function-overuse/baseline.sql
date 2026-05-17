SELECT user_id, id AS order_id, total_cents
FROM (
  SELECT o.*,
         row_number() OVER (PARTITION BY user_id ORDER BY total_cents DESC, id DESC) AS rn,
         rank() OVER (PARTITION BY user_id ORDER BY total_cents DESC) AS unused_rank
  FROM orders o
  WHERE status IN ('paid', 'shipped', 'delivered')
) ranked
WHERE rn = 1
ORDER BY total_cents DESC, user_id
LIMIT 50
