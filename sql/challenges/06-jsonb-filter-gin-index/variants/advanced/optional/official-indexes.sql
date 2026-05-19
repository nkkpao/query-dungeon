CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_events_campaign_device_type
ON user_events ((metadata->>'campaign'), (metadata->>'device'), event_type);
