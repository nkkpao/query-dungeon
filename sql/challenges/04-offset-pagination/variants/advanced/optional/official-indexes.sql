CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_events_type_created_id
ON user_events (event_type, created_at DESC, id DESC);
