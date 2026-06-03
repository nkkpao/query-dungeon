# Quickstart: Server SQL Evaluation Reliability

## Prerequisites

- Node.js 20+
- Docker and Docker Compose
- Dependencies installed with `npm ci`

## Local Setup

1. Start PostgreSQL:

   ```bash
   docker compose up -d
   ```

2. Load deterministic local data:

   ```bash
   make seed
   ```

3. Run the test suite:

   ```bash
   npm test
   ```

4. Run the server:

   ```bash
   npm run server
   ```

## Evaluation Service Verification

Direct evaluator tests should cover:

- Correct submission returns `completed`, `correct = true`, metrics, and
  leaderboard eligibility.
- Result mismatch returns `completed`, `correct = false`, and
  `errorCode = result_mismatch`.
- Destructive SQL returns `failed` and `errorCode = safety_rejected` before
  execution.
- Multi-statement SQL returns `failed` and `errorCode = safety_rejected`.
- Syntax error returns `failed` and `errorCode = syntax_error`.
- Timeout returns `failed` and `errorCode = timeout`.
- Runtime database error returns `failed` and `errorCode = execution_error`.
- Fixture, persistence, or unexpected evaluator failure returns `failed` and
  `errorCode = internal_error`.
- Every executable path issues rollback and resets pooled session state.
- `EXPLAIN (ANALYZE, BUFFERS)` runs only after correctness succeeds.
- Suggested solution SQL and suggested indexes are not read, run, or applied.

## API Smoke Flow

1. Submit a SQL answer:

   ```bash
   curl -sS -X POST http://localhost:3000/api/submissions \
     -H 'content-type: application/json' \
     -d '{
       "challengeId": "01-user-orders-missing-index",
       "participantName": "Ada",
       "sql": "SELECT 1 AS id"
     }'
   ```

2. Fetch submission status using the returned `submissionId`:

   ```bash
   curl -sS http://localhost:3000/api/submissions/<submissionId>
   ```

3. Fetch leaderboard:

   ```bash
   curl -sS http://localhost:3000/api/challenges/01-user-orders-missing-index/leaderboard
   ```

## Expected Local Commands

```bash
npm run build
npm test
npm run validate-file -- --challenge 01-user-orders-missing-index --file sql/challenges/01-user-orders-missing-index/baseline.sql
npm run explain-file -- --challenge 01-user-orders-missing-index --file sql/challenges/01-user-orders-missing-index/baseline.sql
npm run benchmark-file -- --challenge 01-user-orders-missing-index --file sql/challenges/01-user-orders-missing-index/baseline.sql
```

Tests must avoid exact timing assertions. They should assert classification,
metric presence, ordering rules, rollback behavior, and consistency across
repeated evaluations.
