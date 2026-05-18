# 10 Window Function Overuse

Capture the baseline plan yourself with `make explain-file`.

Business task: Merchandising needs each user’s largest paid-like order.

Expected output: `user_id`, `order_id`, `total_cents`; highest order totals first.

Symptoms to investigate:

- Inspect sort volume before window aggregation.
- Find window functions that do not contribute to the final answer.
- Compare top-per-group strategies and their ordering requirements.

Constraints:

- Return one deterministic best order per user.
- Keep paid, shipped, and delivered statuses only.
- Do not drop tie-breaking on order id.

Success criterion: The query computes top-per-user with less unnecessary window work and a plan that matches the grouping/order.

Manual workflow:

```bash
make run-sql CHALLENGE=10-window-function-overuse SQL=sql/challenges/10-window-function-overuse/baseline.sql
make explain-file CHALLENGE=10-window-function-overuse SQL=sql/challenges/10-window-function-overuse/baseline.sql
cp sql/challenges/10-window-function-overuse/baseline.sql workspace/sql/10-window-function-overuse-attempt-1.sql
make validate-file CHALLENGE=10-window-function-overuse SQL=workspace/sql/10-window-function-overuse-attempt-1.sql
make benchmark-file CHALLENGE=10-window-function-overuse SQL=workspace/sql/10-window-function-overuse-attempt-1.sql ITERATIONS=3
```

Hints: see `hints/hints.md`.

Solution access: suggested solutions are in `optional/` and are outside the default exercise flow. Use them only through the explicit `compare-with-official-solution` command after your own investigation.

Docs: see `docs/how-to-explain.md`, `docs/indexing-cheatsheet.md`, and `docs/query-optimization-workflow.md`.
