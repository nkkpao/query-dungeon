# Project Guardrails

Postgres Query Dungeon is a hands-on performance engineering lab. The project
must preserve manual investigation, exploratory learning, and participant-driven
optimization.

## Non-Negotiable Rules

- Never optimize baseline queries.
- Never expose official solutions by default.
- Never automate challenge solving.
- Never replace manual `EXPLAIN ANALYZE` workflows with abstractions.
- Preserve hands-on investigation.
- Preserve exploratory learning.
- Benchmark tooling must support arbitrary participant SQL.
- Challenge flow must encourage experimentation.
- Official solutions are for comparison only.
- Prefer lab-style workflows over tutorial-style workflows.

## Practical Implications

- Baseline SQL must remain intentionally inefficient and learner-editable.
- Default commands must run participant-selected SQL, not official solution SQL.
- Validation must check correctness without executing official solutions.
- Benchmarks must help participants measure their own hypotheses.
- Index creation should be a manual participant activity.
- Hints may guide investigation but must not reveal the final answer.
- Reference solutions must stay outside the active challenge flow.
- Documentation should teach how to investigate, not how to replay a solved path.
