# Feature Specification: Advanced Skew Plans

**Feature Branch**: `003-advanced-skew-plans`  
**Created**: 2026-05-19  
**Status**: Draft  
**Input**: User description: "Extend the existing PostgreSQL optimization training repository with advanced challenge variants based on larger skewed datasets and recorded EXPLAIN plans for SEED_SCALE=medium. Add more realistic and difficult variants of selected challenges where PostgreSQL planner behavior becomes visible only on sufficiently large and skewed data. This feature must improve the repository as a hands-on performance lab, not as an auto-solved tutorial."

## Clarifications

### Session 2026-05-19

- Q: How should advanced variants relate to existing challenges? → A: Advanced variants are additive, never replacements, and use `challenge-XX-advanced` or `variants/advanced` naming.
- Q: Which seed scales define recorded-plan evidence and default checks? → A: `SEED_SCALE=medium` is canonical for recorded baseline plans; `SEED_SCALE=small` remains the default for CI and quick local smoke tests.
- Q: How are recorded baseline plans stored and used? → A: Recorded plans are committed text artifacts, not dynamically generated during normal challenge execution, and participants use them only as baseline reference after their own investigation.
- Q: How strict must recorded plan reproducibility be? → A: Recorded plans must be reproducible enough for learning, exact timings may vary, and exact execution time equality must never be asserted.
- Q: How should recorded plans be validated? → A: Validation checks stable structural markers such as Seq Scan, row estimate problems, shared buffers, expensive Sort, Hash Join or Nested Loop behavior, and rows removed by filter.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Practice Advanced Planner Investigation (Priority: P1)

As a learner, I want advanced variants of familiar challenges that use larger, skewed datasets so I can observe planner behavior that is not obvious in the baseline exercises and practice investigating it myself.

**Why this priority**: The primary value is deeper hands-on training. Advanced variants must add realistic difficulty without replacing the existing entry-level challenge path.

**Independent Test**: A learner can select an advanced variant, load the medium-scale dataset, read the challenge description, run the baseline bad query, inspect `EXPLAIN (ANALYZE, BUFFERS)`, and begin experiments without seeing or executing an official solution by default.

**Acceptance Scenarios**:

1. **Given** the repository contains existing baseline challenges, **When** a learner lists or opens challenges, **Then** advanced variants appear as additional variants and the original challenge IDs and baseline workflows remain unchanged.
2. **Given** a learner opens an advanced variant, **When** they read its materials, **Then** they see the challenge description, baseline bad query, data skew assumptions, expected planner symptoms, recorded medium-scale baseline plan text artifact, hints, and any explicit solution-access path.
3. **Given** a learner follows the normal advanced variant workflow, **When** they run or explain the baseline bad query, **Then** the lab uses the learner-selected query artifacts and does not apply, reveal, compare against, or depend on official solution SQL.

---

### User Story 2 - Reproduce Medium-Scale Baseline Evidence (Priority: P2)

As a maintainer or learner, I want each advanced variant to include a committed recorded baseline plan captured on the medium-scale dataset so I can compare local behavior with known reference evidence while still performing my own investigation.

**Why this priority**: The feature is specifically about planner behavior that only becomes visible on larger and skewed data, so reproducible medium-scale evidence is required for trust and repeatability.

**Independent Test**: For each advanced variant, a reviewer can load the medium-scale data, regenerate the baseline plan with analyze and buffer evidence, and verify that the committed recorded plan corresponds to the documented baseline bad query and skew assumptions.

**Acceptance Scenarios**:

1. **Given** an advanced variant exists, **When** a reviewer inspects its recorded plan, **Then** the plan clearly states it was captured for the medium-scale dataset and includes actual execution and buffer information.
2. **Given** a maintainer follows the documented regeneration instructions, **When** they regenerate recorded plans locally, **Then** the process updates reference plan artifacts without requiring CI to run medium-scale benchmarks by default.
3. **Given** local hardware or planner versions differ, **When** the regenerated plan differs slightly, **Then** the challenge documentation still identifies the expected planner symptoms rather than requiring byte-for-byte runtime equality.
4. **Given** recorded plan validation runs, **When** it checks the committed plan artifact, **Then** it validates stable structural markers instead of exact execution timings.

