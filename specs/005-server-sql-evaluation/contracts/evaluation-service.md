# Contract: Evaluation Service

## Purpose

Define the reusable service boundary used by the current API and by a future
separate evaluator service.

## Components

### SubmissionEvaluator

Primary orchestration contract.

```ts
type EvaluationErrorCode =
  | 'syntax_error'
  | 'safety_rejected'
  | 'timeout'
  | 'result_mismatch'
  | 'execution_error'
  | 'internal_error';

type SubmissionStatus = 'pending' | 'running' | 'completed' | 'failed';

interface EvaluateStoredSubmissionInput {
  submissionId: string;
}

interface EvaluateExplicitInput {
  challengeId: string;
  variant?: string | null;
  submissionId?: string;
  sql: string;
  participantName?: string | null;
  participantId?: string | null;
}

type EvaluationInput = EvaluateStoredSubmissionInput | EvaluateExplicitInput;

interface ExplainMetrics {
  planningTimeMs: number | null;
  executionTimeMs: number | null;
  actualRows: number | null;
  sharedHitBlocks: number;
  sharedReadBlocks: number;
  tempReadBlocks: number;
  tempWrittenBlocks: number;
  planText?: string;
}

interface EvaluationResult {
  submissionId: string;
  status: SubmissionStatus;
  correct: boolean | null;
  errorCode: EvaluationErrorCode | null;
  errorMessage: string | null;
  latencyMs: number | null;
  executionTimeMs: number | null;
  planningTimeMs: number | null;
  rowCount: number | null;
  diffSummary: unknown | null;
  explainMetrics: ExplainMetrics | null;
  leaderboardEligible: boolean;
}

interface SubmissionEvaluator {
  evaluate(input: EvaluationInput): Promise<EvaluationResult>;
}
```

## Required Behavior

1. Resolve challenge metadata and expected result before execution.
2. Use `SqlSafetyValidator` before opening an executable evaluation path.
3. Store `safety_rejected` without running SQL.
4. Begin an isolated transaction for executable participant SQL.
5. Apply transaction-local `statement_timeout`.
6. Apply read-only transaction mode when compatible.
7. Execute participant SQL through `BenchmarkRunner`.
8. Compare participant rows through `CorrectnessValidator`.
9. Run `ExplainRunner` only when correctness is true.
10. Persist a structured `EvaluationResult`.
11. Always roll back the transaction.
12. Reset pooled session state before releasing the database client.

## Component Contracts

### SqlSafetyValidator

```ts
interface SqlSafetyValidator {
  validate(sql: string, options: {maxBytes: number}): {
    ok: boolean;
    sqlHash: string;
    errorCode: 'safety_rejected' | null;
    errorMessage: string | null;
  };
}
```

Rejects oversized SQL, empty SQL, multi-statement SQL, non-`SELECT` statements,
destructive keywords, transaction-control commands, data-modifying CTEs,
`SELECT INTO`, and known unsafe functions.

### CorrectnessValidator

```ts
interface CorrectnessValidator {
  validate(actualRows: Record<string, unknown>[], expectedResultPath: string): Promise<{
    correct: boolean;
    diffSummary: unknown | null;
  }>;
}
```

Uses the same normalization and comparison behavior as local `validate-file`.

### BenchmarkRunner

```ts
interface BenchmarkRunner {
  run(client: unknown, sql: string): Promise<{
    rows: Record<string, unknown>[];
    rowCount: number;
    latencyMs: number;
  }>;
}
```

Runs participant SQL inside the caller-owned transaction and maps database
errors to evaluator classifications.

### ExplainRunner

```ts
interface ExplainRunner {
  run(client: unknown, sql: string): Promise<ExplainMetrics>;
}
```

Runs `EXPLAIN (ANALYZE, BUFFERS)` inside the caller-owned transaction only after
correctness succeeds.

## Error Classification Mapping

| Source | Error Code |
|--------|------------|
| SQL guard rejection | `safety_rejected` |
| PostgreSQL syntax or parse error | `syntax_error` |
| PostgreSQL statement timeout | `timeout` |
| Correct execution with mismatched normalized rows | `result_mismatch` |
| Non-syntax database execution failure | `execution_error` |
| Fixture loading, persistence, unexpected evaluator failure | `internal_error` |

## API Compatibility

`EvaluationService.submit()` remains the API-facing facade. It creates or loads
the submission, calls `SubmissionEvaluator.evaluate()`, and maps
`EvaluationResult` to the existing `SubmissionResponse` shape. Routes must not
contain evaluation logic.
