# Participant Workspace

Use this directory for repeatable experiments that are not official challenge
artifacts.

- `sql/`: query rewrites and alternative attempts.
- `indexes/`: manual index or schema experiments you choose to run.
- `notes/`: observations, plan snippets, benchmark runs, and hypotheses.

Keep one idea per file when possible. Rerun `make seed SEED_SCALE=small` when
scratch indexes or schema changes make measurements hard to compare.
