CREATE INDEX IF NOT EXISTS idx_solution_orders_status_user ON orders(status, user_id, id);
