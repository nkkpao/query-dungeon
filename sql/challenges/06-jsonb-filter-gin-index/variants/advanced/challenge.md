# Advanced: JSONB event filtering over skewed metadata

Business task: count recent campaign events with a specific metadata shape.

Expected output: one row with `matching_events`.

Data skew assumptions:

- event types are highly skewed toward common low-selectivity values
- metadata keys such as `device`, `experiment`, and `region` are often null
- campaign metadata is unevenly distributed
- hot users produce many events in the same recent time window

Symptoms to investigate:

- `Seq Scan` on `user_events`
- JSONB filter work on many rows
- bad row estimates
- rows removed by filter
- high shared buffer usage

Constraints:

- Run your own `EXPLAIN (ANALYZE, BUFFERS)` first.
- Do not use optional official solution files unless explicitly comparing.
- Recorded plans are reference artifacts only.

Success criterion: preserve the count while making the filter selective enough for PostgreSQL to avoid unnecessary JSONB work.

Manual workflow:

1. Load `SEED_SCALE=medium`.
2. Run the baseline and your own attempts with `--variant advanced`.
3. Compare row estimates, rows removed by filter, and buffer usage.
