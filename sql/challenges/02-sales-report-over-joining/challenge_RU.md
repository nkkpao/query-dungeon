# 02 Отчет по продажам с лишними JOIN

Снимите базовый план самостоятельно через `make explain-file`.

Бизнес-задача: ранжировать категории по оплаченной выручке.

Ручной workflow:

```bash
make run-sql CHALLENGE=02-sales-report-over-joining SQL=sql/challenges/02-sales-report-over-joining/baseline.sql
make explain-file CHALLENGE=02-sales-report-over-joining SQL=sql/challenges/02-sales-report-over-joining/baseline.sql
cp sql/challenges/02-sales-report-over-joining/baseline.sql workspace/sql/02-sales-report-over-joining-attempt-1.sql
make validate-file CHALLENGE=02-sales-report-over-joining SQL=workspace/sql/02-sales-report-over-joining-attempt-1.sql
make benchmark-file CHALLENGE=02-sales-report-over-joining SQL=workspace/sql/02-sales-report-over-joining-attempt-1.sql ITERATIONS=3
```

Подсказки:

- Базовый вариант присоединяет таблицу, которая не меняет запрошенную метрику.
- Следите за количеством строк до агрегации.
- Уберите необязательные JOIN до выбора индексов.

Доступ к решению: официальные материалы находятся в `optional/` и не входят в обычный ход упражнения. Открывайте их только через явную команду `compare-with-official-solution` после собственной попытки.

Документация: см. `docs/how-to-explain.md`, `docs/indexing-cheatsheet.md` и `docs/query-optimization-workflow.md`.
