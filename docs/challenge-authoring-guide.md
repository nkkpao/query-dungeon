# Challenge Authoring Guide

Each challenge directory must be a complete investigation packet:

- `challenge.md`: business context, task, expected output shape, symptoms,
  constraints, manual workflow, and solution access notice.
- `baseline.sql`: intentionally inefficient starting query.
- `expected-result.json`: deterministic correctness contract.
- `hints/hints.md`: graduated English guidance that does not reveal suggested SQL.
- `hints/hints_RU.md`: graduated Russian guidance that does not reveal suggested SQL.
- `optional/suggested-indexes.sql`: reference index/schema changes.
- `optional/suggested-solution.sql`: reference query.
- `optional/baseline-explain.txt`: maintained baseline plan evidence.
- `optional/README.md`: access notice and trade-off reminder.

Preserve the bad starting state. Do not place suggested index names, optimized
query text, or optimized plans in learner-facing files.

Authoring checklist:

1. Seed data makes the baseline symptom measurable.
2. `baseline.sql` runs through `run-sql` and `explain-file`.
3. Participant attempts can be validated with `validate-file`.
4. `benchmark-file --baseline --iterations 3` works for the baseline and a
   workspace attempt.
5. Suggested solutions are only reachable through `optional/` and explicit
   solution comparison.
6. Trade-offs document storage, write cost, specificity, maintenance, and
   limits of the reference approach.

## Advanced Variants

Advanced variants are additive packets under an existing challenge:

```text
sql/challenges/challenge-XX/
  baseline.sql
  challenge.md
  hints/
  variants/
    advanced/
      baseline.sql
      challenge.md
      data-profile.md
      expected-result.json
      hints.md
      result-fixture.sql
      recorded-plan.medium.txt
      optional/
        official-solution.sql
        official-indexes.sql
```

Do not replace or renumber the parent challenge. The parent baseline remains the
default learner workflow; the advanced variant is selected explicitly with
`--variant advanced` or `VARIANT=advanced`.

Advanced variant prompts must include:

- challenge description and baseline bad query location
- `SEED_SCALE=medium` data assumptions
- expected planner symptoms
- reference to `recorded-plan.medium.txt`
- hints that preserve manual investigation
- a correctness fixture query that is independent from `baseline.sql`
- optional official files only inside `optional/`

Recorded plans are text artifacts captured with
`EXPLAIN (ANALYZE, BUFFERS)`. Validate them by structural markers, not exact
timings. Normal challenge commands must not regenerate recorded plans or compare
participant SQL with official solutions unless the user invokes an explicit
solution-comparison command.

## Cumulative Boss Fights

Top-level boss fights, such as
`sql/challenges/13-boss-fight-marketplace-operations-dashboard/`, should remain
normal registered challenges rather than advanced variants when they are meant
to come after the numbered catalog. They must preserve all earlier challenge
IDs and the default manual workflow.

For a cumulative challenge:

- Combine several earlier anti-patterns in one production-like query.
- Keep the bad query in `baseline.sql`; do not make default commands apply
  reference indexes or run the suggested solution.
- Put the reference rewrite, index set, and captured plan evidence only under
  `optional/`.
- Document what participants may change, what they must not change, and how to
  validate a scratch SQL file.
- Prefer `SEED_SCALE=medium` for investigation when the small seed is only a
  fast correctness smoke test.
