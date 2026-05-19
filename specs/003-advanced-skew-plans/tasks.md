# Tasks: Advanced Skew Plans

**Input**: Design documents from `/specs/003-advanced-skew-plans/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/cli.md](./contracts/cli.md), [quickstart.md](./quickstart.md)
**Tests**: Correctness tests and recorded-plan validation are mandatory for this PostgreSQL optimization training feature.
**Organization**: Tasks are grouped by user story so each story can be implemented and tested independently after the foundational work.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the task guardrails and preserve current project behavior before adding variants.

- [ ] T001 Snapshot the current challenge IDs and default registry shape in `tests/challenge-registry.test.ts`
- [ ] T002 Snapshot current default CLI command registration and absence of solution commands in `tests/cli-smoke.test.ts`
- [ ] T003 [P] Snapshot current normal challenge file contract in `tests/challenge-files.test.ts`
- [ ] T004 [P] Snapshot current small-scale default behavior in `tests/seed-scale.test.ts`
- [ ] T005 [P] Add advanced feature fixture helpers for variant paths and structural markers in `tests/helpers/advanced-variants.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add shared variant metadata, path resolution, and seed-skew support required by all user stories.

**Critical**: No user story implementation should begin until this phase is complete.

- [ ] T006 Extend challenge types with `ChallengeVariant`, `DataProfile`, and `RecordedPlanMarker` fields in `src/challenges/types.ts`
- [ ] T007 Update challenge registry metadata to support optional `variants.advanced` without changing existing challenge IDs in `src/challenges/registry.ts`
- [ ] T008 Update query loading to resolve `--variant advanced` paths while defaulting to normal baseline paths in `src/cli/query-loader.ts`
- [ ] T009 Add shared `--variant` option parsing for learner commands in `src/cli/options.ts`
- [ ] T010 Wire `--variant advanced` through run, explain, benchmark, validate, and diff commands in `src/cli/commands/run-sql.ts`, `src/cli/commands/explain-file.ts`, `src/cli/commands/benchmark-file.ts`, `src/cli/commands/validate-file.ts`, and `src/cli/commands/diff-results.ts`
- [ ] T011 Update challenge listing to show variants only when explicitly requested in `src/cli/commands/list.ts`
- [ ] T012 Add `VARIANT ?=` support to Makefile learner command wrappers without changing default behavior in `Makefile`
- [ ] T013 Add `record-plans` and `validate-recorded-plans` script entries without adding them to default learner flow in `package.json`
- [ ] T014 Extend medium seed data with deterministic hot users distribution in `sql/seeds/002_seed_medium.sql`
- [ ] T015 Extend medium seed data with deterministic hot products and long-tail products distribution in `sql/seeds/002_seed_medium.sql`
- [ ] T016 Extend medium seed data with deterministic skewed event types and time-based clustering in `sql/seeds/002_seed_medium.sql`
- [ ] T017 Extend medium seed data with deterministic low-selectivity order and payment statuses in `sql/seeds/002_seed_medium.sql`
- [ ] T018 Extend medium seed data with deterministic NULL-heavy optional metadata patterns in `sql/seeds/002_seed_medium.sql`
- [ ] T019 Document deterministic seed behavior and small-vs-medium expectations in `docs/data-skew.md`

**Checkpoint**: Variant resolution exists, existing challenge IDs still pass, and medium seed skew is documented.

---

## Phase 3: User Story 1 - Practice Advanced Planner Investigation (Priority: P1) MVP

**Goal**: Learners can select advanced variants, inspect larger skewed data assumptions, and manually investigate baseline bad SQL without seeing official solutions.

**Independent Test**: Load the registry, list variants explicitly, open each advanced variant artifact, and run/explain a learner-selected advanced baseline path while default challenge commands still use normal baselines.

### Tests for User Story 1

- [ ] T020 [P] [US1] Add advanced variant file-existence tests for `challenge.md`, `baseline.sql`, `data-profile.md`, `hints.md`, `expected-result.json`, and `recorded-plan.medium.txt` in `tests/advanced-challenge-files.test.ts`
- [ ] T021 [P] [US1] Add registry tests proving advanced variants map to existing parent challenge IDs in `tests/challenge-registry.test.ts`
- [ ] T022 [P] [US1] Add default-flow tests proving omitted `--variant` still resolves standard baseline SQL in `tests/manual-workflow.test.ts`
- [ ] T023 [P] [US1] Add variant-flow tests proving `--variant advanced` resolves advanced baseline SQL in `tests/manual-workflow.test.ts`

### Implementation for User Story 1

