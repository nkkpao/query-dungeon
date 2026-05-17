CREATE INDEX IF NOT EXISTS idx_solution_dashboard_orders ON orders(status, created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_solution_dashboard_events_gin ON user_events USING gin(metadata);
