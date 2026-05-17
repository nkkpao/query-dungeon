# Tasks: Postgres Query Dungeon

**Input**: Design documents from `/specs/001-postgres-query-dungeon/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/cli.md, quickstart.md

**Tests**: Correctness tests and before/after benchmark tasks are mandatory for this PostgreSQL optimization training lab.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing. The first user story creates the minimal vertical slice: 1 challenge -> seed -> explain -> benchmark -> correctness test.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Every task includes an exact target file or directory path

## Phase 1: Setup (Project Initialization)

**Purpose**: Initialize the TypeScript + Node.js CLI project, local database shell, and repository-level commands.

- [ ] T001 Create TypeScript package metadata with scripts and dependencies in package.json
- [ ] T002 Create TypeScript compiler configuration in tsconfig.json
- [ ] T003 Create Vitest configuration in vitest.config.ts
- [ ] T004 Create Docker Compose PostgreSQL 16+ service with healthcheck and volume in docker-compose.yml
- [ ] T005 Create Makefile targets setup, seed, run, explain, benchmark, compare, and reset-solutions in Makefile
- [ ] T006 [P] Create environment example with DATABASE_URL, SEED_SCALE, and QUERY_TIMEOUT_MS in .env.example
- [ ] T007 [P] Create project directory skeleton in sql/schema, sql/seeds, sql/challenges, src/cli/commands, src/db, src/challenges, tests, and docs using tracked placeholder files
- [ ] T008 [P] Create root README warning and quest overview stub in README.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared database schema, seed scale, CLI plumbing, and challenge registry foundation that all stories use.

**Critical**: No user story work begins until these tasks are complete.

- [ ] T009 Create marketplace tables users, categories, products, orders, order_items, payments, reviews, inventory_movements, user_events, and support_tickets in sql/schema/001_tables.sql
- [ ] T010 Create intentionally insufficient baseline indexes and document forbidden solution indexes in sql/schema/002_baseline_indexes.sql
- [ ] T011 Create seed reset and schema loader SQL in sql/seeds/000_reset.sql
- [ ] T012 Create small scale marketplace seed script with skewed users/products/categories/orders/events in sql/seeds/001_seed_small.sql
- [ ] T013 Create medium scale marketplace seed script targeting 1-5 million total rows in sql/seeds/002_seed_medium.sql
- [ ] T014 Create large scale opt-in marketplace seed script in sql/seeds/003_seed_large.sql
- [ ] T015 Implement PostgreSQL connection pool and statement timeout helper in src/db/connection.ts
- [ ] T016 Implement raw SQL file loader with path guards in src/db/sql-files.ts
- [ ] T017 Implement EXPLAIN ANALYZE BUFFERS wrapper and parser shell in src/db/explain.ts
- [ ] T018 Implement benchmark timing utility for repeated SQL execution in src/db/benchmark.ts
- [ ] T019 Define Challenge, Difficulty, AntiPatternTag, and BenchmarkResult types in src/challenges/types.ts
- [ ] T020 Create initial empty challenge registry and lookup helpers in src/challenges/registry.ts
- [ ] T021 Implement commander CLI root with global database-url, scale, timeout-ms, and json options in src/cli/index.ts
- [ ] T022 Implement seed command orchestration for SEED_SCALE=small|medium|large in src/cli/commands/seed.ts
- [ ] T023 Implement list command using challenge registry in src/cli/commands/list.ts
- [ ] T024 Implement run command skeleton for bad|solution variants in src/cli/commands/run.ts
- [ ] T025 Implement explain command skeleton for EXPLAIN (ANALYZE, BUFFERS) in src/cli/commands/explain.ts
- [ ] T026 Implement benchmark command skeleton for before/after metrics in src/cli/commands/benchmark.ts
- [ ] T027 Implement compare command skeleton for result equality in src/cli/commands/compare.ts
- [ ] T028 Implement apply-solution command skeleton in src/cli/commands/apply-solution.ts
- [ ] T029 Implement reset-solutions command skeleton in src/cli/commands/reset-solutions.ts
- [ ] T030 [P] Add seed scale validation tests for small, medium, large, and invalid scale in tests/seed-scale.test.ts
- [ ] T031 [P] Add registry validation tests for required challenge metadata fields and baseline plan artifact paths in tests/challenge-registry.test.ts

**Checkpoint**: Project can install dependencies, start PostgreSQL, load schema/seeds, and run an empty CLI command set.

---

## Phase 3: User Story 1 - Start a Local Training Lab (Priority: P1) - MVP Vertical Slice

**Goal**: A fresh checkout can start PostgreSQL, seed data, run one intentionally bad query, capture EXPLAIN, benchmark it, and verify bad/solution result equivalence.

**Independent Test**: `make setup`, `make seed SEED_SCALE=small`, `make run CHALLENGE=01-user-orders-missing-index`, `make explain CHALLENGE=01-user-orders-missing-index`, `make benchmark CHALLENGE=01-user-orders-missing-index`, and `make compare CHALLENGE=01-user-orders-missing-index` work for challenge 01.

### Tests and Benchmarks for User Story 1

- [ ] T032 [P] [US1] Add correctness test comparing bad and solution results for challenge 01 in tests/challenge-results.test.ts
- [ ] T033 [P] [US1] Add CLI smoke test for list, run, explain, benchmark, and compare on challenge 01 in tests/cli-smoke.test.ts

### Implementation for User Story 1

- [ ] T034 [US1] Create challenge 01 directory and README with business story, hints, expected result, and trade-offs in sql/challenges/01-user-orders-missing-index/README.md
- [ ] T035 [US1] Create intentionally bad user orders query without supporting index in sql/challenges/01-user-orders-missing-index/bad.sql
- [ ] T036 [US1] Create expected result query for challenge 01 in sql/challenges/01-user-orders-missing-index/expected.sql
- [ ] T037 [US1] Create solution SQL with reference index and optimized query notes for challenge 01 in sql/challenges/01-user-orders-missing-index/solution.sql
- [ ] T038 [US1] Register challenge 01 metadata, difficulty, anti-pattern tags, and file paths in src/challenges/registry.ts
- [ ] T039 [US1] Complete run command execution path for challenge variants in src/cli/commands/run.ts
- [ ] T040 [US1] Complete explain command output for raw and JSON plan formats in src/cli/commands/explain.ts
- [ ] T041 [US1] Complete benchmark command metrics for latency, rows, buffers, planning time, and execution time in src/cli/commands/benchmark.ts
- [ ] T042 [US1] Complete compare command deterministic result equality in src/cli/commands/compare.ts
- [ ] T043 [US1] Wire Makefile run, explain, benchmark, and compare targets to challenge 01-capable CLI commands in Makefile
- [ ] T044 [US1] Document vertical slice quest flow for challenge 01 in README.md

**Checkpoint**: Minimal vertical slice complete and independently demoable.

---

## Phase 4: User Story 2 - Complete Optimization Puzzles (Priority: P1)

**Goal**: Expand from 1 challenge to the full 12-puzzle catalog with business stories, bad SQL, expected results, hints, solution SQL, and complete registry metadata.

**Independent Test**: `dungeon list` shows 12 challenges, every challenge directory has README.md, bad.sql, solution.sql, expected.sql, difficulty, anti-pattern tags, and plan symptoms.

### Tests and Benchmarks for User Story 2

- [ ] T045 [P] [US2] Add registry test requiring exactly 12 challenge entries and canonical tag coverage in tests/challenge-registry.test.ts
- [ ] T046 [P] [US2] Add file presence test for README.md, bad.sql, solution.sql, and expected.sql in every sql/challenges/* directory in tests/challenge-files.test.ts

### Implementation for User Story 2

- [ ] T047 [P] [US2] Create business story, hints, baseline EXPLAIN command, and trade-offs for challenge 02 in sql/challenges/02-sales-report-over-joining/README.md
- [ ] T048 [P] [US2] Create intentionally bad over-joining sales report query in sql/challenges/02-sales-report-over-joining/bad.sql
- [ ] T049 [P] [US2] Create reference optimization SQL for challenge 02 in sql/challenges/02-sales-report-over-joining/solution.sql
- [ ] T050 [P] [US2] Create deterministic expected result SQL for challenge 02 in sql/challenges/02-sales-report-over-joining/expected.sql
- [ ] T051 [P] [US2] Create business story, hints, baseline EXPLAIN command, and trade-offs for challenge 03 in sql/challenges/03-latest-payment-correlated-subquery/README.md
- [ ] T052 [P] [US2] Create intentionally bad latest payment correlated subquery in sql/challenges/03-latest-payment-correlated-subquery/bad.sql
- [ ] T053 [P] [US2] Create reference optimization SQL for challenge 03 in sql/challenges/03-latest-payment-correlated-subquery/solution.sql
- [ ] T054 [P] [US2] Create deterministic expected result SQL for challenge 03 in sql/challenges/03-latest-payment-correlated-subquery/expected.sql
- [ ] T055 [P] [US2] Create business story, hints, baseline EXPLAIN command, and trade-offs for challenge 04 in sql/challenges/04-offset-pagination/README.md
- [ ] T056 [P] [US2] Create intentionally bad OFFSET pagination query in sql/challenges/04-offset-pagination/bad.sql
- [ ] T057 [P] [US2] Create reference keyset pagination SQL for challenge 04 in sql/challenges/04-offset-pagination/solution.sql
- [ ] T058 [P] [US2] Create deterministic expected result SQL for challenge 04 in sql/challenges/04-offset-pagination/expected.sql
- [ ] T059 [P] [US2] Create business story, hints, baseline EXPLAIN command, and trade-offs for challenge 05 in sql/challenges/05-lower-email-expression-index/README.md
- [ ] T060 [P] [US2] Create intentionally bad LOWER(email) lookup query in sql/challenges/05-lower-email-expression-index/bad.sql
- [ ] T061 [P] [US2] Create expression index solution SQL for challenge 05 in sql/challenges/05-lower-email-expression-index/solution.sql
- [ ] T062 [P] [US2] Create deterministic expected result SQL for challenge 05 in sql/challenges/05-lower-email-expression-index/expected.sql
- [ ] T063 [P] [US2] Create business story, hints, baseline EXPLAIN command, and trade-offs for challenge 06 in sql/challenges/06-jsonb-filter-gin-index/README.md
- [ ] T064 [P] [US2] Create intentionally bad JSONB filter query in sql/challenges/06-jsonb-filter-gin-index/bad.sql
- [ ] T065 [P] [US2] Create GIN index solution SQL for challenge 06 in sql/challenges/06-jsonb-filter-gin-index/solution.sql
- [ ] T066 [P] [US2] Create deterministic expected result SQL for challenge 06 in sql/challenges/06-jsonb-filter-gin-index/expected.sql
- [ ] T067 [P] [US2] Create business story, hints, baseline EXPLAIN command, and trade-offs for challenge 07 in sql/challenges/07-count-distinct-big-join/README.md
- [ ] T068 [P] [US2] Create intentionally bad COUNT DISTINCT big join query in sql/challenges/07-count-distinct-big-join/bad.sql
- [ ] T069 [P] [US2] Create CTE/materialization-aware solution SQL for challenge 07 in sql/challenges/07-count-distinct-big-join/solution.sql
- [ ] T070 [P] [US2] Create deterministic expected result SQL for challenge 07 in sql/challenges/07-count-distinct-big-join/expected.sql
- [ ] T071 [P] [US2] Create business story, hints, baseline EXPLAIN command, and trade-offs for challenge 08 in sql/challenges/08-latest-user-events/README.md
- [ ] T072 [P] [US2] Create intentionally bad latest user events query in sql/challenges/08-latest-user-events/bad.sql
- [ ] T073 [P] [US2] Create composite/covering index solution SQL for challenge 08 in sql/challenges/08-latest-user-events/solution.sql
- [ ] T074 [P] [US2] Create deterministic expected result SQL for challenge 08 in sql/challenges/08-latest-user-events/expected.sql
- [ ] T075 [P] [US2] Create business story, hints, baseline EXPLAIN command, and trade-offs for challenge 09 in sql/challenges/09-unpaid-orders-partial-index/README.md
- [ ] T076 [P] [US2] Create intentionally bad unpaid orders query in sql/challenges/09-unpaid-orders-partial-index/bad.sql
- [ ] T077 [P] [US2] Create partial index solution SQL for challenge 09 in sql/challenges/09-unpaid-orders-partial-index/solution.sql
- [ ] T078 [P] [US2] Create deterministic expected result SQL for challenge 09 in sql/challenges/09-unpaid-orders-partial-index/expected.sql
- [ ] T079 [P] [US2] Create business story, hints, baseline EXPLAIN command, and trade-offs for challenge 10 in sql/challenges/10-window-function-overuse/README.md
- [ ] T080 [P] [US2] Create intentionally bad window function overuse query in sql/challenges/10-window-function-overuse/bad.sql
- [ ] T081 [P] [US2] Create window rewrite solution SQL for challenge 10 in sql/challenges/10-window-function-overuse/solution.sql
- [ ] T082 [P] [US2] Create deterministic expected result SQL for challenge 10 in sql/challenges/10-window-function-overuse/expected.sql
- [ ] T083 [P] [US2] Create business story, hints, baseline EXPLAIN command, and trade-offs for challenge 11 in sql/challenges/11-inventory-aggregation/README.md
- [ ] T084 [P] [US2] Create intentionally bad inventory aggregation query in sql/challenges/11-inventory-aggregation/bad.sql
- [ ] T085 [P] [US2] Create inventory aggregation solution SQL for challenge 11 in sql/challenges/11-inventory-aggregation/solution.sql
- [ ] T086 [P] [US2] Create deterministic expected result SQL for challenge 11 in sql/challenges/11-inventory-aggregation/expected.sql
- [ ] T087 [P] [US2] Create business story, hints, baseline EXPLAIN command, and trade-offs for challenge 12 in sql/challenges/12-dashboard-boss-fight/README.md
- [ ] T088 [P] [US2] Create intentionally bad dashboard query with multiple anti-patterns in sql/challenges/12-dashboard-boss-fight/bad.sql
- [ ] T089 [P] [US2] Create multi-step dashboard solution SQL for challenge 12 in sql/challenges/12-dashboard-boss-fight/solution.sql
- [ ] T090 [P] [US2] Create deterministic expected result SQL for challenge 12 in sql/challenges/12-dashboard-boss-fight/expected.sql
- [ ] T091 [US2] Register challenges 02-12 with difficulty, anti-pattern tags, plan symptoms, and paths in src/challenges/registry.ts
- [ ] T092 [US2] Ensure canonical anti-pattern coverage includes missing_index, low_selectivity, function_on_column, correlated_subquery, over_joining, bad_pagination, jsonb_scan, sort_spill, cte_materialization, window_overuse, n_plus_one, and stale_stats in src/challenges/registry.ts

**Checkpoint**: Full catalog exists and is discoverable from the CLI.

---

## Phase 5: User Story 3 - Measure Before and After Improvements (Priority: P1)

**Goal**: Every puzzle supports correctness comparison and before/after benchmark evidence with parsed EXPLAIN metrics.

**Independent Test**: `make compare CHALLENGE=<id>` and `make benchmark CHALLENGE=<id>` work for all 12 challenges and report equivalent results plus latency, rows, buffers, planning time, and execution time.

### Tests and Benchmarks for User Story 3

- [ ] T093 [P] [US3] Expand correctness tests to compare bad and solution results for all 12 challenges in tests/challenge-results.test.ts
- [ ] T094 [P] [US3] Add EXPLAIN parser tests for planning time, execution time, rows, and buffer fields in tests/explain-parser.test.ts
- [ ] T095 [P] [US3] Add benchmark output shape tests for all required metrics in tests/benchmark-output.test.ts

### Implementation for User Story 3

- [ ] T096 [US3] Complete EXPLAIN parser for text output fields in src/db/explain.ts
- [ ] T097 [US3] Complete benchmark iteration, warmup, timeout handling, and metric aggregation in src/db/benchmark.ts
- [ ] T098 [US3] Update benchmark command to run bad and solution variants without applying solutions implicitly in src/cli/commands/benchmark.ts
- [ ] T099 [US3] Update compare command to normalize ordering, ties, dates, nulls, and numeric values using expected SQL rules in src/cli/commands/compare.ts
- [ ] T100 [US3] Add machine-readable JSON output support for explain and benchmark commands in src/cli/commands/explain.ts and src/cli/commands/benchmark.ts
- [ ] T101 [US3] Add per-query timeout errors with recovery hints in src/db/connection.ts and src/cli/index.ts
- [ ] T102 [US3] Add Makefile target test to run Vitest correctness tests in Makefile
- [ ] T103 [US3] Document benchmark interpretation and machine-to-machine timing caveat in README.md

**Checkpoint**: All 12 challenges can be measured and correctness-checked.

---

## Phase 6: User Story 4 - Reset and Replay the Quest (Priority: P2)

**Goal**: Learners can apply reference optimizations, reset them, and replay baseline plans without manual database editing.

**Independent Test**: Applying a challenge solution changes the optimized state, `make reset-solutions` restores the baseline state, and rerunning explain shows comparable baseline symptoms.

### Tests and Benchmarks for User Story 4

- [ ] T104 [P] [US4] Add reset-solutions behavior test for one challenge and all challenges in tests/reset-solutions.test.ts
- [ ] T105 [P] [US4] Add apply-solution idempotency and already-applied tests in tests/apply-solution.test.ts

### Implementation for User Story 4

- [ ] T106 [US4] Implement solution state tracking table or marker convention in sql/schema/003_solution_state.sql
- [ ] T107 [US4] Complete apply-solution command for one challenge in src/cli/commands/apply-solution.ts
- [ ] T108 [US4] Complete reset-solutions command for one challenge and all challenges in src/cli/commands/reset-solutions.ts
- [ ] T109 [US4] Add reset-solutions Makefile target behavior for full baseline restore in Makefile
- [ ] T110 [US4] Document replay workflow and reset safety in README.md

**Checkpoint**: Quest can be replayed from an intentionally slow baseline.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, final safety polish, and task-quality checks that affect the whole project.

- [ ] T111 [P] Create EXPLAIN reading guide with seq scan, nested loop, sort spill, hash join, bitmap scan, buffers, planning time, and execution time in docs/how-to-explain.md
- [ ] T112 [P] Create indexing cheatsheet for B-tree, partial, composite, covering, expression, and GIN indexes in docs/indexing-cheatsheet.md
- [ ] T113 [P] Create query optimization workflow guide from baseline capture to trade-off explanation in docs/query-optimization-workflow.md
- [ ] T114 Update root README with full quest instructions, warning about intentional bad queries, safety guidance, and links to docs in README.md
- [ ] T115 Add docs link section to every challenge README in sql/challenges/01-user-orders-missing-index/README.md through sql/challenges/12-dashboard-boss-fight/README.md
- [ ] T116 Verify optimized solutions remain separate from bad starting states across sql/challenges/*/bad.sql and sql/challenges/*/solution.sql
- [ ] T117 Refresh baseline plan regeneration instructions for all challenges in sql/challenges/*/README.md
- [ ] T118 Run quickstart validation commands from specs/001-postgres-query-dungeon/quickstart.md and record any fixes in README.md
- [ ] T119 [P] Capture baseline EXPLAIN ANALYZE BUFFERS artifact for challenge 01 in sql/challenges/01-user-orders-missing-index/baseline-plan.txt
- [ ] T120 [P] Capture baseline EXPLAIN ANALYZE BUFFERS artifact for challenge 02 in sql/challenges/02-sales-report-over-joining/baseline-plan.txt
- [ ] T121 [P] Capture baseline EXPLAIN ANALYZE BUFFERS artifact for challenge 03 in sql/challenges/03-latest-payment-correlated-subquery/baseline-plan.txt
- [ ] T122 [P] Capture baseline EXPLAIN ANALYZE BUFFERS artifact for challenge 04 in sql/challenges/04-offset-pagination/baseline-plan.txt
- [ ] T123 [P] Capture baseline EXPLAIN ANALYZE BUFFERS artifact for challenge 05 in sql/challenges/05-lower-email-expression-index/baseline-plan.txt
- [ ] T124 [P] Capture baseline EXPLAIN ANALYZE BUFFERS artifact for challenge 06 in sql/challenges/06-jsonb-filter-gin-index/baseline-plan.txt
- [ ] T125 [P] Capture baseline EXPLAIN ANALYZE BUFFERS artifact for challenge 07 in sql/challenges/07-count-distinct-big-join/baseline-plan.txt
- [ ] T126 [P] Capture baseline EXPLAIN ANALYZE BUFFERS artifact for challenge 08 in sql/challenges/08-latest-user-events/baseline-plan.txt
- [ ] T127 [P] Capture baseline EXPLAIN ANALYZE BUFFERS artifact for challenge 09 in sql/challenges/09-unpaid-orders-partial-index/baseline-plan.txt
- [ ] T128 [P] Capture baseline EXPLAIN ANALYZE BUFFERS artifact for challenge 10 in sql/challenges/10-window-function-overuse/baseline-plan.txt
- [ ] T129 [P] Capture baseline EXPLAIN ANALYZE BUFFERS artifact for challenge 11 in sql/challenges/11-inventory-aggregation/baseline-plan.txt
- [ ] T130 [P] Capture baseline EXPLAIN ANALYZE BUFFERS artifact for challenge 12 in sql/challenges/12-dashboard-boss-fight/baseline-plan.txt
- [ ] T131 Add baseline index guard test that fails if sql/schema/002_baseline_indexes.sql contains lesson solution indexes in tests/baseline-index-policy.test.ts

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; starts immediately.
- **Foundational (Phase 2)**: Depends on Setup; blocks all user story work.
- **US1 Vertical Slice (Phase 3)**: Depends on Foundational; establishes the MVP path.
- **US2 Full Catalog (Phase 4)**: Depends on US1 registry and challenge conventions.
- **US3 Measurement (Phase 5)**: Depends on US1 for infrastructure and US2 for all challenge files.
- **US4 Reset/Replay (Phase 6)**: Depends on US1 solution application conventions and US3 comparison behavior.
- **Polish (Phase 7)**: Depends on all desired stories being complete.

### User Story Dependencies

- **US1 (P1)**: Required MVP; no story dependencies after foundation.
- **US2 (P1)**: Builds on US1 directory/registry pattern.
- **US3 (P1)**: Needs all challenges from US2 for complete coverage.
- **US4 (P2)**: Needs solution SQL and comparison behavior from US1/US3.

### Within Each User Story

- Correctness tests and benchmark harness tasks come before implementation completion.
- Schema and seed data come before query fixtures.
- Bad query comes before baseline EXPLAIN capture.
- Baseline plan behavior comes before reference optimization comparison.
- Challenge registry entries come before CLI list/run can expose a challenge.

---

## Parallel Opportunities

- Setup tasks T006-T008 can run in parallel after T001-T005 are understood.
- Foundational tests T030-T031 can run in parallel with CLI skeleton tasks T021-T029 once types exist.
- US2 challenge file tasks T047-T090 can be split across workers because each writes a different challenge file.
- US3 tests T093-T095 can run in parallel because they target different test files.
- US4 tests T104-T105 can run in parallel.
- Documentation tasks T111-T113 can run in parallel.
- Baseline plan capture tasks T119-T130 can run in parallel after all challenge bad.sql files and seed scripts exist.

## Parallel Example: Expanding Challenge Catalog

```bash
Task: "T047 [US2] Create business story, hints, baseline EXPLAIN command, and trade-offs for challenge 02 in sql/challenges/02-sales-report-over-joining/README.md"
Task: "T048 [US2] Create intentionally bad over-joining sales report query in sql/challenges/02-sales-report-over-joining/bad.sql"
Task: "T051 [US2] Create business story, hints, baseline EXPLAIN command, and trade-offs for challenge 03 in sql/challenges/03-latest-payment-correlated-subquery/README.md"
Task: "T052 [US2] Create intentionally bad latest payment correlated subquery in sql/challenges/03-latest-payment-correlated-subquery/bad.sql"
```

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 for challenge 01 only.
3. Validate `make setup`, `make seed SEED_SCALE=small`, `make run`, `make explain`, `make benchmark`, and `make compare` for challenge 01.
4. Stop and demo the minimal vertical slice before expanding catalog.

### Incremental Delivery

1. Add remaining challenge folders and registry entries in Phase 4.
2. Expand correctness and benchmark coverage in Phase 5.
3. Add apply/reset replay flow in Phase 6.
4. Finish learner documentation in Phase 7.

### Validation Gates

- Every task uses the required checkbox, task ID, optional `[P]`, story label where needed, and file path.
- Every challenge has `README.md`, `bad.sql`, `solution.sql`, and `expected.sql`.
- Every challenge has a captured `baseline-plan.txt` generated from `EXPLAIN (ANALYZE, BUFFERS)`.
- No optimized SQL is mixed into `bad.sql`.
- Baseline schema excludes all solution indexes listed in the baseline index policy.
- All correctness tests compare bad and optimized results before accepting benchmark improvements.
