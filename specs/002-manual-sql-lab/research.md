# Research: Hands-on SQL Optimization Lab

## Decision: Keep the TypeScript CLI and PostgreSQL Docker foundation

**Rationale**: The existing project already has a working Node.js CLI,
PostgreSQL connection handling, Docker Compose setup, seed scripts, explain
parsing, and benchmark helpers. The refactor goal is behavioral: stop solving
the lab for learners and make participant SQL files first-class. Reusing the
current foundation reduces risk and keeps the migration incremental.

**Alternatives considered**:

- Replace the CLI with shell-only scripts: rejected because existing tests and
  reusable validation/benchmark code would be lost.
- Add a web UI: rejected as out of scope and likely to hide raw SQL behind an
  abstraction.
- Rewrite the project around a new framework: rejected because it does not
  advance the training philosophy.

## Decision: Migrate challenge artifacts in place

**Rationale**: Existing challenge directories already map to the 12 training
scenarios and contain bad queries, expected checks, baseline plans, and
solutions. Renaming and reorganizing files in place preserves discoverability,
history, and test coverage while making the learner-facing contract explicit.

**Alternatives considered**:

- Create a parallel `labs/` directory: rejected because duplicate challenge
  trees would drift.
- Leave current names and rely on documentation: rejected because `bad.sql` and
  `solution.sql` in the same active path encourage solution replay.

## Decision: Use `expected-result.json` for learner validation contracts

**Rationale**: The learner-facing contract should describe the expected output
shape and rows. Until seeded JSON row fixtures are materialized, executable
fixtures must point at public `baseline.sql` files so validation does not run
hidden suggested solution SQL during every validation.

**Alternatives considered**:

- Keep only `expected.sql`: rejected because it hides part of the expected
  result contract and keeps validation too close to implementation SQL.
- Use Markdown tables: rejected because they are readable but brittle for
  automated equality checks.

## Decision: Add a learner-owned workspace

**Rationale**: `/workspace/sql/`, `/workspace/indexes/`, and `/workspace/notes/`
give participants obvious places to create repeatable experiments. Keeping this
outside `sql/challenges/` prevents learner hypotheses from being mistaken for
official challenge assets.

**Alternatives considered**:

- Ask learners to edit challenge files directly: rejected because it makes reset
  and review harder.
- Store learner attempts in generated temp files only: rejected because it
  discourages deliberate, repeatable experimentation.

## Decision: Replace variant-based commands with file-based commands

**Rationale**: Commands like `run --variant solution`, `explain --variant
solution`, and `benchmark` bad-versus-solution encourage automatic solution
walkthroughs. File-based commands make the learner choose what to run and allow
arbitrary SQL experiments while still preserving seed checks, timeouts, plan
parsing, and benchmark reporting.

**Alternatives considered**:

- Keep variants but default to baseline: rejected because solutions remain one
  flag away in the normal flow.
- Remove helper commands entirely: rejected because validation and repeatable
  benchmarks are part of the lab value.

## Decision: Make official comparison explicit and isolated

**Rationale**: Maintainers and learners who opt in still need reference
solutions, expected plan characteristics, and comparison evidence. A dedicated
`compare-with-official-solution` command makes the boundary visible and
testable, while default commands never read optional solution files.

**Alternatives considered**:

- Delete all official solution access: rejected because maintainers and
  facilitators need reference artifacts.
- Keep `apply-solution`: rejected for the default lab because it mutates the
  challenge state toward the answer rather than encouraging manual practice.

## Decision: Preserve benchmark infrastructure but change benchmark semantics

**Rationale**: Existing benchmark timing and explain parsing are useful. The
semantics must change from official bad-versus-solution demonstration to
participant-file measurement. Default benchmarking compares a learner file to
the baseline only when the learner asks for that comparison; official solution
benchmarks require explicit opt-in.

**Alternatives considered**:

- Benchmark only one file with no baseline support: rejected because learners
  need a reference point for manual improvement.
- Always benchmark official solution too: rejected because it violates the
  hands-on training philosophy.

## Decision: Out-of-scope automation remains absent

**Rationale**: Automatic optimization suggestions, generated indexes, and
AI-assisted query rewrites would move the repository back toward solving
problems for learners. The lab can teach how to inspect plans and test
hypotheses, but it should not generate the hypotheses.

**Alternatives considered**:

- Add hint-driven automatic suggestions: rejected because hints should guide
  investigation without providing the answer.
- Generate index candidates from plans: rejected because manual index design is
  a core learning goal.
