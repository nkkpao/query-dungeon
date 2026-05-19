-- Reference approach: match the expression index directly instead of asking
-- PostgreSQL to evaluate broad JSONB predicates for every event row.
-- Trade-off: this is excellent for the campaign/device dashboard predicate but
-- less reusable than a broad GIN index for arbitrary metadata exploration.
SELECT count(*) AS matching_events
FROM user_events
WHERE metadata->>'campaign' = 'spring'
  AND metadata->>'device' = 'web'
  AND event_type IN ('view', 'search')
