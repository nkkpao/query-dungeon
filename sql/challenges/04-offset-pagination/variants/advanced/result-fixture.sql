WITH ranked_events AS (
  SELECT id,
         user_id,
         event_type,
         created_at,
         row_number() OVER (ORDER BY created_at DESC, id DESC) AS row_number
  FROM user_events
  WHERE event_type IN ('view', 'search')
)
SELECT id, user_id, event_type, created_at
FROM ranked_events
WHERE row_number > 50000
  AND row_number <= 50050
ORDER BY row_number
