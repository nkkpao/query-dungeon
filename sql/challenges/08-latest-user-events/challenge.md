# 08 Latest User Events

Capture the baseline plan yourself with `make explain-file`.

Business task: A profile page shows the newest events for one user.

Expected output: `id`, `user_id`, `event_type`, `metadata`, `created_at`; newest events first.

Symptoms to investigate:

- Look for a broad scan over `user_events`.
- Compare the user predicate with requested ordering.
- Check whether an unrelated single-column index misleads the plan.

Constraints:

- Keep the user filter and deterministic order.
- Do not precompute the feed outside PostgreSQL.
- Measure both latency and buffer changes.

Success criterion: The feed can be read through a path ordered for one user rather than sorting a broad scan.

Manual workflow:

```bash
make run-sql CHALLENGE=08-latest-user-events SQL=sql/challenges/08-latest-user-events/baseline.sql
make explain-file CHALLENGE=08-latest-user-events SQL=sql/challenges/08-latest-user-events/baseline.sql
cp sql/challenges/08-latest-user-events/baseline.sql workspace/sql/08-latest-user-events-attempt-1.sql
make validate-file CHALLENGE=08-latest-user-events SQL=workspace/sql/08-latest-user-events-attempt-1.sql
make benchmark-file CHALLENGE=08-latest-user-events SQL=workspace/sql/08-latest-user-events-attempt-1.sql ITERATIONS=3
```

Hints: see `hints/hints.md`.

Solution access: suggested solutions are in `optional/` and are outside the default exercise flow. Use them only through the explicit `compare-with-suggested-solution` command after your own investigation.

Docs: see `docs/how-to-explain.md`, `docs/indexing-cheatsheet.md`, and `docs/query-optimization-workflow.md`.
