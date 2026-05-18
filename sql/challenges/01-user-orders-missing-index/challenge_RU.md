# 01 Заказы пользователя без индекса

Снимите базовый план самостоятельно через `make explain-file`.

Бизнес-задача: Поддержке нужны последние заказы одного клиента при разборе обращения.

Ожидаемый результат: `id`, `user_id`, `status`, `created_at`, `total_cents`; сначала самые новые заказы.

Симптомы для исследования:

- Проверьте, может ли PostgreSQL сузиться до одного пользователя до сортировки.
- Сравните возвращенные строки со строками, отброшенными фильтром.
- Используйте buffers, чтобы понять, читает ли запрос намного больше данных, чем нужно для ответа.

Ограничения:

- Сохраните детерминированную сортировку `created_at DESC, id DESC`.
- Не меняйте бизнес-фильтр и limit.
- Индексные эксперименты кладите в `workspace/indexes/` и запускайте вручную.

Критерий успеха: Запрос остается корректным и не сканирует большую часть `orders` ради lookup одного пользователя.

Ручной workflow:

```bash
make run-sql CHALLENGE=01-user-orders-missing-index SQL=sql/challenges/01-user-orders-missing-index/baseline.sql
make explain-file CHALLENGE=01-user-orders-missing-index SQL=sql/challenges/01-user-orders-missing-index/baseline.sql
cp sql/challenges/01-user-orders-missing-index/baseline.sql workspace/sql/01-user-orders-missing-index-attempt-1.sql
make validate-file CHALLENGE=01-user-orders-missing-index SQL=workspace/sql/01-user-orders-missing-index-attempt-1.sql
make benchmark-file CHALLENGE=01-user-orders-missing-index SQL=workspace/sql/01-user-orders-missing-index-attempt-1.sql ITERATIONS=3
```

Подсказки: см. `hints/hints_RU.md`.

Доступ к решению: предлагаемые решения находятся в `optional/` и не входят в обычный ход упражнения. Открывайте их только через явную команду `compare-with-official-solution` после собственной попытки.

Документация: см. `docs/how-to-explain.md`, `docs/indexing-cheatsheet.md` и `docs/query-optimization-workflow.md`.
