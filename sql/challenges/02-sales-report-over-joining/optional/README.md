# Suggested Solutions / Предлагаемые решения

This directory contains suggested solutions and is outside the default learner workflow. Open it only after you want to compare your own attempt with the maintained reference.

Эта папка содержит предлагаемые решения и не входит в обычный маршрут упражнения. Открывайте ее только после того, как захотите сравнить свою попытку с поддерживаемым эталоном.

Files:

- `suggested-indexes.sql`: reference schema/index changes.
- `suggested-solution.sql`: reference query.
- `baseline-explain.txt`: maintained baseline plan evidence.

Trade-offs to review: the query rewrite removes the unnecessary `users` join; the covering `order_items` index supports the category-to-items access path without relying on low-selectivity order statuses. It adds write overhead and storage, and may not help reports that start from orders instead of products/categories.
