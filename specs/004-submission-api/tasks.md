# Tasks: Submission API MVP

**Input**: Design documents from `/specs/004-submission-api/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/openapi.yaml, quickstart.md

**Tests**: Tests are explicitly requested for this API MVP. Write the listed tests before the implementation tasks in each phase and keep timing assertions tolerant rather than exact.

**Organization**: Tasks are grouped by setup, shared foundation, and user story so each story can be implemented and tested independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add the server dependency, entrypoint skeleton, and project commands without changing existing CLI behavior.

- [X] T001 Add Fastify dependency to `package.json`
- [X] T002 Add `server` npm script pointing to `tsx src/server/index.ts` in `package.json`
- [X] T003 Add `SERVER_PORT` and `SERVER_SQL_MAX_BYTES` defaults plus `server` target using `node dist/src/server/index.js` in `Makefile`
- [X] T004 [P] Create server directory structure with placeholder modules in `src/server/index.ts`, `src/server/app.ts`, `src/server/config.ts`, `src/server/errors.ts`, `src/server/routes/health.ts`, `src/server/routes/challenges.ts`, `src/server/routes/submissions.ts`, `src/server/services/challenge-catalog.ts`, `src/server/services/evaluation-service.ts`, `src/server/services/leaderboard-service.ts`, `src/server/services/sql-safety.ts`, `src/server/repositories/submission-repository.ts`, `src/server/repositories/evaluation-result-repository.ts`, and `src/server/types.ts`
- [X] T005 [P] Add server smoke import test to ensure CLI modules do not depend on Fastify in `tests/cli-smoke.test.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Define shared contracts, database schema, safety validation, repositories, and server plumbing required by all API stories.

**CRITICAL**: No user story endpoint work should begin until this phase is complete.

- [X] T006 [P] Define `SubmissionCreateRequest`, `SubmissionResponse`, `LeaderboardEntryResponse`, `ChallengeListResponse`, and `ErrorResponse` types in `src/server/types.ts`
- [X] T007 [P] Add JSON schemas for request/response validation in `src/server/routes/schemas.ts`
- [X] T008 [P] Add consistent `ApiError` and centralized error response helpers in `src/server/errors.ts`
- [X] T009 [P] Add server config loader for `DATABASE_URL`, `QUERY_TIMEOUT_MS`, `SERVER_PORT`, and `SERVER_SQL_MAX_BYTES` in `src/server/config.ts`
- [X] T010 Add `submissions` and `evaluation_results` tables with `sql_hash`, lifecycle checks, foreign key, and timestamps in `sql/schema/004_submissions.sql`
- [X] T011 Add leaderboard-friendly indexes for challenge, variant, correctness, execution time, latency, and submission time in `sql/schema/004_submissions.sql`
- [X] T012 Update database setup/seed path to apply `sql/schema/004_submissions.sql` in `src/cli/commands/seed.ts`
- [X] T013 [P] Add SQL safety unit tests for single SELECT, multiple statements, max size, DDL, DML, transaction control, COPY, CALL, DO, GRANT, REVOKE, `SELECT INTO`, data-modifying CTEs, semicolon/comment bypasses, and forbidden keywords hidden in comments or string literals in `tests/sql-safety.test.ts`
- [X] T014 Implement SQL safety validation for single SELECT, max size, disallowed statement classes, bypass edge cases, and `sql_hash` generation in `src/server/services/sql-safety.ts`
- [X] T015 [P] Add repository tests for creating submissions, updating statuses, storing results, fetching by ID, and leaderboard ordering in `tests/submission-repository.test.ts`
- [X] T016 Implement submission persistence methods in `src/server/repositories/submission-repository.ts`
- [X] T017 Implement evaluation result persistence methods in `src/server/repositories/evaluation-result-repository.ts`
- [X] T018 Wire Fastify app creation, JSON schema registration, `/health`, and centralized error handling in `src/server/app.ts`, `src/server/index.ts`, and `src/server/routes/health.ts`

**Checkpoint**: Foundation ready. Database, validation, repositories, and the server shell are available for user stories.

---

## Phase 3: User Story 1 - Submit SQL Solution Through API (Priority: P1) MVP

**Goal**: Participant can POST a SQL solution, have it synchronously evaluated against `expected-result.json`, and receive a stored result.

**Independent Test**: Start the server with a seeded database, POST a valid and invalid solution to `/api/submissions`, and confirm stored responses include submission ID, status, correctness, latency, timing evidence when available, rows returned, and participant-safe errors.

### Tests for User Story 1