---

### User Story 3 - Compare with Official Solutions Only by Choice (Priority: P3)

As a learner, I want optional official solutions to remain available only for comparison after my own work, so the advanced variants stay challenging rather than becoming auto-solved tutorials.

**Why this priority**: Reference solutions help maintainers and learners validate their thinking, but the learning value depends on keeping them outside default execution.

**Independent Test**: A learner can complete the default advanced variant workflow, including plan inspection, validation, and benchmarking, without official solution SQL being shown, executed, or used as an execution dependency.

**Acceptance Scenarios**:

1. **Given** an advanced variant has an official solution, **When** a learner runs default commands or reads default challenge instructions, **Then** the solution is not exposed and challenge execution does not depend on it.
2. **Given** a learner explicitly opens the optional solution material, **When** they compare their approach, **Then** the solution is presented as reference material with trade-offs rather than as an automatic scoring or solving mechanism.

### Edge Cases

- An advanced variant requires medium-scale skew to show symptoms, but a learner accidentally uses a smaller scale.
- Recorded plans differ in timing across machines while preserving the same important planner symptoms.
- A selected baseline challenge already has an optional solution, and the advanced variant must not make that solution visible by default.
- Medium-scale seeding takes longer than normal development checks and should not become mandatory in CI.
- A learner attempts to run an advanced variant before loading the required data profile.
- Official solution artifacts exist for comparison but must not be referenced by default challenge execution, validation, or benchmarking.
- Recorded plan validation encounters a valid timing difference while the structural planner symptoms remain present.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The lab MUST add at least three advanced variants of existing challenges.
- **FR-002**: Advanced variants MUST be additive and MUST NOT replace, rename, or optimize existing baseline challenge IDs or baseline bad queries.
- **FR-003**: Each advanced variant MUST require a larger and more skewed dataset than its corresponding normal challenge path.
- **FR-004**: Each advanced variant MUST be runnable with the medium-scale seed profile.
- **FR-005**: Each advanced variant MUST include a committed recorded baseline plan captured from the medium-scale seed profile.
- **FR-006**: Each recorded baseline plan MUST include plan evidence with actual execution and buffer usage.
- **FR-007**: Each advanced variant MUST include a challenge description, baseline bad query, data skew assumptions, expected planner symptoms, recorded medium-scale baseline plan, hints, and optional official solution access when a solution is provided.
- **FR-008**: Recorded plans MUST be presented as reference and reproducibility evidence, not as automatic solving inputs.
- **FR-009**: Default advanced variant execution MUST NOT depend on official solution SQL.
- **FR-010**: Default advanced variant validation, benchmarking, and plan-inspection workflows MUST NOT automatically compare learner SQL with official solution SQL.
- **FR-011**: Official solutions, when present, MUST be hidden from default challenge flow and exposed only through an explicit comparison or reference path.
- **FR-012**: Learners MUST still be expected to manually run plan inspection, read the resulting plan, form hypotheses, edit SQL or schema, validate correctness, and benchmark their own attempts.
- **FR-013**: Advanced variant documentation MUST describe the data skew assumptions and why the planner symptoms are expected to appear at medium scale.
- **FR-014**: Advanced variant documentation MUST identify expected planner symptoms without prescribing the complete optimization path in the default challenge description.
- **FR-015**: The README MUST explain how maintainers can regenerate recorded baseline plans locally for the medium-scale seed profile.
- **FR-016**: The README MUST make clear that medium-scale recorded plan regeneration is not part of the default CI requirement.
- **FR-017**: CI MUST continue to verify normal challenge integrity without requiring medium-scale benchmark runs by default.
- **FR-018**: Existing normal challenges MUST continue to work unchanged through their current learner-facing workflow.
- **FR-019**: Advanced variant artifacts MUST use a consistent naming convention of either `challenge-XX-advanced` or `variants/advanced` so learners can distinguish normal and advanced variants while still recognizing the relationship to the original challenge.
- **FR-020**: Each advanced variant MUST keep the baseline bad query separate from optional solution artifacts.
- **FR-021**: Each advanced variant MUST include enough metadata or documentation for reviewers to verify the required dataset scale, skew assumption, baseline query, and recorded plan relationship.
- **FR-022**: Hints for advanced variants MUST guide learners toward investigating data distribution, row estimates, scan choices, join choices, sorts, aggregations, buffers, or statistics without revealing the official solution by default.
- **FR-023**: Recorded baseline plans MUST be stored as committed text artifacts and MUST NOT be generated dynamically during normal challenge execution.
- **FR-024**: Recorded plan validation MUST check stable structural markers rather than exact execution time equality.
- **FR-025**: Structural markers for recorded plans MUST include one or more relevant symptoms from Seq Scan, bad row estimates, high shared buffer reads or hits, expensive Sort, Hash Join behavior, Nested Loop behavior, or rows removed by filter.
- **FR-026**: Default CI and quick local smoke tests MUST use the small seed profile unless a maintainer explicitly requests medium-scale recorded-plan regeneration or validation.
- **FR-027**: Learner-facing guidance MUST position recorded plans as baseline reference material to consult after the learner's own investigation, not as the first step in solving the challenge.
- **FR-028**: Each advanced variant MUST include correctness validation coverage for its expected result without executing official solution SQL.
- **FR-029**: Each advanced variant MUST include a documented learner-run benchmark path for the baseline and participant attempts without requiring official solution comparison.
- **FR-030**: Medium-scale skew validation MUST verify deterministic distribution shape for relevant hot users, hot products, long-tail products, low-selectivity statuses, NULL-heavy data, and skewed event or order distributions.
- **FR-031**: Each advanced variant MUST be materially distinct from its parent baseline challenge through documented larger data requirements, skew assumptions, harder planner symptoms, or changed bad-query behavior.
- **FR-032**: Recorded baseline plan artifacts MUST be captured or regenerated before completion; placeholder plan artifacts are not acceptable as completed feature evidence.

