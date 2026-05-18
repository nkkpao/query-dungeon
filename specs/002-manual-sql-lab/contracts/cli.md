# CLI Contract: Hands-on SQL Optimization Lab

The CLI is the required interface for the lab workflow. Commands must keep raw
SQL visible and learner-selected. Default commands must not reveal, apply, or
benchmark suggested solution SQL.

## Global Options

- `--database-url <url>`: override `DATABASE_URL`
- `--scale <small|medium|large>`: seed scale label used in output
- `--timeout-ms <number>`: per-query statement timeout
- `--json`: emit machine-readable output where supported

## Default Commands

### `dungeon list`

Lists available challenges.

Output fields:

- `id`
- `title`
- `difficulty`
- `antiPatternTags`
- `planSymptoms`
- `challengePath`

Must not output optional solution paths.

### `dungeon run-sql <challenge-id> --file <path>`

Runs a participant-selected SQL file and prints result rows.

Requirements:

- Accepts baseline files and participant files, including files under
  `workspace/sql/`.
- Refuses unknown challenge IDs.
- Applies the configured statement timeout.
- Reports whether the database appears seeded.
- Does not read optional suggested solution files.

### `dungeon explain-file <challenge-id> --file <path>`

Runs `EXPLAIN (ANALYZE, BUFFERS)` for a participant-selected SQL file.

Requirements:

- Prints raw plan text by default.
- Supports `--json` with parsed planning time, execution time, row count, and
  buffer fields where parser support is available.
- Does not substitute baseline or suggested solution SQL.
- Does not apply suggested indexes.

### `dungeon benchmark-file <challenge-id> --file <path> [--baseline] [--iterations <n>]`

Benchmarks a participant-selected SQL file.

Requirements:

- Measures the selected file independently.
- When `--baseline` is provided, also benchmarks `baseline.sql` for the same
  challenge.
- Reports latency, rows, buffers, planning time, and execution time.
- Warns that absolute timings vary by machine.
- Does not include suggested solution metrics.

### `dungeon validate-file <challenge-id> --file <path>`

Validates a participant-selected SQL file against `expected-result.json`.

Requirements:

- Normalizes rows according to the expected-result contract.
- Fails with a clear message when columns, rows, values, order-sensitive output,
  or numeric tolerances do not match.
- Does not reveal suggested solution SQL.
- Does not treat faster runtime as correctness.

### `dungeon diff-results <challenge-id> --left <path> --right <path>`

Compares result sets from two participant-selected SQL files.

Requirements:

- Shows whether normalized outputs are equal.
- Reports missing, extra, or changed rows in a concise format.
- Supports `--json`.
- Does not require either side to be the suggested solution.

## Explicit Opt-in Commands

### `dungeon compare-with-suggested-solution <challenge-id> --file <path> [--benchmark] [--show-sql]`

Compares a participant-selected SQL file with suggested solution behavior.

Requirements:

- Must display a warning before suggested solution material is read.
- Must require an explicit command name; it cannot be reached through default
  run, explain, benchmark, validate, diff, README, or Makefile paths.
- Uses files under `sql/challenges/<id>/optional/`.
- `--show-sql` is required before printing suggested solution SQL.
- `--benchmark` may compare participant, baseline, and suggested solution
  measurements only after opt-in.

## Deprecated or Removed Commands

These commands must be removed from the default workflow or retained only as
clearly labeled optional examples that do not reveal suggested solutions by
default:

- `dungeon run <challenge-id> --variant solution`
- `dungeon explain <challenge-id> --variant solution`
- `dungeon benchmark <challenge-id>` that automatically runs bad versus solution
- `dungeon compare <challenge-id>` that automatically compares bad and solution
- `dungeon apply-solution <challenge-id>`
- `dungeon reset-solutions` if it only supports the old apply-solution state

## Makefile Command Mapping

- `make setup`: install dependencies, build, and start Docker Compose
- `make seed SEED_SCALE=small|medium|large`: create schema and seed data
- `make run-sql CHALLENGE=<id> SQL=<path>`: delegate to `dungeon run-sql`
- `make explain-file CHALLENGE=<id> SQL=<path>`: delegate to `dungeon explain-file`
- `make benchmark-file CHALLENGE=<id> SQL=<path>`: delegate to `dungeon benchmark-file --baseline`
- `make validate-file CHALLENGE=<id> SQL=<path>`: delegate to `dungeon validate-file`
- `make diff-results CHALLENGE=<id> LEFT=<path> RIGHT=<path>`: delegate to `dungeon diff-results`
- `make compare-with-suggested-solution CHALLENGE=<id> SQL=<path>`: explicit opt-in only
- `make reset`: restore schema and selected seed scale

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
- SQL file not found
- SQL file is empty
- query timeout
- invalid expected-result fixture
- result mismatch
- solution access requires explicit opt-in
