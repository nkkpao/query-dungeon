# Research: Server SQL Evaluation Reliability

## Decision: Use a Reusable `SubmissionEvaluator` Orchestrator

**Rationale**: The current API-facing evaluation flow already proves the basic
submission lifecycle, but route-oriented orchestration makes future worker use
and direct evaluator tests harder. A dedicated evaluator keeps the API as one
caller and gives the future evaluator service the same entrypoint.

**Alternatives considered**:

- Keep evaluation inside route-facing service only: rejected because the feature
  explicitly requires direct testability and future evaluator-service reuse.
- Move evaluation directly into repositories: rejected because persistence
  should not own SQL safety, execution, correctness, or explain behavior.

## Decision: Split Evaluation Into Focused Components

**Rationale**: `SqlSafetyValidator`, `CorrectnessValidator`, `BenchmarkRunner`,
`ExplainRunner`, `SubmissionRepository`, and `EvaluationResultRepository` map
cleanly to the requested algorithm and make the risky behaviors independently
testable. This also keeps PostgreSQL execution logic separate from
participant-facing response mapping.

**Alternatives considered**:

- Single large `EvaluationService`: rejected because it already mixes creation,
  safety, execution, explain, persistence, and response mapping.
- More granular classes for every metric parser: deferred because `ExplainRunner`
  can own parsed explain metrics for this iteration.

## Decision: Evaluate in a Rolled-Back Transaction With Local Timeout

**Rationale**: `BEGIN`, `SET LOCAL statement_timeout`, optional read-only mode,
participant execution, correct-only explain, and unconditional `ROLLBACK` meet
the isolation and timeout requirements while preserving the existing local
PostgreSQL workflow. `SET LOCAL` ties the timeout to the transaction and
`RESET ALL` after release protects pooled connections.

**Alternatives considered**:

- Session-level timeout only: rejected because it risks leaking state across
  pooled connections.
- Rollback only for successful queries: rejected because failures, syntax
  errors, timeouts, and explain errors must leave challenge data unchanged.
- Always use only `BEGIN READ ONLY`: accepted as preferred when compatible, but
  the plan keeps `SET TRANSACTION READ ONLY` as an equivalent transaction-local
  option.

## Decision: Static SQL Guard Is the First Safety Layer

**Rationale**: Rejecting clearly unsafe SQL before execution reduces risk and
lets the evaluator persist a clean `safety_rejected` classification. The guard
must reject multi-statement submissions, destructive keywords, data-modifying
CTEs, unsafe functions, and comment/string bypasses where possible.

**Alternatives considered**:

- Rely only on read-only transaction: rejected because static rejection provides
  clearer participant feedback and avoids running obvious destructive attempts.
- Full SQL parser dependency: deferred unless regex/token-based screening proves
  insufficient; current requirements can be met with the existing validator plus
  expanded bypass tests.

## Decision: Correctness Comes Only From `expected-result.json`

**Rationale**: The constitution and spec require expected-result fixtures as the
source of truth. Reusing `loadExpectedResult` and `validateRows` keeps server
evaluation aligned with `validate-file`, including column checks, ordering,
numeric tolerance, date normalization, numeric string normalization, and
fixture-backed expected rows.

**Alternatives considered**:

- Run suggested solution SQL to produce expected rows: rejected by feature
  requirements and hidden solution policy.
- Compare raw JSON output without normalization: rejected because server and
  local validation must match.

## Decision: Run `EXPLAIN (ANALYZE, BUFFERS)` Only for Correct SQL

**Rationale**: Correct-only explain capture avoids spending extra work on failed
submissions and ensures leaderboard metrics are tied to accepted results. Since
`EXPLAIN ANALYZE` executes the query, it must run inside the same rolled-back,
timeout-protected transaction.

**Alternatives considered**:

- Explain every executable submission: rejected because incorrect SQL should
  store failure reasons without extra database work.
- Store only execution/planning times: rejected because the feature requires
  buffer metrics when SQL is correct.

## Decision: Persist Structured Error Classification

**Rationale**: The requested classifications are stable enough to drive tests,
participant-safe messages, troubleshooting, and leaderboard exclusion:
`syntax_error`, `safety_rejected`, `timeout`, `result_mismatch`,
`execution_error`, and `internal_error`.

**Alternatives considered**:

- Store only free-form error messages: rejected because tests and later worker
  flows need stable categories.
- Add many PostgreSQL-specific subclasses now: rejected because the requested
  taxonomy is sufficient and easier for participants to understand.

## Decision: Keep Leaderboard Query Repository-Owned

**Rationale**: `SubmissionRepository.leaderboard()` already enforces correct-only
ranking and database ordering. It should continue to own the query, while the
result schema gains structured metrics needed by ordering and display.

**Alternatives considered**:

- Rank in memory after fetching all submissions: rejected because it duplicates
  database ordering and scales worse.
- Include failed submissions with labels: rejected by feature requirements.

## Decision: No External Queue in This Iteration

**Rationale**: The feature requires future evaluator-service compatibility, not
an immediate distributed worker. A clean service contract and explicit
evaluation input supports future extraction without adding operational moving
parts now.

**Alternatives considered**:

- Add a queue and worker immediately: rejected as out of scope for local MVP and
  contrary to the no-extra-infrastructure constraint.
- Keep only API submission entrypoint: rejected because the spec requires future
  evaluator-service use.
