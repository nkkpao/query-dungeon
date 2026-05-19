CREATE INDEX IF NOT EXISTS idx_solution_dashboard_paid_orders_page
  ON orders(created_at DESC, id DESC)
  INCLUDE (user_id, total_cents)
  WHERE status IN ('paid', 'shipped', 'delivered');

CREATE INDEX IF NOT EXISTS idx_solution_dashboard_spring_events_by_user
  ON user_events(user_id)
  WHERE metadata @> '{"campaign":"spring"}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_solution_dashboard_open_tickets_by_user
  ON support_tickets(user_id)
  WHERE status IN ('open', 'pending');
