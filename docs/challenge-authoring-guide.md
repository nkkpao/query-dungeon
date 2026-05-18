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
