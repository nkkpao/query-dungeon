SELECT count(*) AS premium_products
FROM products
WHERE attributes @> '{"tier":"premium"}'::jsonb
