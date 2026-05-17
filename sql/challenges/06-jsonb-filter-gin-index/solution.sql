CREATE INDEX IF NOT EXISTS idx_solution_products_attributes_gin ON products USING gin(attributes);

-- query
SELECT count(*) AS premium_products
FROM products
WHERE attributes @> '{"tier":"premium"}'::jsonb
