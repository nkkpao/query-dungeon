# Tasks: Server SQL Evaluation Reliability

**Input**: Design documents from `/specs/005-server-sql-evaluation/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/
**Tests**: Required by feature request and specification. Story phases include tests before implementation tasks.
**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel with other marked tasks in the same phase because it touches different files and has no dependency on incomplete tasks.
- **[Story]**: Which user story this task belongs to, using `[US1]`, `[US2]`, or `[US3]`.
- Every task includes an exact file path.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the existing server codebase for the Evaluation Service refactor without changing behavior yet.

- [ ] T001 Add placeholder section for Evaluation Runner documentation in docs/evaluation-runner.md
- [ ] T002 [P] Add server evaluation service barrel or exports plan in src/server/services/evaluation-service.ts
- [ ] T003 [P] Add task-specific test fixture helpers for evaluator fake clients in tests/helpers/evaluation-fakes.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared types, persistence fields, and repository operations required before any user story can be implemented.

**CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T004 Add EvaluationInput, EvaluationResult, EvaluationErrorCode, ExplainMetrics, and leaderboardEligible types in src/server/types.ts
- [ ] T005 Add error_code and explain_metrics columns to evaluation_results in sql/schema/004_submissions.sql
- [ ] T006 [P] Add repository tests for errorCode and explainMetrics persistence in tests/submission-repository.test.ts
- [ ] T007 Update EvaluationResultRepository create/find mapping for errorCode and explainMetrics in src/server/repositories/evaluation-result-repository.ts
- [ ] T008 Update SubmissionRepository status helpers for markRunning, markCompleted, and markFailed in src/server/repositories/submission-repository.ts
- [ ] T009 Update submission response schema to include stable errorCode when present in src/server/routes/schemas.ts

**Checkpoint**: Foundation ready. User story implementation can now begin.

---

## Phase 3: User Story 1 - Safely Evaluate a Submission (Priority: P1) MVP

**Goal**: Evaluate submitted SQL safely in an isolated transaction, reject unsafe SQL before execution, compare against `expected-result.json`, capture metrics, persist structured results, and always roll back.

**Independent Test**: Submit or directly evaluate correct, incorrect, syntax-error, timeout-prone, DDL/DML, and multi-statement SQL, then verify status, error classification, metrics, and rollback behavior without challenge data changes.

### Tests for User Story 1

- [ ] T010 [P] [US1] Add SqlSafetyValidator tests for SQL size limit, non-SELECT SQL, DDL/DML keywords, and multi-statement rejection in tests/sql-safety.test.ts
- [ ] T011 [P] [US1] Add correctness-validator tests for expected-result.json loading and validateRows reuse in tests/result-validation.test.ts
- [ ] T012 [P] [US1] Add benchmark and explain runner tests for latencyMs, rowsReturned, planningTimeMs, and executionTimeMs in tests/submission-evaluation.test.ts
- [ ] T013 [P] [US1] Add evaluator failure classification tests for syntax_error, safety_rejected, timeout, result_mismatch, execution_error, and internal_error in tests/submission-evaluation.test.ts
- [ ] T014 [P] [US1] Add rollback and statement_timeout tests for every executable evaluator path in tests/submission-evaluation.test.ts

### Implementation for User Story 1

- [ ] T015 [US1] Implement SqlSafetyValidator wrapper around existing SQL guard behavior in src/server/services/sql-safety-validator.ts
- [ ] T016 [US1] Preserve sqlHash and compatibility exports from existing SQL safety module in src/server/services/sql-safety.ts
- [ ] T017 [US1] Implement CorrectnessValidator using loadExpectedResult and validateRows in src/server/services/correctness-validator.ts
- [ ] T018 [US1] Implement BenchmarkRunner for participant SQL execution, latencyMs, rowsReturned, and execution error mapping in src/server/services/benchmark-runner.ts
- [ ] T019 [US1] Implement ExplainRunner for correct-only EXPLAIN (ANALYZE, BUFFERS) metrics in src/server/services/explain-runner.ts
- [ ] T020 [US1] Implement transaction wrapper with BEGIN, SET LOCAL statement_timeout, optional read-only mode, rollback, and pooled-session reset in src/server/services/submission-evaluator.ts
- [ ] T021 [US1] Implement SubmissionEvaluator orchestration for stored submission and explicit input evaluation in src/server/services/submission-evaluator.ts
- [ ] T022 [US1] Persist structured EvaluationResult for correct, mismatch, rejected, timeout, syntax, execution, and internal outcomes in src/server/services/submission-evaluator.ts
- [ ] T023 [US1] Refactor EvaluationService.submit to create submissions and delegate evaluation to SubmissionEvaluator in src/server/services/evaluation-service.ts
- [ ] T024 [US1] Update submission route response mapping for structured errorCode and metrics in src/server/services/evaluation-service.ts

**Checkpoint**: User Story 1 is independently functional and testable as the MVP.

---

## Phase 4: User Story 2 - Rank Only Reliable Results (Priority: P2)

**Goal**: Ensure leaderboard ranking includes only correct submissions and orders by executionTimeMs, latencyMs, then submittedAt using persisted structured results.

**Independent Test**: Evaluate a mix of correct, incorrect, rejected, timed-out, and tied submissions, then verify leaderboard inclusion and ordering.

### Tests for User Story 2

- [ ] T025 [P] [US2] Add repository leaderboard tests for correct-only filtering and ranking ties in tests/submission-repository.test.ts
- [ ] T026 [P] [US2] Add route-level leaderboard tests excluding failed and incorrect submissions in tests/server-routes.test.ts
- [ ] T027 [P] [US2] Add API contract expectations for leaderboard metrics and ordering in tests/server-contract.test.ts

### Implementation for User Story 2

- [ ] T028 [US2] Update SubmissionRepository.leaderboard to use structured result fields and correct-completed-only filtering in src/server/repositories/submission-repository.ts
- [ ] T029 [US2] Update LeaderboardService response mapping for structured metrics and null-safe ordering in src/server/services/leaderboard-service.ts
- [ ] T030 [US2] Update leaderboard response schema if structured metric fields changed in src/server/routes/schemas.ts

**Checkpoint**: User Story 2 works independently after US1 and excludes incorrect or failed submissions from ranking.

---

## Phase 5: User Story 3 - Test Evaluation Outside Request Handling (Priority: P3)

**Goal**: Make the evaluator callable and testable independently of HTTP handlers, with the same behavior available to the API now and a future evaluator service later.

**Independent Test**: Invoke SubmissionEvaluator directly with a stored submissionId and explicit evaluation input, then verify the resulting EvaluationResult matches API-triggered evaluation for the same challenge state.

### Tests for User Story 3

- [ ] T031 [P] [US3] Add direct SubmissionEvaluator tests for stored submissionId input in tests/submission-evaluation.test.ts
- [ ] T032 [P] [US3] Add direct SubmissionEvaluator tests for explicit evaluation input in tests/submission-evaluation.test.ts
- [ ] T033 [P] [US3] Add API-versus-direct evaluator equivalence tests in tests/server-routes.test.ts
- [ ] T034 [P] [US3] Add route handler test proving routes delegate services without evaluator logic in tests/server-routes.test.ts

### Implementation for User Story 3

- [ ] T035 [US3] Expose stable SubmissionEvaluator construction dependencies for API and future worker callers in src/server/services/submission-evaluator.ts
- [ ] T036 [US3] Update EvaluationService constructor to accept an injectable SubmissionEvaluator in src/server/services/evaluation-service.ts
- [ ] T037 [US3] Ensure registerSubmissionRoutes depends only on submit/findById service methods in src/server/routes/submissions.ts
- [ ] T038 [US3] Document direct evaluator usage, API usage, and future evaluator-service boundary in docs/evaluation-runner.md

**Checkpoint**: User Story 3 works independently after US1 and proves evaluator behavior without HTTP handlers.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, regression protection, and final verification across all user stories.

- [ ] T039 [P] Update quickstart verification notes for evaluator tests in specs/005-server-sql-evaluation/quickstart.md
- [ ] T040 [P] Update server API documentation to mention structured evaluation errors in docs/server-api.md
- [ ] T041 [P] Add regression test proving suggested solution SQL and suggested indexes are not read, run, or applied during evaluation in tests/suggested-solution-gating.test.ts
- [ ] T042 Run TypeScript build and record any required fixes in package.json
- [ ] T043 Run full Vitest suite and record any required test stabilization in tests/submission-evaluation.test.ts
- [ ] T044 Verify all evaluator timing assertions avoid exact timing equality in tests/submission-evaluation.test.ts

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational. This is the MVP.
- **User Story 2 (Phase 4)**: Depends on Foundational and structured results from US1.
- **User Story 3 (Phase 5)**: Depends on Foundational and the evaluator from US1.
- **Polish (Phase 6)**: Depends on all desired user stories.

### User Story Dependencies

- **US1 - Safely Evaluate a Submission**: Start after Phase 2; no dependency on US2 or US3.
- **US2 - Rank Only Reliable Results**: Start after Phase 2, but final correctness depends on US1 structured result persistence.
- **US3 - Test Evaluation Outside Request Handling**: Start after Phase 2, but final equivalence depends on US1 evaluator orchestration.

### Within Each User Story

- Tests before implementation.
- Types and persistence before evaluator orchestration.
- SQL safety before transaction execution.
- Correctness validation before explain capture.
- Evaluator orchestration before API facade refactor.
- Structured persistence before leaderboard ranking.

## Parallel Opportunities

- T002 and T003 can run in parallel after T001.
- T006 can run in parallel with T004, T005, T007, and T008 once files are understood.
- US1 test tasks T010 through T014 can be drafted in parallel.
- US2 test tasks T025 through T027 can be drafted in parallel after Foundation.
- US3 test tasks T031 through T034 can be drafted in parallel after Foundation.
- Documentation tasks T039 and T040 can run in parallel with final regression task T041.

## Parallel Example: User Story 1

```bash
Task: "T010 [P] [US1] Add SqlSafetyValidator tests for SQL size limit, non-SELECT SQL, DDL/DML keywords, and multi-statement rejection in tests/sql-safety.test.ts"
Task: "T011 [P] [US1] Add correctness-validator tests for expected-result.json loading and validateRows reuse in tests/result-validation.test.ts"
Task: "T013 [P] [US1] Add evaluator failure classification tests for syntax_error, safety_rejected, timeout, result_mismatch, execution_error, and internal_error in tests/submission-evaluation.test.ts"
```

## Parallel Example: User Story 2

```bash
Task: "T025 [P] [US2] Add repository leaderboard tests for correct-only filtering and ranking ties in tests/submission-repository.test.ts"
Task: "T026 [P] [US2] Add route-level leaderboard tests excluding failed and incorrect submissions in tests/server-routes.test.ts"
Task: "T027 [P] [US2] Add API contract expectations for leaderboard metrics and ordering in tests/server-contract.test.ts"
```

## Parallel Example: User Story 3

```bash
Task: "T031 [P] [US3] Add direct SubmissionEvaluator tests for stored submissionId input in tests/submission-evaluation.test.ts"
Task: "T032 [P] [US3] Add direct SubmissionEvaluator tests for explicit evaluation input in tests/submission-evaluation.test.ts"
Task: "T034 [P] [US3] Add route handler test proving routes delegate services without evaluator logic in tests/server-routes.test.ts"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 setup.
2. Complete Phase 2 foundational types, schema, and repositories.
3. Complete Phase 3 US1 evaluator safety, correctness, transaction, timeout, rollback, metrics, and persistence.
4. Stop and validate US1 with `npm test -- submission-evaluation sql-safety result-validation`.

### Incremental Delivery

1. Deliver US1 to make server evaluation safe and structured.
2. Deliver US2 to make leaderboard ranking reliable from structured results.
3. Deliver US3 to prove reusable evaluator service boundaries and direct invocation.
4. Finish Polish to update docs and full-suite verification.

### Validation Commands

```bash
npm run build
npm test
```

## Notes

- [P] tasks touch different files or can be drafted independently before integration.
- Every story remains independently testable at its checkpoint.
- Preserve existing CLI behavior and challenge source-of-truth files.
- Do not expose, run, or apply suggested solution SQL or suggested indexes.
- Avoid exact timing assertions in tests.
