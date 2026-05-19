WITH params AS (
  SELECT
    TIMESTAMPTZ '2024-08-01 00:00:00+00' AS start_date,
    TIMESTAMPTZ '2024-12-31 23:59:59+00' AS end_date,
    'US'::text AS country,
    'seller'::text AS seller_search,
    'na'::text AS traffic_region,
    20::integer AS result_limit,
    0::integer AS result_offset
),
seller_profiles AS MATERIALIZED (
  SELECT DISTINCT
         s.id AS seller_id,
         s.user_id,
         s.name AS seller_name,
         s.email AS seller_email,
         s.country,
         s.status,
         p.category_id,
         r.rating AS noisy_review_rating
  FROM sellers s
  CROSS JOIN params prm
  LEFT JOIN products p ON p.seller_id = s.id
  LEFT JOIN reviews r ON r.product_id = p.id
  WHERE s.status IN ('active', 'paused')
    AND s.country = prm.country
    AND (
      lower(s.email) LIKE '%' || lower(prm.seller_search) || '%'
      OR lower(s.name) LIKE '%' || lower(prm.seller_search) || '%'
    )
),
filtered_sellers AS (
  SELECT DISTINCT seller_id, user_id, seller_name, seller_email, country, status
  FROM seller_profiles
  WHERE seller_id NOT IN (
    SELECT po.seller_id
    FROM payouts po
    CROSS JOIN params prm
    WHERE po.status IN ('failed', 'cancelled')
      AND po.created_at >= prm.start_date - INTERVAL '180 days'
  )
),
dashboard_rows AS (
  SELECT
    fs.seller_id,
    fs.seller_name,
    fs.seller_email,
    (
      SELECT count(DISTINCT o.id)
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      JOIN products p ON p.id = oi.product_id
      CROSS JOIN params prm
      WHERE p.seller_id = fs.seller_id
        AND o.status IN ('paid', 'shipped', 'delivered')
        AND o.created_at >= prm.start_date
        AND o.created_at < prm.end_date
    ) AS paid_orders_count,
    (
      SELECT coalesce(round(sum(oi.quantity * oi.unit_price_cents)::numeric / 100.0, 2), 0)
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      JOIN products p ON p.id = oi.product_id
      CROSS JOIN params prm
      WHERE p.seller_id = fs.seller_id
        AND o.status IN ('paid', 'shipped', 'delivered')
        AND o.created_at >= prm.start_date
        AND o.created_at < prm.end_date
    ) AS gross_revenue,
    (
      SELECT coalesce(round(sum(refund_orders.refunded_cents)::numeric / 100.0, 2), 0)
      FROM (
        SELECT o.id, sum(DISTINCT pay.amount_cents) AS refunded_cents
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        JOIN products p ON p.id = oi.product_id
        JOIN payments pay ON pay.order_id = o.id
        CROSS JOIN params prm
        WHERE p.seller_id = fs.seller_id
          AND pay.status = 'refunded'
          AND o.status IN ('paid', 'shipped', 'delivered')
          AND o.created_at >= prm.start_date
          AND o.created_at < prm.end_date
        GROUP BY o.id
      ) refund_orders
    ) AS refunded_revenue,
    (
      SELECT coalesce(round(avg(order_totals.order_total_cents)::numeric / 100.0, 2), 0)
      FROM (
        SELECT o.id, sum(oi.quantity * oi.unit_price_cents) AS order_total_cents
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        JOIN products p ON p.id = oi.product_id
        CROSS JOIN params prm
        WHERE p.seller_id = fs.seller_id
          AND o.status IN ('paid', 'shipped', 'delivered')
          AND o.created_at >= prm.start_date
          AND o.created_at < prm.end_date
        GROUP BY o.id
      ) order_totals
    ) AS avg_order_value,
    (
      SELECT count(DISTINCT o.user_id)
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      JOIN products p ON p.id = oi.product_id
      CROSS JOIN params prm
      WHERE p.seller_id = fs.seller_id
        AND o.status IN ('paid', 'shipped', 'delivered')
        AND o.created_at >= prm.start_date
        AND o.created_at < prm.end_date
    ) AS unique_buyers_count,
    (
      SELECT count(*)
      FROM shipments sh
      CROSS JOIN params prm
      WHERE sh.seller_id = fs.seller_id
        AND sh.status IN ('shipped', 'delivered', 'returned')
        AND sh.created_at >= prm.start_date
        AND sh.created_at < prm.end_date
        AND coalesce(sh.delivered_at, sh.shipped_at, prm.end_date) > sh.promised_at
    ) AS late_shipments_count,
    (
      SELECT count(DISTINCT st.id)
      FROM support_tickets st
      JOIN orders o ON o.id = st.order_id
      JOIN order_items oi ON oi.order_id = o.id
      JOIN products p ON p.id = oi.product_id
      CROSS JOIN params prm
      WHERE p.seller_id = fs.seller_id
        AND st.status IN ('open', 'pending', 'resolved', 'closed')
        AND st.created_at >= prm.start_date
        AND st.created_at < prm.end_date
    ) AS support_tickets_count,
    (
      SELECT round(avg(r.rating)::numeric, 2)
      FROM reviews r
      JOIN products p ON p.id = r.product_id
      CROSS JOIN params prm
      WHERE p.seller_id = fs.seller_id
        AND r.created_at >= prm.start_date
        AND r.created_at < prm.end_date
    ) AS avg_review_rating,
    (
      SELECT count(*)
      FROM reviews r
      JOIN products p ON p.id = r.product_id
      CROSS JOIN params prm
      WHERE p.seller_id = fs.seller_id
        AND r.rating IN (1, 2)
        AND r.created_at >= prm.start_date
        AND r.created_at < prm.end_date
    ) AS negative_reviews_count,
    (
      SELECT max(po.created_at)
      FROM payouts po
      WHERE po.seller_id = fs.seller_id
        AND po.status = 'paid'
    ) AS latest_successful_payout_at,
    (
      SELECT greatest(
        0,
        100 - coalesce(sum(im.quantity_delta), 0)
          + (
            SELECT count(*) * 3
            FROM reviews r2
            JOIN products p2 ON p2.id = r2.product_id
            CROSS JOIN params prm
            WHERE p2.seller_id = fs.seller_id
              AND r2.rating IN (1, 2)
              AND r2.created_at >= prm.start_date
              AND r2.created_at < prm.end_date
          )
      )
      FROM inventory_movements im
      JOIN products p ON p.id = im.product_id
      WHERE p.seller_id = fs.seller_id
    ) AS inventory_risk_score,
    (
      SELECT count(*)
      FROM user_events e
      CROSS JOIN params prm
      WHERE e.event_type IN ('view', 'search')
        AND e.created_at >= prm.start_date
        AND e.created_at < prm.end_date
        AND e.metadata @> jsonb_build_object('seller_id', fs.seller_id)
        AND e.metadata @> jsonb_build_object('region', prm.traffic_region)
    ) AS recent_product_views,
    (
      SELECT count(*)
      FROM user_events e
      CROSS JOIN params prm
      WHERE e.event_type IN ('cart_add')
        AND e.created_at >= prm.start_date
        AND e.created_at < prm.end_date
        AND e.metadata @> jsonb_build_object('seller_id', fs.seller_id)
        AND e.metadata @> jsonb_build_object('region', prm.traffic_region)
    ) AS recent_add_to_cart_events,
    (
      SELECT coalesce(round(
        count(*) FILTER (WHERE e.event_type = 'purchase')::numeric
        / nullif(count(*) FILTER (WHERE e.event_type IN ('view', 'search')), 0),
        4
      ), 0)
      FROM user_events e
      CROSS JOIN params prm
      WHERE e.event_type IN ('view', 'search', 'purchase')
        AND e.created_at >= prm.start_date
        AND e.created_at < prm.end_date
        AND e.metadata @> jsonb_build_object('seller_id', fs.seller_id)
        AND e.metadata @> jsonb_build_object('region', prm.traffic_region)
    ) AS conversion_rate
  FROM filtered_sellers fs
  LEFT JOIN products noisy_products ON noisy_products.seller_id = fs.seller_id
  LEFT JOIN support_tickets noisy_tickets ON noisy_tickets.user_id = fs.user_id
  GROUP BY fs.seller_id, fs.seller_name, fs.seller_email, fs.user_id, fs.country, fs.status
)
SELECT
  seller_id,
  seller_name,
  seller_email,
  paid_orders_count,
  gross_revenue,
  refunded_revenue,
  avg_order_value,
  unique_buyers_count,
  late_shipments_count,
  support_tickets_count,
  avg_review_rating,
  negative_reviews_count,
  latest_successful_payout_at,
  inventory_risk_score,
  recent_product_views,
  recent_add_to_cart_events,
  conversion_rate,
  round(
    (paid_orders_count * 2)
    + (gross_revenue / 1000)
    - (refunded_revenue / 500)
    + (late_shipments_count * 3)
    + (support_tickets_count * 2)
    + (negative_reviews_count * 2)
    + (inventory_risk_score / 10)
    - (coalesce(avg_review_rating, 0) * 4)
    - (conversion_rate * 10),
    2
  ) AS dashboard_score
FROM dashboard_rows
ORDER BY (
    (paid_orders_count * 2)
    + (gross_revenue / 1000)
    - (refunded_revenue / 500)
    + (late_shipments_count * 3)
    + (support_tickets_count * 2)
    + (negative_reviews_count * 2)
    + (inventory_risk_score / 10)
    - (coalesce(avg_review_rating, 0) * 4)
    - (conversion_rate * 10)
  ) DESC,
  seller_id ASC
OFFSET (SELECT result_offset FROM params)
LIMIT (SELECT result_limit FROM params);
