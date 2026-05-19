CREATE INDEX IF NOT EXISTS idx_solution_inventory_product_covering
  ON inventory_movements(product_id)
  INCLUDE (quantity_delta);
