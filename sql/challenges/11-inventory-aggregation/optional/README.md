# Suggested Solutions / Предлагаемые решения

This directory contains suggested solutions and is outside the default learner workflow. Open it only after you want to compare your own attempt with the maintained reference.

Эта папка содержит предлагаемые решения и не входит в обычный маршрут упражнения. Открывайте ее только после того, как захотите сравнить свою попытку с поддерживаемым эталоном.

Files:

- `suggested-indexes.sql`: reference schema/index changes.
- `suggested-solution.sql`: reference query.
- `baseline-explain.txt`: maintained baseline plan evidence.

Trade-offs to review: the rewrite removes the row-multiplying `order_items` join; the covering inventory index can reduce heap visits during product-level aggregation. It duplicates part of the baseline product-id index and adds write/storage cost, so the query-shape fix is the primary win.
