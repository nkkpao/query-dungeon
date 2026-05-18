# Implementation Plan: Hands-on SQL Optimization Lab

**Branch**: `002-manual-sql-lab` | **Date**: 2026-05-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-manual-sql-lab/spec.md`

## Summary

Refactor Postgres Query Dungeon from a demonstration-oriented CLI into a
hands-on SQL optimization lab. Preserve existing datasets, bad queries,
PostgreSQL Docker workflow, explain parsing, result comparison, and benchmark
measurement helpers, but reorganize challenge assets and CLI commands so
learners run and improve their own SQL files. Suggested solutions remain
available only through explicit opt-in flows outside the default README and
challenge path.

The refactor is incremental: first freeze the baseline learning contract and
workspace, then migrate challenge files, then replace solution-driven commands
with file-based learner commands, then downgrade old auto-demo flows to optional
examples or remove them, and finally update documentation and tests around the
manual investigation workflow.

## Technical Context

**Language/Version**: TypeScript on Node.js 20+  
**Primary Dependencies**: commander, node-postgres (`pg`), dotenv, Vitest,
Docker Compose, Makefile  
**Storage**: PostgreSQL 16+ via Docker Compose; raw SQL and JSON files under
`sql/` and `workspace/` are the source of truth for challenges and learner
experiments  
**Testing**: Vitest unit and integration tests for challenge contracts, CLI
command behavior, result normalization, explain parsing, benchmark output, and
solution-gating policy  
**Target Platform**: Local developer machine with Docker, Node.js, and shell
access  
**Project Type**: CLI-first local training lab  
**Performance Goals**: Baseline challenge symptoms remain measurable on the
supported seed profiles; learner SQL validation completes in under 30 seconds
on the smallest dataset; benchmark-file reports latency and plan metrics for
participant SQL independently of suggested solutions; every challenge supports
at least three repeated participant-SQL benchmark attempts with optional
baseline comparison and no suggested solution execution  
**Constraints**: Preserve existing seed datasets and bad-query intent; do not
show, apply, benchmark, or compare suggested solutions in default commands; keep
raw SQL directly visible and editable; support iterative scratchpad SQL and
manual indexes; default CLI registration must not include solution variants,
apply-solution, reset-solutions, or automatic bad-versus-solution benchmark or
compare commands  
**Scale/Scope**: Existing 12 marketplace challenges, `small|medium|large` seed
profiles, one participant workspace with `/workspace/sql/`,
`/workspace/indexes/`, and `/workspace/notes/`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Intentional slowness**: PASS. Existing bad queries and datasets remain the
  baseline learning artifacts. Each migrated challenge keeps measurable
  symptoms in `challenge.md`, `baseline.sql`, and maintainer baseline plan
  evidence.
- **Scenario contract**: PASS. Each challenge is planned to contain
  `challenge.md`, `baseline.sql`, `expected-result.json`, `hints/hints.md`,
  `hints/hints_RU.md`, and
  `optional/suggested-solution.sql`, `optional/suggested-indexes.sql`, and
  `optional/baseline-explain.txt`.
- **PostgreSQL-first scope**: PASS. The learner workflow centers on SQL files,
  `EXPLAIN (ANALYZE, BUFFERS)`, manual indexes, result validation, and
  benchmarks. Automatic optimization suggestions, generated indexes, and
  AI-assisted rewriting are explicitly out of scope.
- **Docker Compose reproducibility**: PASS. Existing Docker Compose, seed, and
  reset workflows remain. Makefile targets are updated to setup, seed, run SQL,
  explain participant files, benchmark participant files, validate participant
  files, diff participant results, and optionally compare with suggested
  solution.
- **Correctness and evidence**: PASS with lab-specific exposure rules.
  Correctness checks compare learner SQL to `expected-result.json`; benchmark
  evidence measures learner SQL against baseline by default. Suggested before/
  after comparison exists only in opt-in solution comparison paths.
- **Analyze remediation gate**: PASS. Implementation must add guardrail tests
  that fail while default CLI, README, Makefile, registry, benchmark, or
  validation code can expose, execute, or compare suggested solutions without
  the explicit solution-comparison command.
- **Trade-off review**: PASS. Suggested solution artifacts remain separate and
  include trade-off notes in optional solution documentation or challenge
  metadata; learners do not see these through default commands.

**Post-design re-check**: PASS. The research, data model, CLI contract, and
quickstart preserve reproducible bad baselines, PostgreSQL-first manual work,
isolated suggested solutions, learner-owned scratchpad files, correctness
validation, and benchmark evidence without default solution replay.

## Project Structure

### Documentation (this feature)

```text
specs/002-manual-sql-lab/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── cli.md
└── tasks.md
```

### Source Code (repository root)

```text
docker-compose.yml
Makefile
README.md
README_RU.md
package.json
tsconfig.json
vitest.config.ts

workspace/
├── sql/
│   └── .gitkeep
├── indexes/
│   └── .gitkeep
└── notes/
    └── .gitkeep

sql/
├── schema/
│   ├── 001_tables.sql
│   ├── 002_baseline_indexes.sql
│   └── 003_solution_state.sql          # remove or retain only for optional legacy examples
├── seeds/
│   ├── 000_reset.sql
│   ├── 001_seed_small.sql
│   ├── 002_seed_medium.sql
│   └── 003_seed_large.sql
└── challenges/
    ├── 01-user-orders-missing-index/
    │   ├── challenge.md                # replaces learner-facing README.md
    │   ├── challenge_RU.md
    │   ├── baseline.sql                # renamed from bad.sql
    │   ├── expected-result.json        # replaces executable expected.sql for validation contract
    │   ├── hints/
    │   │   ├── hints.md
    │   │   └── hints_RU.md
    │   └── optional/
    │       ├── suggested-solution.sql
    │       ├── suggested-indexes.sql
    │       └── baseline-explain.txt
    └── ...

