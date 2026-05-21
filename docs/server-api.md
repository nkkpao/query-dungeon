# Server API

The server API is a local MVP for submitting Query Dungeon SQL attempts through
HTTP while preserving the existing CLI-first workflow.

## Start

```bash
npm run build
make seed
npm run server
```

or after building:

```bash
make server
```

Defaults:

- `DATABASE_URL=postgresql://dungeon:dungeon@localhost:54329/dungeon`
- `QUERY_TIMEOUT_MS=15000`
- `SERVER_PORT=3000`
- `SERVER_SQL_MAX_BYTES=65536`

## Endpoints

### `GET /health`

```bash
curl http://localhost:3000/health
```

Returns:

```json
{"ok":true}
```

### `GET /api/challenges`

Lists participant-safe challenge metadata:

```bash
curl http://localhost:3000/api/challenges
```

The response includes challenge IDs, titles, difficulty, and variant metadata.
It does not expose suggested or official solution SQL.

### `POST /api/submissions`

Creates and evaluates a well-formed submission synchronously:

```bash
curl -X POST http://localhost:3000/api/submissions \
  -H 'content-type: application/json' \
  -d '{
    "challengeId": "01-user-orders-missing-index",
    "participantName": "Ada",
    "sql": "SELECT * FROM orders WHERE user_id = 42 ORDER BY created_at DESC LIMIT 20"
  }'
```

Malformed JSON or request-schema failures return a standard error response
without a `submissionId`. Well-formed attempts that fail SQL safety, size, or
timeout checks are stored and return a failed submission result with
`submissionId`.

### `GET /api/submissions/:id`

Fetches a stored submission result:

```bash
curl http://localhost:3000/api/submissions/<submissionId>
```

The response includes status, correctness, latency, returned rows, available
`EXPLAIN ANALYZE` timing, and a participant-safe error message when applicable.
It does not include suggested solution SQL, official solution SQL, raw SQL, or
notes.

### `GET /api/challenges/:challengeId/leaderboard`

Lists best correct completed submissions:

```bash
curl 'http://localhost:3000/api/challenges/01-user-orders-missing-index/leaderboard'
curl 'http://localhost:3000/api/challenges/04-offset-pagination/leaderboard?variant=advanced'
```

Leaderboard entries include only correct completed submissions. Incorrect and
failed submissions remain stored but are not ranked. Ranking order is:

1. `executionTimeMs ASC NULLS LAST`
2. `latencyMs ASC NULLS LAST`
3. `submittedAt ASC`

Leaderboard responses do not expose raw submitted SQL or solution material.

## SQL Safety

The MVP accepts one participant SQL statement and requires it to be a `SELECT`
or `WITH ... SELECT` query. It rejects multiple statements, SQL over
`SERVER_SQL_MAX_BYTES`, DDL, DML, transaction control, `COPY`, `CALL`, `DO`,
`CREATE`, `ALTER`, `DROP`, `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`, `GRANT`,
`REVOKE`, `SELECT INTO`, data-modifying CTEs, and known semicolon/comment
bypass shapes.

Executable participant SQL runs inside a transaction with `statement_timeout`
configured and is always rolled back after evaluation.
