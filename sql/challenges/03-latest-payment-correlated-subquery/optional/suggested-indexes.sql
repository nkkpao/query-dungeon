CREATE INDEX IF NOT EXISTS idx_solution_payments_order_created ON payments(order_id, created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_solution_orders_not_cancelled_created
  ON orders(created_at DESC, id DESC)
  INCLUDE (user_id)
  WHERE status <> 'cancelled';
