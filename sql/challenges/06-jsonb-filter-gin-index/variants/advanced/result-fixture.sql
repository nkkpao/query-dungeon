SELECT sum(
  CASE
    WHEN metadata @> '{"campaign":"spring"}'::jsonb
      AND metadata->>'device' = 'web'
      AND event_type IN ('view', 'search')
    THEN 1
    ELSE 0
  END
)::bigint AS matching_events
FROM user_events
