# 05 Case-Insensitive Email Lookup

Capture the baseline plan yourself with `make explain-file`.

Business task: Support searches for a user by email regardless of letter case.

Expected output: `id`, `email`, `status`, `country` for the matching user.

Symptoms to investigate:

- Check whether the function on `email` prevents use of the unique email index.
- Compare estimated rows with actual rows.
- Think about expression indexes versus changing stored data.

Constraints:

- The lookup must remain case-insensitive.
- Do not remove the function unless you preserve semantics another way.
- Explain write/storage trade-offs for any expression index.

Success criterion: The lookup becomes selective without changing which email variants match.

Manual workflow:

```bash
make run-sql CHALLENGE=05-lower-email-expression-index SQL=sql/challenges/05-lower-email-expression-index/baseline.sql
make explain-file CHALLENGE=05-lower-email-expression-index SQL=sql/challenges/05-lower-email-expression-index/baseline.sql
cp sql/challenges/05-lower-email-expression-index/baseline.sql workspace/sql/05-lower-email-expression-index-attempt-1.sql
make validate-file CHALLENGE=05-lower-email-expression-index SQL=workspace/sql/05-lower-email-expression-index-attempt-1.sql
make benchmark-file CHALLENGE=05-lower-email-expression-index SQL=workspace/sql/05-lower-email-expression-index-attempt-1.sql ITERATIONS=3
```

Hints: see `hints/hints.md`.

Solution access: suggested solutions are in `optional/` and are outside the default exercise flow. Use them only through the explicit `compare-with-official-solution` command after your own investigation.

Docs: see `docs/how-to-explain.md`, `docs/indexing-cheatsheet.md`, and `docs/query-optimization-workflow.md`.
