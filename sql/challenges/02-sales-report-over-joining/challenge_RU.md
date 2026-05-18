# 02 Отчет по продажам с лишними JOIN

Снимите базовый план самостоятельно через `make explain-file`.

Бизнес-задача: Аналитика ранжирует категории по оплаченной выручке.

Ожидаемый результат: `category_id`, `category_name`, `paid_orders`, `revenue_cents`; сначала максимальная выручка.

Симптомы для исследования:

- Отслеживайте количество строк до агрегации.
- Найдите JOIN, которые размножают строки, но не меняют нужную метрику.
- Проверьте, не проливаются ли sort или aggregate nodes во временные файлы.

Ограничения:

- Выручка должна считаться только по paid, shipped и delivered заказам.
- Не удаляйте таблицу, пока не докажете, что она не влияет на ответ.
- Измеряйте после каждого rewrite до добавления индексов.

Критерий успеха: План агрегирует меньше лишних строк и сохраняет выручку и количество оплаченных заказов по категориям.

Ручной workflow:

```bash
make run-sql CHALLENGE=02-sales-report-over-joining SQL=sql/challenges/02-sales-report-over-joining/baseline.sql
make explain-file CHALLENGE=02-sales-report-over-joining SQL=sql/challenges/02-sales-report-over-joining/baseline.sql
cp sql/challenges/02-sales-report-over-joining/baseline.sql workspace/sql/02-sales-report-over-joining-attempt-1.sql
make validate-file CHALLENGE=02-sales-report-over-joining SQL=workspace/sql/02-sales-report-over-joining-attempt-1.sql
make benchmark-file CHALLENGE=02-sales-report-over-joining SQL=workspace/sql/02-sales-report-over-joining-attempt-1.sql ITERATIONS=3
```

Подсказки: см. `hints/hints_RU.md`.

Доступ к решению: предлагаемые решения находятся в `optional/` и не входят в обычный ход упражнения. Открывайте их только через явную команду `compare-with-suggested-solution` после собственной попытки.

Документация: см. `docs/how-to-explain.md`, `docs/indexing-cheatsheet.md` и `docs/query-optimization-workflow.md`.
