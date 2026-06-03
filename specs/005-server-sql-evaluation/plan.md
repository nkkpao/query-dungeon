# Implementation Plan: Server SQL Evaluation Reliability

**Branch**: `005-server-sql-evaluation` | **Date**: 2026-06-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-server-sql-evaluation/spec.md`

## Summary

Refactor server-side submission evaluation into a reusable Evaluation Service
centered on `SubmissionEvaluator`. The service accepts either a stored
submission ID or explicit evaluation input, validates SQL safety before
execution, runs participant SQL inside a rolled-back PostgreSQL transaction with
`statement_timeout`, compares results only against `expected-result.json`,
captures correctness and timing metrics, captures `EXPLAIN (ANALYZE, BUFFERS)`
metrics only for correct submissions, classifies failures consistently, and
persists structured `EvaluationResult` records for API use now and a future
separate evaluator service later.

## Technical Context

**Language/Version**: TypeScript on Node.js 20+  
**Primary Dependencies**: Fastify, node-postgres (`pg`), dotenv, commander, Vitest, Docker Compose, Makefile  
**Storage**: Existing PostgreSQL 16+ Docker Compose database; extend `submissions` and `evaluation_results` persistence to include structured evaluation status, error classification, row count, latency, planning time, execution time, plan/buffer metrics, and diff summary  
**Testing**: Vitest unit, repository, service, HTTP route, and smoke tests; direct evaluator tests are mandatory and must not require HTTP handlers; include full correct evaluator happy-path and 10-run repeatability coverage  
**Target Platform**: Local developer machine with Docker, Node.js, shell access, and PostgreSQL container  
**Project Type**: CLI-first local PostgreSQL performance training lab with additive backend HTTP service and reusable server evaluation module  
**Performance Goals**: Each evaluator run honors configured `QUERY_TIMEOUT_MS`; a 10-run repeatability check of the same SQL yields the same correctness, normalized rows, row count, and metric presence; leaderboard ordering avoids exact timing assertions  
**Constraints**: Preserve existing CLI commands, challenge IDs, `sql/challenges` source-of-truth files, hidden suggested solution policy, and current learner workflow; evaluate correctness from `expected-result.json`; do not run suggested solution SQL; do not apply suggested indexes; static SQL guard runs before execution; every executable evaluation always rolls back  
**Scale/Scope**: Local training server and future evaluator-service extraction path; no external queue, paid SaaS, authentication, public deployment hardening, or distributed worker pool in this iteration

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Intentional slowness**: PASS. This feature does not add new lesson
  slowness or alter baseline challenge behavior. It evaluates participant SQL
  against existing deterministic challenge data and records comparable timing
  evidence without relying on accidental machine load.
- **Scenario contract**: PASS. Existing challenge contracts remain authoritative:
  challenge metadata and `expected-result.json` drive correctness. Suggested
  solution SQL and suggested indexes remain outside the evaluation path.
- **PostgreSQL-first scope**: PASS. Evaluation uses PostgreSQL transactions,
  `statement_timeout`, result execution, `EXPLAIN (ANALYZE, BUFFERS)`, row
  normalization, and persisted PostgreSQL metrics. No application cache or
  non-PostgreSQL shortcut is introduced.
- **Docker Compose reproducibility**: PASS. Existing local commands remain
  valid: `docker compose up -d`, `make seed`, `npm test`, `npm run server`,
  `npm run validate-file`, `npm run benchmark-file`, and
  `npm run explain-file`. Evaluator tests use either fakes for unit coverage or
  the existing local PostgreSQL workflow for integration coverage.
- **Correctness and evidence**: PASS. Correctness uses `expected-result.json`
  and the shared local validation normalizer. Correct submissions store
  latency, execution time, planning time, row count, and plan/buffer metrics;
  failed submissions store a structured failure reason.
- **Trade-off review**: PASS. Splitting the current evaluation service into
  focused components adds interfaces but reduces route coupling, enables direct
  evaluator tests, and creates a future evaluator-service extraction point
  without introducing a queue or distributed worker now.

**Post-design re-check**: PASS. Research, data model, contracts, and quickstart
preserve local Docker reproducibility, PostgreSQL-first correctness and metrics,
hidden solution policy, rolled-back execution, direct evaluator testing, and
additive service boundaries.

## Project Structure

### Documentation (this feature)

```text
specs/005-server-sql-evaluation/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── evaluation-service.md
│   └── persistence.md
└── tasks.md
```

### Source Code (repository root)

```text
AGENTS.md
package.json
Makefile

