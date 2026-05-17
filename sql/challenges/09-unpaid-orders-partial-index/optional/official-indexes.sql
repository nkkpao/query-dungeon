CREATE INDEX IF NOT EXISTS idx_solution_orders_unpaid_created ON orders(created_at DESC, id DESC) WHERE status = 'unpaid';
