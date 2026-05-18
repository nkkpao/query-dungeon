# 06 JSONB Filter Without GIN

Capture the baseline plan yourself with `make explain-file`.

Business task: Catalog reporting counts premium products stored inside JSONB attributes.

Expected output: One row with `premium_products`.

Symptoms to investigate:

- Inspect whether JSONB containment is evaluated by scanning every product.
- Compare predicate selectivity with table size.
- Reason about GIN index cost, storage, and write overhead.

Constraints:

- Keep the JSONB containment predicate semantically equivalent.
- Do not extract the attribute into application code.
- Measure whether the index helps on the chosen seed scale.

Success criterion: The plan can use a JSONB-aware access path when selectivity and scale justify it.

Manual workflow:

```bash
make run-sql CHALLENGE=06-jsonb-filter-gin-index SQL=sql/challenges/06-jsonb-filter-gin-index/baseline.sql
make explain-file CHALLENGE=06-jsonb-filter-gin-index SQL=sql/challenges/06-jsonb-filter-gin-index/baseline.sql
cp sql/challenges/06-jsonb-filter-gin-index/baseline.sql workspace/sql/06-jsonb-filter-gin-index-attempt-1.sql
make validate-file CHALLENGE=06-jsonb-filter-gin-index SQL=workspace/sql/06-jsonb-filter-gin-index-attempt-1.sql
make benchmark-file CHALLENGE=06-jsonb-filter-gin-index SQL=workspace/sql/06-jsonb-filter-gin-index-attempt-1.sql ITERATIONS=3
```

Hints: see `hints/hints.md`.

Solution access: suggested solutions are in `optional/` and are outside the default exercise flow. Use them only through the explicit `compare-with-official-solution` command after your own investigation.

Docs: see `docs/how-to-explain.md`, `docs/indexing-cheatsheet.md`, and `docs/query-optimization-workflow.md`.