src/
├── cli/
│   ├── index.ts
│   ├── options.ts
│   ├── query-loader.ts
│   └── commands/
│       ├── list.ts
│       ├── seed.ts
│       ├── run-sql.ts
│       ├── explain-file.ts
│       ├── benchmark-file.ts
│       ├── validate-file.ts
│       ├── diff-results.ts
│       └── compare-with-suggested-solution.ts
├── challenges/
│   ├── registry.ts
│   └── types.ts
└── db/
    ├── benchmark.ts
    ├── connection.ts
    ├── explain.ts
    └── sql-files.ts

tests/
├── challenge-files.test.ts
├── challenge-registry.test.ts
├── cli-smoke.test.ts
├── manual-workflow.test.ts
├── suggested-solution-gating.test.ts
├── result-validation.test.ts
├── benchmark-output.test.ts
├── explain-parser.test.ts
└── seed-scale.test.ts
```

**Structure Decision**: Keep the existing single TypeScript CLI project and
SQL-first challenge layout. Migrate challenge assets in place under
`sql/challenges/<id>/` to minimize disruption and preserve datasets, while
moving participant experiments into top-level `workspace/` so learner files are
never confused with suggested artifacts.

## Incremental Refactor Sequence

1. **Protect existing training data**: Add tests that snapshot the existing
   challenge IDs, seed files, baseline index policy, and bad query presence
   before any file migration.
2. **Introduce workspace**: Add `/workspace/sql/`, `/workspace/indexes/`, and
   `/workspace/notes/` with README or placeholder files and documentation that
   learner files are safe to edit.
3. **Migrate challenge contract**: For each challenge, rename or copy
   `README.md` to `challenge.md`, `bad.sql` to `baseline.sql`, convert
   `expected.sql` into `expected-result.json`, split `solution.sql` into
   `optional/suggested-solution.sql` and `optional/suggested-indexes.sql`, and
   move `baseline-plan.txt` to `optional/baseline-explain.txt` only if it
   contains solution-revealing plan evidence.
4. **Update registry and loaders**: Replace `QueryVariant`-driven loading with
   explicit baseline, expected result, hints, and optional suggested solution
   paths. Add generic participant SQL file loading with path validation.
5. **Replace default CLI flow**: Remove solution variants from `run` and
   `explain`; add `run-sql`, `explain-file`, `benchmark-file`,
   `validate-file`, and `diff-results`.
6. **Gate suggested comparison**: Remove `apply-solution` and old automatic
   bad-versus-solution benchmark/compare defaults, or reintroduce them only as
   `compare-with-suggested-solution` with explicit warning and opt-in behavior.
7. **Preserve reusable infrastructure**: Reuse connection handling, seed
   checks, explain parsing, benchmark timing, row normalization, and timeout
   handling behind the new file-based commands.
8. **Update Makefile and docs**: Make the default path teach investigation:
   read challenge, run baseline manually, run `EXPLAIN ANALYZE`, create SQL or
   index hypotheses in workspace files, benchmark, validate, and optionally
   reveal/compare the suggested solution.
9. **Add regression tests**: Verify no default command reads optional solution
   files, default README paths do not link to suggested solution replay, and
   participant SQL files work across run, explain, benchmark, validate, and
   diff workflows.
10. **Prove every challenge remains iterative**: Run repeated participant-SQL
    benchmarks and fixture-based validation for every challenge baseline and at
    least one workspace SQL attempt, without executing suggested solutions.

## Analyze Findings Resolved

| Finding | Why It Harms Hands-on Learning | Chosen Fix |
|---------|--------------------------------|------------|
| C1: Default CLI registers solution commands | Learners can apply or replay the answer instead of investigating plans. | Make solution commands absent from default registration; only explicit solution comparison may access optional files. |
| C2: README and Makefile guide solution replay | The first path teaches demonstration replay rather than performance engineering practice. | Rewrite default docs and Makefile around baseline, explain, workspace experiments, validation, and benchmark-file. |
| C3: Registry treats solutions as active metadata | Solution paths and index names become normal challenge data instead of gated reference artifacts. | Replace variant metadata with baseline, expected-result, hints, and optional suggested paths. |
| C4: Benchmark auto-runs suggested solution | Benchmarking becomes an answer reveal instead of iterative hypothesis testing. | Benchmark participant SQL and optional baseline by default; suggested benchmark only behind explicit solution comparison. |
| C5: Validation executes suggested solution | Correctness checks depend on the answer and can leak solution behavior. | Validate participant SQL against deterministic expected-result fixtures only. |
| C6: Run/explain cannot accept arbitrary SQL | Learners cannot practice with their own hypotheses. | Add file-based run and explain commands for participant-selected SQL. |
| C7: Docs still say compare bad and solution | Workflow language reduces exploration and skips manual tuning loops. | Rewrite workflow docs around EXPLAIN ANALYZE, hypotheses, scratch files, validation, and benchmark iteration. |
| C8: Benchmark coverage sampled challenges only | Success criteria require every challenge to support repeated benchmark attempts. | Add all-challenge repeated benchmark regression coverage. |

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
