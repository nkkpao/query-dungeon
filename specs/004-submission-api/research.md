# Research: Submission API MVP

## Decision: Use Fastify for the HTTP Server

**Rationale**: The project has no existing Express dependency or server
framework convention. Fastify fits the TypeScript/Node.js service shape, gives
request/response schema validation without adding a large framework surface, and
keeps the server additive to the existing CLI package.

**Alternatives considered**:

- Express: familiar and lightweight, but the repository does not already favor
  it and JSON schema validation would need more glue.
- Native `node:http`: avoids a dependency but would make route validation and
  error handling more bespoke than this MVP needs.

## Decision: Evaluate Submissions Synchronously in `POST /api/submissions`

**Rationale**: The MVP is local-session focused, Kafka is explicitly out of
scope, and synchronous evaluation gives participants one simple request path.
The stored submission can still be fetched later through
`GET /api/submissions/:id`.

**Alternatives considered**:

- In-process background queue: useful for future concurrency, but adds job
  lifecycle and polling complexity before the MVP proves the API flow.
- Kafka or external broker: explicitly out of scope for this iteration.

## Decision: Persist All Attempts in Existing PostgreSQL

**Rationale**: The existing Docker Compose database is already the local source
of truth for challenge execution. Storing submissions and evaluation results
there keeps the MVP reproducible without introducing a second storage system.

**Alternatives considered**:

- JSON files: simpler at first, but awkward for leaderboards, indexes, and
  concurrent requests.
- Separate database: unnecessary for a local MVP and breaks the current single
  database setup.

## Decision: Split `submissions` and `evaluation_results`

**Rationale**: `submissions` records the participant attempt and lifecycle,
while `evaluation_results` records execution evidence and correctness. This
keeps request metadata separate from potentially evolving evaluation metrics and
supports a stable `GET /api/submissions/:id` shape.

**Alternatives considered**:

- One wide table: simpler but mixes request metadata, validation failures,
  execution evidence, and leaderboard fields in one row.
- Event log only: more flexible but too heavy for an MVP.

## Decision: Use a Conservative SQL Safety Gate Before Execution

**Rationale**: The API should only evaluate participant `SELECT` statements.
The plan uses a defensive validator that rejects multiple statements, SQL above
65,536 bytes by default, and DDL, DML, transaction control, `COPY`, `CALL`,
`DO`, `CREATE`, `ALTER`, `DROP`, `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`,
`GRANT`, and `REVOKE`. Execution still happens inside a transaction that is
rolled back, with `statement_timeout` set.

**Alternatives considered**:

- Full SQL parser: stronger long-term, but adds dependency and dialect decisions
  not needed for the first local MVP.
- Keyword check only: too weak without single-statement and transaction rollback
  enforcement.

## Decision: Reuse Existing Challenge and Evaluation Helpers

**Rationale**: `getChallengeForVariant`, `loadExpectedResult`, `validateRows`,
`explainAnalyze`, and benchmark timing patterns already encode the repository's
challenge contract. The API should compose these utilities rather than create a
parallel validator.

**Alternatives considered**:

- Reimplement challenge loading in the server: risks divergence from CLI
  behavior and hidden solution gating.
- Call CLI commands from the server: preserves behavior but creates brittle
  process boundaries and output parsing.

## Decision: Rank Leaderboards by Correctness and Timing Evidence

**Rationale**: Only correct completed submissions belong on the leaderboard.
Ranking uses `executionTimeMs ASC NULLS LAST`, then `latencyMs ASC NULLS LAST`,
then `submittedAt ASC` for deterministic ties. Raw SQL is excluded from
leaderboard responses.

**Alternatives considered**:

- Include incorrect attempts: useful for coaching, but violates the clarified
  leaderboard requirement.
- Rank by latency only: simpler, but `EXPLAIN ANALYZE` execution time is better
  aligned with the training objective when available.