- [ ] T024 [P] [US1] Create advanced bad pagination variant structure in `sql/challenges/04-offset-pagination/variants/advanced/`
- [ ] T025 [P] [US1] Add advanced bad pagination challenge description in `sql/challenges/04-offset-pagination/variants/advanced/challenge.md`
- [ ] T026 [P] [US1] Add advanced bad pagination baseline SQL over skewed `user_events` in `sql/challenges/04-offset-pagination/variants/advanced/baseline.sql`
- [ ] T027 [P] [US1] Add advanced bad pagination data profile in `sql/challenges/04-offset-pagination/variants/advanced/data-profile.md`
- [ ] T028 [P] [US1] Add advanced bad pagination hints in `sql/challenges/04-offset-pagination/variants/advanced/hints.md`
- [ ] T029 [P] [US1] Add advanced bad pagination expected-result fixture in `sql/challenges/04-offset-pagination/variants/advanced/expected-result.json`
- [ ] T030 [P] [US1] Create advanced dashboard variant structure in `sql/challenges/12-dashboard-boss-fight/variants/advanced/`
- [ ] T031 [P] [US1] Add advanced dashboard challenge description in `sql/challenges/12-dashboard-boss-fight/variants/advanced/challenge.md`
- [ ] T032 [P] [US1] Add advanced dashboard baseline SQL over skewed `orders`, `order_items`, and `products` in `sql/challenges/12-dashboard-boss-fight/variants/advanced/baseline.sql`
- [ ] T033 [P] [US1] Add advanced dashboard data profile in `sql/challenges/12-dashboard-boss-fight/variants/advanced/data-profile.md`
- [ ] T034 [P] [US1] Add advanced dashboard hints in `sql/challenges/12-dashboard-boss-fight/variants/advanced/hints.md`
- [ ] T035 [P] [US1] Add advanced dashboard expected-result fixture in `sql/challenges/12-dashboard-boss-fight/variants/advanced/expected-result.json`
- [ ] T036 [P] [US1] Create advanced JSONB event filtering variant structure in `sql/challenges/06-jsonb-filter-gin-index/variants/advanced/`
- [ ] T037 [P] [US1] Add advanced JSONB event filtering challenge description in `sql/challenges/06-jsonb-filter-gin-index/variants/advanced/challenge.md`
- [ ] T038 [P] [US1] Add advanced JSONB event filtering baseline SQL over skewed `user_events.metadata` in `sql/challenges/06-jsonb-filter-gin-index/variants/advanced/baseline.sql`
- [ ] T039 [P] [US1] Add advanced JSONB event filtering data profile in `sql/challenges/06-jsonb-filter-gin-index/variants/advanced/data-profile.md`
- [ ] T040 [P] [US1] Add advanced JSONB event filtering hints in `sql/challenges/06-jsonb-filter-gin-index/variants/advanced/hints.md`
- [ ] T041 [P] [US1] Add advanced JSONB event filtering expected-result fixture in `sql/challenges/06-jsonb-filter-gin-index/variants/advanced/expected-result.json`
- [ ] T042 [US1] Register all three advanced variants and their expected planner symptoms in `src/challenges/registry.ts`
- [ ] T043 [US1] Verify advanced variants are listed only with explicit variant display in `src/cli/commands/list.ts`

**Checkpoint**: US1 is independently testable with advanced variant files present, explicit variant selection working, and normal challenges unchanged.

---

## Phase 4: User Story 2 - Reproduce Medium-Scale Baseline Evidence (Priority: P2)

**Goal**: Maintainers can explicitly regenerate medium-scale recorded plans and validate recorded plan artifacts structurally without exact timing assertions.

**Independent Test**: Run recorded-plan validation on committed artifacts and inspect the maintainer-only command contract without invoking medium-scale plan generation during normal tests.

### Tests for User Story 2

- [ ] T044 [P] [US2] Add recorded plan existence tests for every advanced variant in `tests/recorded-plan-validation.test.ts`
- [ ] T045 [P] [US2] Add recorded plan marker tests for `QUERY PLAN`, `actual time`, and `Buffers` in `tests/recorded-plan-validation.test.ts`
- [ ] T046 [P] [US2] Add structural symptom marker tests for Seq Scan, bad estimates, shared buffers, Sort, Hash Join, Nested Loop, or rows removed by filter in `tests/recorded-plan-validation.test.ts`
- [ ] T047 [P] [US2] Add regression test proving recorded plan tests do not assert exact planning or execution timings in `tests/recorded-plan-validation.test.ts`
- [ ] T048 [P] [US2] Add CLI smoke test proving `record-plans` is explicit and absent from the normal learner workflow in `tests/cli-smoke.test.ts`

