\i sql/seeds/002_seed_medium.sql

INSERT INTO user_events (user_id, event_type, metadata, created_at)
SELECT CASE WHEN gs % 4 = 0 THEN 42 ELSE 1 + (gs % 1000) END,
       (ARRAY['view','search','cart_add','checkout_start','purchase','support_opened'])[1 + (gs % 6)],
       jsonb_build_object('device', (ARRAY['web','ios','android'])[1 + (gs % 3)], 'campaign', CASE WHEN gs % 13 = 0 THEN 'spring' ELSE 'organic' END),
       TIMESTAMPTZ '2025-01-01' + (gs % 90) * INTERVAL '1 day'
FROM generate_series(250001, 1000000) AS gs;
