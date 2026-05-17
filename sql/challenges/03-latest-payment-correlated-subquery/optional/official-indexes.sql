CREATE INDEX IF NOT EXISTS idx_solution_payments_order_created ON payments(order_id, created_at DESC, id DESC);
