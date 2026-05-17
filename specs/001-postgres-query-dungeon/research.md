# Research: Postgres Query Dungeon

## Decision: TypeScript + Node.js CLI

Rationale: The user selected TypeScript + Node.js for the backend. It gives a
small CLI surface with commander, a typed challenge registry, easy Vitest tests,
and straightforward PostgreSQL orchestration. The code remains thin enough that
raw SQL files stay the teaching surface.

Alternatives considered:

- Python: previously considered for quick scripting, but superseded by the
  explicit technical plan.
- REST-first service: rejected for MVP because CLI-first keeps local workflows
  simpler and supports Makefile commands directly.

## Decision: PostgreSQL 16+ in Docker Compose

Rationale: PostgreSQL 16+ satisfies the spec and keeps the lab current while not
requiring version 17-specific planner behavior. Docker Compose makes the local
database reproducible for setup, reset, seeding, tests, explain, and benchmarks.

Alternatives considered:

- Host PostgreSQL install: rejected because it makes reproducibility and reset
  behavior inconsistent.
- Managed database: rejected because the project is a local training lab.

## Decision: Raw SQL Challenge Files

Rationale: Query text must be visible, editable, and intentionally bad. Keeping
`bad.sql`, `solution.sql`, and expected-result SQL in challenge directories
supports reading, diffing, and teaching without burying query logic in
application code.

Alternatives considered:

- ORM/query builder for challenge SQL: rejected because it hides the SQL that
  learners must inspect.
- Inline SQL strings in TypeScript: rejected because scattered strings make
  challenge review and documentation harder.

## Decision: node-postgres or Kysely Only for Connectivity

Rationale: `pg` is sufficient for raw SQL execution, timeouts, transactions, and
result comparison. Kysely may be used only if it improves typed connection code;
challenge SQL remains raw and file-backed either way.

Alternatives considered:

- Full ORM: rejected because it conflicts with SQL-first teaching goals.
- Shelling out to `psql` for all operations: rejected because tests and
  benchmark parsing are easier and more portable from Node.

## Decision: SQL Seed Scripts with Optional Node Orchestration

Rationale: `generate_series` and seeded random expressions can create realistic
marketplace data directly in PostgreSQL. Node orchestration can select
`SEED_SCALE=small|medium|large`, run scripts in order, and report row counts.

Alternatives considered:

- Pure Node data generator: useful for complex skew, but slower for millions of
  rows unless batched carefully.
- Static dumps: rejected because they are bulky and less transparent.

## Decision: Scale Profiles and Query Timeout

Rationale: The project intentionally contains bad queries, so safety controls are
part of the product. `small` supports quick smoke tests, `medium` is the default
learning dataset, and `large` is opt-in. CLI query timeouts prevent accidental
runaway local sessions.

Alternatives considered:

- One fixed dataset size: rejected because laptops and workshop timeboxes vary.
- No timeout: rejected because bad queries are intentionally heavy.

## Decision: Vitest Result Equivalence Tests

Rationale: Vitest fits the TypeScript stack and can run challenge-level tests
that compare bad and optimized query outputs for deterministic equality. Tests
protect the educational trap: faster must still mean correct.

Alternatives considered:

- SQL-only assertions: useful but less ergonomic for comparing structured result
  sets and integrating with Node CLI code.
- Snapshot-only checks: rejected because exact timing/plan text varies locally.

## Decision: Benchmark and EXPLAIN Output Contract

Rationale: Every challenge needs `EXPLAIN (ANALYZE, BUFFERS)` and benchmark
evidence. The CLI should normalize output around latency, rows, buffers,
planning time, execution time, and raw plan text while accepting machine-to-
machine timing variation.

Alternatives considered:

- Wall-clock timing only: rejected because it misses PostgreSQL-specific
  learning signals.
- Plan text only: rejected because learners also need before/after latency
  comparison.
