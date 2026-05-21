# Quickstart: Submission API MVP

## Prerequisites

- Node.js 20+
- Docker Compose
- PostgreSQL container started by this repository

## Start Local Database

```bash
docker compose up -d
make seed
```

## Build and Test

```bash
npm run build
npm test
```

## Start the Server

```bash
npm run server
```

or:

```bash
make server
```

Expected defaults:

- `DATABASE_URL=postgresql://dungeon:dungeon@localhost:54329/dungeon`
- `QUERY_TIMEOUT_MS=15000`
- `SERVER_PORT=3000`
- `SERVER_SQL_MAX_BYTES=65536`

## Health Check

```bash
curl http://localhost:3000/health
```

Expected shape:

```json
{"ok":true}
```

## List Challenges

```bash
curl http://localhost:3000/api/challenges
```

The response must include challenge IDs, titles, difficulty, and variants only.
It must not include official or suggested solution SQL.

## Submit SQL

```bash
curl -X POST http://localhost:3000/api/submissions \
  -H 'content-type: application/json' \
  -d '{
    "challengeId": "01-user-orders-missing-index",
    "participantName": "Ada",
    "sql": "SELECT u.id, u.email, count(o.id)::int AS order_count FROM users u JOIN orders o ON o.user_id = u.id GROUP BY u.id, u.email ORDER BY order_count DESC, u.id LIMIT 10"
  }'
```

Expected response shape:

```json
{
  "submissionId": "00000000-0000-0000-0000-000000000000",
  "status": "completed",
  "correctness": true,
  "latencyMs": 12.3,
  "executionTimeMs": 10.8,
  "planningTimeMs": 0.4,
  "rowsReturned": 10,
  "errorMessage": null
}
```

## Fetch Submission

```bash
curl http://localhost:3000/api/submissions/<submissionId>
```

## Fetch Leaderboard

```bash
curl 'http://localhost:3000/api/challenges/01-user-orders-missing-index/leaderboard'
```

For a variant:

```bash
curl 'http://localhost:3000/api/challenges/04-offset-pagination/leaderboard?variant=advanced'
```

Leaderboard entries include only correct completed submissions and do not expose
raw SQL.

## Existing CLI Still Works

```bash
make list
make validate-file CHALLENGE=01-user-orders-missing-index SQL=sql/challenges/01-user-orders-missing-index/baseline.sql
make benchmark-file CHALLENGE=01-user-orders-missing-index SQL=sql/challenges/01-user-orders-missing-index/baseline.sql
```
