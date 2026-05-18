# 10 Чрезмерное использование оконных функций

Снимите базовый план самостоятельно через `make explain-file`.

Бизнес-задача: Мерчандайзингу нужен самый крупный paid-like заказ каждого пользователя.

Ожидаемый результат: `user_id`, `order_id`, `total_cents`; сначала самые большие суммы.

Симптомы для исследования:

- Изучите объем сортировки перед window aggregation.
- Найдите window functions, которые не влияют на финальный ответ.
- Сравните top-per-group стратегии и их требования к порядку.

Ограничения:

- Верните один детерминированный лучший заказ на пользователя.
- Оставьте только paid, shipped и delivered statuses.
- Не убирайте tie-breaker по order id.

Критерий успеха: Запрос вычисляет top-per-user с меньшей лишней window work и планом, соответствующим grouping/order.

Ручной workflow:

```bash
make run-sql CHALLENGE=10-window-function-overuse SQL=sql/challenges/10-window-function-overuse/baseline.sql
make explain-file CHALLENGE=10-window-function-overuse SQL=sql/challenges/10-window-function-overuse/baseline.sql
cp sql/challenges/10-window-function-overuse/baseline.sql workspace/sql/10-window-function-overuse-attempt-1.sql
make validate-file CHALLENGE=10-window-function-overuse SQL=workspace/sql/10-window-function-overuse-attempt-1.sql
make benchmark-file CHALLENGE=10-window-function-overuse SQL=workspace/sql/10-window-function-overuse-attempt-1.sql ITERATIONS=3
```

Подсказки: см. `hints/hints_RU.md`.

Доступ к решению: предлагаемые решения находятся в `optional/` и не входят в обычный ход упражнения. Открывайте их только через явную команду `compare-with-official-solution` после собственной попытки.

Документация: см. `docs/how-to-explain.md`, `docs/indexing-cheatsheet.md` и `docs/query-optimization-workflow.md`.
