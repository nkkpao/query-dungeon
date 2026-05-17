CREATE INDEX IF NOT EXISTS idx_solution_orders_created_id ON orders(created_at DESC, id DESC);
