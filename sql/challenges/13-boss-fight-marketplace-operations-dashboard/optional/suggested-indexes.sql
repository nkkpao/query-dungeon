-- Reference index set for the marketplace operations dashboard.
-- Apply manually in a scratch database after inspecting the baseline plan.

-- Composite indexes for date-filtered paid-like order access and seller rollups.
CREATE INDEX IF NOT EXISTS idx_solution_boss13_orders_status_created_id
  ON orders(status, created_at, id)
  INCLUDE (user_id);

CREATE INDEX IF NOT EXISTS idx_solution_boss13_products_seller_product
  ON products(seller_id, id)
  INCLUDE (category_id);

-- Covering index for the hot order_items join and aggregation path.
CREATE INDEX IF NOT EXISTS idx_solution_boss13_order_items_order_product_covering
  ON order_items(order_id, product_id)
  INCLUDE (quantity, unit_price_cents);

-- Partial indexes for status-specific operational facts.
CREATE INDEX IF NOT EXISTS idx_solution_boss13_payments_refunded_order
  ON payments(order_id)
  INCLUDE (amount_cents)
  WHERE status = 'refunded';

CREATE INDEX IF NOT EXISTS idx_solution_boss13_payouts_success_latest
  ON payouts(seller_id, created_at DESC)
  WHERE status = 'paid';

CREATE INDEX IF NOT EXISTS idx_solution_boss13_payouts_failed_recent
  ON payouts(seller_id, created_at)
  WHERE status IN ('failed', 'cancelled');

CREATE INDEX IF NOT EXISTS idx_solution_boss13_shipments_late_candidates
  ON shipments(seller_id, created_at, promised_at)
  INCLUDE (status, shipped_at, delivered_at)
  WHERE status IN ('shipped', 'delivered', 'returned');

-- Expression indexes for case-insensitive seller search.
CREATE INDEX IF NOT EXISTS idx_solution_boss13_sellers_lower_email
  ON sellers(lower(email));

CREATE INDEX IF NOT EXISTS idx_solution_boss13_sellers_lower_name
  ON sellers(lower(name));

-- Fact-table indexes for reviews, tickets, and inventory aggregation.
CREATE INDEX IF NOT EXISTS idx_solution_boss13_reviews_product_created
  ON reviews(product_id, created_at)
  INCLUDE (rating);

CREATE INDEX IF NOT EXISTS idx_solution_boss13_support_tickets_order_created
  ON support_tickets(order_id, created_at)
  INCLUDE (status);

CREATE INDEX IF NOT EXISTS idx_solution_boss13_inventory_product_delta
  ON inventory_movements(product_id)
  INCLUDE (quantity_delta);

-- JSONB support. The GIN index helps containment predicates; the expression
-- index helps rewrites that group/filter by seller_id extracted from metadata.
CREATE INDEX IF NOT EXISTS idx_solution_boss13_user_events_metadata_gin
  ON user_events USING gin (metadata jsonb_path_ops);

CREATE INDEX IF NOT EXISTS idx_solution_boss13_user_events_seller_region_created
  ON user_events(((metadata->>'seller_id')::bigint), (metadata->>'region'), created_at, event_type)
  WHERE metadata ? 'seller_id';
