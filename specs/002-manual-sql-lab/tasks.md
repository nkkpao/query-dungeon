# Tasks: Hands-on SQL Optimization Lab

**Input**: Design documents from `/specs/002-manual-sql-lab/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/cli.md, quickstart.md

**Tests**: Correctness tests, guardrail tests, and benchmark checks are mandatory for this PostgreSQL optimization training refactor.

**Organization**: Tasks are grouped by user story so each increment is independently implementable and testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches different files and has no dependency on an incomplete task
- **[Story]**: User story label for story phases only
- Every task includes exact file paths

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preserve current project behavior before changing challenge assets or CLI semantics.

- [X] T001 Snapshot current challenge IDs, bad query paths, seed files, and baseline index policy in tests/challenge-files.test.ts
- [X] T002 [P] Snapshot existing benchmark output shape and explain parser expectations in tests/benchmark-output.test.ts
- [X] T003 [P] Snapshot current CLI command registration and add failing expectations that default CLI registration must not expose apply-solution, reset-solutions, solution variants, or automatic bad-versus-solution commands in tests/cli-smoke.test.ts
- [X] T004 [P] Add fixture helpers for temporary participant SQL files in tests/helpers/sql-fixtures.ts
- [X] T005 [P] Add fixture helpers for expected-result JSON assertions in tests/helpers/expected-results.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create shared contracts and utilities required before any user story can be implemented.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T006 Refactor Challenge and BenchmarkResult types for baseline, expected result, hints, optional suggested solution, and participant labels in src/challenges/types.ts
- [X] T007 Refactor challenge registry paths from bad/solution variants to challenge.md, baseline.sql, expected-result.json, hints/hints.md, hints/hints_RU.md, and optional files in src/challenges/registry.ts
- [X] T008 Replace QueryVariant-based challenge query loading with explicit baseline, expected-result, participant file, and optional suggested loaders in src/cli/query-loader.ts
- [X] T009 [P] Add safe SQL file reading and empty-file errors for participant-selected paths in src/db/sql-files.ts
- [X] T010 [P] Add expected-result JSON schema types and parser in src/challenges/expected-result.ts
- [X] T011 [P] Extract reusable row normalization and result diff helpers from src/cli/commands/compare.ts into src/db/result-compare.ts
- [X] T012 Refactor benchmark helper to accept a label and SQL path instead of QueryVariant in src/db/benchmark.ts
- [X] T013 Update CLI entrypoint imports and command registration scaffolding for new file-based commands in src/cli/index.ts

**Checkpoint**: Challenge metadata, SQL loading, expected-result parsing, result comparison, and benchmark primitives are ready for story work.

---

## Phase 3: User Story 1 - Explore a Challenge Manually (Priority: P1) MVP

**Goal**: Learners can open a challenge, see only learner-facing artifacts, run baseline SQL manually, inspect its plan, and begin experimentation without seeing suggested solution material.

**Independent Test**: Run `dungeon list`, open a migrated challenge, execute `run-sql` and `explain-file` against `baseline.sql`, and verify no default output exposes optional suggested solution files.

### Tests and Guardrails for User Story 1

- [X] T014 [P] [US1] Add challenge contract tests requiring challenge.md, baseline.sql, expected-result.json, hints/hints.md, hints/hints_RU.md, and optional/ files for every challenge in tests/challenge-files.test.ts
- [X] T015 [P] [US1] Add guardrail test that default challenge docs, README paths, Makefile targets, package scripts, and list output do not reveal suggested solution SQL paths in tests/suggested-solution-gating.test.ts
- [X] T016 [P] [US1] Add CLI smoke tests for run-sql and explain-file with baseline.sql in tests/cli-smoke.test.ts
- [X] T017 [P] [US1] Add regression test that every baseline.sql remains runnable through the shared SQL loader in tests/challenge-registry.test.ts

### Implementation for User Story 1

- [X] T018 [P] [US1] Create participant workspace directories with placeholders in workspace/sql/.gitkeep, workspace/indexes/.gitkeep, and workspace/notes/.gitkeep
- [X] T019 [P] [US1] Add workspace usage notes for scratch SQL, scratch indexes, and notes in workspace/README.md
- [X] T020 [US1] Migrate challenge 01 assets from README.md, bad.sql, expected.sql, solution.sql, and baseline-plan.txt to the new structure under sql/challenges/01-user-orders-missing-index/
- [X] T021 [US1] Migrate challenge 02 assets to challenge.md, baseline.sql, expected-result.json, hints/hints.md, hints/hints_RU.md, and optional/ files under sql/challenges/02-sales-report-over-joining/
- [X] T022 [US1] Migrate challenge 03 assets to challenge.md, baseline.sql, expected-result.json, hints/hints.md, hints/hints_RU.md, and optional/ files under sql/challenges/03-latest-payment-correlated-subquery/
- [X] T023 [US1] Migrate challenge 04 assets to challenge.md, baseline.sql, expected-result.json, hints/hints.md, hints/hints_RU.md, and optional/ files under sql/challenges/04-offset-pagination/
- [X] T024 [US1] Migrate challenge 05 assets to challenge.md, baseline.sql, expected-result.json, hints/hints.md, hints/hints_RU.md, and optional/ files under sql/challenges/05-lower-email-expression-index/
- [X] T025 [US1] Migrate challenge 06 assets to challenge.md, baseline.sql, expected-result.json, hints/hints.md, hints/hints_RU.md, and optional/ files under sql/challenges/06-jsonb-filter-gin-index/
- [X] T026 [US1] Migrate challenge 07 assets to challenge.md, baseline.sql, expected-result.json, hints/hints.md, hints/hints_RU.md, and optional/ files under sql/challenges/07-count-distinct-big-join/
- [X] T027 [US1] Migrate challenge 08 assets to challenge.md, baseline.sql, expected-result.json, hints/hints.md, hints/hints_RU.md, and optional/ files under sql/challenges/08-latest-user-events/
- [X] T028 [US1] Migrate challenge 09 assets to challenge.md, baseline.sql, expected-result.json, hints/hints.md, hints/hints_RU.md, and optional/ files under sql/challenges/09-unpaid-orders-partial-index/
- [X] T029 [US1] Migrate challenge 10 assets to challenge.md, baseline.sql, expected-result.json, hints/hints.md, hints/hints_RU.md, and optional/ files under sql/challenges/10-window-function-overuse/
- [X] T030 [US1] Migrate challenge 11 assets to challenge.md, baseline.sql, expected-result.json, hints/hints.md, hints/hints_RU.md, and optional/ files under sql/challenges/11-inventory-aggregation/
- [X] T031 [US1] Migrate challenge 12 assets to challenge.md, baseline.sql, expected-result.json, hints/hints.md, hints/hints_RU.md, and optional/ files under sql/challenges/12-dashboard-boss-fight/
- [X] T032 [US1] Update list command output to include challengePath and hide optional solution paths in src/cli/commands/list.ts
- [X] T033 [US1] Implement run-sql command for participant-selected SQL files in src/cli/commands/run-sql.ts
- [X] T034 [US1] Implement explain-file command for participant-selected SQL files in src/cli/commands/explain-file.ts
- [X] T035 [US1] Remove solution variant handling from default run and explain paths in src/cli/commands/run.ts and src/cli/commands/explain.ts
- [X] T036 [US1] Wire run-sql and explain-file into src/cli/index.ts and remove default solution-oriented command registration
- [X] T037 [US1] Update Makefile targets for run-sql and explain-file while removing default run/explain solution variant paths in Makefile

**Checkpoint**: User Story 1 is independently functional as the MVP manual exploration workflow.

---

## Phase 4: User Story 2 - Benchmark and Validate My Own SQL (Priority: P2)

**Goal**: Learners can run correctness validation, benchmark arbitrary participant SQL, compare participant attempts, and use scratch SQL or scratch indexes repeatedly without suggested solution exposure.

**Independent Test**: Create SQL and index files in workspace/, run validate-file, benchmark-file with baseline, and diff-results between two participant SQL files without touching optional suggested solution files.

### Tests and Benchmarks for User Story 2

- [X] T038 [P] [US2] Add expected-result parser tests for columns, orderSensitive, numericTolerance, and normalization in tests/result-validation.test.ts
- [X] T039 [P] [US2] Add validate-file CLI tests for pass, mismatch, malformed SQL, empty file, and timeout cases in tests/manual-workflow.test.ts
- [X] T040 [P] [US2] Add benchmark-file CLI tests for participant-only, participant-versus-baseline, three repeated attempts, and no suggested-solution execution in tests/benchmark-output.test.ts
- [X] T041 [P] [US2] Add diff-results CLI tests for equal, missing, extra, and changed rows in tests/result-validation.test.ts
- [X] T042 [P] [US2] Add scratch index workflow test using workspace/indexes/ without marking indexes as suggested solutions in tests/manual-workflow.test.ts

### Implementation for User Story 2

- [X] T043 [US2] Implement deterministic expected-result comparison service in src/db/result-compare.ts
- [X] T044 [US2] Implement validate-file command against expected-result.json in src/cli/commands/validate-file.ts
- [X] T045 [US2] Implement benchmark-file command with optional baseline comparison in src/cli/commands/benchmark-file.ts
- [X] T046 [US2] Implement diff-results command for two participant-selected SQL files in src/cli/commands/diff-results.ts
- [X] T047 [US2] Add scratch SQL and scratch index execution support to participant file loader in src/cli/query-loader.ts
- [X] T048 [US2] Add clear recovery errors for missing SQL file, empty SQL file, invalid expected-result fixture, result mismatch, and query timeout in src/cli/index.ts
- [X] T049 [US2] Wire validate-file, benchmark-file, and diff-results into src/cli/index.ts
- [X] T050 [US2] Update Makefile targets for benchmark-file, validate-file, diff-results, and reset in Makefile
- [X] T051 [US2] Remove automatic bad-versus-solution behavior from benchmark command and ensure default benchmarking cannot load suggested solution SQL in src/cli/commands/benchmark.ts
- [X] T052 [US2] Remove automatic bad-versus-solution behavior from compare command and ensure default validation cannot execute suggested solution SQL in src/cli/commands/compare.ts

**Checkpoint**: User Story 2 supports iterative manual optimization and deterministic correctness checks independently of suggested solutions.

---

## Phase 5: User Story 3 - Access Reference Solutions Deliberately (Priority: P3)

**Goal**: Suggested solutions remain available for maintainers and explicit learner comparison, but cannot leak through default challenge flow or default commands.

**Independent Test**: Default commands never read optional files; `compare-with-suggested-solution` shows a warning and uses suggested files only after the learner runs the explicit command.

### Tests and Guardrails for User Story 3

- [X] T053 [P] [US3] Add tests proving run-sql, explain-file, benchmark-file, validate-file, diff-results, list, and README paths do not read optional solution files in tests/suggested-solution-gating.test.ts
- [X] T054 [P] [US3] Add compare-with-suggested-solution CLI tests for warning text, --benchmark behavior, and --show-sql gating in tests/suggested-solution-gating.test.ts
- [X] T055 [P] [US3] Add challenge optional artifact tests for suggested-solution.sql, suggested-indexes.sql, baseline-explain.txt, and trade-off notes in tests/challenge-files.test.ts
- [X] T056 [P] [US3] Add regression test that baseline.sql files do not contain suggested solution index names from optional files in tests/baseline-index-policy.test.ts

### Implementation for User Story 3

- [X] T057 [US3] Implement suggested solution loader that reads only optional/ files after explicit opt-in in src/cli/query-loader.ts
- [X] T058 [US3] Implement compare-with-suggested-solution command with warning, --benchmark, and --show-sql gates in src/cli/commands/compare-with-suggested-solution.ts
- [X] T059 [US3] Remove apply-solution command from default CLI registration in src/cli/index.ts
- [X] T060 [US3] Remove or downgrade reset-solutions command to an optional legacy example outside the default workflow in src/cli/commands/reset-solutions.ts
- [X] T061 [US3] Remove solution_state dependency from normal seed and learner flows in sql/schema/003_solution_state.sql and src/cli/commands/seed.ts
- [X] T062 [US3] Add explicit Makefile opt-in target for compare-with-suggested-solution and no default target that reveals solution material in Makefile
- [X] T063 [US3] Add suggested solution access notices to optional solution documentation in sql/challenges/*/optional/README.md
- [X] T064 [US3] Add registry guardrail test proving solutionSqlPath, solutionIndexes, and QueryVariant solution are not part of active challenge metadata in tests/suggested-solution-gating.test.ts

**Checkpoint**: User Story 3 provides deliberate solution access without weakening the exploratory default workflow.

---

## Phase 6: Documentation Overhaul

**Purpose**: Reframe the repository as an investigation lab and teach manual plan reading, hypothesis testing, and safe experimentation.

- [X] T065 [P] Rewrite English README around read challenge, run baseline, EXPLAIN ANALYZE, experiment, validate, benchmark, and optional solution comparison in README.md
- [X] T066 [P] Rewrite Russian README around the same exploratory workflow in README_RU.md
- [X] T067 [P] Add manual EXPLAIN ANALYZE investigation guide updates in docs/how-to-explain.md
- [X] T068 [P] Add Russian manual EXPLAIN ANALYZE investigation guide updates in docs/how-to-explain_RU.md
- [X] T069 [P] Update optimization workflow documentation for manual hypotheses, scratch SQL, scratch indexes, validation, and benchmarking in docs/query-optimization-workflow.md
- [X] T070 [P] Update Russian optimization workflow documentation in docs/query-optimization-workflow_RU.md
- [X] T071 [P] Update indexing cheatsheet to emphasize manual index experiments and cleanup in docs/indexing-cheatsheet.md
- [X] T072 [P] Update Russian indexing cheatsheet with manual index experiment guidance in docs/indexing-cheatsheet_RU.md
- [X] T073 [P] Update roadmap to describe hands-on lab progression and de-emphasize automatic demos in docs/roadmap.md
- [X] T074 [P] Update Russian roadmap to describe hands-on lab progression in docs/roadmap_RU.md
- [X] T075 Update quickstart examples to use new file-based commands and workspace paths in specs/002-manual-sql-lab/quickstart.md

---

## Phase 7: Regression Checks and Polish

**Purpose**: Confirm the refactor preserves datasets, runnable challenges, benchmark reproducibility, and exploratory guardrails.

- [X] T076 Run npm test and fix failures in tests/
- [X] T077 Run npm run build and fix TypeScript errors in src/
- [ ] T078 Run make seed SEED_SCALE=small and verify datasets load unchanged via sql/seeds/
- [ ] T079 Run run-sql and explain-file against every challenge baseline.sql and record any broken challenge paths in specs/002-manual-sql-lab/tasks.md
- [ ] T080 Run validate-file against every challenge baseline.sql and update expected-result.json fixtures where deterministic validation requires normalization in sql/challenges/*/expected-result.json
- [ ] T081 Run benchmark-file --baseline for every challenge baseline.sql with at least three repeated attempts to verify benchmark reproducibility in src/db/benchmark.ts
- [X] T082 Search for default solution exposure in README.md, README_RU.md, docs/, src/cli/, Makefile, package.json, and sql/challenges/*/challenge.md and remove any accidental leak
- [X] T083 Verify suggested solution artifacts remain separate from active challenge flow in sql/challenges/*/optional/
- [X] T084 Verify existing seed files and baseline schema are unchanged unless an earlier task documented a required migration in sql/seeds/ and sql/schema/
- [X] T085 Update package scripts to expose the new workflow commands or examples without solution replay shortcuts in package.json

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Phase 1 and blocks all user stories
- **User Story 1 (Phase 3)**: Depends on Phase 2 and is the MVP
- **User Story 2 (Phase 4)**: Depends on Phase 2; can start after US1 path conventions are stable
- **User Story 3 (Phase 5)**: Depends on Phase 2; can start after optional artifact paths exist from US1
- **Documentation (Phase 6)**: Depends on target CLI names and challenge paths from US1/US2/US3
- **Regression (Phase 7)**: Depends on selected implementation phases

### User Story Dependencies

- **US1 Explore a Challenge Manually**: MVP; no dependency on US2 or US3 after foundation
- **US2 Benchmark and Validate My Own SQL**: Builds on shared loaders and expected-result fixtures; independently testable once foundation is ready
- **US3 Access Reference Solutions Deliberately**: Builds on optional artifact separation; independently testable through explicit opt-in command

### Required Task Group Coverage

- **Challenge model refactor**: T006-T008, T014-T017, T020-T032, T055-T056, T064
- **CLI refactor**: T003, T013, T016, T033-T037, T039-T052, T057-T062
- **Workspace support**: T018-T019, T042, T047
- **Validation system**: T010-T011, T038-T044, T048, T079
- **Benchmark system**: T002, T012, T040, T045, T051, T054, T081
- **Documentation overhaul**: T065-T075
- **Guardrails**: T003, T015, T053-T056, T059-T064, T082-T083
- **Regression checks**: T001-T003, T076-T085

---

## Parallel Opportunities

- Setup tests T002-T005 can run in parallel after T001 is clear.
- Foundational utilities T009-T011 can run in parallel after T006-T008 are agreed.
- Challenge migrations T020-T031 can be split by challenge directory once the first migration pattern is established by T020.
- US2 test tasks T038-T042 can run in parallel.
- US3 test tasks T053-T056 can run in parallel.
- Documentation tasks T065-T074 can run in parallel after CLI command names are stable.

## Parallel Example: User Story 1

```bash
Task: "T021 [US1] Migrate challenge 02 assets in sql/challenges/02-sales-report-over-joining/"
Task: "T022 [US1] Migrate challenge 03 assets in sql/challenges/03-latest-payment-correlated-subquery/"
Task: "T023 [US1] Migrate challenge 04 assets in sql/challenges/04-offset-pagination/"
```

## Parallel Example: User Story 2

```bash
Task: "T038 [US2] Add expected-result parser tests in tests/result-validation.test.ts"
Task: "T040 [US2] Add benchmark-file CLI tests in tests/benchmark-output.test.ts"
Task: "T042 [US2] Add scratch index workflow test in tests/manual-workflow.test.ts"
```

## Parallel Example: Documentation

```bash
Task: "T065 Rewrite English README in README.md"
Task: "T066 Rewrite Russian README in README_RU.md"
Task: "T069 Update optimization workflow in docs/query-optimization-workflow.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 setup snapshots.
2. Complete Phase 2 shared challenge and file-loading foundation.
3. Complete Phase 3 manual exploration workflow.
4. Stop and validate with `dungeon list`, `run-sql`, and `explain-file` on at least one migrated challenge.

### Incremental Delivery

1. US1 delivers the non-solution default challenge flow.
2. US2 adds participant validation, benchmarking, diffing, and scratchpad iteration.
3. US3 adds explicit suggested comparison with guardrails.

## Regression Notes

- 2026-05-17: `npm test` passed and `npm run build` passed.
- 2026-05-17: `make seed SEED_SCALE=small` could not run in this sandbox
  because Docker access to `/var/run/docker.sock` was denied. T078-T081 remain
  unchecked until run in an environment with Docker/PostgreSQL access.
4. Documentation and regression phases harden the experience across all challenges.

### Safety Rules

- Do not delete existing bad query content until its `baseline.sql` equivalent is present and tested.
- Do not expose optional solution files from default commands, README paths, list output, or learner-facing challenge docs.
- Do not change seed data unless a regression task documents why the change is required.
- Keep every learner-facing workflow raw-SQL-first; no automatic optimization suggestions, generated indexes, or AI-assisted rewrites.
