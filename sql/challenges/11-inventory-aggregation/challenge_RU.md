# 11 Ошибка агрегации запасов

Снимите базовый план самостоятельно через `make explain-file`.

Бизнес-задача: Операциям нужны продукты с наименьшим остатком на складе.

Ожидаемый результат: `product_id`, `name`, `on_hand`; сначала минимальный остаток.

Симптомы для исследования:

- Ищите JOIN после агрегации stock, который размножает строки без изменения stock.
- Сравните grouped rows и joined rows.
- Проверьте, можно ли агрегировать ближе к таблице, владеющей метрикой.

Ограничения:

- Stock — это сумма inventory movement deltas.
- История order items не должна менять stock metric.
- Сохраните детерминированный порядок по `on_hand`, затем product id.

Критерий успеха: План считает stock из inventory movements без несвязанного detail-row expansion.

Ручной workflow:

```bash
make run-sql CHALLENGE=11-inventory-aggregation SQL=sql/challenges/11-inventory-aggregation/baseline.sql
make explain-file CHALLENGE=11-inventory-aggregation SQL=sql/challenges/11-inventory-aggregation/baseline.sql
cp sql/challenges/11-inventory-aggregation/baseline.sql workspace/sql/11-inventory-aggregation-attempt-1.sql
make validate-file CHALLENGE=11-inventory-aggregation SQL=workspace/sql/11-inventory-aggregation-attempt-1.sql
make benchmark-file CHALLENGE=11-inventory-aggregation SQL=workspace/sql/11-inventory-aggregation-attempt-1.sql ITERATIONS=3
```

Подсказки: см. `hints/hints_RU.md`.

Доступ к решению: предлагаемые решения находятся в `optional/` и не входят в обычный ход упражнения. Открывайте их только через явную команду `compare-with-suggested-solution` после собственной попытки.

Документация: см. `docs/how-to-explain.md`, `docs/indexing-cheatsheet.md` и `docs/query-optimization-workflow.md`.
