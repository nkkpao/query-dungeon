# Evaluation Runner

The Evaluation Runner is the reusable server-side boundary for scoring submitted
SQL. HTTP handlers call `EvaluationService`, and `EvaluationService` delegates
the actual work to `SubmissionEvaluator`. A later evaluator worker can construct
`SubmissionEvaluator` directly with the same repositories and validators.

## Components

- `SubmissionEvaluator`: orchestrates stored `submissionId` evaluation and
  explicit evaluator input.
- `SqlSafetyValidator`: rejects oversized, multi-statement, non-SELECT, DDL,
  DML, transaction-control, and known side-effecting SQL before execution.
- `CorrectnessValidator`: compares participant rows against
  `expected-result.json` using the same `validateRows` normalization as local
  `validate-file`.
- `BenchmarkRunner`: executes participant SQL and captures latency plus row
  count.
- `ExplainRunner`: runs `EXPLAIN (ANALYZE, BUFFERS)` only after correctness
  succeeds and returns parsed planning, execution, row, and buffer metrics.
  If explain capture fails after correctness succeeds, correctness remains true
  and the result stores an `EXPLAIN_CAPTURE_FAILED` warning in `errorMessage`.
- `SubmissionRepository` and `EvaluationResultRepository`: store status
  transitions and structured evaluation results.

## Algorithm

1. Resolve the challenge and load the stored submission or explicit evaluator
   input.
2. Load `expected-result.json`.
3. Run the SQL static guard.
4. Mark executable submissions `running`.
5. Open `BEGIN READ ONLY`.
6. Apply `SET LOCAL statement_timeout`.
7. Execute participant SQL through `BenchmarkRunner`.
8. Compare rows through `CorrectnessValidator`.
9. If correct, run `ExplainRunner`.
10. Always `ROLLBACK` executable paths.
11. Store one structured `EvaluationResult`.
12. Mark the submission `completed` for correct or mismatch results, otherwise
    `failed`.
13. Reset pooled session state before releasing the connection.

Safety rejection happens before `BEGIN`, so destructive SQL is stored as a
failed submission without executing participant SQL. The static guard is
conservative and rejects destructive keywords even when they appear in comments
or string literals.

If rollback fails, evaluation is marked failed with `internal_error`, the
connection is discarded from the pool, and status/result persistence is retried
through the pool rather than the questionable client.

## Error Codes

- `syntax_error`: PostgreSQL reports a SQL syntax error.
- `safety_rejected`: the static SQL guard rejected the submission.
- `timeout`: PostgreSQL canceled the query due to `statement_timeout`.
- `result_mismatch`: SQL ran successfully but rows differed from
  `expected-result.json`.
- `execution_error`: PostgreSQL reported a runtime execution error.
- `internal_error`: challenge metadata, expected-result loading, persistence, or
  evaluator infrastructure failed unexpectedly.

## Boundaries

Normal evaluation never reads, runs, or applies suggested solution SQL,
official solution SQL, or suggested indexes. Correctness comes from
`expected-result.json` only.

Route handlers remain thin: they validate request/response shape and delegate to
service methods. Evaluator tests can call `SubmissionEvaluator.evaluate()`
directly without starting Fastify.

## Ranking

Leaderboards include only submissions with `status = completed` and
`correct = true`. Ordering is by `executionTimeMs`, then `latencyMs`, then
`submittedAt`.
