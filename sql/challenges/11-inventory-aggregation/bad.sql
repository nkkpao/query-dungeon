WITH stock AS MATERIALIZED (
  SELECT product_id, sum(quantity_delta) AS on_hand
  FROM inventory_movements
  GROUP BY product_id
)
SELECT p.id AS product_id,
       p.name,
       max(stock.on_hand) AS on_hand
FROM products p
JOIN stock ON stock.product_id = p.id
LEFT JOIN order_items oi ON oi.product_id = p.id
GROUP BY p.id, p.name
ORDER BY on_hand ASC, p.id
LIMIT 50