sql/
└── schema/
    └── 004_submissions.sql

src/
├── challenges/
│   ├── expected-result.ts
│   ├── registry.ts
│   └── types.ts
├── db/
│   ├── benchmark.ts
│   ├── explain.ts
│   ├── result-compare.ts
│   └── sql-files.ts
└── server/
    ├── app.ts
    ├── config.ts
    ├── routes/
    │   └── submissions.ts
    ├── repositories/
    │   ├── evaluation-result-repository.ts
    │   └── submission-repository.ts
    ├── services/
    │   ├── benchmark-runner.ts
    │   ├── challenge-catalog.ts
    │   ├── correctness-validator.ts
    │   ├── evaluation-service.ts
    │   ├── explain-runner.ts
    │   ├── leaderboard-service.ts
    │   ├── sql-safety-validator.ts
    │   └── submission-evaluator.ts
    └── types.ts

tests/
├── submission-evaluation.test.ts
├── submission-repository.test.ts
├── sql-safety.test.ts
├── server-routes.test.ts
├── server-contract.test.ts
└── existing CLI and challenge tests
```

**Structure Decision**: Keep the feature inside the existing TypeScript package
and `src/server` tree. Refactor the current monolithic
`src/server/services/evaluation-service.ts` behavior into focused services
rather than changing the HTTP route contract first. Reuse `src/db/result-compare.ts`
for normalization, `src/db/explain.ts` for plan parsing, and
`src/challenges/expected-result.ts` for fixture loading.

## Component Design

- **SubmissionEvaluator**: Orchestrates the complete evaluation algorithm within
  the reusable Evaluation Service module boundary and
  returns structured `EvaluationResult` for both API and future worker callers.
- **SqlSafetyValidator**: Performs max-size, single-statement, read-only shape,
  destructive keyword, data-modifying CTE, unsafe function, and comment/string
  bypass checks before any execution.
- **CorrectnessValidator**: Loads or receives `expected-result.json` content and
  compares participant rows with shared local validation normalization.
- **BenchmarkRunner**: Executes participant SQL inside the active transaction,
  measures end-to-end latency, captures row count, and maps execution errors to
  evaluation classifications.
- **ExplainRunner**: Runs `EXPLAIN (ANALYZE, BUFFERS)` only after correctness is
  proven and extracts planning time, execution time, row estimate/actual rows,
  buffer counters, temp I/O counters, and raw plan text when stored.
- **SubmissionRepository**: Creates and loads submissions, marks `pending`,
  `running`, `completed`, or `failed`, and supports leaderboard ordering.
- **EvaluationResultRepository**: Stores one structured result per submission,
  including correctness, metrics, classification, participant-safe error
  message, diff summary, and explain metrics.
- **EvaluationService**: Remains the API-facing facade that creates submissions
  from `POST /api/submissions`, delegates to `SubmissionEvaluator`, maps
  results to existing response schemas, and can later be bypassed by a worker
  that calls `SubmissionEvaluator` directly.

## Evaluation Algorithm

1. Load submission and challenge metadata from `SubmissionRepository` and
   `ChallengeCatalog`, or use explicit evaluation input supplied by tests or a
   future evaluator service.
2. Load `expected-result.json` through existing expected-result helpers.
3. Validate SQL safety with `SqlSafetyValidator`.
4. If safety fails, store `safety_rejected`, mark submission `failed`, and stop.
5. Acquire a database client and `BEGIN` an isolated transaction.
6. Apply `SET LOCAL statement_timeout` using the configured timeout.
7. Prefer `SET TRANSACTION READ ONLY` or `BEGIN READ ONLY` for the evaluation
   transaction when compatible with the current connection flow.
8. Execute participant SQL through `BenchmarkRunner`.
9. Compare output to expected result through `CorrectnessValidator`.
10. If correct, run `ExplainRunner` with `EXPLAIN (ANALYZE, BUFFERS)`.
11. Persist correctness, row count, latency, planning time, execution time,
    explain/buffer metrics, diff summary, and failure classification.
12. Always `ROLLBACK` before returning or rethrowing, including syntax,
    timeout, result mismatch, execution, explain, and internal errors.
13. Reset session state for pooled connections.
14. Mark submission `completed` for correct or result-mismatch evaluations and
    `failed` for safety, timeout, syntax, execution, or internal failures.

## Error Classification

| Code | Meaning | Submission Status | Correct |
|------|---------|-------------------|---------|
| `syntax_error` | Submitted SQL cannot be parsed or planned by PostgreSQL | `failed` | `false` |
| `safety_rejected` | Static SQL guard rejects the statement before execution | `failed` | `false` |
| `timeout` | Statement timeout interrupts participant execution or explain capture | `failed` | `false` |
| `result_mismatch` | Statement executes but normalized rows differ from expected result | `completed` | `false` |
| `execution_error` | PostgreSQL raises a non-syntax, non-timeout execution error | `failed` | `false` |
| `internal_error` | Evaluator, fixture loading, persistence, or unexpected infrastructure failure | `failed` | `false` |

## Incremental Implementation Sequence

1. **Lock current API behavior**: Keep existing route and repository tests green
   while adding assertions for classification, structured result shape, and no
   evaluation logic inside route handlers.
2. **Extend server types**: Add `EvaluationInput`, `EvaluationResult`,
   `EvaluationErrorCode`, `ExplainMetrics`, and metric/diff summary shapes in
   `src/server/types.ts`.
3. **Upgrade persistence**: Extend `evaluation_results` with error code,
   explain metrics, raw or summarized plan data, and any missing timing fields;
   update repositories and mapping tests.
4. **Extract SQL safety**: Rename or wrap the existing `sql-safety.ts` logic as
   `SqlSafetyValidator` while preserving `sqlHash` behavior and expanding tests
   for multi-statement and destructive SQL bypass attempts.
5. **Extract correctness**: Add `CorrectnessValidator` that reuses
   `validateRows` and expected-result parsing, including fixture-backed expected
   rows when required.
6. **Extract runners**: Add `BenchmarkRunner` for participant execution and
   latency/row-count capture, then `ExplainRunner` for correct-only
   `EXPLAIN (ANALYZE, BUFFERS)` metrics.
7. **Add SubmissionEvaluator**: Implement the orchestration algorithm with
   explicit rollback and session reset guarantees; support submission ID and
   explicit evaluation input entrypoints.
8. **Refactor API facade**: Keep `EvaluationService.submit()` as the route
   dependency, but delegate evaluation to `SubmissionEvaluator` and only perform
   request-to-submission/result response mapping there.
9. **Update leaderboard filtering**: Ensure repository ranking includes only
   correct completed submissions ordered by execution time, latency, then
   submitted time.
10. **Broaden tests**: Cover correct full evaluator happy path, 10-run
    repeatability, mismatch, syntax, safety rejected, timeout, execution error,
    internal error, rollback, read-only transaction, statement timeout,
    explain-only-when-correct, no suggested SQL/index use, and API/direct
    evaluator equivalence.
11. **Update docs and quickstart**: Document the local commands and direct
    evaluator verification path without exposing suggested solution material.

## Phase 0 Research Summary

See [research.md](./research.md) for decisions on component boundaries,
transaction and timeout handling, SQL safety, correctness reuse, explain metric
capture, error classification, persistence, and future evaluator-service
compatibility.

## Phase 1 Design Summary

See [data-model.md](./data-model.md), [contracts/evaluation-service.md](./contracts/evaluation-service.md),
[contracts/persistence.md](./contracts/persistence.md), and
[quickstart.md](./quickstart.md) for data shapes, service contracts,
persistence rules, and local verification workflow.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | No constitution violations identified | No exception needed |
