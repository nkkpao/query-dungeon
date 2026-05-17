# Feature Specification: Hands-on SQL Optimization Lab

**Feature Branch**: `002-manual-sql-lab`  
**Created**: 2026-05-17  
**Status**: Draft  
**Input**: User description: "Refactor the existing Postgres Query Dungeon project from a demonstration repo into a hands-on SQL optimization training lab. The repository must stop automatically solving optimization problems for the user. The participant must manually run EXPLAIN ANALYZE, inspect plans, create indexes, rewrite SQL, benchmark hypotheses, and validate correctness. The repository should provide intentionally bad baseline queries, realistic datasets, challenge descriptions, tooling for validation and benchmarking, and hidden or delayed reference solutions. The repository should not automatically apply optimized queries, show optimized plans during normal workflow, benchmark the official solution against the bad query during challenge execution, or hide SQL experimentation behind abstractions. Each challenge must contain a problem statement, business context, baseline bad query, expected output shape, performance symptoms, constraints, hints, and optional solution access."

## Clarifications

### Session 2026-05-17

- Q: What decisions define the hands-on training workflow? → A: Solutions hidden by default; solution SQL lives outside active challenge flow; participant SQL files are first-class inputs; supported learner commands include explain, benchmark, compare-results, and validate-correctness; compare-with-official-solution is optional and explicit; README flow emphasizes exploration; participants create indexes manually in migration or scratch files; scratchpad mode is supported; existing auto-demo flows are removed or downgraded to optional examples.
- Q: What analyze findings must be locked before implementation? → A: Default CLI registration, README examples, Makefile targets, benchmark behavior, validation behavior, and challenge registry metadata must all fail guardrail checks if they expose official solutions, execute official solutions, or compare against official solutions without an explicit solution-comparison command.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Explore a Challenge Manually (Priority: P1)

As a learner, I want each challenge to give me the business problem, a slow starting query, expected output shape, symptoms, constraints, and hints so I can investigate the performance problem myself before seeing any official answer.

**Why this priority**: The repository only becomes a training lab when the default learner experience requires hands-on investigation instead of watching a scripted demonstration.

**Independent Test**: A learner can open any challenge, identify what the query is supposed to answer, run the provided bad query, inspect its plan, and start experiments without receiving optimized SQL or an optimized plan.

**Acceptance Scenarios**:

1. **Given** a learner opens a challenge from the default workflow, **When** they read the challenge material, **Then** they see the business context, baseline bad query, expected output shape, symptoms, constraints, and hints, but not the official optimized query.
2. **Given** a learner runs the normal challenge command, **When** the challenge executes, **Then** the command runs the learner-selected or baseline SQL only and does not apply solution changes or display official solution content.
3. **Given** a learner wants to inspect performance, **When** they run explain against the baseline or a participant-provided SQL file, **Then** they receive evidence for their chosen SQL so they can reason about scans, joins, sorts, buffers, planning time, and execution time.
4. **Given** a learner follows the default README path, **When** they begin a challenge, **Then** the path prompts exploration and manual measurement instead of replaying a guided official solution.

---

### User Story 2 - Benchmark and Validate My Own SQL (Priority: P2)

As a learner, I want to run correctness checks and benchmarks against SQL that I write so I can test hypotheses iteratively without the lab comparing my work to the official solution by default.

**Why this priority**: Manual optimization practice depends on quick feedback for learner-written experiments, not on automatic baseline-versus-answer scoring.

**Independent Test**: A learner can provide arbitrary SQL for a challenge, verify that it returns the expected output shape and values, and benchmark it repeatedly while preserving their ability to revise the SQL manually.

**Acceptance Scenarios**:

