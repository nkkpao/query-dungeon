CREATE INDEX IF NOT EXISTS idx_solution_order_items_product_order_covering
  ON order_items(product_id, order_id)
  INCLUDE (quantity, unit_price_cents);
