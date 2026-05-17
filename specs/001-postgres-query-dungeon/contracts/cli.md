# CLI Contract: Postgres Query Dungeon

The CLI is the required interface for MVP workflows. REST endpoints may be added
later, but no required workflow may depend on REST.

## Global Options

- `--database-url <url>`: override `DATABASE_URL`
- `--scale <small|medium|large>`: override `SEED_SCALE`
- `--timeout-ms <number>`: per-query timeout; defaults to a safe local value
- `--json`: emit machine-readable output where supported

## Commands

### `dungeon list`

Lists registered challenges.

Output fields:

- `id`
- `title`
- `difficulty`
- `antiPatternTags`
- `planSymptoms`

### `dungeon run <challenge-id> [--variant bad|solution]`

Runs a challenge query and prints the result. Default variant is `bad`.

Requirements:

- Reads SQL from `sql/challenges/<id>/bad.sql` or `solution.sql`.
- Refuses unknown challenge IDs.
- Applies the configured statement timeout.
- Reports whether the database appears seeded.

### `dungeon explain <challenge-id> [--variant bad|solution]`

Runs `EXPLAIN (ANALYZE, BUFFERS)` for a challenge variant.

Requirements:

- Prints raw plan text.
- Supports `--json` with parsed planning time, execution time, row counts, and
  buffer fields where parser support is available.
- Must not apply solution migrations implicitly.

### `dungeon benchmark <challenge-id> [--iterations <n>]`

Runs repeatable before/after measurements for a challenge.

Requirements:

- Measures bad and solution variants separately.
- Reports latency, rows, buffers, planning time, and execution time.
- Warns that absolute timings vary by machine.
- Uses the same seed scale for both variants.

### `dungeon compare <challenge-id>`

Compares bad and solution results for deterministic equality.

Requirements:

- Uses challenge expected-result rules for ordering/ties/null handling.
- Fails with a clear message when result sets differ.
- Does not treat faster runtime as correctness.

### `dungeon apply-solution <challenge-id>`

Applies the solution SQL/migration for a challenge.

Requirements:

- Runs only `sql/challenges/<id>/solution.sql`.
- Records enough state for reset detection.
- Does not modify `bad.sql`.

### `dungeon reset-solutions [challenge-id]`

Restores the baseline state by dropping solution-only indexes or recreating the
database from schema and seed scripts.

Requirements:

- Supports resetting one challenge or all challenges.
- Preserves the selected seed scale unless full reseed is requested.
- Leaves bad baseline SQL intact.

## Makefile Command Mapping

- `make setup`: install dependencies and start Docker Compose
- `make seed SEED_SCALE=small|medium|large`: create schema and seed data
- `make run CHALLENGE=<id>`: delegate to `dungeon run`
- `make explain CHALLENGE=<id>`: delegate to `dungeon explain`
- `make benchmark CHALLENGE=<id>`: delegate to `dungeon benchmark`
- `make compare CHALLENGE=<id>`: delegate to `dungeon compare`
- `make reset-solutions`: delegate to `dungeon reset-solutions`

## Error Contract

CLI errors must include:

- short error code
- human-readable message
- suggested next command when recovery is obvious

Required error classes:

- unknown challenge ID
- database unavailable
- database not seeded
- invalid seed scale
- query timeout
- solution already applied
- result mismatch
