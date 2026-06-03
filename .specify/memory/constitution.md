<!--
Sync Impact Report
Version change: template -> 1.0.0
Modified principles:
- Template principle 1 -> I. Intentional, Measurable Slowness
- Template principle 2 -> II. Complete Training Scenario Contract
- Template principle 3 -> III. PostgreSQL-First Optimization
- Template principle 4 -> IV. Local Docker Reproducibility
- Template principle 5 -> V. Correctness and Before/After Evidence
Added sections:
- Scenario Design Constraints
- Development Workflow and Quality Gates
Removed sections:
- None
Templates requiring updates:
- ✅ .specify/templates/plan-template.md
- ✅ .specify/templates/spec-template.md
- ✅ .specify/templates/tasks-template.md
- ✅ .specify/templates/commands/ (directory absent; no command templates to update)
- ✅ .specify/extensions/git/commands/*.md
- ✅ AGENTS.md
Follow-up TODOs:
- None
-->
# PostgreSQL Optimization Training Constitution

## Core Principles

### I. Intentional, Measurable Slowness
Poor SQL performance is a first-class product behavior in the initial state of
each lesson. Every slow query MUST be reproducible, measurable, and tied to a
named learning objective. A scenario MUST NOT rely on accidental machine load,
random timing variance, or hidden environmental quirks to appear slow.

Rationale: developers can learn query planning only when the performance problem
is stable enough to measure before and after an optimization.

### II. Complete Training Scenario Contract
Each learning scenario MUST include a bad query, the business task it is meant
to satisfy, deterministic seed data, the expected result, a captured baseline
`EXPLAIN (ANALYZE, BUFFERS)` plan, hints, and a reference optimization. The bad
query MUST remain available as the starting point for the exercise.

Rationale: a scenario is useful only when learners can understand the business
intent, reproduce the workload, verify correctness, inspect the baseline, and
compare their solution with a defensible reference.

### III. PostgreSQL-First Optimization
Scenarios MUST focus on PostgreSQL behavior: SQL shape, indexes, statistics,
joins, scans, sorts, aggregations, locking where relevant, and query plans.
Solutions MUST NOT hide the problem primarily with application-level caches,
precomputed responses, or non-PostgreSQL shortcuts. Such techniques MAY be
discussed only as trade-offs after the PostgreSQL optimization path is shown.

Rationale: the repository exists to train reading and improving PostgreSQL query
plans, not to route around them.

### IV. Local Docker Reproducibility
All scenarios MUST run locally through Docker Compose with documented commands
for starting PostgreSQL, loading seed data, running correctness checks, capturing
baseline plans, and running benchmarks. Required datasets MUST be generated or
loaded by repository-controlled scripts so the same scenario can be recreated on
another developer machine.

Rationale: learners need a consistent local lab that does not depend on shared
infrastructure, private data, or manual database preparation.

### V. Correctness and Before/After Evidence
Every scenario MUST provide automated correctness tests for the query result and
benchmarks that compare the unoptimized baseline with the optimized solution.
Optimizations MUST be separate tasks or solution artifacts, not mixed into the
initial bad state. Any accepted optimization MUST explain the trade-off it makes,
including write overhead, storage cost, query specificity, maintainability, and
cases where the chosen index or rewrite may not help.

Rationale: a faster query is not an improvement unless it is still correct,
measured against the same workload, and understood in operational context.

## Scenario Design Constraints

Scenario code MUST be readable enough for learners to navigate quickly. SQL in
the bad state MAY be intentionally awful, verbose, repetitive, or inefficient,
but its intent MUST be documented and its expected result MUST be deterministic.

Each scenario MUST separate these artifacts:

- Bad SQL and initial schema/data state.
- Business task explanation and learner-facing prompt.
- Seed data generation or load scripts.
- Expected output fixtures or assertions.
- Baseline `EXPLAIN (ANALYZE, BUFFERS)` output.
- Hints that guide investigation without revealing the full solution.
- Reference optimization with SQL/index changes and trade-off notes.
- Correctness tests and before/after benchmark commands.

Application code MAY exist to organize exercises, run checks, or present output,
but it MUST NOT be the primary place where PostgreSQL performance is fixed.

## Development Workflow and Quality Gates

Feature specs for new scenarios MUST describe the business task, bad query
behavior, seed data shape, expected result, baseline plan expectations, hints,
reference optimization, and benchmark success criteria.

Implementation plans MUST include a Constitution Check that verifies Docker
Compose reproducibility, PostgreSQL-first scope, scenario artifact completeness,
correctness tests, before/after benchmarks, and separation between bad starting
state and reference optimization.

Task lists MUST include explicit work for seed data, bad query setup, expected
result verification, baseline plan capture, hints, reference optimization,
correctness tests, benchmark scripts, and trade-off documentation. Correctness
tests and benchmark tasks are mandatory for every scenario.

Reviews MUST reject changes that make the bad state unmeasurable, place the
optimization in the starting exercise, omit local Docker Compose execution, or
replace PostgreSQL optimization with application-cache masking.

## Governance

This constitution supersedes conflicting repository practices and templates.
Amendments MUST update this file and any affected Spec Kit templates or runtime
guidance in the same change. Each amendment MUST include a Sync Impact Report
summarizing version changes, modified principles, updated templates, and any
deferred follow-up.

Versioning follows semantic versioning:

- MAJOR: removes or redefines a core principle in a backward-incompatible way.
- MINOR: adds a principle, required section, quality gate, or materially expands
  scenario obligations.
- PATCH: clarifies wording, fixes errors, or makes non-semantic refinements.

Compliance MUST be reviewed during specification, planning, task generation, and
implementation review. Any exception MUST be documented in the implementation
plan with a measurable reason, an explicit trade-off, and a follow-up path back
to compliance.

- Preserve the existing local hands-on SQL optimization workflow.
- Do not break existing CLI commands.
- Do not expose suggested solutions by default.
- Do not make the system auto-solve challenges for the participant.
- Keep sql/challenges as the educational source of truth.
- Preserve existing challenge IDs and challenge file structure unless explicitly required.
- Prefer additive changes over rewrites.
- Every server-side feature must validate correctness against expected-result.json.
- Leaderboard results must include only correct submissions.
- Avoid exact timing assertions in tests.
- Do not require paid SaaS tools.
- Keep every iteration independently shippable.

**Version**: 1.0.0 | **Ratified**: 2026-05-17 | **Last Amended**: 2026-05-17
