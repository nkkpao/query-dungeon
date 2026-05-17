# Quickstart: Postgres Query Dungeon

This project is intentionally inefficient by design. The slow queries are the
training material. Do not use this repository as a production template.

## Prerequisites

- Docker and Docker Compose
- Node.js 20+
- Make

## 1. Install and Start

```bash
make setup
```

Expected result:

- Node dependencies are installed.
- PostgreSQL 16+ starts through Docker Compose.
- The CLI can connect through `DATABASE_URL`.

## 2. Seed Data

```bash
make seed SEED_SCALE=small
```

Scale options:

- `small`: smoke tests and constrained laptops
- `medium`: default learning scale, about 1-5 million total rows
- `large`: opt-in heavier local run

The seed data models a marketplace with users, products, categories, orders,
order_items, payments, reviews, inventory_movements, user_events, and
support_tickets. Data includes skew for popular products, active users,
seasonality, and uneven categories.

## 3. List Challenges

```bash
npx tsx src/cli/index.ts list
```

MVP challenges:

1. User orders without index
2. Sales report with over-joining
3. Latest payment correlated subquery
4. Large table OFFSET pagination
5. Case-insensitive email lookup
6. JSONB filter without GIN
7. COUNT DISTINCT over big join
8. Latest user events
9. Unpaid orders partial index
10. Window function overuse
11. Inventory aggregation mistake
12. Marketplace dashboard boss fight

## 4. Run a Bad Query

```bash
make run CHALLENGE=01-user-orders-missing-index
```

The command runs `sql/challenges/<id>/bad.sql`. Bad SQL must answer a meaningful
business question even when it is deliberately inefficient.

## 5. Capture EXPLAIN

```bash
make explain CHALLENGE=01-user-orders-missing-index
```

This runs `EXPLAIN (ANALYZE, BUFFERS)` for the bad query and prints the plan.
Look for plan symptoms such as seq scan, nested loop, sort spill, hash join, and
bitmap scan.

## 6. Compare Correctness

```bash
make compare CHALLENGE=01-user-orders-missing-index
```

The comparison checks that bad and optimized variants return equivalent results.
Faster is not accepted unless the answer remains correct.

## 7. Benchmark Before and After

```bash
make benchmark CHALLENGE=01-user-orders-missing-index
```

Benchmark output must include latency, rows, buffers, planning time, and
execution time for baseline and optimized variants. Absolute timings vary by
machine; compare before/after on the same seed scale.

## 8. Reset Solutions

```bash
make reset-solutions
```

This restores the intentionally bad baseline state so the quest can be replayed.

## Safety

- Use `SEED_SCALE=small` first on constrained laptops.
- CLI commands enforce a statement timeout.
- `large` scale is opt-in.
- Solution SQL is separate from bad SQL and must not be applied implicitly.
