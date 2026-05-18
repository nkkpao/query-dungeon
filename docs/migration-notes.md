# Migration Notes: Manual SQL Lab

The lab moved from automatic demonstration commands to participant-selected SQL
files.

## Asset Changes

- `bad.sql` became `baseline.sql`.
- `README.md` became `challenge.md`.
- `README_RU.md` became `challenge_RU.md`.
- `solution.sql` moved to `optional/official-solution.sql`.
- Official index DDL moved to `optional/official-indexes.sql`.
- Captured plan evidence moved to `optional/baseline-explain.txt`.
- `expected-result.json` is now the validation contract. Executable fixtures
  point at public `baseline.sql` so validation does not run suggested solution
  SQL.

## Command Changes

- Use `run-sql`, `explain-file`, `validate-file`, `benchmark-file`, and
  `diff-results` for normal work.
- `apply-solution`, `reset-solutions`, and automatic bad-versus-solution flows
  are not registered in the default CLI.
- Use `compare-with-official-solution` only as an explicit opt-in review step.

## Data Preservation

Seed files and baseline schema remain the reproducible data source. Baseline
queries were renamed, not optimized.
