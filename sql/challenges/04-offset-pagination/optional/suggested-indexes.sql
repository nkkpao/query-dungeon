CREATE INDEX IF NOT EXISTS idx_solution_orders_created_id_covering
  ON orders(created_at DESC, id DESC)
  INCLUDE (user_id, status, total_cents);
