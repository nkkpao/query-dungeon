# Postgres Query Dungeon

This is a hands-on PostgreSQL optimization lab. The slow baseline SQL is the
starting point, and the work is to investigate it yourself: run the query,
capture `EXPLAIN (ANALYZE, BUFFERS)`, form a hypothesis, edit SQL or indexes in
your workspace, validate correctness, and benchmark repeated attempts.

## Investigation Path

1. Start PostgreSQL and build the CLI:

   ```bash
   make setup
   ```

2. Load a reproducible local dataset:

   ```bash
   make seed SEED_SCALE=small
   ```

3. List challenges and open the prompt:

   ```bash
   make list
   less sql/challenges/01-user-orders-missing-index/challenge.md
   ```

4. Run the baseline manually:

   ```bash
   make run-sql CHALLENGE=01-user-orders-missing-index \
     SQL=sql/challenges/01-user-orders-missing-index/baseline.sql
   ```

5. Capture the plan:

   ```bash
   make explain-file CHALLENGE=01-user-orders-missing-index \
     SQL=sql/challenges/01-user-orders-missing-index/baseline.sql
   ```

6. Create your own attempt:

   ```bash
   cp sql/challenges/01-user-orders-missing-index/baseline.sql \
     workspace/sql/01-user-orders-attempt-1.sql
   ```

   Put manual index experiments in `workspace/indexes/` and notes in
   `workspace/notes/`.

7. Validate and benchmark your attempt:

   ```bash
   make validate-file CHALLENGE=01-user-orders-missing-index \
     SQL=workspace/sql/01-user-orders-attempt-1.sql

   make benchmark-file CHALLENGE=01-user-orders-missing-index \
     SQL=workspace/sql/01-user-orders-attempt-1.sql ITERATIONS=3
   ```

8. Compare two of your own attempts:

   ```bash
   make diff-results CHALLENGE=01-user-orders-missing-index \
     LEFT=workspace/sql/01-user-orders-attempt-1.sql \
     RIGHT=workspace/sql/01-user-orders-attempt-2.sql
   ```

Suggested solutions live under each challenge's `optional/` directory and are
not part of the default workflow. Use `compare-with-suggested-solution` only
when you intentionally want to leave the exercise flow.

## Local Submission API

An optional local HTTP API can receive participant SQL submissions, validate
them against `expected-result.json`, store results in PostgreSQL, and expose a
correct-only leaderboard. It does not replace the CLI workflow and does not
expose suggested solution SQL.

```bash
npm run build
make seed
npm run server
```

Useful examples:

```bash
curl http://localhost:3000/health

curl http://localhost:3000/api/challenges

curl -X POST http://localhost:3000/api/submissions \
  -H 'content-type: application/json' \
  -d '{"challengeId":"01-user-orders-missing-index","participantName":"Ada","sql":"SELECT * FROM orders WHERE user_id = 42 ORDER BY created_at DESC LIMIT 20"}'

curl http://localhost:3000/api/submissions/<submissionId>

curl 'http://localhost:3000/api/challenges/01-user-orders-missing-index/leaderboard'
```

See [Server API](docs/server-api.md) for the endpoint contract, SQL safety
rules, environment variables, and leaderboard ranking.

## Challenge Catalog

The catalog contains 13 PostgreSQL optimization challenges covering missing
indexes, low selectivity, expression indexes, correlated subqueries,
over-joining, bad pagination, JSONB scans, sort spills, CTE materialization,
window overuse, N+1-style query shape, stale statistics, and a cumulative
marketplace operations dashboard boss fight after the first 12 challenges.

## Advanced Variants

Some challenges also include additive advanced variants under
`variants/advanced/`. They keep the original challenge IDs and baselines intact,
but use `SEED_SCALE=medium` skew profiles and committed
`recorded-plan.medium.txt` reference plans.

Run one explicitly:

```bash
make seed SEED_SCALE=medium
make explain-file CHALLENGE=04-offset-pagination VARIANT=advanced \
  SQL=sql/challenges/04-offset-pagination/variants/advanced/baseline.sql
```

Recorded plans are reference artifacts only. They are not generated during
normal challenge execution and exact timings are not correctness criteria.
Regenerate them manually when maintaining the repository:

```bash
make record-plans SCALE=medium
make validate-recorded-plans
```

## Guides

- [How to Read EXPLAIN](docs/how-to-explain.md)
- [Indexing Cheatsheet](docs/indexing-cheatsheet.md)
- [Optimization Workflow](docs/query-optimization-workflow.md)
- [Challenge Authoring Guide](docs/challenge-authoring-guide.md)
- [Data Skew Profiles](docs/data-skew.md)
- [Recorded Plans](docs/recorded-plans.md)
- [Server API](docs/server-api.md)
- [Contributor Workflow](docs/contributor-workflow.md)
- [Migration Notes](docs/migration-notes.md)
- [Roadmap](docs/roadmap.md)
