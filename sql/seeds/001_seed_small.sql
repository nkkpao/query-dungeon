INSERT INTO users (id, email, created_at, status, country)
SELECT gs,
       'user' || gs || '@example.com',
       TIMESTAMPTZ '2024-01-01' + (gs % 365) * INTERVAL '1 day',
       CASE WHEN gs % 97 = 0 THEN 'suspended' WHEN gs % 211 = 0 THEN 'deleted' ELSE 'active' END,
       (ARRAY['US','DE','BR','IN','JP','GB'])[1 + (gs % 6)]
FROM generate_series(1, 1000) AS gs;

INSERT INTO categories (id, parent_id, name, slug)
SELECT gs, NULL, 'Category ' || gs, 'category-' || gs
FROM generate_series(1, 20) AS gs;

INSERT INTO products (id, category_id, sku, name, price_cents, attributes, created_at)
SELECT gs,
       1 + (gs % 20),
       'SKU-' || gs,
       'Product ' || gs,
       500 + ((gs * 37) % 20000),
       jsonb_build_object(
         'brand', (ARRAY['acme','northwind','globex','initech'])[1 + (gs % 4)],
         'color', (ARRAY['red','blue','black','white','green'])[1 + (gs % 5)],
         'fragile', gs % 11 = 0,
         'tier', CASE WHEN gs % 17 = 0 THEN 'premium' ELSE 'standard' END
       ),
       TIMESTAMPTZ '2024-02-01' + (gs % 120) * INTERVAL '1 day'
FROM generate_series(1, 500) AS gs;

INSERT INTO orders (id, user_id, status, created_at, total_cents)
SELECT gs,
       CASE WHEN gs % 5 = 0 THEN 42 ELSE 1 + (gs % 1000) END,
       CASE
         WHEN gs % 19 = 0 THEN 'unpaid'
         WHEN gs % 23 = 0 THEN 'cancelled'
         WHEN gs % 7 = 0 THEN 'delivered'
         WHEN gs % 3 = 0 THEN 'shipped'
         ELSE 'paid'
       END,
       TIMESTAMPTZ '2024-06-01' + (gs % 180) * INTERVAL '1 day' + (gs % 24) * INTERVAL '1 hour',
       1000 + ((gs * 97) % 100000)
FROM generate_series(1, 5000) AS gs;

INSERT INTO order_items (order_id, product_id, quantity, unit_price_cents)
SELECT o.id,
       CASE WHEN n = 1 THEN 7 ELSE 1 + ((o.id * n) % 500) END,
       1 + ((o.id + n) % 3),
       500 + (((o.id + n) * 37) % 20000)
FROM orders o
CROSS JOIN generate_series(1, 3) AS n;

INSERT INTO payments (order_id, status, provider, amount_cents, created_at)
SELECT id,
       CASE WHEN status = 'unpaid' THEN 'pending' WHEN id % 29 = 0 THEN 'failed' WHEN id % 31 = 0 THEN 'refunded' ELSE 'paid' END,
       (ARRAY['stripe','paypal','adyen'])[1 + (id % 3)],
       total_cents,
       created_at + INTERVAL '5 minutes'
FROM orders;

INSERT INTO reviews (user_id, product_id, rating, body, created_at)
SELECT 1 + (gs % 1000), 1 + (gs % 500), 1 + (gs % 5), 'Review ' || gs,
       TIMESTAMPTZ '2024-07-01' + (gs % 120) * INTERVAL '1 day'
FROM generate_series(1, 2500) AS gs;

INSERT INTO inventory_movements (product_id, movement_type, quantity_delta, warehouse_id, created_at)
SELECT 1 + (gs % 500),
       (ARRAY['purchase','sale','return','adjustment'])[1 + (gs % 4)],
       CASE WHEN gs % 4 = 0 THEN 20 ELSE -1 * (1 + (gs % 5)) END,
       1 + (gs % 5),
       TIMESTAMPTZ '2024-05-01' + (gs % 180) * INTERVAL '1 day'
FROM generate_series(1, 6000) AS gs;

INSERT INTO user_events (user_id, event_type, metadata, created_at)
SELECT CASE WHEN gs % 4 = 0 THEN 42 ELSE 1 + (gs % 1000) END,
       (ARRAY['view','search','cart_add','checkout_start','purchase','support_opened'])[1 + (gs % 6)],
       jsonb_build_object('device', (ARRAY['web','ios','android'])[1 + (gs % 3)], 'campaign', CASE WHEN gs % 13 = 0 THEN 'spring' ELSE 'organic' END),
       TIMESTAMPTZ '2024-08-01' + (gs % 90) * INTERVAL '1 day' + (gs % 24) * INTERVAL '1 hour'
FROM generate_series(1, 12000) AS gs;

INSERT INTO support_tickets (user_id, order_id, status, priority, created_at, resolved_at)
SELECT 1 + (gs % 1000),
       1 + (gs % 5000),
       (ARRAY['open','pending','resolved','closed'])[1 + (gs % 4)],
       (ARRAY['low','normal','high','urgent'])[1 + (gs % 4)],
       TIMESTAMPTZ '2024-09-01' + (gs % 60) * INTERVAL '1 day',
       CASE WHEN gs % 4 IN (2,3) THEN TIMESTAMPTZ '2024-09-01' + (gs % 60) * INTERVAL '1 day' + INTERVAL '2 days' ELSE NULL END
FROM generate_series(1, 700) AS gs;

SELECT setval('users_id_seq', (SELECT max(id) FROM users));
SELECT setval('categories_id_seq', (SELECT max(id) FROM categories));
SELECT setval('products_id_seq', (SELECT max(id) FROM products));
SELECT setval('orders_id_seq', (SELECT max(id) FROM orders));
