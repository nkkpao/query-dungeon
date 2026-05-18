# 04 OFFSET-пагинация по большой таблице

Снимите базовый план самостоятельно через `make explain-file`.

Бизнес-задача: Админский экран получает глубокую страницу заказов.

Ожидаемый результат: `id`, `user_id`, `status`, `created_at`, `total_cents`; порядок страницы как в baseline.

Симптомы для исследования:

- Посмотрите, сколько отсортированных строк PostgreSQL должен пройти перед возвратом страницы.
- Сравните top-N sort с путем по упорядоченному индексу.
- Разберите cursor/keyset pagination против произвольных номеров страниц.

Ограничения:

- Сохраните стабильный порядок `created_at DESC, id DESC`.
- Если вводите cursor, зафиксируйте, откуда берется значение cursor.
- Не прячьте работу в application code.

Критерий успеха: Попытка делает навигацию по странице зависимой от ordered access path, а не от повторного прохода по пропущенным строкам.

Ручной workflow:

```bash
make run-sql CHALLENGE=04-offset-pagination SQL=sql/challenges/04-offset-pagination/baseline.sql
make explain-file CHALLENGE=04-offset-pagination SQL=sql/challenges/04-offset-pagination/baseline.sql
cp sql/challenges/04-offset-pagination/baseline.sql workspace/sql/04-offset-pagination-attempt-1.sql
make validate-file CHALLENGE=04-offset-pagination SQL=workspace/sql/04-offset-pagination-attempt-1.sql
make benchmark-file CHALLENGE=04-offset-pagination SQL=workspace/sql/04-offset-pagination-attempt-1.sql ITERATIONS=3
```

Подсказки: см. `hints/hints_RU.md`.

Доступ к решению: предлагаемые решения находятся в `optional/` и не входят в обычный ход упражнения. Открывайте их только через явную команду `compare-with-official-solution` после собственной попытки.

Документация: см. `docs/how-to-explain.md`, `docs/indexing-cheatsheet.md` и `docs/query-optimization-workflow.md`.
