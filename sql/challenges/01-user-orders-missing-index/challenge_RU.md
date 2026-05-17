# 01 Заказы пользователя без индекса

Снимите базовый план самостоятельно через `make explain-file`.

Бизнес-задача: поддержке нужны последние заказы одного пользователя.

Ручной workflow:

```bash
make run-sql CHALLENGE=01-user-orders-missing-index SQL=sql/challenges/01-user-orders-missing-index/baseline.sql
make explain-file CHALLENGE=01-user-orders-missing-index SQL=sql/challenges/01-user-orders-missing-index/baseline.sql
cp sql/challenges/01-user-orders-missing-index/baseline.sql workspace/sql/01-user-orders-missing-index-attempt-1.sql
make validate-file CHALLENGE=01-user-orders-missing-index SQL=workspace/sql/01-user-orders-missing-index-attempt-1.sql
make benchmark-file CHALLENGE=01-user-orders-missing-index SQL=workspace/sql/01-user-orders-missing-index-attempt-1.sql ITERATIONS=3
```

Подсказки:

- Найдите сканирование по `orders`.
- Сравните колонки фильтрации с колонками сортировки.
- Спроектируйте самый узкий путь доступа для этого запроса поддержки.

Доступ к решению: официальные материалы находятся в `optional/` и не входят в обычный ход упражнения. Открывайте их только через явную команду `compare-with-official-solution` после собственной попытки.

Документация: см. `docs/how-to-explain.md`, `docs/indexing-cheatsheet.md` и `docs/query-optimization-workflow.md`.
