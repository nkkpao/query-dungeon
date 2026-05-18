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

## Challenge Catalog

The catalog contains 12 PostgreSQL optimization challenges covering missing
indexes, low selectivity, expression indexes, correlated subqueries,
over-joining, bad pagination, JSONB scans, sort spills, CTE materialization,
window overuse, N+1-style query shape, and stale statistics.

## Guides

- [How to Read EXPLAIN](docs/how-to-explain.md)
- [Indexing Cheatsheet](docs/indexing-cheatsheet.md)
- [Optimization Workflow](docs/query-optimization-workflow.md)
- [Challenge Authoring Guide](docs/challenge-authoring-guide.md)
- [Contributor Workflow](docs/contributor-workflow.md)
- [Migration Notes](docs/migration-notes.md)
- [Roadmap](docs/roadmap.md)
