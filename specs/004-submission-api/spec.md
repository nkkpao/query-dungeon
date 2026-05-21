# Feature Specification: Submission API MVP

**Feature Branch**: `004-submission-api`  
**Created**: 2026-05-20  
**Status**: Draft  
**Input**: User description: "Extend the existing Query Dungeon project with a server-side API MVP for submitting participant SQL solutions. Participants should be able to submit their SQL solution for a challenge to a backend API instead of only running everything locally. Add endpoints for submissions, submission status/result, challenges, and challenge leaderboard. Keep existing CLI workflow intact. Do not introduce Kafka. Validate correctness using expected-result.json. Record submission result in the database. Do not expose official solution SQL."

## Clarifications

### Session 2026-05-20

- Q: Which existing project/runtime should host the API MVP? → A: Use the existing TypeScript/Node.js project.
- Q: Which HTTP server framework should be preferred? → A: Prefer Fastify because the project has no strong Express convention.
- Q: Where should submissions and leaderboard data be persisted? → A: Use the existing PostgreSQL database.
- Q: Which existing evaluation components should the API reuse? → A: Reuse challenge registry, expected-result parsing, result comparison, benchmark, and explain utilities.
- Q: How should submission execution, safety, and ranking behave in the MVP? → A: `POST /api/submissions` creates and evaluates a stored attempt synchronously; only one `SELECT` statement is allowed; unsafe statement classes are rejected; SQL size and statement timeout limits are enforced; executable evaluation always runs in a rolled-back transaction; well-formed attempts are stored; leaderboards rank only correct completed submissions; suggested solution SQL is never returned.
- Q: How should malformed requests differ from unsafe SQL submissions? → A: Malformed JSON or request-schema failures return a standard error without `submissionId`; well-formed submissions that fail SQL safety, size, or timeout checks are stored as failed attempts and return a `SubmissionResponse` with `submissionId`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Submit SQL Solution Through API (Priority: P1)

A participant submits their SQL answer for an existing challenge to a local server and receives a submission identifier plus an evaluable result path, without needing to run the full local CLI workflow themselves.

**Why this priority**: This is the core MVP value: moving solution submission from local-only execution to a backend-owned evaluation path while preserving the same challenge source of truth.

**Independent Test**: Can be tested by starting the server, posting a SQL solution for a known challenge, and confirming the response includes a submission ID and eventually shows a completed or failed result.

**Acceptance Scenarios**:

1. **Given** the API server is running and a valid challenge exists, **When** a participant posts `challengeId`, optional `variant`, `participantName` or `participantId`, `sql`, and optional `notes` to `POST /api/submissions`, **Then** the system stores the attempt, evaluates it, and returns a unique `submissionId` with the resulting status.
2. **Given** a submitted SQL answer produces the expected rows for the challenge, **When** evaluation finishes, **Then** the recorded result is marked `completed` and includes correctness, latency, row count, and any available planning or execution timing evidence.
3. **Given** a well-formed submission request contains SQL that is invalid, unsafe for the challenge, exceeds the configured SQL size limit, exceeds the configured statement timeout, or does not match the expected result, **When** evaluation finishes, **Then** the attempt is stored, the response includes a `submissionId`, and the stored result is retrievable with a `failed` status or completed incorrect result plus an explanatory participant-safe error or mismatch message.

---

### User Story 2 - Check Submission Result (Priority: P2)

A participant, facilitator, or integration can fetch a submission by ID to inspect the stored result details after `POST /api/submissions` creates and evaluates the attempt.

**Why this priority**: Even with synchronous MVP evaluation, clients need a stable way to retrieve the stored result after the initial post.

**Independent Test**: Can be tested by creating a submission and requesting `GET /api/submissions/:id` until it returns a terminal status with result fields.

**Acceptance Scenarios**:

1. **Given** an existing submission ID, **When** a client requests `GET /api/submissions/:id`, **Then** the response includes `submissionId`, status, correctness result, latency, returned rows count, available timing evidence, and any failure message.
2. **Given** a submission ID does not exist, **When** a client requests it, **Then** the response clearly indicates that no such submission exists without exposing internal details.

---

### User Story 3 - Discover Challenges and Leaderboard (Priority: P3)

A participant or facilitator can list available challenges and view the best correct completed submissions for a specific challenge without revealing official or suggested solution SQL.

**Why this priority**: Discovery and ranking make the API useful for a training session, but submission and status lookup remain the minimal viable loop.

