# Advanced: bad OFFSET pagination on skewed events

Business task: show a deep page of recent high-volume user events for an operations review.

Expected output: `id`, `user_id`, `event_type`, `created_at`, ordered by newest events first.

Data skew assumptions:

- `SEED_SCALE=medium` contains hot users with a disproportionate share of events.
- Recent event timestamps are clustered into a small time window.
- Common event types such as `view` and `search` are low-selectivity filters.

Symptoms to investigate:

- large `Seq Scan` on `user_events`
- expensive `Sort`
- high shared buffer usage
- many rows removed by filter before the deep page is returned

Constraints:

- Keep the baseline bad query unchanged as the starting point.
- Manually run `EXPLAIN (ANALYZE, BUFFERS)` and benchmark your own SQL.
- Use `recorded-plan.medium.txt` only as a reference after your investigation.
- Official solution files under `optional/` are for explicit comparison only.

Success criterion: produce the same result with a plan that avoids scanning and sorting far more rows than the page needs.

Manual workflow:

1. Load medium data when investigating this variant: `SEED_SCALE=medium make seed`.
2. Run your own query with `--variant advanced`.
3. Explain and benchmark your attempts manually.
4. Consult `recorded-plan.medium.txt` after forming your own hypothesis.
