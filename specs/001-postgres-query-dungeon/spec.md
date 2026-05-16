# Feature Specification: Postgres Query Dungeon

**Feature Branch**: `001-postgres-query-dungeon`  
**Created**: 2026-05-17  
**Status**: Draft  
**Input**: User description: "Создай учебный проект \"Postgres Query Dungeon\" — локальный репозиторий с backend-приложением и PostgreSQL, где есть набор намеренно плохих SQL-запросов для тренировки оптимизации."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Start a Local Training Lab (Priority: P1)

As a developer learner, I want to start the whole training environment locally,
load a large synthetic dataset, and run the first inefficient query so that I
can practice PostgreSQL query analysis without external services.

**Why this priority**: The project has no learning value unless a learner can
reproduce the database, data, and bad baseline on their own machine.

**Independent Test**: A fresh checkout can complete setup, seed data, run one
scenario, and show the expected result plus a baseline plan from documented
commands.

**Acceptance Scenarios**:

1. **Given** a fresh local checkout, **When** the learner runs the setup and seed
   commands, **Then** the database environment starts and deterministic training
   data is loaded.
2. **Given** seeded data, **When** the learner runs the first scenario, **Then**
   the intentionally bad query returns the documented expected result.
3. **Given** the first scenario, **When** the learner asks for the baseline plan,
   **Then** the project prints or stores a reproducible `EXPLAIN (ANALYZE, BUFFERS)`
   output.

---

### User Story 2 - Complete Optimization Puzzles (Priority: P1)

As a developer learner, I want at least 12 guided query optimization puzzles so
that I can practice recognizing common plan symptoms and choosing appropriate
SQL rewrites or indexes.

**Why this priority**: The core product is the puzzle catalog; breadth is needed
to cover the plan patterns and index families in the learning goal.

**Independent Test**: The scenario list contains at least 12 runnable puzzles,
and each puzzle includes its business story, bad SQL, runner command, expected
result, reproducible baseline plan, hints, reference solution, and reference
index migration.

**Acceptance Scenarios**:

1. **Given** the scenario catalog, **When** the learner lists available puzzles,
   **Then** at least 12 named puzzles are shown.
2. **Given** any puzzle, **When** the learner opens its materials, **Then** they
   can see the business story, intentionally bad SQL, expected result, hints,
   and solution documentation.
3. **Given** any puzzle, **When** the learner runs the puzzle command, **Then**
   the command executes the bad query against the seeded dataset and reports the
   result in a comparable form.

---

### User Story 3 - Measure Before and After Improvements (Priority: P1)

As a developer learner, I want to compare the baseline query with a reference
optimization so that I can explain improvements in latency, rows processed,
buffers, planning time, and execution time.

**Why this priority**: Optimization practice must be evidence-driven; learners
need to prove that a faster version is also correct and understand the trade-off.

**Independent Test**: For every puzzle, automated checks prove that the bad and
optimized queries return the same result, and benchmark output compares both
versions using the same dataset.

**Acceptance Scenarios**:

1. **Given** a selected puzzle, **When** the learner runs the correctness check,
   **Then** the bad query and optimized query produce equivalent results.
2. **Given** a selected puzzle, **When** the learner runs the benchmark command,
   **Then** the output includes before/after latency and plan evidence.
3. **Given** a selected solution, **When** the learner reads the solution notes,
   **Then** the trade-offs of the optimization are explained.

---

### User Story 4 - Reset and Replay the Quest (Priority: P2)

As a learner or workshop facilitator, I want to reset reference optimizations and
replay scenarios so that the same repository can be used repeatedly for practice.

**Why this priority**: Reusable exercises make the project suitable for solo
practice, workshops, and code review drills.

**Independent Test**: Applying solutions, running comparisons, resetting
solutions, and rerunning baselines returns the project to the intentionally slow
starting state.

**Acceptance Scenarios**:

1. **Given** reference optimizations have been applied, **When** the learner runs
   the reset command, **Then** the bad starting state is restored without
   changing seed data.
2. **Given** the reset state, **When** the learner reruns a baseline scenario,
   **Then** the same expected result and comparable slow plan symptoms appear.

### Edge Cases

- Seed generation is interrupted and rerun; the final dataset remains valid and
  deterministic.
- A learner runs a puzzle before seeding; the project explains the missing setup
  step and does not present misleading benchmark data.
- A reference optimization has already been applied; baseline commands identify
  that the starting state is no longer clean or reset it through the documented
  workflow.
- Different local machines produce different absolute timings; success criteria
  rely on comparable before/after evidence and plan symptoms rather than one
  universal millisecond value.
- A query result contains ties, date boundaries, or nullable values; expected
  results define deterministic ordering and comparison rules.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The project MUST provide a local command that starts the complete
  training environment with PostgreSQL available to scenario runners.
- **FR-002**: The project MUST provide deterministic commands for setup, seed,
  run, explain, benchmark, and resetting reference optimizations.
- **FR-003**: The project MUST generate or load a large synthetic dataset that is
  sufficient to make inefficient query plans observable.
- **FR-004**: The project MUST provide a runner interface that can list puzzles,
  run an individual puzzle, capture its plan, and benchmark it.
