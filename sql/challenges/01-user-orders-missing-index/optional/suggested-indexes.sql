CREATE INDEX IF NOT EXISTS idx_solution_orders_user_created ON orders(user_id, created_at DESC, id DESC);