### Key Entities *(include if feature involves data)*

- **Advanced Challenge Variant**: An additive harder version of an existing challenge with its own description, bad baseline query, skew assumptions, symptoms, hints, recorded plan, and optional reference solution.
- **Medium-Scale Dataset Profile**: The reproducible seed profile used to expose planner behavior for advanced variants.
- **Skew Assumption**: The documented data distribution characteristic that makes the advanced variant realistic and affects planner behavior.
- **Recorded Baseline Plan**: The committed reference `EXPLAIN (ANALYZE, BUFFERS)` output for an advanced variant on the medium-scale dataset.
- **Planner Symptom**: The expected observable plan behavior learners should investigate, such as poor row estimates, sequential scans, expensive nested loops, sort pressure, hash spill risk, or unexpectedly high buffer usage.
- **Structural Plan Marker**: A stable recorded-plan indicator used for validation, such as Seq Scan, estimate mismatch, shared buffer reads or hits, Sort, Hash Join, Nested Loop, or rows removed by filter.
- **Skew Shape Validation**: A lightweight deterministic check that confirms intended data concentration, long-tail distribution, low-selectivity values, and NULL-heavy patterns exist without requiring medium-scale plan generation in CI.
- **Baseline Bad Query**: The intentionally inefficient starting query for the advanced variant.
- **Hint Set**: Learner-facing clues that preserve investigation while focusing attention on likely symptoms.
- **Official Solution**: Optional comparison material that is separate from the default learner workflow and never required to execute an advanced variant.

