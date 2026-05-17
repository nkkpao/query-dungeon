SELECT id, user_id, event_type, metadata, created_at
FROM user_events
WHERE user_id = 42
ORDER BY created_at DESC, id DESC
LIMIT 30
