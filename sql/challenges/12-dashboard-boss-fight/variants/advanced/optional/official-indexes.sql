CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_items_product_order
ON order_items (product_id, order_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_status_id
ON orders (status, id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_demand_band
ON products ((attributes->>'demand_band'), id);
