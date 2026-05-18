# 03 Latest Payment Correlated Subquery

Capture the baseline plan yourself with `make explain-file`.

Business task: Operations needs the latest payment state for recent non-cancelled orders.

Expected output: `order_id`, `user_id`, `latest_payment_status`, `latest_payment_at`; newest orders first.

Symptoms to investigate:

- Look for repeated subplans under the order page.
- Check whether the same payment lookup is performed more than once per order.
- Compare the payment lookup order with available indexes.

Constraints:

- Keep orders with no payment visible with null latest-payment fields.
- Keep the latest payment tie-breaker on `created_at DESC, id DESC`.
- Avoid solving by limiting the business result differently.

Success criterion: The plan performs one latest-payment lookup per visible order and uses an access path that matches the lookup order.

Manual workflow:

```bash
make run-sql CHALLENGE=03-latest-payment-correlated-subquery SQL=sql/challenges/03-latest-payment-correlated-subquery/baseline.sql
make explain-file CHALLENGE=03-latest-payment-correlated-subquery SQL=sql/challenges/03-latest-payment-correlated-subquery/baseline.sql
cp sql/challenges/03-latest-payment-correlated-subquery/baseline.sql workspace/sql/03-latest-payment-correlated-subquery-attempt-1.sql
make validate-file CHALLENGE=03-latest-payment-correlated-subquery SQL=workspace/sql/03-latest-payment-correlated-subquery-attempt-1.sql
make benchmark-file CHALLENGE=03-latest-payment-correlated-subquery SQL=workspace/sql/03-latest-payment-correlated-subquery-attempt-1.sql ITERATIONS=3
```

Hints: see `hints/hints.md`.

Solution access: suggested solutions are in `optional/` and are outside the default exercise flow. Use them only through the explicit `compare-with-suggested-solution` command after your own investigation.

Docs: see `docs/how-to-explain.md`, `docs/indexing-cheatsheet.md`, and `docs/query-optimization-workflow.md`.
