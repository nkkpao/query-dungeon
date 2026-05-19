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
filtered_sellers AS (
  SELECT s.id AS seller_id,
         s.user_id,
         s.name AS seller_name,
         s.email AS seller_email
  FROM sellers s
  CROSS JOIN params prm
  WHERE s.status IN ('active', 'paused')
    AND s.country = prm.country
    AND (
      lower(s.email) LIKE '%' || lower(prm.seller_search) || '%'
      OR lower(s.name) LIKE '%' || lower(prm.seller_search) || '%'
    )
    AND NOT EXISTS (
      SELECT 1
      FROM payouts po
      WHERE po.seller_id = s.id
        AND po.status IN ('failed', 'cancelled')
        AND po.created_at >= prm.start_date - INTERVAL '180 days'
    )
),
seller_order_items AS (
  SELECT p.seller_id,
         o.id AS order_id,
         o.user_id,
         oi.quantity * oi.unit_price_cents AS item_cents
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.id
  JOIN products p ON p.id = oi.product_id
  JOIN filtered_sellers fs ON fs.seller_id = p.seller_id
  CROSS JOIN params prm
  WHERE o.status IN ('paid', 'shipped', 'delivered')
    AND o.created_at >= prm.start_date
    AND o.created_at < prm.end_date
),
order_totals AS (
  SELECT seller_id,
         order_id,
         user_id,
         sum(item_cents) AS order_total_cents
  FROM seller_order_items
  GROUP BY seller_id, order_id, user_id
),
order_metrics AS (
  SELECT seller_id,
         count(*) AS paid_orders_count,
         round(sum(order_total_cents)::numeric / 100.0, 2) AS gross_revenue,
         round(avg(order_total_cents)::numeric / 100.0, 2) AS avg_order_value,
         count(DISTINCT user_id) AS unique_buyers_count
  FROM order_totals
  GROUP BY seller_id
),
refund_metrics AS (
  SELECT ot.seller_id,
         round(sum(refunded.refunded_cents)::numeric / 100.0, 2) AS refunded_revenue
  FROM order_totals ot
  JOIN (
    SELECT pay.order_id, sum(DISTINCT pay.amount_cents) AS refunded_cents
    FROM payments pay
    WHERE pay.status = 'refunded'
    GROUP BY pay.order_id
  ) refunded ON refunded.order_id = ot.order_id
  GROUP BY ot.seller_id
),
shipment_metrics AS (
  SELECT sh.seller_id,
         count(*) AS late_shipments_count
  FROM shipments sh
  JOIN filtered_sellers fs ON fs.seller_id = sh.seller_id
  CROSS JOIN params prm
  WHERE sh.status IN ('shipped', 'delivered', 'returned')
    AND sh.created_at >= prm.start_date
    AND sh.created_at < prm.end_date
    AND coalesce(sh.delivered_at, sh.shipped_at, prm.end_date) > sh.promised_at
  GROUP BY sh.seller_id
),
ticket_metrics AS (
  SELECT p.seller_id,
         count(DISTINCT st.id) AS support_tickets_count
  FROM support_tickets st
  JOIN orders o ON o.id = st.order_id
  JOIN order_items oi ON oi.order_id = o.id
  JOIN products p ON p.id = oi.product_id
  JOIN filtered_sellers fs ON fs.seller_id = p.seller_id
  CROSS JOIN params prm
  WHERE st.status IN ('open', 'pending', 'resolved', 'closed')
    AND st.created_at >= prm.start_date
    AND st.created_at < prm.end_date
  GROUP BY p.seller_id
),
review_metrics AS (
  SELECT p.seller_id,
         round(avg(r.rating)::numeric, 2) AS avg_review_rating,
         count(*) FILTER (WHERE r.rating IN (1, 2)) AS negative_reviews_count
  FROM reviews r
  JOIN products p ON p.id = r.product_id
  JOIN filtered_sellers fs ON fs.seller_id = p.seller_id
  CROSS JOIN params prm
  WHERE r.created_at >= prm.start_date
    AND r.created_at < prm.end_date
  GROUP BY p.seller_id
),
inventory_metrics AS (
  SELECT p.seller_id,
         greatest(
           0,
           100 - coalesce(sum(im.quantity_delta), 0)
             + coalesce(max(rm.negative_reviews_count), 0) * 3
         ) AS inventory_risk_score
  FROM products p
  JOIN filtered_sellers fs ON fs.seller_id = p.seller_id
  LEFT JOIN inventory_movements im ON im.product_id = p.id
  LEFT JOIN review_metrics rm ON rm.seller_id = p.seller_id
  GROUP BY p.seller_id
),
traffic_metrics AS (
  SELECT (e.metadata->>'seller_id')::bigint AS seller_id,
         count(*) FILTER (WHERE e.event_type IN ('view', 'search')) AS recent_product_views,
         count(*) FILTER (WHERE e.event_type = 'cart_add') AS recent_add_to_cart_events,
         coalesce(round(
           count(*) FILTER (WHERE e.event_type = 'purchase')::numeric
           / nullif(count(*) FILTER (WHERE e.event_type IN ('view', 'search')), 0),
           4
         ), 0) AS conversion_rate
  FROM user_events e
  CROSS JOIN params prm
  WHERE e.event_type IN ('view', 'search', 'cart_add', 'purchase')
    AND e.created_at >= prm.start_date
    AND e.created_at < prm.end_date
    AND e.metadata @> jsonb_build_object('region', prm.traffic_region)
    AND e.metadata ? 'seller_id'
  GROUP BY (e.metadata->>'seller_id')::bigint
),
latest_payout AS (
  SELECT po.seller_id,
         max(po.created_at) AS latest_successful_payout_at
  FROM payouts po
  JOIN filtered_sellers fs ON fs.seller_id = po.seller_id
  WHERE po.status = 'paid'
  GROUP BY po.seller_id
),
dashboard_rows AS (
  SELECT
    fs.seller_id,
    fs.seller_name,
    fs.seller_email,
    coalesce(om.paid_orders_count, 0) AS paid_orders_count,
    coalesce(om.gross_revenue, 0) AS gross_revenue,
    coalesce(rfm.refunded_revenue, 0) AS refunded_revenue,
    coalesce(om.avg_order_value, 0) AS avg_order_value,
    coalesce(om.unique_buyers_count, 0) AS unique_buyers_count,
    coalesce(sm.late_shipments_count, 0) AS late_shipments_count,
    coalesce(tm.support_tickets_count, 0) AS support_tickets_count,
    rm.avg_review_rating,
    coalesce(rm.negative_reviews_count, 0) AS negative_reviews_count,
    lp.latest_successful_payout_at,
    coalesce(im.inventory_risk_score, 100) AS inventory_risk_score,
    coalesce(tr.recent_product_views, 0) AS recent_product_views,
    coalesce(tr.recent_add_to_cart_events, 0) AS recent_add_to_cart_events,
    coalesce(tr.conversion_rate, 0) AS conversion_rate
  FROM filtered_sellers fs
  LEFT JOIN order_metrics om ON om.seller_id = fs.seller_id
  LEFT JOIN refund_metrics rfm ON rfm.seller_id = fs.seller_id
  LEFT JOIN shipment_metrics sm ON sm.seller_id = fs.seller_id
  LEFT JOIN ticket_metrics tm ON tm.seller_id = fs.seller_id
  LEFT JOIN review_metrics rm ON rm.seller_id = fs.seller_id
  LEFT JOIN inventory_metrics im ON im.seller_id = fs.seller_id
  LEFT JOIN traffic_metrics tr ON tr.seller_id = fs.seller_id
  LEFT JOIN latest_payout lp ON lp.seller_id = fs.seller_id
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
