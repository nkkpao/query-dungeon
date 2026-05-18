# 12 Босс-файт: дашборд маркетплейса

Снимите базовый план самостоятельно через `make explain-file`.

Бизнес-задача: Дашборд объединяет страницу заказов, количество campaign events и открытых тикетов.

Ожидаемый результат: `id`, `user_id`, `total_cents`, `spring_events`, `open_tickets`; порядок страницы как в baseline.

Симптомы для исследования:

- Разбейте план на выбор страницы, подсчет events и подсчет tickets.
- Ищите повторные scans под per-row subqueries.
- Отдельно проверьте JSONB filtering и row estimates.

Ограничения:

- Сохраните семантику страницы дашборда и обоих counts.
- Не используйте cache или precompute вне PostgreSQL.
- Оптимизируйте по одной секции и валидируйте после каждого изменения.

Критерий успеха: План сначала определяет страницу, затем считает связанные метрики без повторного сканирования больших таблиц.

Ручной workflow:

```bash
make run-sql CHALLENGE=12-dashboard-boss-fight SQL=sql/challenges/12-dashboard-boss-fight/baseline.sql
make explain-file CHALLENGE=12-dashboard-boss-fight SQL=sql/challenges/12-dashboard-boss-fight/baseline.sql
cp sql/challenges/12-dashboard-boss-fight/baseline.sql workspace/sql/12-dashboard-boss-fight-attempt-1.sql
make validate-file CHALLENGE=12-dashboard-boss-fight SQL=workspace/sql/12-dashboard-boss-fight-attempt-1.sql
make benchmark-file CHALLENGE=12-dashboard-boss-fight SQL=workspace/sql/12-dashboard-boss-fight-attempt-1.sql ITERATIONS=3
```

Подсказки: см. `hints/hints_RU.md`.

Доступ к решению: предлагаемые решения находятся в `optional/` и не входят в обычный ход упражнения. Открывайте их только через явную команду `compare-with-official-solution` после собственной попытки.

Документация: см. `docs/how-to-explain.md`, `docs/indexing-cheatsheet.md` и `docs/query-optimization-workflow.md`.