- [X] T019 [P] [US1] Add contract tests for `POST /api/submissions` success, malformed request `400` error shape, and unsafe well-formed SQL returning `SubmissionResponse` with `failed` status and `submissionId` in `tests/server-contract.test.ts`
- [X] T020 [P] [US1] Add evaluation service tests for correct submission, incorrect result, invalid SQL, destructive SQL rejection, SQL size rejection, timeout handling, rollback behavior, and stored failed attempts with `submissionId` in `tests/submission-evaluation.test.ts`
- [X] T021 [P] [US1] Add route tests for `GET /health` and `POST /api/submissions` using Fastify injection in `tests/server-routes.test.ts`

### Implementation for User Story 1

- [X] T022 [P] [US1] Implement challenge metadata resolution using `getChallengeForVariant` and `loadExpectedResult` in `src/server/services/challenge-catalog.ts`
- [X] T023 [US1] Implement synchronous evaluation flow using request-schema validation, submission insert for well-formed attempts, SQL safety validation, failed-result storage for SQL safety and size failures, `BEGIN`, `set_config('statement_timeout', ...)`, participant SQL execution, `validateRows`, `explainAnalyze`, `ROLLBACK`, and result storage in `src/server/services/evaluation-service.ts`
- [X] T024 [US1] Ensure evaluation stores all failed, incorrect, and correct attempts with `sql_hash`, status, row count, latency, planning time, execution time, diff summary, and participant-safe error message in `src/server/services/evaluation-service.ts`
- [X] T025 [US1] Implement `POST /api/submissions` route with JSON request validation, malformed request `ErrorResponse` mapping, and well-formed attempt `SubmissionResponse` mapping including failed SQL-safety submissions in `src/server/routes/submissions.ts`
- [X] T026 [US1] Verify no API response from `POST /api/submissions` includes official solution SQL, suggested solution SQL, raw plan text, or hidden optional material in `src/server/routes/submissions.ts`

**Checkpoint**: User Story 1 is independently functional and can be demoed as the MVP.

---

## Phase 4: User Story 2 - Check Submission Result (Priority: P2)

**Goal**: Participant, facilitator, or integration can fetch a stored submission result by ID.

**Independent Test**: Create a submission, request `GET /api/submissions/:id`, and confirm it returns the same participant-safe status/result fields; request an unknown ID and confirm the consistent error shape.

### Tests for User Story 2

- [X] T027 [P] [US2] Add contract tests for `GET /api/submissions/:id` success, not-found responses, and absence of official or suggested solution SQL in `tests/server-contract.test.ts`
- [X] T028 [P] [US2] Add route tests for fetching completed, failed, unsafe-SQL failed, and unknown submissions without exposing raw hidden solution material in `tests/server-routes.test.ts`

### Implementation for User Story 2

- [X] T029 [US2] Add repository read model for submission plus evaluation result lookup in `src/server/repositories/submission-repository.ts`
- [X] T030 [US2] Add response mapper for submission status/result that excludes raw SQL and notes from default status responses in `src/server/routes/submissions.ts`
- [X] T031 [US2] Implement `GET /api/submissions/:id` route with UUID validation and consistent not-found errors in `src/server/routes/submissions.ts`

**Checkpoint**: User Story 2 is independently functional after a submission exists.

---

## Phase 5: User Story 3 - Discover Challenges and Leaderboard (Priority: P3)

**Goal**: Participant or facilitator can list participant-safe challenges and view the best correct completed submissions for a challenge.

**Independent Test**: Request `/api/challenges`, verify no solution SQL is exposed, create multiple correct and incorrect submissions, then request leaderboard and verify only correct completed submissions are ordered by execution time, latency, and submitted time.

### Tests for User Story 3

- [X] T032 [P] [US3] Add contract tests for `GET /api/challenges` and `GET /api/challenges/:challengeId/leaderboard` response shapes in `tests/server-contract.test.ts`
- [X] T033 [P] [US3] Add route test proving challenge list does not expose official or suggested solution paths or SQL in `tests/server-routes.test.ts`
- [X] T034 [P] [US3] Add leaderboard ranking test for correct-only filtering, incorrect/failed exclusion, no raw SQL or solution material exposure, and ordering by `executionTimeMs ASC`, `latencyMs ASC`, and `submittedAt ASC` in `tests/server-routes.test.ts`

### Implementation for User Story 3

- [X] T035 [US3] Implement participant-safe challenge list mapping from `challenges` and variants in `src/server/services/challenge-catalog.ts`
- [X] T036 [US3] Implement `GET /api/challenges` route in `src/server/routes/challenges.ts`
- [X] T037 [US3] Implement leaderboard query for challenge ID and optional variant with correct-completed-only filtering, incorrect/failed exclusion, and deterministic timing rank order in `src/server/services/leaderboard-service.ts`
- [X] T038 [US3] Implement `GET /api/challenges/:challengeId/leaderboard` route with variant validation and no raw SQL fields in `src/server/routes/challenges.ts`

