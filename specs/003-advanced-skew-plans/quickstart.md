# Quickstart: Advanced Skew Plans

## Normal Smoke Workflow

Use the small scale for quick checks and CI-style feedback:

```sh
npm install
npm run build
docker compose up -d
SEED_SCALE=small make seed
npm test
```

This workflow validates normal challenge integrity and lightweight advanced
variant file contracts. It must not regenerate medium-scale recorded plans.

## Manual Medium-Scale Recorded Plan Regeneration

Maintainers regenerate committed plan artifacts explicitly:

```sh
docker compose up -d
SEED_SCALE=medium make seed
make record-plans SCALE=medium
```

Equivalent npm flow:

```sh
npm run record-plans -- --scale medium
```

The command writes `recorded-plan.medium.txt` files under advanced variant
directories. Review structural planner symptoms, not exact timings.

## Advanced Variant Learner Flow

1. Read the advanced challenge material:

   ```text
   sql/challenges/<challenge-id>/variants/advanced/challenge.md
   sql/challenges/<challenge-id>/variants/advanced/data-profile.md
   sql/challenges/<challenge-id>/variants/advanced/hints.md
   ```

2. Load medium data when investigating recorded-plan-scale behavior:

   ```sh
   SEED_SCALE=medium make seed
   ```

3. Run and explain the baseline or your own SQL:

   ```sh
   npm run explain-file -- <challenge-id> --variant advanced --file workspace/sql/my-attempt.sql --scale medium
   npm run benchmark-file -- <challenge-id> --variant advanced --file workspace/sql/my-attempt.sql --scale medium
   npm run validate-file -- <challenge-id> --variant advanced --file workspace/sql/my-attempt.sql --scale medium
   ```

4. Consult `recorded-plan.medium.txt` only as reference after your own
   investigation.

5. Use optional official solution files only when deliberately comparing after
   attempting the challenge.

## Expected Initial Variants

- `sql/challenges/04-offset-pagination/variants/advanced/`: advanced bad
  pagination on skewed events.
- `sql/challenges/12-dashboard-boss-fight/variants/advanced/`: advanced
  dashboard query with hot products and `order_items` skew.
- `sql/challenges/06-jsonb-filter-gin-index/variants/advanced/`: advanced
  JSONB/event filtering with skewed event types.
