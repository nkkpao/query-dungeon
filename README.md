# Postgres Query Dungeon

This repository is intentionally inefficient by design. The slow baseline SQL is the training material, not production guidance.

## Quest Path

1. Install dependencies and start PostgreSQL:

   ```bash
   make setup
   ```

2. Load a safe local dataset:

   ```bash
   make seed SEED_SCALE=small
   ```

3. List puzzles:

   ```bash
   npx tsx src/cli/index.ts list
   ```

4. Run the bad baseline for the first puzzle:

   ```bash
   make run CHALLENGE=01-user-orders-missing-index
   ```

5. Read the plan:

   ```bash
   make explain CHALLENGE=01-user-orders-missing-index
   ```

6. Compare correctness and benchmark before/after:

   ```bash
   make compare CHALLENGE=01-user-orders-missing-index
   make benchmark CHALLENGE=01-user-orders-missing-index
   ```

7. Apply and replay reference solutions:

   ```bash
   make apply-solution CHALLENGE=01-user-orders-missing-index
   make reset-solutions
   ```

Use `SEED_SCALE=small` first. `medium` targets the full learning shape, and `large` is opt-in for stronger local plan symptoms. Absolute timings vary by machine; compare bad and solution variants on the same seed.

## Challenge Catalog

The catalog contains 12 PostgreSQL optimization puzzles covering missing indexes, low selectivity, expression indexes, correlated subqueries, over-joining, bad pagination, JSONB scans, sort spills, CTE materialization, window overuse, N+1-style query shape, and stale statistics.

## Guides

- [How to Read EXPLAIN](docs/how-to-explain.md)
- [Indexing Cheatsheet](docs/indexing-cheatsheet.md)
- [Optimization Workflow](docs/query-optimization-workflow.md)
- [Roadmap](docs/roadmap.md)
