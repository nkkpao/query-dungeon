# Data Model: Hands-on SQL Optimization Lab

## Challenge

Represents one optimization exercise.

**Fields**:

- `id`: stable unique directory name, e.g. `01-user-orders-missing-index`
- `title`: learner-facing title
- `difficulty`: `easy`, `medium`, `hard`, or `boss`
- `antiPatternTags`: learning objective tags
- `planSymptoms`: expected baseline symptoms learners should be able to observe
- `challengePath`: `sql/challenges/<id>/challenge.md`
- `baselineSqlPath`: `sql/challenges/<id>/baseline.sql`
- `expectedResultPath`: `sql/challenges/<id>/expected-result.json`
- `hintsPath`: `sql/challenges/<id>/hints/hints.md`
- `hintsRuPath`: `sql/challenges/<id>/hints/hints_RU.md`
- `optionalSolutionSqlPath`: `sql/challenges/<id>/optional/official-solution.sql`
- `optionalIndexesSqlPath`: `sql/challenges/<id>/optional/official-indexes.sql`
- `optionalBaselineExplainPath`: `sql/challenges/<id>/optional/baseline-explain.txt`

**Validation rules**:

- Challenge IDs are unique and match directory names.
- Learner-facing paths must exist for every challenge.
- Optional solution paths must never be read by default learner commands.
- Baseline SQL must be executable against the baseline schema and seed data.

## Challenge Document

Learner-facing markdown for one challenge.

**Fields**:

- `problemStatement`
- `businessContext`
- `expectedOutputShape`
- `performanceSymptoms`
- `constraints`
- `manualWorkflow`
- `solutionAccessNotice`

**Validation rules**:

- Must not include official optimized SQL.
- Must not link the default path to official solution replay.
- Must explain how to run baseline SQL, inspect plans, test hypotheses, and
  validate correctness manually.

## Baseline SQL

The intentionally inefficient starting query.

**Fields**:

- `challengeId`
- `sqlText`
- `expectedReadOnlyResult`: true for query files used in validation and
  benchmarking

**Validation rules**:

- Must remain separate from optional official solution files.
- Must not include solution-only indexes or optimized rewrites.
- Must be runnable through the same file-based CLI commands as participant SQL.

## Expected Result

JSON correctness contract for a challenge.

**Fields**:

- `columns`: ordered list of expected output fields
- `rows`: expected rows for deterministic validation
- `orderSensitive`: whether row order is part of correctness
- `numericTolerance`: optional tolerance for numeric comparisons
- `normalization`: rules for timestamps, numeric strings, nulls, and ordering

**Validation rules**:

- Participant SQL passes only when its normalized output matches the fixture.
- Faster runtime never compensates for incorrect output.
- The fixture must be generated from known-correct challenge behavior and kept
  under version control.

## Hint Set

Graduated learner guidance.

**Fields**:

- `levels`: ordered hints from broad symptom checks to narrower investigation
  prompts
- `noSolutionLeak`: true

**Validation rules**:

- Hints may mention plan symptoms, data distributions, or PostgreSQL concepts.
- Hints must not reveal the final official SQL or complete index set.

## Participant SQL File

Learner-authored SQL used by file-based CLI commands.

**Fields**:

- `path`: usually under `workspace/sql/`
- `challengeId`: provided by CLI argument
- `purpose`: run, explain, benchmark, validate, or diff
- `statements`: one or more SQL statements, depending on command mode

**Validation rules**:

- File must be readable and explicitly selected by the participant.
- Validation commands compare the final result-producing statement to
  `expected-result.json`.
- Commands must report malformed SQL, timeouts, and missing files clearly.

## Participant Index File

Learner-authored SQL for manual schema experiments.

**Fields**:

- `path`: usually under `workspace/indexes/`
- `challengeId`: documented by learner naming or notes
- `statements`: index creation, index drop, or related PostgreSQL setup

**Validation rules**:

- Index files are run only when explicitly selected by the participant.
- Index changes are not treated as official solutions.
- Learners must be able to reset or drop manual indexes during experimentation.

## Scratchpad

Learner-owned experimentation area.

**Fields**:

- `sqlDirectory`: `workspace/sql/`
- `indexDirectory`: `workspace/indexes/`
- `notesDirectory`: `workspace/notes/`
- `resetGuidance`: documented recovery workflow

**Validation rules**:

- Scratchpad contents are not official challenge artifacts.
- Scratchpad files can be rerun repeatedly.
- Documentation encourages notes that record hypothesis, plan evidence, and
  benchmark outcome.

## Benchmark Result

Measurement for selected SQL.

**Fields**:

- `challengeId`
- `label`: baseline, participant label, or explicit official comparison label
- `sqlPath`
- `seedScale`
- `iterations`
- `latencyMs`
- `planningTimeMs`
- `executionTimeMs`
- `rows`
- `sharedHitBlocks`
- `sharedReadBlocks`
- `tempReadBlocks`
- `tempWrittenBlocks`

**Validation rules**:

- Default benchmark output must not include official solution metrics.
- Baseline comparison is allowed by default.
- Suggested solution comparison requires explicit opt-in.

## Official Solution

Reference material outside the active challenge flow.

**Fields**:

- `officialSolutionSqlPath`
- `officialIndexesSqlPath`
- `officialExplainPath`
- `tradeOffNotes`
- `accessMode`: explicit opt-in only

**Validation rules**:

- Must remain separate from baseline and participant files.
- Default commands must not read these files.
- Explicit comparison commands must warn that suggested solutions are being used.
