# Contributor Workflow

Use the same loop learners use before changing challenge behavior.

1. Build and seed:

   ```bash
   npm run build
   make seed SEED_SCALE=small
   ```

2. Run the baseline:

   ```bash
   make run-sql CHALLENGE=01-user-orders-missing-index \
     SQL=sql/challenges/01-user-orders-missing-index/baseline.sql
   ```

3. Capture a plan with `explain-file`.
4. Put experiments in `workspace/sql/` and `workspace/indexes/`.
5. Validate with `validate-file`.
6. Benchmark with `benchmark-file --baseline --iterations 3`.
7. Run tests:

   ```bash
   npm test
   npm run build
   ```

Before opening a change, search for accidental solution exposure in README,
docs, Makefile, package scripts, CLI registration, registry metadata, and
learner-facing challenge files.
