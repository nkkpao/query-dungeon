# Implementation Plan: Advanced Skew Plans

**Branch**: `003-advanced-skew-plans` | **Date**: 2026-05-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-advanced-skew-plans/spec.md`

## Summary

Add advanced variants for selected existing SQL optimization challenges while
preserving the current manual lab architecture. Advanced variants live under the
existing challenge directories, use medium-scale skewed seed data to expose
planner behavior, and include committed text `EXPLAIN (ANALYZE, BUFFERS)`
baseline plans. Normal challenge IDs, baseline SQL, default commands, and the
manual experimentation workflow remain unchanged. Official solutions stay in
optional folders and are never used by default learner commands.

The first release adds at least three advanced variants:

1. Advanced bad pagination on skewed events.
2. Advanced dashboard query with hot products and `order_items` skew.
3. Advanced JSONB/event filtering with skewed event types.

## Technical Context

**Language/Version**: TypeScript on Node.js 20+  
**Primary Dependencies**: commander, node-postgres (`pg`), dotenv, Vitest, Docker Compose, Makefile  
**Storage**: PostgreSQL 16+ via Docker Compose; SQL challenge files, recorded plan text files, JSON expected-result fixtures, and Markdown docs in the repository  
**Testing**: Vitest unit and smoke tests for registry metadata, challenge file contracts, recorded plan markers, solution-gating policy, seed scale behavior, and CLI command registration  
**Target Platform**: Local developer machine with Docker, Node.js, shell access, and PostgreSQL container  
**Project Type**: CLI-first local PostgreSQL performance training lab  
**Performance Goals**: `SEED_SCALE=small` remains fast enough for CI and quick local smoke tests; `SEED_SCALE=medium` is large and skewed enough for recorded plans to show stable planner symptoms such as Seq Scan, bad row estimates, shared buffer pressure, expensive Sort, Hash Join or Nested Loop behavior, and rows removed by filter  
**Constraints**: Preserve existing architecture, challenge IDs, baseline challenge artifacts, default learner commands, manual SQL workflow, and hidden optional solution policy; do not automate solving, expose official solutions in default commands, or make normal challenge execution call recorded-plan generation  
**Scale/Scope**: Existing 12 challenges remain intact; add at least 3 advanced variants under selected existing challenge directories; extend medium seed data with deterministic skew profiles for hot users, hot products, heavy categories, long-tail products, uneven order volumes, NULL-heavy columns, low-selectivity statuses, and time-based clustering

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Intentional slowness**: PASS. Advanced variants introduce deliberately bad
  baseline SQL whose symptoms are visible on deterministic medium-scale skewed
  data. Each variant names the learning objective and preserves the bad query as
  the exercise starting point.
- **Scenario contract**: PASS. Each advanced variant includes business task,
  baseline bad SQL, deterministic seed profile assumptions, expected result,
  recorded `EXPLAIN (ANALYZE, BUFFERS)` text, hints, and optional reference
  optimization artifacts.
- **PostgreSQL-first scope**: PASS. The work centers on PostgreSQL plans, SQL
  shape, indexes, statistics, data distribution, joins, scans, sorts, filters,
  JSONB predicates, and buffer behavior. No application cache or external
  shortcut is used to hide the problem.
- **Docker Compose reproducibility**: PASS. Existing Docker Compose workflow is
  preserved. Maintainers can start PostgreSQL with `docker compose up -d`, load
  data with `SEED_SCALE=medium make seed`, regenerate plans with
  `make record-plans SCALE=medium`, and run normal smoke checks with the small
  seed profile.
- **Correctness and evidence**: PASS. Expected-result fixtures remain the
  correctness source. Recorded plans provide baseline evidence for learning;
  official solutions remain separate optional artifacts and are not used by
  default validation, explanation, benchmarking, or recorded-plan checks.
- **Trade-off review**: PASS. Optional official solutions for advanced variants
  include trade-off notes through the existing optional solution material:
  storage cost, write overhead, selectivity limits, data-skew sensitivity, and
  maintainability.

**Post-design re-check**: PASS. Research, data model, contracts, and quickstart
preserve additive variants, medium-only recorded-plan regeneration, small-scale
default CI, structural recorded-plan validation, and hidden optional solutions.

## Project Structure

### Documentation (this feature)

```text
specs/003-advanced-skew-plans/
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
Makefile
package.json
README.md
README_RU.md

docs/
├── challenge-authoring-guide.md
├── data-skew.md
└── recorded-plans.md