### Implementation for User Story 2

- [ ] T049 [US2] Add recorded plan validation helper for text artifacts and structural markers in `src/challenges/recorded-plan-validation.ts`
- [ ] T050 [US2] Add `validate-recorded-plans` CLI command in `src/cli/commands/validate-recorded-plans.ts`
- [ ] T051 [US2] Register `validate-recorded-plans` as a maintainer validation command in `src/cli/index.ts`
- [ ] T052 [US2] Add `record-plans` CLI command that runs `EXPLAIN (ANALYZE, BUFFERS)` for advanced baselines in `src/cli/commands/record-plans.ts`
- [ ] T053 [US2] Add recorded plan writing support for `recorded-plan.medium.txt` in `src/db/explain.ts`
- [ ] T054 [US2] Add `record-plans` Makefile target using `SCALE=medium` and no default invocation in `Makefile`
- [ ] T055 [US2] Add placeholder or generated advanced bad pagination recorded plan artifact in `sql/challenges/04-offset-pagination/variants/advanced/recorded-plan.medium.txt`
- [ ] T056 [US2] Add placeholder or generated advanced dashboard recorded plan artifact in `sql/challenges/12-dashboard-boss-fight/variants/advanced/recorded-plan.medium.txt`
- [ ] T057 [US2] Add placeholder or generated advanced JSONB event filtering recorded plan artifact in `sql/challenges/06-jsonb-filter-gin-index/variants/advanced/recorded-plan.medium.txt`
- [ ] T058 [US2] Document recorded plan regeneration and timing variation in `docs/recorded-plans.md`

**Checkpoint**: US2 is independently testable with committed text plans, explicit maintainer regeneration, and structural validation only.

---

## Phase 5: User Story 3 - Compare with Official Solutions Only by Choice (Priority: P3)

**Goal**: Optional official solution files exist for comparison but remain hidden from default commands, docs, validation, benchmarking, and recorded-plan workflows.

**Independent Test**: Run solution-gating tests and default workflow tests to prove normal commands do not read or reveal advanced official solution files.

### Tests for User Story 3

- [ ] T059 [P] [US3] Add solution-gating tests for advanced variant optional paths in `tests/suggested-solution-gating.test.ts`
- [ ] T060 [P] [US3] Add default README workflow guardrail tests for advanced official solution references in `tests/manual-workflow.test.ts`
- [ ] T061 [P] [US3] Add recorded-plan command test proving official solution SQL is not executed in `tests/recorded-plan-validation.test.ts`

### Implementation for User Story 3

- [ ] T062 [P] [US3] Add advanced bad pagination optional official solution SQL in `sql/challenges/04-offset-pagination/variants/advanced/optional/official-solution.sql`
- [ ] T063 [P] [US3] Add advanced bad pagination optional official indexes SQL in `sql/challenges/04-offset-pagination/variants/advanced/optional/official-indexes.sql`
- [ ] T064 [P] [US3] Add advanced dashboard optional official solution SQL in `sql/challenges/12-dashboard-boss-fight/variants/advanced/optional/official-solution.sql`
- [ ] T065 [P] [US3] Add advanced dashboard optional official indexes SQL in `sql/challenges/12-dashboard-boss-fight/variants/advanced/optional/official-indexes.sql`
- [ ] T066 [P] [US3] Add advanced JSONB event filtering optional official solution SQL in `sql/challenges/06-jsonb-filter-gin-index/variants/advanced/optional/official-solution.sql`
- [ ] T067 [P] [US3] Add advanced JSONB event filtering optional official indexes SQL in `sql/challenges/06-jsonb-filter-gin-index/variants/advanced/optional/official-indexes.sql`
- [ ] T068 [US3] Extend explicit solution comparison to accept `--variant advanced` in `src/cli/commands/compare-with-suggested-solution.ts`
- [ ] T069 [US3] Ensure default run, explain, benchmark, validate, diff, and record-plan commands never resolve `variants/advanced/optional/` in `src/cli/query-loader.ts`

**Checkpoint**: US3 is independently testable with optional solutions present but hidden from normal learner workflows.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, CI behavior, syntax checks, and final regression coverage across all stories.