**Independent Test**: Can be tested by requesting `GET /api/challenges` and `GET /api/challenges/:challengeId/leaderboard` after several completed submissions.

**Acceptance Scenarios**:

1. **Given** existing challenge directories and optional variants, **When** a client requests `GET /api/challenges`, **Then** the response lists participant-safe challenge metadata needed to submit an answer.
2. **Given** correct completed submissions for a challenge, **When** a client requests `GET /api/challenges/:challengeId/leaderboard`, **Then** the response returns the best correct completed submissions for that challenge ordered by performance evidence.
3. **Given** official or suggested solution artifacts exist for a challenge, **When** a client requests challenges, submissions, or leaderboard data, **Then** no official or suggested solution SQL is returned.

---

### Edge Cases

- A submission references an unknown challenge ID or variant.
- A request omits both participant identity fields or provides empty SQL.
- A request contains more than one SQL statement.
- A request contains `SELECT INTO`, a data-modifying CTE, forbidden keywords inside comments or strings, or semicolon/comment tricks intended to bypass single-statement validation.
- A request contains DDL, DML, transaction control, `COPY`, `CALL`, `DO`, `CREATE`, `ALTER`, `DROP`, `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`, `GRANT`, or `REVOKE`.
- A request exceeds the configured SQL size limit.
- Submitted SQL returns the correct columns in a different row order where the challenge expected result is order-insensitive, or returns the right values but extra rows.
- Evaluation fails because the query has a syntax error, exceeds the configured statement timeout, or cannot be explained.
- Timing evidence from query analysis is unavailable even though correctness can still be evaluated.
- Multiple submissions from the same participant are made for the same challenge.
- The leaderboard is requested before any completed submissions exist.
- A completed submission is incorrect and therefore must be stored but excluded from the leaderboard.
- Existing local CLI commands are run before, during, or after API usage.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a locally startable HTTP API server for the Query Dungeon training project.
- **FR-002**: System MUST accept SQL solution submissions through `POST /api/submissions` with `challengeId`, optional `variant`, `participantName` or `participantId`, `sql`, and optional `notes`.
- **FR-003**: System MUST reject malformed JSON or request-schema failures with clear participant-safe validation errors and no `submissionId`.
- **FR-004**: System MUST evaluate submitted SQL against the expected result fixture for the referenced challenge and variant.
- **FR-005**: System MUST treat the existing `sql/challenges` structure as the source of truth for challenge metadata, expected results, and variant resolution.
- **FR-006**: System MUST record every well-formed submission attempt and its final result in the existing PostgreSQL database, including SQL-safety failures, size-limit failures, timeout failures, incorrect results, and correct results.
- **FR-007**: System MUST expose `GET /api/submissions/:id` to retrieve submission status and result details.
- **FR-008**: Submission results MUST include `submissionId`, `status`, correctness result, `latencyMs`, returned row count, and an error message when evaluation fails.
- **FR-009**: Submission results MUST include `executionTimeMs` and `planningTimeMs` when those values are available from query analysis.
- **FR-010**: Submission status MUST use only `pending`, `running`, `completed`, or `failed`.
- **FR-011**: System MUST expose `GET /api/challenges` with participant-safe challenge metadata sufficient to choose a challenge and optional variant.
- **FR-012**: System MUST expose `GET /api/challenges/:challengeId/leaderboard` with the best correct completed submissions for the requested challenge.
- **FR-013**: Leaderboard entries MUST include only correct completed submissions and use performance evidence to rank them.
- **FR-014**: System MUST NOT expose official or suggested solution SQL through any API response.
- **FR-015**: Existing local CLI commands and hands-on SQL workflow MUST continue to work without requiring the API server.
- **FR-016**: Suggested or official solutions MUST remain optional and hidden from default participant workflows.
- **FR-017**: The MVP MUST NOT require Kafka or any external message broker.
- **FR-018**: `POST /api/submissions` MUST create and evaluate the submission, and synchronous evaluation is acceptable for the MVP.
- **FR-019**: Submitted SQL MUST be limited to a single `SELECT` statement.
- **FR-020**: Submitted SQL MUST reject DDL, DML, transaction control, `COPY`, `CALL`, `DO`, `CREATE`, `ALTER`, `DROP`, `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`, `GRANT`, and `REVOKE`.
- **FR-021**: Submitted SQL MUST be rejected when it exceeds a documented maximum SQL size.
- **FR-022**: Submission evaluation MUST enforce a documented statement timeout.
- **FR-023**: Submission evaluation MUST run inside a transaction that is rolled back after evaluation.
- **FR-024**: The API implementation MUST reuse the existing challenge registry, expected-result parsing, result comparison, benchmark, and explain utilities where those utilities already satisfy the API behavior.
- **FR-025**: Well-formed submission requests rejected by SQL safety, SQL size, or statement timeout controls MUST return a submission result containing `submissionId` and `failed` status; malformed request-schema failures MAY return only the standard error response.
- **FR-026**: SQL safety validation MUST include tests for `SELECT INTO`, data-modifying CTEs, semicolon/comment bypasses, and forbidden keywords hidden in comments or string literals.

