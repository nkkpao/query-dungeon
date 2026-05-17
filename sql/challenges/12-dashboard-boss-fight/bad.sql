SELECT o.id,
       o.user_id,
       o.total_cents,
       (SELECT count(*) FROM user_events e WHERE e.user_id = o.user_id AND e.metadata @> '{"campaign":"spring"}'::jsonb) AS spring_events,
       (SELECT count(*) FROM support_tickets st WHERE st.user_id = o.user_id AND st.status IN ('open', 'pending')) AS open_tickets
FROM orders o
WHERE o.status IN ('paid', 'shipped', 'delivered')
ORDER BY o.created_at DESC, o.id DESC
OFFSET 500
LIMIT 25
