# 08 Последние события пользователя

Снимите базовый план самостоятельно через `make explain-file`.

Бизнес-задача: Страница профиля показывает самые новые события одного пользователя.

Ожидаемый результат: `id`, `user_id`, `event_type`, `metadata`, `created_at`; сначала новые события.

Симптомы для исследования:

- Ищите широкий scan по `user_events`.
- Сравните user predicate с нужной сортировкой.
- Проверьте, не вводит ли план в заблуждение нерелевантный single-column index.

Ограничения:

- Сохраните фильтр пользователя и детерминированный порядок.
- Не precompute ленту вне PostgreSQL.
- Измеряйте latency и buffers.

Критерий успеха: Лента читается через путь, упорядоченный для одного пользователя, а не через сортировку широкого scan.

Ручной workflow:

```bash
make run-sql CHALLENGE=08-latest-user-events SQL=sql/challenges/08-latest-user-events/baseline.sql
make explain-file CHALLENGE=08-latest-user-events SQL=sql/challenges/08-latest-user-events/baseline.sql
cp sql/challenges/08-latest-user-events/baseline.sql workspace/sql/08-latest-user-events-attempt-1.sql
make validate-file CHALLENGE=08-latest-user-events SQL=workspace/sql/08-latest-user-events-attempt-1.sql
make benchmark-file CHALLENGE=08-latest-user-events SQL=workspace/sql/08-latest-user-events-attempt-1.sql ITERATIONS=3
```

Подсказки: см. `hints/hints_RU.md`.

Доступ к решению: предлагаемые решения находятся в `optional/` и не входят в обычный ход упражнения. Открывайте их только через явную команду `compare-with-suggested-solution` после собственной попытки.

Документация: см. `docs/how-to-explain.md`, `docs/indexing-cheatsheet.md` и `docs/query-optimization-workflow.md`.
