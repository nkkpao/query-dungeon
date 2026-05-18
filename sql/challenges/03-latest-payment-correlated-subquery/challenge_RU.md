# 03 Последний платеж через коррелированный подзапрос

Снимите базовый план самостоятельно через `make explain-file`.

Бизнес-задача: Операциям нужно последнее состояние платежа для недавних неотмененных заказов.

Ожидаемый результат: `order_id`, `user_id`, `latest_payment_status`, `latest_payment_at`; сначала самые новые заказы.

Симптомы для исследования:

- Ищите повторяющиеся subplan под страницей заказов.
- Проверьте, выполняется ли один и тот же lookup платежа больше одного раза на заказ.
- Сравните порядок lookup платежей с доступными индексами.

Ограничения:

- Заказы без платежа должны оставаться в результате с null в полях последнего платежа.
- Сохраните tie-breaker последнего платежа `created_at DESC, id DESC`.
- Не решайте задачу изменением бизнес-лимита.

Критерий успеха: План делает один lookup последнего платежа на видимый заказ и использует путь доступа, совпадающий с порядком lookup.

Ручной workflow:

```bash
make run-sql CHALLENGE=03-latest-payment-correlated-subquery SQL=sql/challenges/03-latest-payment-correlated-subquery/baseline.sql
make explain-file CHALLENGE=03-latest-payment-correlated-subquery SQL=sql/challenges/03-latest-payment-correlated-subquery/baseline.sql
cp sql/challenges/03-latest-payment-correlated-subquery/baseline.sql workspace/sql/03-latest-payment-correlated-subquery-attempt-1.sql
make validate-file CHALLENGE=03-latest-payment-correlated-subquery SQL=workspace/sql/03-latest-payment-correlated-subquery-attempt-1.sql
make benchmark-file CHALLENGE=03-latest-payment-correlated-subquery SQL=workspace/sql/03-latest-payment-correlated-subquery-attempt-1.sql ITERATIONS=3
```

Подсказки: см. `hints/hints_RU.md`.

Доступ к решению: предлагаемые решения находятся в `optional/` и не входят в обычный ход упражнения. Открывайте их только через явную команду `compare-with-suggested-solution` после собственной попытки.

Документация: см. `docs/how-to-explain.md`, `docs/indexing-cheatsheet.md` и `docs/query-optimization-workflow.md`.
