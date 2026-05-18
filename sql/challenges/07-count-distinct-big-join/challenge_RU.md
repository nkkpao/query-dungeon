# 07 COUNT DISTINCT поверх большого JOIN

Снимите базовый план самостоятельно через `make explain-file`.

Бизнес-задача: Бизнесу нужны количества оплаченных заказов по стране пользователя.

Ожидаемый результат: `country`, `orders_count`; сначала максимальное количество.

Симптомы для исследования:

- Найдите размножение строк перед `count(DISTINCT ...)`.
- Проверьте, фиксирует ли materialization слишком большой intermediate set.
- Определите joined tables, которые не влияют на итоговый count.

Ограничения:

- Считайте только distinct paid, shipped и delivered orders.
- Страна должна по-прежнему браться у владельца заказа.
- Удаляйте JOIN только с аргументом корректности.

Критерий успеха: План считает те же заказы по странам без построения огромного expanded relation.

Ручной workflow:

```bash
make run-sql CHALLENGE=07-count-distinct-big-join SQL=sql/challenges/07-count-distinct-big-join/baseline.sql
make explain-file CHALLENGE=07-count-distinct-big-join SQL=sql/challenges/07-count-distinct-big-join/baseline.sql
cp sql/challenges/07-count-distinct-big-join/baseline.sql workspace/sql/07-count-distinct-big-join-attempt-1.sql
make validate-file CHALLENGE=07-count-distinct-big-join SQL=workspace/sql/07-count-distinct-big-join-attempt-1.sql
make benchmark-file CHALLENGE=07-count-distinct-big-join SQL=workspace/sql/07-count-distinct-big-join-attempt-1.sql ITERATIONS=3
```

Подсказки: см. `hints/hints_RU.md`.

Доступ к решению: предлагаемые решения находятся в `optional/` и не входят в обычный ход упражнения. Открывайте их только через явную команду `compare-with-official-solution` после собственной попытки.

Документация: см. `docs/how-to-explain.md`, `docs/indexing-cheatsheet.md` и `docs/query-optimization-workflow.md`.