sql/
├── schema/
│   ├── 001_tables.sql
│   ├── 002_baseline_indexes.sql
│   └── 003_solution_state.sql
├── seeds/
│   ├── 000_reset.sql
│   ├── 001_seed_small.sql
│   ├── 002_seed_medium.sql
│   └── 003_seed_large.sql
└── challenges/
    ├── 04-offset-pagination/
    │   ├── baseline.sql
    │   ├── challenge.md
    │   ├── expected-result.json
    │   ├── hints/
    │   │   └── hints.md
    │   └── variants/
    │       └── advanced/
    │           ├── baseline.sql
    │           ├── challenge.md
    │           ├── data-profile.md
    │           ├── expected-result.json
    │           ├── recorded-plan.medium.txt
    │           ├── hints.md
    │           └── optional/
    │               ├── official-solution.sql
    │               └── official-indexes.sql
    ├── 06-jsonb-filter-gin-index/
    │   └── variants/advanced/...
    └── 12-dashboard-boss-fight/
        └── variants/advanced/...

src/
├── challenges/
│   ├── registry.ts
│   └── types.ts
├── cli/
│   ├── index.ts
│   └── commands/
│       ├── record-plans.ts
│       └── validate-recorded-plans.ts
└── db/
    └── explain.ts

tests/
├── advanced-challenge-files.test.ts
├── recorded-plan-validation.test.ts
├── seed-scale.test.ts
├── suggested-solution-gating.test.ts
└── cli-smoke.test.ts
```

**Structure Decision**: Preserve the single TypeScript CLI and SQL-first
challenge layout. Put advanced material inside each existing challenge under
`variants/advanced/` rather than adding new top-level challenge IDs. This keeps
normal challenge IDs stable, makes the relationship to the baseline obvious,
and allows the registry to expose variants without changing existing baseline
metadata.

## Incremental Implementation Sequence

1. **Lock existing behavior**: Add or extend tests that snapshot existing
   challenge IDs, default CLI commands, solution-gating behavior, seed-scale
   defaults, and current baseline challenge file contracts.
2. **Add variant metadata model**: Extend challenge types and registry loading
   to represent optional advanced variants with paths for baseline SQL,
   challenge docs, data profile, expected result, recorded plan, hints, and
   optional official solution files. Keep existing `Challenge` IDs unchanged and
   add a `VARIANT` Makefile/CLI option rather than changing the `CHALLENGE`
   identifier.
3. **Create advanced directory contract**: Adopt
   `sql/challenges/<existing-id>/variants/advanced/` as the canonical layout.
   Validate file presence and forbid default command paths from resolving
   optional official solution files.
4. **Extend medium seed skew**: Update medium seed generation to create
   deterministic skew profiles: hot users, hot products, heavy categories,
   long-tail products, uneven order volumes, NULL-heavy columns,
   low-selectivity statuses, and time-based clustering. Add lightweight
   distribution-shape validation for the relevant skew profiles. Keep small
   seed fast and suitable for CI.
5. **Add three advanced variants**: Implement advanced bad pagination on skewed
   events, advanced dashboard query with hot products and `order_items` skew,
   and advanced JSONB/event filtering with skewed event types. Each variant
   documents how it differs materially from the parent baseline challenge.
6. **Record baseline plans**: Add maintainer-only `record-plans` support via
   `make record-plans SCALE=medium` and `npm run record-plans -- --scale medium`.
   The command writes captured `recorded-plan.medium.txt` text artifacts and is
   never called by normal learner commands. Placeholder plans are acceptable
   only during local drafting and must not satisfy completion criteria.
7. **Validate recorded plans lightly**: Add tests or command support that checks
   recorded plan files exist, contain `EXPLAIN (ANALYZE, BUFFERS)` evidence,
   include expected structural markers, and do not assert exact timing equality.
8. **Validate correctness and learner benchmarks**: Add per-variant validation
   tasks proving expected results can be checked without official solution SQL,
   plus documented learner-run baseline and participant benchmark paths that do
   not compare against official solutions by default.
9. **Update docs**: Update README, challenge authoring guide,
   `docs/recorded-plans.md`, and `docs/data-skew.md` with regeneration,
   validation, skew-profile, and learner workflow guidance. Recorded plans are
   described as post-investigation reference evidence.
10. **Keep CI small**: Ensure default CI-style test commands run small-scale
   smoke checks, file-structure validation, syntax checks where available, and
   recorded-plan marker validation only. Medium-scale full plan generation
   remains explicit maintainer work.

## Initial Advanced Variant Plan

| Variant | Existing challenge | Medium skew focus | Expected planner symptoms |
|---------|--------------------|-------------------|---------------------------|
| Advanced bad pagination on skewed events | `04-offset-pagination` | time-based clustering, hot users, uneven event volume in `user_events` | large Sort, Seq Scan, rows removed by filter, high shared buffers |
| Advanced dashboard query with hot products and `order_items` skew | `12-dashboard-boss-fight` | hot products, long-tail products, uneven order volumes, heavy categories | Hash Join or Nested Loop pressure, bad row estimates, high shared buffers |
| Advanced JSONB/event filtering with skewed event types | `06-jsonb-filter-gin-index` | skewed event types, low-selectivity statuses, NULL-heavy event metadata keys | Seq Scan, JSONB filter, rows removed by filter, bad row estimates |

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
