SELECT count(*) AS matching_events
FROM user_events
WHERE metadata @> '{"campaign":"spring"}'::jsonb
  AND metadata->>'device' = 'web'
  AND event_type IN ('view', 'search')
