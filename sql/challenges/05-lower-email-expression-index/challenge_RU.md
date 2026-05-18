# 05 Поиск email без учета регистра

Снимите базовый план самостоятельно через `make explain-file`.

Бизнес-задача: Поддержка ищет пользователя по email независимо от регистра букв.

Ожидаемый результат: `id`, `email`, `status`, `country` для найденного пользователя.

Симптомы для исследования:

- Проверьте, мешает ли функция над `email` использовать уникальный индекс email.
- Сравните estimated rows и actual rows.
- Подумайте об expression indexes против изменения способа хранения данных.

Ограничения:

- Lookup должен остаться case-insensitive.
- Не удаляйте функцию, если не сохраняете семантику другим способом.
- Опишите write/storage trade-offs для expression index.

Критерий успеха: Lookup становится селективным без изменения набора совпадающих email-вариантов.

Ручной workflow:

```bash
make run-sql CHALLENGE=05-lower-email-expression-index SQL=sql/challenges/05-lower-email-expression-index/baseline.sql
make explain-file CHALLENGE=05-lower-email-expression-index SQL=sql/challenges/05-lower-email-expression-index/baseline.sql
cp sql/challenges/05-lower-email-expression-index/baseline.sql workspace/sql/05-lower-email-expression-index-attempt-1.sql
make validate-file CHALLENGE=05-lower-email-expression-index SQL=workspace/sql/05-lower-email-expression-index-attempt-1.sql
make benchmark-file CHALLENGE=05-lower-email-expression-index SQL=workspace/sql/05-lower-email-expression-index-attempt-1.sql ITERATIONS=3
```

Подсказки: см. `hints/hints_RU.md`.

Доступ к решению: предлагаемые решения находятся в `optional/` и не входят в обычный ход упражнения. Открывайте их только через явную команду `compare-with-suggested-solution` после собственной попытки.

Документация: см. `docs/how-to-explain.md`, `docs/indexing-cheatsheet.md` и `docs/query-optimization-workflow.md`.
