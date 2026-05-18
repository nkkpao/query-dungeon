# 09 Частичный индекс для неоплаченных заказов

Снимите базовый план самостоятельно через `make explain-file`.

Бизнес-задача: Финансы разбирают недавние неоплаченные заказы.

Ожидаемый результат: `id`, `user_id`, `status`, `created_at`, `total_cents`; сначала новые unpaid orders.

Симптомы для исследования:

- Измерьте селективность `status = unpaid`.
- Проверьте, сканирует ли план много paid orders ради маленького working set.
- Разберите partial indexes и стабильность predicate.

Ограничения:

- В ответе должны быть только unpaid orders.
- Сохраните порядок `created_at DESC, id DESC`.
- Зафиксируйте, почему partial index подходит или не подходит.

Критерий успеха: Запрос использует путь доступа, размер которого соответствует unpaid working set.

Ручной workflow:

```bash
make run-sql CHALLENGE=09-unpaid-orders-partial-index SQL=sql/challenges/09-unpaid-orders-partial-index/baseline.sql
make explain-file CHALLENGE=09-unpaid-orders-partial-index SQL=sql/challenges/09-unpaid-orders-partial-index/baseline.sql
cp sql/challenges/09-unpaid-orders-partial-index/baseline.sql workspace/sql/09-unpaid-orders-partial-index-attempt-1.sql
make validate-file CHALLENGE=09-unpaid-orders-partial-index SQL=workspace/sql/09-unpaid-orders-partial-index-attempt-1.sql
make benchmark-file CHALLENGE=09-unpaid-orders-partial-index SQL=workspace/sql/09-unpaid-orders-partial-index-attempt-1.sql ITERATIONS=3
```

Подсказки: см. `hints/hints_RU.md`.

Доступ к решению: предлагаемые решения находятся в `optional/` и не входят в обычный ход упражнения. Открывайте их только через явную команду `compare-with-suggested-solution` после собственной попытки.

Документация: см. `docs/how-to-explain.md`, `docs/indexing-cheatsheet.md` и `docs/query-optimization-workflow.md`.
