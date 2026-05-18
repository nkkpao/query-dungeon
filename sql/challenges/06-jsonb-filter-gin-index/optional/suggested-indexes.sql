CREATE INDEX IF NOT EXISTS idx_solution_products_attributes_gin ON products USING gin(attributes);
