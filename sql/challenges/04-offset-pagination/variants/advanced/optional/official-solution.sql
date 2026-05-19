-- Reference approach: use the same ordering key as a seek cursor so the
-- supporting index can avoid sorting the full matching event set.
-- Trade-off: the first deep-page anchor still has to be discovered once; in a
-- real UI, callers should pass the last `(created_at, id)` from the previous page.
WITH page_anchor AS (
  SELECT created_at, id
  FROM user_events
  WHERE event_type IN ('view', 'search')
  ORDER BY created_at DESC, id DESC
  OFFSET 50000
  LIMIT 1
)
SELECT e.id, e.user_id, e.event_type, e.created_at
FROM user_events e
CROSS JOIN page_anchor a
WHERE e.event_type IN ('view', 'search')
  AND (e.created_at, e.id) <= (a.created_at, a.id)
ORDER BY e.created_at DESC, e.id DESC
LIMIT 50
