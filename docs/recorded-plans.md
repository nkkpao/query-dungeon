# Recorded Plans

Advanced variants include `recorded-plan.medium.txt` artifacts captured with:

```bash
EXPLAIN (ANALYZE, BUFFERS)
```

These files are reference evidence for `SEED_SCALE=medium`. They are committed
text artifacts so normal challenge execution does not generate plans, run
medium-scale benchmarks, or compare participant SQL with official solutions.

Participants should run their own `EXPLAIN (ANALYZE, BUFFERS)` first, then use
the recorded plan as a baseline reference for reproducibility and discussion.

## Regenerate Locally

Start the database, seed medium data, then run the maintainer command:

```bash
make setup
make seed SEED_SCALE=medium
make record-plans SCALE=medium
```

Equivalent npm command:

```bash
npm run record-plans -- --scale medium
```

The command writes each advanced variant's
`variants/advanced/recorded-plan.medium.txt`. It is intentionally explicit and
is not called by `run-sql`, `explain-file`, `validate-file`, `benchmark-file`, or
CI smoke tests.

## Validate Artifacts

Use lightweight structural validation:

```bash
make validate-recorded-plans
npm run validate-recorded-plans
```

Validation checks for:

- `QUERY PLAN`
- `actual time`
- `Buffers`
- expected planner symptoms such as `Seq Scan`, `Sort`, `Hash Join`,
  `Nested Loop`, and `Rows Removed by Filter`

Validation does not assert exact costs, row counts, or execution-time equality.
Those values are useful clues, but they are machine-dependent.
