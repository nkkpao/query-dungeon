CREATE INDEX IF NOT EXISTS idx_solution_inventory_product_delta ON inventory_movements(product_id, quantity_delta);
