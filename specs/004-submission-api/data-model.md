# Data Model: Submission API MVP

## Entity: Submission

Represents one participant attempt for a challenge and optional variant.

**Fields**:

- `id`: UUID primary key, returned as `submissionId`.
- `challenge_id`: Existing challenge ID from the registry.
- `variant`: Optional variant ID; null means baseline challenge.
- `participant_name`: Optional display name.
- `participant_id`: Optional participant identifier.
- `sql_text`: Submitted participant SQL. Stored for attempt audit and result
  lookup, but never returned by leaderboard responses.
- `sql_hash`: Stable hash of `sql_text` for duplicate detection, debugging, and
  leaderboard-safe references without exposing raw SQL.
- `notes`: Optional participant notes.
- `status`: `pending`, `running`, `completed`, or `failed`.
- `validation_error`: Participant-safe validation or SQL safety error, nullable.
- `submitted_at`: Timestamp when the request was accepted.
- `started_at`: Timestamp when evaluation began, nullable.
- `completed_at`: Timestamp when evaluation finished, nullable.

**Validation Rules**:

- `challenge_id` is required and must resolve through the existing registry.
- At least one of `participant_name` or `participant_id` is required.
- `sql_text` is required, non-empty, and at most 65,536 bytes by default.
- `variant`, when provided, must exist for the challenge.
- `status` must use the canonical lifecycle enum.

## Entity: EvaluationResult

Represents the correctness and execution evidence for a submission.

**Fields**:

- `id`: UUID primary key.
- `submission_id`: UUID foreign key to `submissions.id`, unique for MVP.
- `correct`: Boolean correctness result.
- `row_count`: Number of rows returned by participant SQL, nullable for failures.
- `latency_ms`: End-to-end measured query latency, nullable for pre-execution
  failures.
- `execution_time_ms`: Parsed `EXPLAIN ANALYZE` execution time, nullable when
  unavailable.
- `planning_time_ms`: Parsed `EXPLAIN ANALYZE` planning time, nullable when
  unavailable.
- `error_message`: Participant-safe failure or mismatch message, nullable.
- `diff_summary`: JSON summary of missing, extra, or changed rows, nullable.
- `created_at`: Timestamp when the result was recorded.

**Validation Rules**:

- Every completed or failed accepted submission must have one evaluation result.
- Incorrect attempts are stored but excluded from leaderboard responses.
- Error messages must not include official or suggested solution SQL.
- Timing values must not be used in tests with exact equality assertions.

## Entity: LeaderboardEntry

Read model derived from `submissions` joined to `evaluation_results`.

**Fields**:

- `submissionId`
- `challengeId`
- `variant`
- `participantName`
- `participantId`
- `latencyMs`
- `executionTimeMs`
- `planningTimeMs`
- `rowsReturned`
- `submittedAt`
- `completedAt`

**Rules**:

- Include only `status = completed` and `correct = true`.
- Filter by challenge ID and optional variant.
- Rank by `executionTimeMs ASC NULLS LAST`, then `latencyMs ASC NULLS LAST`,
  then `submittedAt ASC`.
- Do not include raw SQL, notes, diff details, or solution material.

## State Transitions

```text
pending -> running -> completed
pending -> running -> failed
pending -> failed
```

- `pending -> failed` is used when validation or SQL safety fails after the
  attempt is accepted for storage.
- `running -> failed` is used for database errors, statement timeout, syntax
  errors, or explain failures.
- `running -> completed` is used when SQL executes and comparison completes,
  whether the answer is correct or incorrect.

## Database Objects

```sql
submissions(
  id uuid primary key,
  challenge_id text not null,
  variant text null,
  participant_name text null,
  participant_id text null,
  sql_text text not null,
  sql_hash text not null,
  notes text null,
  status text not null,
  validation_error text null,
  submitted_at timestamptz not null,
  started_at timestamptz null,
  completed_at timestamptz null
)

evaluation_results(
  id uuid primary key,
  submission_id uuid not null unique references submissions(id),
  correct boolean not null,
  row_count integer null,
  latency_ms double precision null,
  execution_time_ms double precision null,
  planning_time_ms double precision null,
  error_message text null,
  diff_summary jsonb null,
  created_at timestamptz not null
)
```

**Indexes**:

- `submissions(id)` through primary key for status lookup.
- `submissions(challenge_id, variant, submitted_at)` for filtering attempts.
- Partial leaderboard index on completed submissions by
  `(challenge_id, variant, submitted_at)` where `status = 'completed'`.
- `evaluation_results(submission_id)` through unique foreign key.
- Leaderboard helper index on
  `(correct, execution_time_ms, latency_ms, created_at)` or an equivalent join
  strategy selected during implementation.