- **FR-005**: The project MUST include at least 12 runnable query optimization
  puzzles.
- **FR-006**: Each puzzle MUST include a business story, intentionally bad SQL,
  runner command, expected result, reproducible baseline plan, hints, solution
  documentation, and a reference migration for indexes or equivalent database
  changes.
- **FR-007**: The puzzle catalog MUST cover recognition of seq scan, nested loop,
  sort spill, hash join, and bitmap scan plan patterns.
- **FR-008**: The puzzle catalog MUST cover B-tree, partial, composite, covering,
  and expression index design.
- **FR-009**: The puzzle catalog MUST cover rewrites for poor joins, correlated
  subqueries, CTE usage, window functions, and aggregations.
- **FR-010**: Each puzzle MUST provide a reproducible baseline
  `EXPLAIN (ANALYZE, BUFFERS)` output that can be recreated after seeding.
- **FR-011**: Each reference solution MUST keep the optimized state separate from
  the initial bad state so learners encounter the inefficient query first.
- **FR-012**: The project MUST include automated tests proving that bad and
  optimized versions of each puzzle return equivalent results.
- **FR-013**: Benchmark output MUST compare latency, rows, buffers, planning time,
  and execution time before and after optimization.
- **FR-014**: The README MUST explain how to pass the quest, including setup,
  seeding, running puzzles, reading plans, applying solutions, benchmarking, and
  resetting solutions.
- **FR-015**: The project MUST explicitly communicate that it is not production
  ready and is intentionally inefficient by design.

### Key Entities *(include if feature involves data)*

- **Puzzle**: A named training task with a business story, bad query, runner
  command, expected result, baseline plan, hints, reference solution, and
  reference migration.
- **Dataset**: Deterministic synthetic data used by all puzzles, including row
  volumes, relationships, distributions, and edge cases required to expose bad
  plans.
- **Query Variant**: Either the intentionally bad query or an optimized reference
  query for the same puzzle, both tied to the same expected result.
- **Plan Capture**: A reproducible `EXPLAIN (ANALYZE, BUFFERS)` artifact for a
  puzzle and query variant.
- **Benchmark Result**: A comparable measurement record containing latency, row
  counts, buffer usage, planning time, and execution time.
- **Solution Migration**: A separate database change artifact that applies the
  reference indexes or related database changes for a puzzle.

### Training Scenario Contract *(mandatory for PostgreSQL optimization scenarios)*

- **Business Task**: The learner is solving realistic reporting, search,
  ranking, filtering, reconciliation, or dashboard-style data questions.
- **Bad Query**: Every puzzle starts from intentionally inefficient SQL that is
  readable enough to understand but poor enough to create observable plan issues.
- **Seed Data**: The dataset is synthetic, large, deterministic, and includes
  distributions that make the target plan symptoms appear.
- **Expected Result**: Every puzzle defines deterministic output so result
  equality can be tested between bad and optimized variants.
- **Baseline Plan**: Every puzzle stores or regenerates
  `EXPLAIN (ANALYZE, BUFFERS)` output with notable symptoms called out.
- **Hints**: Hints progress from plan-reading clues to index or rewrite direction
  without revealing the full answer immediately.
- **Reference Optimization**: Each puzzle includes one or more separate solution
  options, including reference index migrations when indexes are part of the
  lesson.
- **Benchmark Evidence**: Each puzzle has before/after benchmark output that
  compares latency, rows, buffers, planning time, and execution time.
- **Trade-offs**: Each solution explains storage cost, write overhead, query
  specificity, maintainability, and cases where the optimization may not help.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new learner can start the local lab, seed data, and run the first
  puzzle within 15 minutes using the documented quest instructions.
- **SC-002**: The catalog contains at least 12 runnable puzzles, and 100% of them
  include all required scenario artifacts.
- **SC-003**: 100% of puzzles can regenerate their baseline plan after a clean
  reset and seed workflow.
- **SC-004**: 100% of puzzles have automated checks proving the bad and optimized
  variants return equivalent results.
- **SC-005**: 100% of puzzles produce before/after benchmark output with latency,
  rows, buffers, planning time, and execution time.
- **SC-006**: Across the puzzle catalog, every required plan symptom, index type,
  and query rewrite category appears in at least one puzzle.
- **SC-007**: A learner can apply a reference solution, benchmark it, reset the
  solution, and rerun the baseline for any puzzle without manually editing the
  database.
- **SC-008**: At least 90% of pilot learners can explain the observed plan
  symptom and the main trade-off of a completed puzzle using the provided
  materials.

## Assumptions

- The learner is a developer who can run local command-line tools and read SQL.
- The repository is a local training lab, not a deployed service or production
  template.
- Synthetic data is acceptable and no real user or business data is required.
- Absolute timings may vary by machine, so comparisons focus on before/after
  evidence, plan shape, rows, buffers, and relative improvement.
- A single local learner workflow is the default; multi-user progress tracking,
  authentication, and hosted leaderboards are out of scope for the first version.
- The runner may expose either a REST-style interface, a CLI, or both, as long as
  every puzzle has a documented command or endpoint.
