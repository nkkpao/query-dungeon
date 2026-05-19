SELECT count(*) AS premium_fragile_products
FROM products
WHERE attributes @> '{"tier":"premium","fragile":true}'::jsonb
