# Implementation Plan: Submission API MVP

**Branch**: `004-submission-api` | **Date**: 2026-05-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-submission-api/spec.md`

## Summary

Add a minimal HTTP API service inside the existing TypeScript/Node.js Query
Dungeon project. The service uses Fastify, shares the current PostgreSQL
database, reuses the challenge registry, expected-result parsing,
result-comparison, benchmark, and explain helpers, and persists all submission
attempts plus evaluation results. The MVP evaluates submissions synchronously in
`POST /api/submissions`, only accepts a single `SELECT` statement, runs the
participant SQL inside a rolled-back transaction with statement timeout
enforcement, and exposes participant-safe challenge, status, and leaderboard
endpoints without returning raw participant SQL on leaderboards or any suggested
solution SQL.

## Technical Context

**Language/Version**: TypeScript on Node.js 20+  
**Primary Dependencies**: Fastify, node-postgres (`pg`), dotenv, commander, Vitest, Docker Compose, Makefile  
**Storage**: Existing PostgreSQL 16+ Docker Compose database; add `submissions` and `evaluation_results` tables plus leaderboard indexes through `sql/schema/004_submissions.sql`  
**Testing**: Vitest unit, contract, repository, service, and HTTP route tests; existing CLI smoke tests remain required  
**Target Platform**: Local developer machine with Docker, Node.js, shell access, and PostgreSQL container  
**Project Type**: CLI-first local PostgreSQL performance training lab with one additive backend HTTP service  
**Performance Goals**: Synchronous local evaluation completes within the existing default `QUERY_TIMEOUT_MS=15000`; leaderboard queries use indexes and deterministic ranking without exact timing assertions  
**Constraints**: Preserve existing CLI commands and manual SQL workflow; keep `sql/challenges` as the source of truth; do not expose official or suggested solution SQL; do not introduce Kafka or external brokers; store all attempts; rank only correct completed submissions; reject unsafe SQL before execution; run evaluation in a rolled-back transaction  
**Scale/Scope**: Local MVP for small training sessions; no authentication, rate limiting, multi-tenant isolation, distributed workers, public deployment hardening, or challenge-authoring API

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Intentional slowness**: PASS. This feature does not add or change scenario
  slowness; it preserves existing bad queries and uses participant submissions
  as evaluation inputs.
- **Scenario contract**: PASS. Existing challenge contracts remain the source
  of truth. The API reads existing challenge metadata and `expected-result.json`
  fixtures rather than creating a parallel challenge model.
- **PostgreSQL-first scope**: PASS. Evaluation uses PostgreSQL execution,
  `EXPLAIN (ANALYZE, BUFFERS)` timing evidence when available, result
  comparison against fixtures, and PostgreSQL persistence. No application cache
  or non-PostgreSQL shortcut is introduced.
- **Docker Compose reproducibility**: PASS. Existing commands remain valid:
  `docker compose up -d`, `make seed`, `make test`, `make explain-file`,
  `make benchmark-file`, and `make validate-file`. Add `npm run server` and
  `make server` for the API while keeping the database URL and timeout
  environment conventions.
- **Correctness and evidence**: PASS. API validation uses existing
  `expected-result.json` fixtures and `validateRows`. Evaluation records
  correctness, row count, latency, planning time, execution time, and errors
  without exact timing assertions.
- **Trade-off review**: PASS. Synchronous evaluation is intentionally simple for
  the MVP and avoids Kafka. The trade-off is lower concurrency, documented as a
  local-session constraint with a future path to in-process or external workers.

**Post-design re-check**: PASS. Research, data model, contracts, and quickstart
preserve the local Docker workflow, current CLI behavior, hidden solution
policy, PostgreSQL correctness validation, rolled-back evaluation, and additive
service structure.

## Project Structure

### Documentation (this feature)

```text
specs/004-submission-api/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── openapi.yaml
└── tasks.md
```

### Source Code (repository root)

```text
Makefile
package.json
README.md