1. **Given** a learner has written an experimental query, **When** they run validation for that query, **Then** the lab reports whether the result is correct without revealing the official solution.
2. **Given** a learner has multiple hypotheses, **When** they benchmark each query or schema change separately, **Then** the lab reports comparable measurements for the learner-provided SQL without automatically benchmarking the official solution.
3. **Given** a learner provides malformed, unsafe, or non-returning SQL, **When** validation or benchmarking runs, **Then** the lab reports the problem clearly and leaves the challenge state recoverable.
4. **Given** a learner wants to compare two of their own attempts, **When** they run compare-results with participant-provided SQL files, **Then** the lab reports result differences without invoking official solution material.
5. **Given** a learner wants to try manual indexes, **When** they place index changes in a migration or scratch file and run them in scratchpad mode, **Then** they can benchmark and validate the resulting hypothesis without changing the official challenge starting point.

---

### User Story 3 - Access Reference Solutions Deliberately (Priority: P3)

As a learner or maintainer, I want reference solutions to exist but require an explicit opt-in so they can support later comparison, facilitation, and maintenance without becoming part of the normal exercise path.

**Why this priority**: Solutions are necessary for maintainers and for optional learner review, but exposing them too early undermines the lab's learning model.

**Independent Test**: A learner can complete the default challenge workflow without seeing solution SQL, while an explicitly requested solution flow reveals the official solution, trade-offs, and comparison guidance.

**Acceptance Scenarios**:

1. **Given** a learner has not requested a solution, **When** they browse or run a challenge normally, **Then** reference solution SQL, optimized plans, and official benchmark comparisons remain hidden or clearly out of the default path.
2. **Given** a learner explicitly requests solution access or compare-with-official-solution, **When** the solution is revealed or compared, **Then** the lab provides the official query or index changes, expected plan characteristics, correctness expectations, benchmark guidance, and operational trade-offs.
3. **Given** a maintainer updates a challenge, **When** they review the challenge contract, **Then** they can locate the reference solution and expected evidence without changing the learner-facing default workflow.

### Edge Cases

