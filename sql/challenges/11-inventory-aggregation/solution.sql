CREATE INDEX IF NOT EXISTS idx_solution_inventory_product_created ON inventory_movements(product_id, created_at DESC);

-- query
SELECT p.id AS product_id,
       p.name,
       sum(im.quantity_delta) AS on_hand
FROM products p
JOIN inventory_movements im ON im.product_id = p.id
GROUP BY p.id, p.name
ORDER BY on_hand ASC, p.id
LIMIT 50
