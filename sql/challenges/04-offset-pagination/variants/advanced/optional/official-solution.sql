SELECT id, user_id, event_type, created_at
FROM user_events
WHERE event_type IN ('view', 'search')
ORDER BY created_at DESC, id DESC
OFFSET 50000
LIMIT 50
