# Data Model: Server SQL Evaluation Reliability

## Submission

Represents one participant SQL answer for one challenge and optional variant.

**Fields**:

- `id`: Stable submission identifier.
- `challengeId`: Existing challenge identifier from the challenge registry.
- `variant`: Optional challenge variant identifier.
- `participantName`: Optional display name.
- `participantId`: Optional stable participant identifier.
- `sqlText`: Submitted participant SQL.
- `sqlHash`: SHA-256 hash of submitted SQL for repeatability and duplicate
  analysis.
- `notes`: Optional participant notes.
- `status`: `pending`, `running`, `completed`, or `failed`.
- `validationError`: Participant-safe validation or evaluation failure message.
- `submittedAt`: Submission creation timestamp.
- `startedAt`: Evaluation start timestamp.
- `completedAt`: Evaluation completion timestamp.

**Validation rules**:

- Either `participantName` or `participantId` is required.
- `challengeId` must resolve through the challenge registry.
- `variant`, when present, must resolve for the challenge.
- `sqlText` must be non-empty before a submission can be created through the API.

**State transitions**:

```text
pending -> running -> completed
pending -> failed
running -> failed
```

`completed` includes both correct submissions and result mismatches. `failed`
includes safety rejection, timeout, syntax errors, execution errors, and
internal evaluator errors.

## Evaluation Input

Represents the two accepted ways to invoke the evaluator.

**Forms**:

- `submissionId`: Load stored submission and challenge metadata from
  repositories/catalog.
- `explicit`: Provide challenge ID, optional variant, SQL text, submission ID
  when available, participant metadata when needed, and expected-result context
  for direct tests or future worker integration.

**Validation rules**:

- Exactly one input form is used per evaluation call.
- Explicit input must include SQL text and resolvable challenge context.
- Submission ID input must resolve to an existing submission before evaluation
  can start.

## EvaluationResult

Represents the structured result returned by `SubmissionEvaluator` and persisted
by `EvaluationResultRepository`.

**Fields**:

- `submissionId`: Submission being evaluated.
- `status`: Final submission status after evaluation.
- `correct`: `true`, `false`, or `null` when an internal failure prevents a
  correctness decision.
- `errorCode`: One of `syntax_error`, `safety_rejected`, `timeout`,
  `result_mismatch`, `execution_error`, `internal_error`, or `null` for correct
  submissions.
- `errorMessage`: Participant-safe failure reason, or `null` for correct
  submissions.
- `latencyMs`: End-to-end participant SQL execution latency when available.
- `executionTimeMs`: PostgreSQL execution time from explain metrics when
  available.
- `planningTimeMs`: PostgreSQL planning time from explain metrics when
  available.
- `rowCount`: Number of rows returned by participant SQL when available.
- `diffSummary`: Truncated result difference details for result mismatches.
- `explainMetrics`: Parsed plan/buffer metrics for correct submissions when
  explain capture succeeds.
- `createdAt`: Result persistence timestamp.
- `leaderboardEligible`: Derived value; `true` only when `status` is
  `completed` and `correct` is `true`.

**Validation rules**:

- Exactly one persisted evaluation result exists per submission.
- `errorCode` is required whenever `correct` is not `true`.
- `result_mismatch` must include a diff summary when comparison completes.
- Correct submissions must include row count and available timing metrics.
- Correct submissions should include explain metrics unless explain capture
  fails after correctness; such failures are recorded without changing
  correctness.

## Explain Metrics

Represents parsed `EXPLAIN (ANALYZE, BUFFERS)` evidence for correct SQL.

**Fields**:

- `planningTimeMs`: Planning time.
- `executionTimeMs`: Execution time.
- `actualRows`: Rows reported by the plan when available.
- `sharedHitBlocks`: Shared buffer hits.
- `sharedReadBlocks`: Shared buffer reads.
- `tempReadBlocks`: Temporary blocks read.
- `tempWrittenBlocks`: Temporary blocks written.
- `planText`: Raw plan text or stored summarized plan text, depending on storage
  choice made during implementation.

**Validation rules**:

- Metrics are captured only after the correctness validator marks the SQL
  correct.
- Metrics are captured inside the same rollback-protected transaction and
  timeout scope as participant execution.

## Expected Result

Represents the challenge-owned correctness fixture.

**Fields**:

- `columns`: Expected output columns.
- `rows`: Expected output rows, or empty when `fixtureSqlPath` supplies rows.
- `fixtureSqlPath`: Optional SQL fixture used to load expected rows.
- `orderSensitive`: Whether row order is part of correctness.
- `numericTolerance`: Optional tolerance for numeric comparison.
- `normalization`: Existing local validation normalization controls.

**Validation rules**:

- Loaded only from challenge `expected-result.json`.
- Suggested solution SQL and suggested indexes are never used to create or alter
  expected results during evaluation.

## Evaluation Failure

Represents a non-correct outcome.

**Codes**:

- `syntax_error`: PostgreSQL syntax or parse failure.
- `safety_rejected`: Static guard rejection.
- `timeout`: `statement_timeout` during execution or explain capture.
- `result_mismatch`: Normalized rows differ from `expected-result.json`.
- `execution_error`: Runtime database error that is not syntax or timeout.
- `internal_error`: Evaluator, fixture loading, persistence, or unexpected
  infrastructure failure.

**Validation rules**:

- Every failed or incorrect submission stores one of these codes.
- Participant-safe messages avoid exposing hidden suggested solution material.

## Leaderboard Entry

Represents a ranked correct submission.

**Fields**:

- `submissionId`
- `participantName`
- `participantId`
- `latencyMs`
- `executionTimeMs`
- `planningTimeMs`
- `rowsReturned`
- `submittedAt`
- `completedAt`

**Validation rules**:

- Includes only submissions where `status = completed` and `correct = true`.
- Ordering is `executionTimeMs` ascending, then `latencyMs` ascending, then
  `submittedAt` ascending.
