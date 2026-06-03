# Feature Specification: Server SQL Evaluation Reliability

**Feature Branch**: `005-server-sql-evaluation`  
**Created**: 2026-06-03  
**Status**: Draft  
**Input**: User description: "Improve server-side solution evaluation reliability. Make submitted SQL evaluation safe, reproducible, measurable, and suitable for leaderboard scoring."

## Clarifications

### Session 2026-06-03

- Q: Where should Evaluation Runner behavior live? → A: In a dedicated service class or module, not directly inside route handlers.
- Q: What inputs should Evaluation Runner accept? → A: It must accept either a stored submission identifier or explicit evaluation input.
- Q: What should Evaluation Runner return? → A: It must return a structured `EvaluationResult`.
- Q: Which callers must Evaluation Runner support? → A: It must be usable by the API now and a separate evaluator service later.
- Q: What is the correctness source? → A: The challenge `expected-result.json` file is the correctness source.
- Q: Should suggested indexes be applied during evaluation? → A: No, evaluation must not apply suggested indexes.
- Q: Should suggested solution SQL be run during evaluation? → A: No, evaluation must not run suggested solution SQL.
- Q: What is the first safety layer for submitted SQL? → A: A static SQL guard is the first safety layer.
- Q: Which execution protections remain mandatory? → A: Transaction rollback and `statement_timeout` remain required.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Safely Evaluate a Submission (Priority: P1)

As a participant, I want my submitted SQL to be checked in a controlled evaluation run so that the result is judged fairly without changing challenge data for myself or other participants.

**Why this priority**: This is the core trust boundary for server-side submissions. If evaluation is unsafe or non-reproducible, correctness and scoring cannot be trusted.

**Independent Test**: Can be tested by submitting a correct query, an incorrect query, a timeout-prone query, a destructive query, and a multi-statement query, then confirming each receives the expected evaluation outcome and the challenge data remains unchanged.

**Acceptance Scenarios**:

1. **Given** a valid challenge and a correct single submitted SQL statement, **When** the submission is evaluated, **Then** the system records it as correct, records normalized row count and timing measurements, and leaves challenge data unchanged.
2. **Given** a valid challenge and an incorrect single submitted SQL statement, **When** the submission is evaluated, **Then** the system records it as incorrect with a failure reason, stores available measurements, and leaves challenge data unchanged.
3. **Given** a submission that exceeds the configured evaluation time limit, **When** the submission is evaluated, **Then** the system stops the evaluation, records the submission as failed due to timeout, and leaves challenge data unchanged.
4. **Given** a submitted SQL statement that attempts destructive data changes, **When** the submission is screened, **Then** the system rejects it before execution where possible and records a failure reason.
5. **Given** a submission containing multiple SQL statements, **When** the submission is screened, **Then** the system rejects it before execution and records a failure reason.

---

### User Story 2 - Rank Only Reliable Results (Priority: P2)

As a participant viewing the leaderboard, I want only correct submissions to be ranked using consistent performance measurements so that leaderboard position reflects valid optimization work.

**Why this priority**: The leaderboard is meaningful only when failed, unsafe, and incorrect submissions cannot appear ahead of correct work.

**Independent Test**: Can be tested by evaluating several correct and incorrect submissions, including tied or near-tied timings, then verifying leaderboard inclusion and ordering.

**Acceptance Scenarios**:

1. **Given** a mix of correct, incorrect, rejected, and timed-out submissions, **When** the leaderboard is displayed, **Then** only correct submissions appear.
2. **Given** multiple correct submissions for the same challenge, **When** the leaderboard ranks them, **Then** lower execution time ranks first, lower latency ranks second, and earlier submission time ranks third.
3. **Given** an incorrect submission with faster measured latency than correct submissions, **When** the leaderboard is displayed, **Then** that submission is excluded from ranked results.

---

### User Story 3 - Test Evaluation Outside Request Handling (Priority: P3)

As a maintainer, I want the evaluation behavior to be testable without going through request handling so that safety, correctness, and metric capture can be verified directly and repeatedly.

**Why this priority**: Direct evaluator tests make reliability easier to prove and keep ranking behavior independent from delivery details.

**Independent Test**: Can be tested by invoking the evaluator service with controlled challenge fixtures and submissions, then asserting outcomes, stored metadata, rollback behavior, and leaderboard eligibility without requiring an end-to-end request.

**Acceptance Scenarios**:

1. **Given** stored expected-result data for a challenge, **When** the evaluator checks a submitted SQL statement directly, **Then** it compares normalized results against the stored expected result rather than any suggested or reference solution.
2. **Given** repeated direct evaluations of the same SQL against the same challenge data, **When** results are compared, **Then** correctness, normalized rows, row count, and metric presence are consistent across runs.
3. **Given** evaluator tests covering rejection, timeout, correctness, and ranking eligibility, **When** the test suite runs, **Then** each behavior can be verified through the evaluator service without invoking a request handler.
4. **Given** the API needs evaluation now and a separate evaluator service may need it later, **When** either caller provides a stored submission identifier or explicit evaluation input, **Then** the same evaluator service returns a structured evaluation result.

### Edge Cases

