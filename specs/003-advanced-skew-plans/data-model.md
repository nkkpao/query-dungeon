# Data Model: Advanced Skew Plans

## Advanced Challenge Variant

Represents an additive harder version of an existing challenge.

**Fields**

- `parentChallengeId`: existing challenge ID, unchanged.
- `variantId`: `advanced`.
- `title`: learner-facing variant title.
- `difficulty`: normally `hard` or `boss`.
- `challengePath`: `sql/challenges/<id>/variants/advanced/challenge.md`.
- `baselineSqlPath`: `sql/challenges/<id>/variants/advanced/baseline.sql`.
- `dataProfilePath`: `sql/challenges/<id>/variants/advanced/data-profile.md`.
- `expectedResultPath`: `sql/challenges/<id>/variants/advanced/expected-result.json`.
- `recordedPlanPath`: `sql/challenges/<id>/variants/advanced/recorded-plan.medium.txt`.
- `hintsPath`: `sql/challenges/<id>/variants/advanced/hints.md`.
- `optionalOfficialSolutionSqlPath`: `sql/challenges/<id>/variants/advanced/optional/official-solution.sql`.
- `optionalOfficialIndexesSqlPath`: `sql/challenges/<id>/variants/advanced/optional/official-indexes.sql`.
- `planSymptoms`: stable planner symptoms expected in the recorded plan.

**Validation Rules**

- `parentChallengeId` must match an existing baseline challenge.
- Existing baseline challenge files must not be moved, renamed, or modified as a
  side effect of adding the variant.
- `variantId` must be `advanced` for this feature.
- `recordedPlanPath` must exist for every advanced variant.
- Optional official solution paths may exist but must not be required by default
  learner workflows.

## Data Profile

Documents the medium-scale data assumptions required by an advanced variant.

**Fields**

- `scale`: canonical value `medium`.
- `skewTypes`: one or more of hot users, hot products, heavy categories,
  long-tail products, uneven order volumes, NULL-heavy columns,
  low-selectivity statuses, time-based clustering.
- `affectedTables`: tables whose distributions are intentionally skewed.
- `expectedSymptoms`: plan symptoms the skew is intended to reveal.
- `smokeScaleBehavior`: note for how the variant behaves on `small`.

**Validation Rules**

- Every advanced variant must document at least one skew type.
- The profile must explain why medium scale is required for the recorded plan.
- The profile must not require medium scale for default CI smoke tests.

## Recorded Baseline Plan

Committed text artifact containing the baseline `EXPLAIN (ANALYZE, BUFFERS)`
output for an advanced variant.

**Fields**

- `scale`: `medium`.
- `sourceQuery`: the variant baseline SQL.
- `planText`: recorded explain output.
- `structuralMarkers`: symptoms that validation expects to find.
- `captureInstructions`: maintainer command or doc reference used to regenerate
  the artifact.

**Validation Rules**

- Must include evidence of `EXPLAIN (ANALYZE, BUFFERS)`.
- Must include actual execution information and buffer information.
- Must include one or more expected structural markers.
- Must not be validated by exact execution time equality.

## Seed Skew Profile

Represents deterministic medium-scale data distribution changes.

**Fields**

- `hotUsers`: concentrated user activity distribution.
- `hotProducts`: product IDs with disproportionate order activity.
- `heavyCategories`: categories with disproportionate product counts or sales.
- `longTailProducts`: many products with sparse activity.
- `unevenOrderVolumes`: order volume imbalance across users or time.
- `nullHeavyColumns`: selected columns with high NULL ratio.
- `lowSelectivityStatuses`: status values that match many rows.
- `timeBasedClustering`: inserted or generated timestamps clustered by period.

**Validation Rules**

- Skew generation must be deterministic.
- Small seed defaults must remain lightweight and suitable for smoke tests.
- Medium seed must be sufficient to regenerate recorded plans.

## Official Solution

Optional reference artifact for comparison only.

**Fields**

- `solutionSqlPath`: optional optimized SQL.
- `indexesSqlPath`: optional index changes.
- `tradeOffNotes`: storage, write overhead, specificity, and maintainability
  notes, either in docs or optional solution material.

**Validation Rules**

- Must remain outside default command execution.
- Must not be used by recorded-plan generation for baseline artifacts.
- Must not be required for validation, explain, benchmark, or normal challenge
  execution.

## State Transitions

```text
Normal challenge only
  -> Advanced variant added
  -> Medium skew profile documented
  -> Baseline plan recorded
  -> Structural markers validated
  -> Optional solution added for explicit comparison
```

No transition may modify or replace the existing normal challenge ID.
