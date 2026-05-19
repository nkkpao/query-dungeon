# Suggested Solutions / Предлагаемые решения

This directory contains suggested solutions and is outside the default learner workflow. Open it only after you want to compare your own attempt with the maintained reference.

Эта папка содержит предлагаемые решения и не входит в обычный маршрут упражнения. Открывайте ее только после того, как захотите сравнить свою попытку с поддерживаемым эталоном.

Files:

- `suggested-indexes.sql`: reference schema/index changes.
- `suggested-solution.sql`: reference query.
- `baseline-explain.txt`: maintained baseline plan evidence.

Trade-offs to review: `jsonb_path_ops` is compact and effective for JSONB containment, but it is narrower than the default GIN operator class. The index adds write overhead and is most useful when the combined JSONB predicate is selective enough.
