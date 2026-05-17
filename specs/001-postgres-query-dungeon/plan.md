# Implementation Plan: Postgres Query Dungeon

**Branch**: `001-postgres-query-dungeon` | **Date**: 2026-05-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-postgres-query-dungeon/spec.md`

## Summary

Build a local PostgreSQL query optimization training lab with a TypeScript +
Node.js CLI, PostgreSQL 16+ in Docker Compose, raw SQL challenge files, scalable
marketplace seed data, and 12 intentionally inefficient query puzzles. Learners
run bad baselines, inspect `EXPLAIN (ANALYZE, BUFFERS)`, apply separate solution
SQL/migrations, and compare correctness plus benchmark evidence before/after.

## Technical Context

**Language/Version**: TypeScript on Node.js 20+  
**Primary Dependencies**: commander for CLI, node-postgres (`pg`) or Kysely only
for connection/query execution, Vitest for tests, Docker Compose, Makefile  
**Storage**: PostgreSQL 16+ via Docker Compose; raw SQL files under `/sql` are
the source of truth for schema, seeds, bad queries, and solutions  
**Testing**: Vitest correctness tests comparing bad and optimized query results;
CLI smoke tests where useful  
**Target Platform**: Local developer machine with Docker and Node.js  
**Project Type**: CLI-first local training application; REST API optional and
out of MVP unless all CLI requirements are complete  
**Performance Goals**: Bad queries are visibly slower on local `medium` data;
benchmarks report latency, rows, buffers, planning time, and execution time for
baseline and optimized variants  
**Constraints**: `SEED_SCALE=small|medium|large`; query timeout enforced by CLI;
bad SQL remains raw and intentionally inefficient; optimized SQL/migrations stay
separate from baseline state  
**Scale/Scope**: MVP has 12 challenge scenarios over marketplace data totaling
about 1-5 million rows at default scale, with smaller and larger profiles for
safety and workshop use

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Intentional slowness**: PASS. Each challenge has a named anti-pattern and a
  learning objective; bad SQL is stored in `sql/challenges/<id>/bad.sql`.
- **Scenario contract**: PASS. Each challenge directory contains `README.md`,
  `bad.sql`, `solution.sql`, expected result metadata, baseline explain command,
  hints, solution notes, and reference migration details.
- **PostgreSQL-first scope**: PASS. The CLI executes raw SQL against PostgreSQL;
  node-postgres/Kysely is used only for connectivity and result orchestration.
  No application cache may be used to mask query cost.
- **Docker Compose reproducibility**: PASS. `make setup`, `make seed`,
  `make run`, `make explain`, `make benchmark`, and `make reset-solutions`
  define the local workflow.
- **Correctness and evidence**: PASS. Vitest compares bad and optimized query
  result sets; benchmark commands collect before/after timing and plan evidence.
- **Trade-off review**: PASS. Each `solution.sql` and challenge `README.md`
  documents index/write/storage/query-specific trade-offs.

**Post-design re-check**: PASS. `research.md`, `data-model.md`,
`contracts/cli.md`, and `quickstart.md` preserve the bad baseline, separate
solutions, deterministic seed data, local Docker workflow, and benchmark/test
requirements.

## Project Structure

### Documentation (this feature)

```text
specs/001-postgres-query-dungeon/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── cli.md
└── tasks.md
```

### Source Code (repository root)

```text
docker-compose.yml
Makefile
README.md
package.json
tsconfig.json
vitest.config.ts

sql/
├── schema/
│   ├── 001_tables.sql
│   └── 002_baseline_indexes.sql
├── seeds/
│   ├── 001_seed_small.sql
│   ├── 002_seed_medium.sql
│   └── 003_seed_large.sql
└── challenges/
    ├── 01-user-orders-missing-index/
    │   ├── README.md
    │   ├── bad.sql
    │   ├── solution.sql
    │   └── expected.sql
    └── ...

src/
├── cli/
│   ├── index.ts
│   └── commands/
│       ├── run.ts
│       ├── explain.ts
│       ├── benchmark.ts
│       └── compare.ts
├── db/
│   ├── connection.ts
│   ├── explain.ts
│   └── sql-files.ts
└── challenges/
    ├── registry.ts
    └── types.ts

tests/
├── challenge-results.test.ts
├── challenge-registry.test.ts
└── seed-scale.test.ts
```

**Structure Decision**: Single CLI project with SQL-first challenge assets.
TypeScript owns orchestration, safety, benchmark parsing, and tests; raw SQL
files own all educational query content.

## Challenge Catalog

| ID | Title | Difficulty | Primary anti-pattern tags |
|----|-------|------------|---------------------------|
| 01 | User orders without index | easy | missing_index |
| 02 | Sales report with over-joining | easy | over_joining, low_selectivity |
| 03 | Latest payment correlated subquery | medium | correlated_subquery |
| 04 | Large table OFFSET pagination | medium | bad_pagination |
| 05 | Case-insensitive email lookup | easy | function_on_column |
| 06 | JSONB filter without GIN | medium | jsonb_scan |
| 07 | COUNT DISTINCT over big join | hard | over_joining, low_selectivity, cte_materialization |
| 08 | Latest user events | medium | missing_index, sort_spill |
| 09 | Unpaid orders partial index | medium | missing_index, low_selectivity |
| 10 | Window function overuse | hard | window_overuse |
| 11 | Inventory aggregation mistake | hard | over_joining, sort_spill |
| 12 | Marketplace dashboard boss fight | boss | missing_index, correlated_subquery, bad_pagination, jsonb_scan, stale_stats, n_plus_one |

Coverage note: all canonical anti-pattern tags from the specification are
covered by at least one MVP challenge.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
