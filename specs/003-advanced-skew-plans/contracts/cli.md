# CLI Contract: Advanced Skew Plans

## Existing Learner Commands

The following commands remain the normal learner workflow and must not reveal or
execute advanced official solution files:

```text
dungeon list
dungeon seed --scale small|medium|large
dungeon run-sql <challenge-id> --file <path>
dungeon explain-file <challenge-id> --file <path>
dungeon benchmark-file <challenge-id> --file <path> [--baseline] [--iterations N]
dungeon validate-file <challenge-id> --file <path>
dungeon diff-results <challenge-id> --left <path> --right <path>
```

## Advanced Variant Selection

Advanced variants should be addressable without changing baseline challenge IDs.
Acceptable contract:

```text
dungeon list --variants
dungeon run-sql <challenge-id> --variant advanced --file <path>
dungeon explain-file <challenge-id> --variant advanced --file <path>
dungeon benchmark-file <challenge-id> --variant advanced --file <path> [--baseline]
dungeon validate-file <challenge-id> --variant advanced --file <path>
```

Rules:

- Omitting `--variant` uses the existing normal challenge behavior.
- `--variant advanced` resolves paths under
  `sql/challenges/<challenge-id>/variants/advanced/`.
- Default commands must not read
  `variants/advanced/optional/official-solution.sql` or
  `variants/advanced/optional/official-indexes.sql`.
- Makefile wrappers may expose this as `VARIANT=advanced`, but `CHALLENGE`
  remains the existing baseline challenge ID.

## Maintainer Recorded-Plan Commands

Maintainer-only recorded-plan regeneration is explicit:

```text
make record-plans SCALE=medium
npm run record-plans -- --scale medium
```

Behavior:

- Requires an already running PostgreSQL container and loaded medium seed data,
  or documents the required setup steps before execution.
- Runs each advanced variant baseline query through
  `EXPLAIN (ANALYZE, BUFFERS)`.
- Writes `recorded-plan.medium.txt` under each advanced variant directory.
- Does not execute official solution SQL.
- Is not called by normal learner commands.
- Is not required in default CI.

## Recorded-Plan Validation

Lightweight validation is allowed in normal test suites:

```text
npm test -- recorded-plan-validation
```

Checks:

- Advanced variant files exist.
- Recorded plan text files exist.
- Recorded plan text includes `EXPLAIN`, `ANALYZE`, and `BUFFERS` evidence or a
  documented captured-plan header plus PostgreSQL plan output with actual timing
  and buffer lines.
- Recorded plan text contains expected structural planner markers.
- Tests do not assert exact planning or execution time equality.

## Explicit Solution Comparison

Solution comparison remains opt-in only:

```text
dungeon compare-with-suggested-solution <challenge-id> --variant advanced --file <path>
```

Rules:

- The command must clearly indicate that it is leaving the default exercise
  flow.
- The command may read official solution files only after explicit invocation.
- No default README path should require this command.
