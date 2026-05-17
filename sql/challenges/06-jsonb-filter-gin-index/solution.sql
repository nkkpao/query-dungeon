CREATE INDEX IF NOT EXISTS idx_solution_products_attributes_gin ON products USING gin(attributes);

-- query
SELECT id, sku, name, attributes
FROM products
WHERE attributes @> '{"tier":"premium"}'::jsonb
ORDER BY id
LIMIT 50
