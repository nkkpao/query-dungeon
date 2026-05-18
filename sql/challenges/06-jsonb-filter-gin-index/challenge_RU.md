# 06 JSONB-фильтр без GIN

Снимите базовый план самостоятельно через `make explain-file`.

Бизнес-задача: Каталожная отчетность считает premium-продукты, сохраненные внутри JSONB attributes.

Ожидаемый результат: Одна строка с `premium_products`.

Симптомы для исследования:

- Проверьте, выполняется ли JSONB containment через сканирование всех products.
- Сравните селективность предиката с размером таблицы.
- Разберите стоимость GIN index, storage и write overhead.

Ограничения:

- Сохраните семантически эквивалентный JSONB containment predicate.
- Не выносите извлечение атрибута в application code.
- Измерьте, помогает ли индекс на выбранном seed scale.

Критерий успеха: План может использовать JSONB-aware путь доступа, когда селективность и scale это оправдывают.

Ручной workflow:

```bash
make run-sql CHALLENGE=06-jsonb-filter-gin-index SQL=sql/challenges/06-jsonb-filter-gin-index/baseline.sql
make explain-file CHALLENGE=06-jsonb-filter-gin-index SQL=sql/challenges/06-jsonb-filter-gin-index/baseline.sql
cp sql/challenges/06-jsonb-filter-gin-index/baseline.sql workspace/sql/06-jsonb-filter-gin-index-attempt-1.sql
make validate-file CHALLENGE=06-jsonb-filter-gin-index SQL=workspace/sql/06-jsonb-filter-gin-index-attempt-1.sql
make benchmark-file CHALLENGE=06-jsonb-filter-gin-index SQL=workspace/sql/06-jsonb-filter-gin-index-attempt-1.sql ITERATIONS=3
```

Подсказки: см. `hints/hints_RU.md`.

Доступ к решению: предлагаемые решения находятся в `optional/` и не входят в обычный ход упражнения. Открывайте их только через явную команду `compare-with-suggested-solution` после собственной попытки.

Документация: см. `docs/how-to-explain.md`, `docs/indexing-cheatsheet.md` и `docs/query-optimization-workflow.md`.
