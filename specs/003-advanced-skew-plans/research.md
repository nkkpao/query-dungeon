# Research: Advanced Skew Plans

## Decision: Store Advanced Variants Under Existing Challenge Directories

Use `sql/challenges/<existing-id>/variants/advanced/` for advanced variants.

**Rationale**: This preserves every existing challenge ID and baseline artifact
while making the advanced relationship obvious to learners and maintainers. It
also avoids turning variants into apparently independent normal challenges.

**Alternatives considered**:

- `sql/challenges/challenge-XX-advanced/`: acceptable by clarification, but it
  risks looking like a new baseline challenge ID and increases registry churn.
- Top-level `sql/advanced-challenges/`: separates advanced content too far from
  the baseline challenge and duplicates challenge discovery rules.

## Decision: Use Medium Scale as Canonical Recorded-Plan Scale

Use `SEED_SCALE=medium` as the required scale for committed recorded baseline
plans, while keeping `SEED_SCALE=small` as the default for CI and quick local
smoke tests.

**Rationale**: Medium scale is large enough to expose planner choices affected
by skew, but small scale keeps normal development and CI feedback quick.

**Alternatives considered**:

- Small-scale recorded plans: faster but hides the target planner behavior.
- Large-scale recorded plans: more realistic but too expensive and hardware
  sensitive for routine maintainer regeneration.

## Decision: Commit Recorded Plans as Text Artifacts

Store each recorded plan as `recorded-plan.medium.txt` inside the advanced
variant directory.

**Rationale**: Text artifacts are reviewable in diffs, reproducible enough for
learning, and available without forcing normal learner commands to regenerate
plans. They also match the repository's SQL-first artifact style.

**Alternatives considered**:

- Generate plans dynamically in normal challenge execution: rejected because it
  makes the learner path heavier and can turn the plan into an automatic
  solving aid.
- Store structured JSON plans only: useful for machines, but less readable for
  learners and maintainers reviewing plan symptoms.

## Decision: Validate Structural Plan Markers, Not Timings

Recorded-plan validation checks for `EXPLAIN (ANALYZE, BUFFERS)` evidence and
stable markers such as Seq Scan, bad row estimates, shared buffer reads or hits,
expensive Sort, Hash Join, Nested Loop, and rows removed by filter.

**Rationale**: Wall-clock timings vary by host, PostgreSQL patch version,
container load, and cache state. Structural symptoms better represent the
learning objective and avoid brittle tests.

**Alternatives considered**:

- Exact timing assertions: rejected as brittle and misleading.
- No validation: rejected because recorded plans could go stale silently.

## Decision: Extend Existing Medium Seed Data with Deterministic Skew

Add deterministic skew profiles to the existing medium seed path: hot users, hot
products, heavy categories, long-tail products, uneven order volumes,
NULL-heavy columns, low-selectivity statuses, and time-based clustering.

**Rationale**: Skew must be repository-controlled and repeatable so recorded
plans can be regenerated locally and reviewed meaningfully.

**Alternatives considered**:

- Separate random skew generator: rejected because random data increases plan
  drift and makes recorded plans harder to reproduce.
- New external fixture dataset: rejected because it adds dependency and import
  complexity without improving local lab control.

## Decision: Keep Official Solutions Optional and Hidden

Place advanced official solution files under `variants/advanced/optional/` and
exclude them from default run, explain, benchmark, validation, and recorded-plan
commands.

**Rationale**: The feature exists to deepen manual investigation. Solutions are
useful for maintainers and explicit comparison but must not become the learner's
default path.

**Alternatives considered**:

- Include solution comparison in advanced plan validation: rejected because it
  risks reintroducing auto-solved tutorial behavior.
- Omit official solutions entirely: rejected because maintainers still need a
  reference optimization and trade-off record.
