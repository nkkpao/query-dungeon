# 09 Unpaid Orders Partial Index

Capture the baseline plan yourself with `make explain-file`.

Business task: Finance triages recent unpaid orders.

Expected output: `id`, `user_id`, `status`, `created_at`, `total_cents`; newest unpaid orders first.

Symptoms to investigate:

- Measure how selective `status = unpaid` is.
- Check whether the plan scans many paid orders to find a small working set.
- Reason about partial indexes and predicate stability.

Constraints:

- Only unpaid orders belong in the answer.
- Keep ordering on `created_at DESC, id DESC`.
- Document why a partial index is or is not appropriate.

Success criterion: The query uses an access path sized for the unpaid working set.

Manual workflow:

```bash
make run-sql CHALLENGE=09-unpaid-orders-partial-index SQL=sql/challenges/09-unpaid-orders-partial-index/baseline.sql
make explain-file CHALLENGE=09-unpaid-orders-partial-index SQL=sql/challenges/09-unpaid-orders-partial-index/baseline.sql
cp sql/challenges/09-unpaid-orders-partial-index/baseline.sql workspace/sql/09-unpaid-orders-partial-index-attempt-1.sql
make validate-file CHALLENGE=09-unpaid-orders-partial-index SQL=workspace/sql/09-unpaid-orders-partial-index-attempt-1.sql
make benchmark-file CHALLENGE=09-unpaid-orders-partial-index SQL=workspace/sql/09-unpaid-orders-partial-index-attempt-1.sql ITERATIONS=3
```

Hints: see `hints/hints.md`.

Solution access: suggested solutions are in `optional/` and are outside the default exercise flow. Use them only through the explicit `compare-with-official-solution` command after your own investigation.

Docs: see `docs/how-to-explain.md`, `docs/indexing-cheatsheet.md`, and `docs/query-optimization-workflow.md`.
