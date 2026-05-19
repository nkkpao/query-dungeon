WITH cursor_params AS (
  -- Values from the last row of the previous page on the small seed.
  -- In an application this cursor is supplied by the previous response.
  SELECT
    TIMESTAMPTZ '2024-10-21 22:00:00+00' AS cursor_created_at,
    4822::bigint AS cursor_id
)
SELECT o.id, o.user_id, o.status, o.created_at, o.total_cents
FROM orders o
CROSS JOIN cursor_params c
WHERE (o.created_at, o.id) < (c.cursor_created_at, c.cursor_id)
ORDER BY o.created_at DESC, o.id DESC
LIMIT 25
