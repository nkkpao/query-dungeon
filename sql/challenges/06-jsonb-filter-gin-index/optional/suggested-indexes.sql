CREATE INDEX IF NOT EXISTS idx_solution_products_attributes_path_gin
  ON products USING gin(attributes jsonb_path_ops);
