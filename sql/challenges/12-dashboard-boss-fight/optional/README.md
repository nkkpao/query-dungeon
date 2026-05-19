# Suggested Solutions / Предлагаемые решения

This directory contains suggested solutions and is outside the default learner workflow. Open it only after you want to compare your own attempt with the maintained reference.

Эта папка содержит предлагаемые решения и не входит в обычный маршрут упражнения. Открывайте ее только после того, как захотите сравнить свою попытку с поддерживаемым эталоном.

Files:

- `suggested-indexes.sql`: reference schema/index changes.
- `suggested-solution.sql`: reference query.
- `baseline-explain.txt`: maintained baseline plan evidence.

Trade-offs to review: the reference uses keyset pagination plus narrow partial indexes for the exact dashboard counts. This is fast for cursor-based navigation, but the indexes are query-specific and add write/storage overhead.
