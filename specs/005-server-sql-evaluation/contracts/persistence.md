# Contract: Evaluation Persistence

## SubmissionRepository

### Required Operations

- `create(input)`: Persist an API-created submission with `pending` status.
- `findById(id)`: Load submission and current evaluation result.
- `markRunning(id)`: Set status to `running` and `startedAt` if unset.
- `markCompleted(id)`: Set status to `completed` and `completedAt`.
- `markFailed(id, validationError)`: Set status to `failed`, store
  participant-safe validation error, and set `completedAt`.
- `leaderboard(challengeId, variant)`: Return only correct completed
  submissions ordered by execution time, latency, and submitted time.

### Invariants

- Route handlers do not update submission state directly.
- Evaluator owns status transitions during evaluation.
- `completed` can mean correct or result mismatch; leaderboard eligibility is
  determined by the joined evaluation result.

## EvaluationResultRepository

### Required Operations

- `create(input)`: Persist exactly one structured result per submission.
- `findBySubmissionId(submissionId)`: Load the current structured result.

### Required Stored Fields

- `submissionId`
- `correct`
- `errorCode`
- `errorMessage`
- `rowCount`
- `latencyMs`
- `executionTimeMs`
- `planningTimeMs`
- `diffSummary`
- `explainMetrics`
- `createdAt`

### Invariants

- Every well-formed submission eventually has one evaluation result.
- Failed and incorrect submissions always have `errorCode`.
- Correct submissions have `errorCode = null`.
- Leaderboard queries include only `correct = true` and `status = completed`.
- Suggested solution SQL and suggested indexes are never stored as part of
  evaluation results.

## Schema Evolution Notes

Existing `evaluation_results` already stores correctness, row count, latency,
execution time, planning time, error message, and diff summary. This feature
requires additive fields for stable error code and explain/buffer metrics.

Recommended additive storage shape:

```sql
ALTER TABLE evaluation_results
  ADD COLUMN IF NOT EXISTS error_code text NULL,
  ADD COLUMN IF NOT EXISTS explain_metrics jsonb NULL;
```

If raw plan text is too verbose for the main table, store summarized
`explain_metrics` first and defer a separate plan text table. The planning tasks
should choose the smallest schema that satisfies metric capture and tests.
