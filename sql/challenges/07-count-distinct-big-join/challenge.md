# 07 COUNT DISTINCT Over Big Join

Capture the baseline plan yourself with `make explain-file`.

Business task: Business wants paid-order counts by user country.

Expected output: `country`, `orders_count`; highest count first.

Symptoms to investigate:

- Find row multiplication before `count(DISTINCT ...)`.
- Check whether materialization freezes an unnecessarily large intermediate set.
- Identify joined tables that do not affect the final count.

Constraints:

- Count distinct paid, shipped, and delivered orders only.
- Country must still come from the order owner.
- Remove joins only with a correctness argument.

Success criterion: The plan counts the same orders by country without building a huge expanded relation.

Manual workflow:

```bash
make run-sql CHALLENGE=07-count-distinct-big-join SQL=sql/challenges/07-count-distinct-big-join/baseline.sql
make explain-file CHALLENGE=07-count-distinct-big-join SQL=sql/challenges/07-count-distinct-big-join/baseline.sql
cp sql/challenges/07-count-distinct-big-join/baseline.sql workspace/sql/07-count-distinct-big-join-attempt-1.sql
make validate-file CHALLENGE=07-count-distinct-big-join SQL=workspace/sql/07-count-distinct-big-join-attempt-1.sql
make benchmark-file CHALLENGE=07-count-distinct-big-join SQL=workspace/sql/07-count-distinct-big-join-attempt-1.sql ITERATIONS=3
```

Hints: see `hints/hints.md`.

Solution access: suggested solutions are in `optional/` and are outside the default exercise flow. Use them only through the explicit `compare-with-suggested-solution` command after your own investigation.

Docs: see `docs/how-to-explain.md`, `docs/indexing-cheatsheet.md`, and `docs/query-optimization-workflow.md`.
