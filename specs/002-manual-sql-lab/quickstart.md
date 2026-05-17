# Quickstart: Hands-on SQL Optimization Lab

This quickstart describes the target workflow for the refactor. The point is to
practice investigation, not replay an official answer.

## 1. Start the local lab

```bash
make setup
make seed SEED_SCALE=small
```

Use `medium` or `large` later when you want stronger performance symptoms.

## 2. Pick a challenge

```bash
npm run dungeon -- list
```

Open the challenge prompt:

```bash
less sql/challenges/01-user-orders-missing-index/challenge.md
```

Read the business context, expected output shape, symptoms, constraints, and
hints before opening any optional material.

## 3. Run the baseline yourself

```bash
npm run dungeon -- run-sql 01-user-orders-missing-index \
  --file sql/challenges/01-user-orders-missing-index/baseline.sql
```

## 4. Inspect the plan

```bash
npm run dungeon -- explain-file 01-user-orders-missing-index \
  --file sql/challenges/01-user-orders-missing-index/baseline.sql
```

Look for the plan symptoms named in the challenge: scan type, join shape,
filters, sort cost, row estimates, buffers, planning time, and execution time.

## 5. Create a hypothesis

Create a scratch SQL file:

```bash
cp sql/challenges/01-user-orders-missing-index/baseline.sql \
  workspace/sql/01-user-orders-attempt-1.sql
```

Edit `workspace/sql/01-user-orders-attempt-1.sql` manually.

For index experiments, create your own index file:

```bash
$EDITOR workspace/indexes/01-user-orders-indexes.sql
```

Run or drop those indexes manually as part of the experiment. Keep notes in
`workspace/notes/01-user-orders.md`.

## 6. Rerun, explain, benchmark, and validate

```bash
npm run dungeon -- run-sql 01-user-orders-missing-index \
  --file workspace/sql/01-user-orders-attempt-1.sql

npm run dungeon -- explain-file 01-user-orders-missing-index \
  --file workspace/sql/01-user-orders-attempt-1.sql

npm run dungeon -- benchmark-file 01-user-orders-missing-index \
  --file workspace/sql/01-user-orders-attempt-1.sql \
  --baseline --iterations 3

npm run dungeon -- validate-file 01-user-orders-missing-index \
  --file workspace/sql/01-user-orders-attempt-1.sql
```

Repeat until the result is correct and the plan evidence supports your
hypothesis.

## 7. Compare your own attempts

```bash
npm run dungeon -- diff-results 01-user-orders-missing-index \
  --left workspace/sql/01-user-orders-attempt-1.sql \
  --right workspace/sql/01-user-orders-attempt-2.sql
```

This compares participant-selected results only. It does not read official
solution files.

## 8. Optional official comparison

Only after you want to leave the exercise flow:

```bash
npm run dungeon -- compare-with-official-solution 01-user-orders-missing-index \
  --file workspace/sql/01-user-orders-attempt-1.sql \
  --benchmark
```

Printing official SQL requires an additional explicit option:

```bash
npm run dungeon -- compare-with-official-solution 01-user-orders-missing-index \
  --file workspace/sql/01-user-orders-attempt-1.sql \
  --show-sql
```

## 9. Reset when needed

```bash
make seed SEED_SCALE=small
```

Use reset/reseed when scratch indexes or schema experiments make comparisons
hard to interpret.