- A learner submits SQL that returns correct rows in a different order when order is not part of the expected output.
- A learner submits SQL that is faster but returns incomplete, duplicated, or stale results.
- A learner adds indexes or other schema changes that make later experiments hard to compare.
- A challenge has multiple valid optimization paths rather than a single canonical rewrite.
- A learner requests hints repeatedly and should receive graduated help without receiving the full solution accidentally.
- A dataset is too small or too large for the learner's machine, making symptoms hard to reproduce.
- A reference solution becomes discoverable through filenames, command output, logs, or default documentation links.
- A participant-provided SQL file contains multiple statements, setup statements, or index changes that must be handled predictably in scratchpad mode.
- An old auto-demo flow still exists and risks presenting a scripted solution path as the recommended learner workflow.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The default challenge workflow MUST require learners to run baseline queries, inspect plans, change SQL or schema, benchmark hypotheses, and validate correctness manually.
- **FR-002**: No default command or documented normal workflow MUST reveal optimized SQL, optimized plans, official solution files, or official baseline-versus-solution benchmark comparisons.
- **FR-003**: Each challenge MUST include a learner-facing problem statement, business context, intentionally inefficient baseline query, expected output shape, observed performance symptoms, constraints, hints, and explicit solution-access instructions.
- **FR-004**: Baseline queries MUST remain available as the starting point for each challenge and MUST be clearly separated from reference solutions.
- **FR-005**: Learners MUST be able to run plan inspection for the baseline query and for any learner-provided SQL without the lab substituting or applying official optimized SQL.
- **FR-006**: Learners MUST be able to benchmark arbitrary learner-provided SQL for a challenge and receive measurements that support manual comparison across their own experiments.
- **FR-007**: Learners MUST be able to validate learner-provided SQL against the challenge's expected output without seeing the official solution.
- **FR-008**: The lab MUST support iterative experimentation, including repeated query edits, optional index or schema experiments, state reset, and rerunning validation or benchmarks.
- **FR-009**: Hints MUST be graduated and learner-facing, guiding investigation without revealing the final optimized SQL or complete solution path before explicit solution access.
- **FR-010**: Reference solutions MUST exist for maintainers and optional learner comparison, but MUST be excluded from the default challenge execution path.
- **FR-011**: Explicit solution access MUST make it clear that the learner is leaving the normal exercise flow and is about to see official solution material.
- **FR-012**: Reference solution material MUST include the official optimized approach, expected evidence, correctness expectations, and trade-offs such as write cost, storage cost, specificity, and maintainability.
- **FR-013**: Challenge progression MUST feel exploratory: learners can choose when to inspect plans, when to benchmark, when to validate, when to ask for hints, and when to reveal solutions.
- **FR-014**: The lab MUST avoid abstractions that prevent learners from seeing, editing, running, and reasoning about raw SQL directly.
- **FR-015**: Challenge and workflow documentation MUST consistently describe the repository as a performance engineering lab, not as a scripted tutorial or automatic optimizer.
- **FR-016**: The lab MUST provide realistic datasets that make the baseline performance symptoms reproducible enough for learners to measure meaningful differences.
- **FR-017**: The lab MUST preserve maintainer evidence for baselines and reference solutions while keeping that evidence separate from learner-facing default commands.
- **FR-018**: The lab MUST treat participant-provided SQL files as first-class inputs for explain, benchmark, compare-results, and validate-correctness workflows.
- **FR-019**: The lab MUST provide compare-results for participant-selected SQL attempts without requiring or revealing the official solution.
- **FR-020**: The lab MUST provide compare-with-official-solution only as an explicit opt-in workflow that clearly warns learners they are leaving the default challenge flow.
- **FR-021**: Solution SQL MUST live separately from active challenge flow artifacts so learners do not encounter it through normal challenge reading, running, explanation, validation, or benchmarking.
- **FR-022**: The default README path MUST guide learners toward exploration, manual plan inspection, manual benchmarking, and correctness validation rather than guided solution replay.
- **FR-023**: The lab MUST encourage participants to create indexes manually in their own migration or scratch files and then measure the effect themselves.
- **FR-024**: The lab MUST support a scratchpad mode where learners can run experimental SQL and schema changes without treating those changes as official challenge solutions.
- **FR-025**: Existing automatic demonstration flows MUST be removed from the default path or downgraded to clearly labeled optional examples that do not reveal official solutions by default.
- **FR-026**: Default CLI registration MUST NOT include commands or options that apply official solutions, reset official solution state, run a `solution` variant, explain a `solution` variant, or automatically benchmark bad SQL against official solution SQL.
- **FR-027**: Correctness validation MUST compare participant SQL only against deterministic expected-result fixtures and MUST NOT execute official solution SQL as part of validation.
- **FR-028**: Benchmark tooling MUST support at least three repeated benchmark attempts for every challenge using participant-selected SQL and optional baseline comparison, without requiring an official solution comparison.

### Key Entities *(include if feature involves data)*

- **Challenge**: A training exercise with a business task, learner-facing prompt, bad baseline query, expected output shape, symptoms, constraints, hints, optional solution access, and maintainer-only reference material.
- **Baseline Query**: The intentionally inefficient starting SQL learners must run, inspect, and improve manually.
- **Learner Experiment**: A learner-authored query, index, schema adjustment, or repeatable test attempt used during manual optimization.
- **Expected Output**: The observable result shape and correctness target used to validate learner experiments.
- **Benchmark Result**: A measurement record for learner-selected SQL, including enough timing and plan evidence for manual comparison.
- **Hint**: A staged clue that guides investigation without revealing the official solution by default.
- **Reference Solution**: An opt-in artifact for maintainers and later learner comparison that documents an optimized approach, evidence, and trade-offs.
- **Dataset Profile**: A reproducible data shape and scale that makes performance symptoms visible for training.
- **Scratchpad**: A learner-owned experimentation space for ad hoc SQL, manual indexes, migrations, and repeatable hypotheses that are not official challenge artifacts.

### Training Scenario Contract *(mandatory for PostgreSQL optimization scenarios)*

