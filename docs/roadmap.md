# TODO / Roadmap

- Add alternate solutions for each challenge, including rewrite-only variants where possible.
- Add harder variants with larger skewed datasets and recorded medium-scale plans.
- Add more hands-on checkpoints for manual EXPLAIN notes, hypothesis history,
  and participant benchmark comparison.
- Add lock and concurrency lessons after the query-plan catalog is stable.
- Add optional REST endpoints only after all CLI workflows remain complete.
- Add workshop worksheets with answer spaces for observed plan symptoms and trade-offs.
- Add CI mode that starts PostgreSQL, seeds `small`, and runs `RUN_DB_TESTS=1`.

Priority topics to new challenges:
- stale statistics
- bad cardinality estimation
- partition pruning failures
- BRIN vs BTREE indexing
- HOT updates
- table/index bloat
- VACUUM/autovacuum issues
- inefficient DISTINCT/GROUP BY
- anti-join optimization
- EXISTS vs IN
- lateral joins
- recursive CTE performance
- materialization problems
- merge join vs hash join behavior
- work_mem related sort spills
- parallel query behavior
- TOAST-heavy rows
- wide table penalties
- time-series query optimization
- partial index strategy
- expression indexes
- covering indexes
- bitmap heap scan behavior
- nested loop explosion
- bad pagination patterns
- ORM-generated SQL hell