- A submitted statement returns the right values in a different row or column order than local validation expects.
- A submitted statement returns additional rows, missing rows, duplicate rows, or values with formatting differences.
- A submitted statement is syntactically invalid.
- A submitted statement is read-only in appearance but contains unsafe operations through comments, common table expressions, or nested constructs.
- A submitted statement attempts multiple statements through separators, trailing commands, or comment-obscured text.
- A submitted statement passes static safety screening but still attempts unsafe behavior during execution.
- A submitted statement times out before producing rows or during metric collection.
- A correct submitted statement succeeds during the correctness check but metric capture fails.
- Two or more correct submissions have identical execution time, latency, or submission time values.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST evaluate every submitted SQL statement inside an isolated transaction that is always rolled back, regardless of success, failure, rejection, or timeout.
- **FR-002**: The system MUST apply a configured per-submission `statement_timeout` for evaluation work and store timeout outcomes as failed submissions.
- **FR-003**: The system MUST perform static SQL safety screening as the first safety layer before attempting to execute submitted SQL.
- **FR-004**: The system MUST reject submitted SQL that contains more than one executable statement.
- **FR-005**: The system MUST reject submitted SQL that attempts destructive or data-changing operations before execution where possible.
- **FR-006**: The system MUST record a clear evaluation outcome for every submission: correct, incorrect, rejected, timed out, or errored.
- **FR-007**: The system MUST capture correctness, end-to-end latency, planning time, execution time, returned row count, and error information when those values are available for the evaluation outcome.
- **FR-008**: The system MUST capture `EXPLAIN (ANALYZE, BUFFERS)` plan and buffer metrics for correct submissions so maintainers can review how the accepted SQL performed.
- **FR-009**: The system MUST normalize submitted results using the same comparison rules as local file validation.
- **FR-010**: The system MUST compare submitted SQL results against the challenge `expected-result.json` file.
- **FR-011**: The system MUST NOT require, execute, inspect, or derive correctness from suggested or reference solution SQL during submission evaluation.
- **FR-012**: The system MUST NOT apply suggested or reference indexes during submission evaluation.
- **FR-013**: The system MUST store incorrect, rejected, timed-out, and errored submissions with failure reasons sufficient for participant feedback and maintainer troubleshooting.
- **FR-014**: The system MUST expose evaluation behavior through a dedicated service class or module rather than implementing evaluation directly inside route handlers.
- **FR-015**: The evaluation service MUST accept either a stored submission identifier or explicit evaluation input.
- **FR-016**: The evaluation service MUST return a structured `EvaluationResult` for every evaluation attempt.
- **FR-017**: The evaluation service MUST be usable by current API request handling and by a future separate evaluator service without duplicating evaluation rules.
- **FR-018**: The system MUST make evaluation behavior directly testable independently of request handling or other delivery channels.
- **FR-019**: The system MUST rank only correct submissions.
- **FR-020**: The system MUST rank correct submissions by execution time first, latency second, and submission time third.
- **FR-021**: The system MUST preserve existing challenge identifiers, challenge expected-result files, local validation behavior, and existing learner workflow unless a change is explicitly required for reliable server evaluation.

### Key Entities

- **Submission**: A participant's SQL answer for a specific challenge, with submitted text, submission time, evaluation status, failure reason when applicable, and leaderboard eligibility.
- **Evaluation Runner**: The dedicated service class or module responsible for safety screening, execution controls, correctness comparison, metric capture, rollback, and structured result creation for API callers and future evaluator-service callers.
- **Evaluation Input**: Either a stored submission identifier or explicit evaluation details containing the submitted SQL and challenge context needed for evaluation.
- **EvaluationResult**: The structured outcome of running a submission, including correctness, normalized row count, timing measurements, plan metrics when available, error details, and leaderboard eligibility.
- **Expected Result**: The challenge-owned `expected-result.json` output used as the correctness source of truth for both local validation and server evaluation.
- **Evaluation Failure**: A rejected, timed-out, incorrect, or errored outcome with a category and human-readable reason.
- **Leaderboard Entry**: A ranked view of a correct submission using execution time, latency, and submission time as ordering fields.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a 10-run repeatability check of the same correct submission against unchanged challenge data, 100% of runs produce the same correctness decision, normalized result, and row count.
- **SC-002**: 100% of evaluated submissions leave challenge data unchanged after evaluation, including correct, incorrect, rejected, timed-out, and errored cases.
- **SC-003**: 100% of submissions receive a stored evaluation status, and 100% of failed submissions include a stored failure reason.
- **SC-004**: 100% of destructive and multi-statement submissions in the safety test set are rejected and excluded from leaderboard ranking.
- **SC-005**: 100% of correct submissions store execution time, latency, planning time, row count, and detailed plan metrics when metric capture completes successfully.
- **SC-006**: In leaderboard verification, 100% of ranked entries are correct submissions and ordering follows execution time, then latency, then submission time.
- **SC-007**: Maintainers can verify evaluator correctness, rollback, rejection, timeout, metric capture, structured result shape, and ranking eligibility through direct evaluator service tests without using request handling.
- **SC-008**: API-triggered evaluation and direct service-triggered evaluation produce equivalent `EvaluationResult` fields for the same submission and challenge state.

## Assumptions

- The existing challenge expected-result files remain the authoritative correctness fixtures for server-side evaluation.
- The same result-normalization behavior used by local validation is the desired comparison behavior for all server-side submissions.
- Evaluation may provide participant-safe failure messages while retaining more detailed diagnostic information for maintainers where appropriate.
- Detailed plan metrics are required only after a submission is proven correct; failed submissions still record available timing and error information.
- Timing measurements are used for ordering and comparability, but tests avoid brittle exact timing assertions.
- Suggested or reference solutions and indexes may continue to exist for educational material, but they remain outside the submission evaluation path.
