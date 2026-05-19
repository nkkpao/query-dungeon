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

INSERT INTO sellers (id, user_id, name, email, status, country, created_at)
SELECT gs,
       1 + (gs % 1000),
       CASE WHEN gs <= 8 THEN 'Marketplace Ops Seller ' || gs ELSE 'Seller ' || gs END,
       CASE WHEN gs <= 8 THEN 'marketplace-seller-' || gs || '@example.com' ELSE 'seller' || gs || '@example.com' END,
       CASE WHEN gs % 41 = 0 THEN 'suspended' WHEN gs % 29 = 0 THEN 'paused' ELSE 'active' END,
       (ARRAY['US','DE','BR','IN','JP','GB'])[1 + (gs % 6)],
       TIMESTAMPTZ '2024-01-15' + (gs % 90) * INTERVAL '1 day'
FROM generate_series(1, 80) AS gs;

INSERT INTO products (id, seller_id, category_id, sku, name, price_cents, attributes, created_at)
SELECT gs,
       CASE
         WHEN gs <= 50 THEN 1 + (gs % 5)
         WHEN gs <= 150 THEN 6 + (gs % 10)
         ELSE 1 + (gs % 80)
       END,
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

INSERT INTO payments (order_id, status, provider, amount_cents, created_at)
SELECT id,
       CASE WHEN id % 8 = 0 THEN 'refunded' WHEN id % 5 = 0 THEN 'failed' ELSE 'paid' END,
       (ARRAY['stripe','paypal','adyen'])[1 + ((id + 1) % 3)],
       total_cents,
       created_at + INTERVAL '2 days'
FROM orders
WHERE id % 4 = 0;

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
       jsonb_build_object(
         'device', (ARRAY['web','ios','android'])[1 + (gs % 3)],
         'campaign', CASE WHEN gs % 13 = 0 THEN 'spring' ELSE 'organic' END,
         'region', (ARRAY['na','eu','apac'])[1 + (gs % 3)],
         'product_id', 1 + (gs % 500),
         'seller_id', CASE WHEN gs % 5 = 0 THEN 1 + (gs % 5) ELSE 1 + (gs % 80) END
       ),
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

INSERT INTO shipments (order_id, seller_id, status, promised_at, shipped_at, delivered_at, created_at)
SELECT DISTINCT ON (o.id, p.seller_id)
       o.id,
       p.seller_id,
       CASE WHEN o.status IN ('paid', 'shipped') THEN 'shipped' WHEN o.status = 'delivered' THEN 'delivered' ELSE 'pending' END,
       o.created_at + INTERVAL '5 days',
       o.created_at + INTERVAL '1 day',
       CASE
         WHEN o.status = 'delivered' THEN o.created_at + CASE WHEN o.id % 9 = 0 THEN INTERVAL '8 days' ELSE INTERVAL '4 days' END
         ELSE NULL
       END,
       o.created_at + INTERVAL '1 hour'
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE o.status IN ('paid', 'shipped', 'delivered');

INSERT INTO payouts (seller_id, status, amount_cents, created_at)
SELECT s.id,
       CASE WHEN gs % 37 = 0 THEN 'failed' WHEN gs % 11 = 0 THEN 'processing' ELSE 'paid' END,
       5000 + ((s.id * gs * 137) % 250000),
       TIMESTAMPTZ '2024-07-01' + (gs % 120) * INTERVAL '1 day'
FROM sellers s
CROSS JOIN generate_series(1, 5) AS gs;

SELECT setval('users_id_seq', (SELECT max(id) FROM users));
SELECT setval('categories_id_seq', (SELECT max(id) FROM categories));
SELECT setval('sellers_id_seq', (SELECT max(id) FROM sellers));
SELECT setval('products_id_seq', (SELECT max(id) FROM products));
SELECT setval('orders_id_seq', (SELECT max(id) FROM orders));