### Training Scenario Contract *(mandatory for PostgreSQL optimization scenarios)*

- **Business Task**: Each advanced variant describes the realistic reporting, lookup, ranking, filtering, or operational task the bad query is intended to answer.
- **Bad Query**: Each advanced variant provides its own baseline bad query or clearly points to the inherited bad query when unchanged, without altering the normal challenge baseline.
- **Seed Data**: Each advanced variant documents the medium-scale data requirement and the larger or skewed distribution needed to reproduce planner symptoms. The small seed profile remains the default for CI and quick local smoke tests.
- **Expected Result**: Each advanced variant defines the correctness target needed to validate learner attempts.
- **Correctness Test**: Each advanced variant has automated or documented validation coverage proving the baseline and learner attempts can be checked against the expected result without consulting official solution SQL.
- **Baseline Plan**: Each advanced variant commits a text artifact containing a recorded `EXPLAIN (ANALYZE, BUFFERS)` baseline plan generated on the medium-scale seed profile and lists the notable symptoms learners should look for. The recorded plan is reference evidence for post-investigation comparison, not a dynamically generated normal-execution dependency.
- **Hints**: Each advanced variant provides hints that guide investigation without revealing official solution SQL.
- **Reference Optimization**: Optional official solutions are separate comparison artifacts and are never part of default execution.
- **Benchmark Evidence**: Learners can benchmark the baseline and their own attempts; medium-scale recorded-plan regeneration and official solution benchmarking are not required by default CI.
- **Variant Distinction**: Each advanced variant documents how it is harder or more realistic than the corresponding normal challenge.
- **Trade-offs**: Optional official solutions explain operational trade-offs when provided.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least three advanced variants are available and each is visibly linked to an existing baseline challenge without replacing that baseline challenge.
- **SC-002**: 100% of advanced variants document a larger or skewed data requirement and identify the expected planner symptoms.
- **SC-003**: 100% of advanced variants include a committed recorded medium-scale baseline plan with actual execution and buffer evidence.
- **SC-004**: A maintainer can follow README instructions to regenerate all advanced variant recorded baseline plans locally using the medium-scale dataset.
- **SC-005**: 100% of existing normal challenges remain available through their previous IDs and normal learner workflow.
- **SC-006**: 100% of default advanced variant commands and instructions avoid revealing, applying, or comparing against official solution SQL unless the learner explicitly chooses a solution path.
- **SC-007**: CI completes by default without requiring medium-scale benchmark execution.
- **SC-008**: At least 90% of reviewed advanced variant materials are judged to support manual investigation rather than scripted tutorial completion.
- **SC-009**: 100% of recorded plan validation checks rely on structural planner markers rather than exact execution time equality.
- **SC-010**: 100% of advanced variant recorded plans are stored as committed text artifacts and are not generated during normal challenge execution.
- **SC-011**: 100% of advanced variants have correctness validation coverage and a learner-run benchmark path that do not execute official solution SQL.
- **SC-012**: 100% of advanced variants document a material difference from the parent baseline challenge and pass skew-shape validation for their relevant medium-scale data profile.
- **SC-013**: 0 completed advanced variants rely on placeholder recorded plan artifacts.

## Assumptions

- Advanced variants extend the current manual SQL lab workflow and inherit its no-auto-solve policy.
- The medium-scale seed profile is the required reproducibility target for recorded plans, while smaller profiles may remain useful for faster local checks.
- Recorded plan timings may vary by machine; the important requirement is that actual execution, buffers, and planner symptoms are captured and documented.
- Official solutions are useful comparison material but are not required for learners to run, validate, explain, or benchmark advanced variants.
- The first release can select any three existing challenges whose planner behavior becomes more instructive under larger or skewed data.
- Structural planner symptoms are more stable than wall-clock timings and are the appropriate basis for recorded-plan validation.