docs/
└── server-api.md

sql/
└── schema/
    └── 004_submissions.sql

src/
├── challenges/
│   ├── expected-result.ts
│   ├── registry.ts
│   └── types.ts
├── cli/
│   └── ...
├── db/
│   ├── benchmark.ts
│   ├── connection.ts
│   ├── explain.ts
│   ├── result-compare.ts
│   └── sql-files.ts
└── server/
    ├── index.ts
    ├── app.ts
    ├── config.ts
    ├── errors.ts
    ├── routes/
    │   ├── health.ts
    │   ├── challenges.ts
    │   └── submissions.ts
    ├── services/
    │   ├── challenge-catalog.ts
    │   ├── evaluation-service.ts
    │   ├── leaderboard-service.ts
    │   └── sql-safety.ts
    ├── repositories/
    │   ├── submission-repository.ts
    │   └── evaluation-result-repository.ts
    └── types.ts

tests/
├── server-contract.test.ts
├── server-routes.test.ts
├── submission-evaluation.test.ts
├── submission-repository.test.ts
├── sql-safety.test.ts
└── existing CLI and challenge tests
```

**Structure Decision**: Keep one additive backend service inside the existing
package. Use `src/server` for HTTP entrypoint, routes, services, repositories,
and server-specific types. Keep reusable PostgreSQL helpers in `src/db` and
challenge source-of-truth helpers in `src/challenges`. Add persistence SQL under
`sql/schema` so Docker/local setup remains repository-controlled.

## Incremental Implementation Sequence

1. **Lock existing behavior**: Keep current CLI tests green and add a smoke test
   proving core CLI commands still register without server dependencies.
2. **Add schema**: Create `submissions` and `evaluation_results` tables plus
   indexes that support submission lookup and leaderboard ordering. Extend seed
   or setup flow to apply the new schema.
3. **Add server shell**: Add Fastify dependency, `src/server/index.ts`,
   `src/server/app.ts`, config loading, `/health`, centralized error handling,
   JSON validation, `npm run server`, and `make server`.
4. **Add SQL safety service**: Enforce one statement, `SELECT` only, max SQL
   size of 65,536 bytes by default, disallowed keyword classes, and tests for
   rejection messages.
5. **Add repositories**: Persist all attempts and evaluation results in
   PostgreSQL, including malformed-but-accepted request attempts where
   applicable after request validation.
6. **Add evaluation service**: Validate request, resolve challenge and variant,
   load `expected-result.json`, insert submission, run participant SQL inside
   `BEGIN`/`ROLLBACK`, enforce statement timeout, compare rows with
   `validateRows`, capture latency and `EXPLAIN` timing when available, and
   store the result.
7. **Add submission routes**: Implement `POST /api/submissions` and
   `GET /api/submissions/:id` with participant-safe response shapes and no
   solution SQL exposure.
8. **Add challenge and leaderboard routes**: Implement `GET /api/challenges`
   from registry metadata and `GET /api/challenges/:challengeId/leaderboard`
   with optional `variant`, correct-completed-only filtering, and ranking by
   `executionTimeMs ASC NULLS LAST`, `latencyMs ASC NULLS LAST`,
   `submittedAt ASC`.
9. **Add docs**: Create `docs/server-api.md`, update README with server setup,
   and include curl examples for health, challenges, submit, status, and
   leaderboard.
10. **Verify end-to-end**: Run build, unit/contract tests, server smoke checks,
    and existing CLI smoke tests. Avoid exact timing equality in assertions.

## Phase 0 Research Summary

See [research.md](./research.md) for decisions on Fastify, synchronous
evaluation, PostgreSQL schema design, SQL safety, timing capture, and
leaderboard ranking.

## Phase 1 Design Summary

See [data-model.md](./data-model.md), [contracts/openapi.yaml](./contracts/openapi.yaml),
and [quickstart.md](./quickstart.md) for schema, API contracts, and local usage.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