**Checkpoint**: User Story 3 is independently functional once submissions exist.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, quickstart validation, and full-regression checks across all stories.

- [X] T039 [P] Add `docs/server-api.md` with endpoint descriptions, safety rules, status/result fields, leaderboard ranking, and curl examples in `docs/server-api.md`
- [X] T040 [P] Add README server section covering setup, `npm run server`, `make server`, environment variables, and curl examples in `README.md`
- [X] T041 [P] Update API contract if implementation response names differ from the generated plan in `specs/004-submission-api/contracts/openapi.yaml`
- [ ] T042 Run quickstart validation commands and update any drift in `specs/004-submission-api/quickstart.md`
- [X] T043 Run `npm run build` and fix TypeScript errors in `src/server/`, `src/db/`, `src/challenges/`, and `src/cli/`
- [X] T044 Run `npm test` and fix failing unit, route, repository, contract, and existing CLI tests in `tests/`
- [ ] T045 Run existing CLI smoke commands `make list`, `make validate-file`, and `make benchmark-file` from `Makefile` to verify local workflow remains intact

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup and blocks every user story.
- **User Story 1 (Phase 3)**: Depends on Foundational and is the MVP.
- **User Story 2 (Phase 4)**: Depends on Foundational; easiest after US1 creates stored submissions.
- **User Story 3 (Phase 5)**: Depends on Foundational; easiest after US1 creates completed submissions.
- **Polish (Phase 6)**: Depends on all selected user stories.

### User Story Dependencies

- **US1 Submit SQL Solution Through API**: No dependency on US2 or US3 after foundation.
- **US2 Check Submission Result**: Can be built after foundation using seeded repository fixtures, but uses US1 naturally for end-to-end demo data.
- **US3 Discover Challenges and Leaderboard**: Challenge listing can be built after foundation; leaderboard needs stored result rows and can use repository fixtures or US1-created submissions.

### Within Each Story

- Tests come before implementation.
- Contract and route tests should assert participant-safe responses and error shape.
- Services should be implemented before routes that depend on them.
- Repository behavior must exist before end-to-end submission and leaderboard tests can pass.
- Timing assertions must be tolerant and must not require exact values.

## Parallel Opportunities

- T004 and T005 can run in parallel after T001-T003.
- T006-T009 and T013 can run in parallel because they touch separate server type/config/error/safety files.
- T015 can be written in parallel with T013 before repository implementation.
- US1 tests T019-T021 can be written in parallel.
- US3 tests T032-T034 can be written in parallel.
- Documentation tasks T039-T041 can run in parallel after endpoint behavior stabilizes.

## Parallel Example: User Story 1

```bash
Task: "T019 [P] [US1] Add contract tests for POST /api/submissions success, malformed request 400 error shape, and unsafe well-formed SQL returning SubmissionResponse with failed status and submissionId in tests/server-contract.test.ts"
Task: "T020 [P] [US1] Add evaluation service tests for correct submission, incorrect result, invalid SQL, destructive SQL rejection, timeout handling, rollback behavior, and stored attempts in tests/submission-evaluation.test.ts"
Task: "T021 [P] [US1] Add route tests for GET /health and POST /api/submissions using Fastify injection in tests/server-routes.test.ts"
```

## Parallel Example: User Story 3

```bash
Task: "T032 [P] [US3] Add contract tests for GET /api/challenges and GET /api/challenges/:challengeId/leaderboard response shapes in tests/server-contract.test.ts"
Task: "T033 [P] [US3] Add route test proving challenge list does not expose official or suggested solution paths or SQL in tests/server-routes.test.ts"
Task: "T034 [P] [US3] Add leaderboard ranking test for correct-only filtering and ordering by executionTimeMs ASC, latencyMs ASC, and submittedAt ASC in tests/server-routes.test.ts"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 setup.
2. Complete Phase 2 foundation.
3. Complete Phase 3 User Story 1.
4. Validate `POST /api/submissions`, SQL safety, rollback, persistence, and existing CLI smoke tests.
5. Demo the API MVP with a seeded database and curl.

### Incremental Delivery

1. Add setup and foundation.
2. Deliver US1 submission creation/evaluation.
3. Deliver US2 stored result lookup.
4. Deliver US3 challenge discovery and leaderboard.
5. Finish docs and full regression checks.

### Notes

- `[P]` tasks touch different files or can be performed before their dependent implementation.
- User-story labels map directly to the three user stories in `spec.md`.
- Suggested and official solution SQL must remain hidden from all default API paths.
- Store all well-formed attempts, including SQL-safety failures, incorrect, failed, and correct submissions.
- Do not introduce Kafka, background workers, authentication, rate limiting, or public deployment hardening in this MVP.