### Key Entities *(include if feature involves data)*

- **Challenge**: A participant-facing exercise sourced from the existing challenge files. Key attributes include challenge ID, title or label, optional variants, and metadata needed to submit an answer.
- **Submission**: A participant's SQL answer for a challenge. Key attributes include submission ID, challenge ID, optional variant, participant identity, SQL text, optional notes, timestamps, status, validation or safety rejection reason when applicable, and final result.
- **Submission Result**: The evaluation outcome for a submission. Key attributes include correctness, latency, planning time when available, execution time when available, rows returned, and an error or mismatch message when applicable.
- **Leaderboard Entry**: A summarized correct completed submission for a challenge. Key attributes include participant identity, submission ID, latency or execution timing, rows returned, and completion timestamp.

### Training Scenario Contract *(mandatory for PostgreSQL optimization scenarios)*

- **Business Task**: This feature does not add a new PostgreSQL optimization scenario; it adds a submission and evaluation API around existing Query Dungeon scenarios.
- **Bad Query**: Existing challenge baseline SQL remains unchanged and continues to be the learner starting point.
- **Seed Data**: Existing local seed data and challenge setup remain the source for correctness evaluation.
- **Expected Result**: Existing `expected-result.json` fixtures remain the correctness authority for submitted SQL.
- **Baseline Plan**: Existing scenario plan evidence remains unchanged; submitted SQL should capture timing evidence when available without changing baseline artifacts.
- **Hints**: Existing learner-facing hints remain unchanged and are not expanded by default API responses.
- **Reference Optimization**: Existing optional official and suggested solutions remain separate and hidden from default participant workflows and API responses.
- **Benchmark Evidence**: Submission results capture per-submission latency and available query analysis timing; this feature does not redefine scenario benchmark success criteria.
- **Trade-offs**: The implementation plan must document any evaluation safety, timeout, persistence, and leaderboard ranking trade-offs.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A participant can start the local server using documented project commands and successfully submit a valid SQL solution within 10 minutes on a freshly prepared local environment.
- **SC-002**: For a known correct SQL answer, the API records a completed submission whose correctness result matches the existing expected result fixture.
- **SC-003**: For a known incorrect SQL answer, the API records a result that clearly identifies the submission as incorrect or failed without exposing official or suggested solution SQL.
- **SC-004**: A client can retrieve a submitted result by ID and receive a terminal status plus result details within a bounded local evaluation window.
- **SC-005**: After at least three correct completed submissions for one challenge, the leaderboard returns the best correct completed entries in deterministic rank order.
- **SC-006**: Existing local CLI challenge, validation, and hands-on SQL workflows continue to pass their current smoke tests after the API feature is added.
- **SC-007**: Well-formed attempts containing multiple statements, disallowed SQL classes, SQL above the configured size limit, or statements exceeding the configured timeout are stored with a `failed` result and rejected without persisting query side effects.

## Assumptions

- The first API version is intended for local training sessions and trusted local participants, not public internet deployment.
- The API is added to the existing TypeScript/Node.js project and should prefer Fastify unless later planning uncovers a strong repository reason to use Express.
- Participant identity is lightweight for the MVP; either a display name or participant ID is enough to associate submissions.
- The API evaluates only SQL solutions for existing challenges and variants; creating or editing challenges through the API is out of scope.
- Official solution SQL, suggested solution SQL, suggested indexes, and hidden optional materials remain maintainers' artifacts and are never part of participant-facing API payloads.
- Submission evaluation uses the same prepared local database state expected by the current Query Dungeon workflow.
- Authentication, rate limiting, multi-tenant isolation, and distributed job processing are out of scope for this first backend iteration.
- Specific SQL size and timeout values are planning parameters, but the chosen values must be documented and covered by tests.