- **Business Task**: Each challenge describes the real-world decision, report, lookup, or operational task that the slow query is meant to support.
- **Bad Query**: Each challenge exposes an intentionally inefficient starting query as learner-editable SQL and keeps it separate from solution material.
- **Participant SQL**: Each challenge accepts learner-provided SQL files for explanation, benchmarking, result comparison, and correctness validation.
- **Seed Data**: Each challenge uses realistic, reproducible data at a scale that makes the performance symptom measurable on a local training machine.
- **Expected Result**: Each challenge defines the output columns, row expectations, ordering expectations when relevant, and correctness rules needed to validate learner experiments.
- **Baseline Plan**: Learners can capture the baseline plan themselves during the exercise; any pre-captured baseline evidence for maintainers is stored outside the default learner workflow.
- **Hints**: Each challenge provides graduated hints that nudge learners toward plan symptoms, data distribution, indexing options, or rewrite ideas without giving away optimized SQL.
- **Reference Optimization**: Each challenge has a separate optional reference solution with optimized SQL or schema changes, expected plan characteristics, and trade-off notes.
- **Benchmark Evidence**: Learners can benchmark baseline and learner-provided SQL manually; official baseline-versus-solution comparisons are available only after explicit solution access or in maintainer material.
- **Validation Evidence**: Learner correctness checks use deterministic expected-result fixtures; official solution execution is never part of default validation.
- **Trade-offs**: Reference solutions explain costs, limits, and cases where the approach may not help.
- **Scratchpad Mode**: Each challenge supports manual experimentation with learner-owned SQL and index changes without promoting those changes into official challenge flow.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a default challenge walkthrough, 100% of normal commands and linked learner-facing pages avoid showing official optimized SQL or official optimized plans before explicit solution access.
- **SC-002**: At least 90% of pilot learners can run a baseline query, inspect its plan, make one manual SQL or index experiment, validate correctness, and benchmark their experiment without facilitator intervention.
- **SC-003**: For every published challenge, a learner can run validation against their own SQL and receive a pass/fail result in under 30 seconds on the smallest supported dataset.
- **SC-004**: For every published challenge, a learner can run at least three separate benchmark attempts against learner-selected SQL without resetting the entire lab.
- **SC-005**: 100% of challenges include the required problem statement, business context, bad baseline query, expected output shape, symptoms, constraints, hints, and explicit solution-access path.
- **SC-006**: 100% of reference solutions remain accessible to maintainers and explicit opt-in learners while remaining absent from the default challenge flow.
- **SC-007**: At least 80% of pilot learners describe the challenge experience as exploratory hands-on practice rather than a scripted tutorial.
- **SC-008**: Every challenge has reproducible data and measurable baseline symptoms that can be observed on at least one supported local dataset profile.
- **SC-009**: 100% of supported learner workflows that inspect, benchmark, compare, or validate SQL accept participant-provided SQL files.
- **SC-010**: 100% of official-solution comparison workflows require an explicit solution-comparison action and are absent from the default README path.
- **SC-011**: At least 90% of pilot learners can create a manual index experiment in a migration or scratch file, rerun explain, benchmark the hypothesis, and validate correctness without using official solution material.
- **SC-012**: Automated regression checks prove that every published challenge supports at least three repeated participant-SQL benchmark attempts with optional baseline comparison and no official-solution execution.

## Assumptions

- The refactor updates the existing Postgres Query Dungeon feature rather than creating a separate unrelated product.
- The target users are developers or database practitioners who can edit and run SQL locally.
- The lab may keep command-line helpers for setup, validation, reset, and measurement as long as those helpers do not solve or compare against official solutions by default.
- Reference solutions are allowed for maintainers, facilitators, and learners who explicitly opt in after attempting a challenge.
- Existing challenge content can be reorganized, renamed, or gated to support the hands-on workflow.
- Existing auto-demo flows may be retained only as optional examples when they are clearly outside the default path and do not expose official solutions unexpectedly.
- Small dataset profiles prioritize quick validation, while larger profiles may be used when learners need more visible performance symptoms.
