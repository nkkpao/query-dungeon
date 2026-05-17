CREATE INDEX IF NOT EXISTS idx_solution_dashboard_orders ON orders(status, created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_solution_dashboard_events_gin ON user_events USING gin(metadata);

-- query
WITH page AS (
  SELECT id, user_id, total_cents, created_at
  FROM orders
  WHERE status IN ('paid', 'shipped', 'delivered')
  ORDER BY created_at DESC, id DESC
  OFFSET 500
  LIMIT 25
),
event_counts AS (
  SELECT e.user_id, count(*) AS spring_events
  FROM user_events e
  JOIN page p ON p.user_id = e.user_id
  WHERE e.metadata @> '{"campaign":"spring"}'::jsonb
  GROUP BY e.user_id
),
ticket_counts AS (
  SELECT st.user_id, count(*) AS open_tickets
  FROM support_tickets st
  JOIN page p ON p.user_id = st.user_id
  WHERE st.status IN ('open', 'pending')
  GROUP BY st.user_id
)
SELECT p.id, p.user_id, p.total_cents,
       coalesce(ec.spring_events, 0) AS spring_events,
       coalesce(tc.open_tickets, 0) AS open_tickets
FROM page p
LEFT JOIN event_counts ec ON ec.user_id = p.user_id
LEFT JOIN ticket_counts tc ON tc.user_id = p.user_id
ORDER BY p.created_at DESC, p.id DESC
