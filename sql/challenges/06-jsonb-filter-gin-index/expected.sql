SELECT id, sku, name, attributes
FROM products
WHERE attributes @> '{"tier":"premium"}'::jsonb
ORDER BY id
LIMIT 50