- [ ] T070 [P] Update README advanced variants section and plan-regeneration notes in `README.md`
- [ ] T071 [P] Update Russian README advanced variants summary without exposing solution paths as default workflow in `README_RU.md`
- [ ] T072 [P] Update challenge authoring guide with `variants/advanced/` file contract in `docs/challenge-authoring-guide.md`
- [ ] T073 [P] Update advanced skew documentation with all skew profiles in `docs/data-skew.md`
- [ ] T074 [P] Update recorded plan documentation with structural-marker validation and timing variation rules in `docs/recorded-plans.md`
- [ ] T075 Add SQL syntax or dry-run validation for advanced variant baseline SQL where supported in `tests/advanced-challenge-files.test.ts`
- [ ] T076 Add regression test that default CI-style test commands use `SEED_SCALE=small` and do not run medium recorded-plan generation in `tests/seed-scale.test.ts`
- [ ] T077 Add regression test that existing normal challenge files and IDs remain unchanged after advanced variant registration in `tests/challenge-registry.test.ts`
- [ ] T078 Run TypeScript build and fix type errors in `src/challenges/types.ts`, `src/challenges/registry.ts`, and `src/cli/commands/record-plans.ts`
- [ ] T079 Run the full test suite and fix failing tests in `tests/advanced-challenge-files.test.ts`, `tests/recorded-plan-validation.test.ts`, `tests/suggested-solution-gating.test.ts`, and `tests/cli-smoke.test.ts`
- [ ] T080 Run small-scale smoke workflow from `specs/003-advanced-skew-plans/quickstart.md`
- [ ] T081 Optionally regenerate medium recorded plans with `make record-plans SCALE=medium` and review diffs in `sql/challenges/*/variants/advanced/recorded-plan.medium.txt`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; start immediately.
- **Foundational (Phase 2)**: Depends on Setup and blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational; MVP for learner-visible advanced variants.
- **User Story 2 (Phase 4)**: Depends on Foundational and benefits from US1 artifacts; can begin once at least one advanced variant exists.
- **User Story 3 (Phase 5)**: Depends on Foundational and advanced variant directories; can run in parallel with US2 after US1 creates variant folders.
- **Polish (Phase 6)**: Depends on selected user stories being complete.

### User Story Dependencies

- **US1 Practice Advanced Planner Investigation**: First deliverable and MVP; no dependency on US2 or US3 after foundational work.
- **US2 Reproduce Medium-Scale Baseline Evidence**: Depends on advanced variant baseline paths from US1 but not on official solutions.
- **US3 Compare with Official Solutions Only by Choice**: Depends on advanced variant directories from US1; independent from recorded-plan regeneration.

### Parallel Opportunities

- T003-T005 can run in parallel after T001-T002 are understood.
- T014-T018 can be split only if changes to `sql/seeds/002_seed_medium.sql` are carefully sequenced; otherwise treat them as one-file serial edits.
- T024-T029, T030-T035, and T036-T041 can run in parallel by variant because they touch separate directories.
- T044-T048 can run in parallel because they target separate test concerns.
- T055-T057 can run in parallel after `record-plans` support exists because they touch separate artifact files.
- T062-T067 can run in parallel because they touch separate optional solution files.
- T070-T074 can run in parallel because they touch separate documentation files.

---

## Parallel Example: User Story 1

```text
Task: "T024-T029 build sql/challenges/04-offset-pagination/variants/advanced/"
Task: "T030-T035 build sql/challenges/12-dashboard-boss-fight/variants/advanced/"
Task: "T036-T041 build sql/challenges/06-jsonb-filter-gin-index/variants/advanced/"
```

## Parallel Example: User Story 2

```text
Task: "T044 add existence tests in tests/recorded-plan-validation.test.ts"
Task: "T048 add CLI explicit-command smoke test in tests/cli-smoke.test.ts"
Task: "T058 write docs/recorded-plans.md"
```

## Parallel Example: User Story 3

```text
Task: "T062-T063 add optional solution files for 04-offset-pagination"
Task: "T064-T065 add optional solution files for 12-dashboard-boss-fight"
Task: "T066-T067 add optional solution files for 06-jsonb-filter-gin-index"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 to snapshot current behavior.
2. Complete Phase 2 to add variant-aware metadata, path resolution, and medium seed skew.
3. Complete Phase 3 to add three advanced variants and explicit variant selection.
4. Stop and validate that default challenge flow still uses normal baselines.

### Incremental Delivery

1. Deliver US1 so learners can see and run advanced variants manually.
2. Deliver US2 so maintainers can regenerate and validate recorded medium plans.
3. Deliver US3 so optional official solutions exist without leaking into default workflows.
4. Complete Polish to update docs, verify CI stays small-scale, and run final regressions.

### Guardrails

- Keep existing challenge IDs stable throughout all tasks.
- Keep `SEED_SCALE=small` as default for smoke tests and CI.
- Keep `SEED_SCALE=medium` explicit for recorded-plan generation.
- Never make default run, explain, benchmark, validate, diff, or list commands read official solution files.
- Never assert exact planning or execution time equality for recorded plans.
