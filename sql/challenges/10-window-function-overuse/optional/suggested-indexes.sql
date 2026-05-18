CREATE INDEX IF NOT EXISTS idx_solution_orders_user_total ON orders(user_id, total_cents DESC, id DESC);
