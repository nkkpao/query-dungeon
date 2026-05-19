# 13 Босс-файт: операционный дашборд маркетплейса

Снимите baseline-план самостоятельно через `make explain-file`.

Бизнес-задача: операционному менеджеру нужен дашборд самых проблемных активных продавцов маркетплейса за недавнее рабочее окно. Дашборд объединяет профиль продавца, оплаченные заказы, выручку, возвраты, уникальных покупателей, опоздавшие доставки, обращения в поддержку, отзывы, последнюю успешную выплату, риск по складу и трафик/конверсию из JSONB-событий.

Ожидаемый результат:

- `seller_id`
- `seller_name`
- `seller_email`
- `paid_orders_count`
- `gross_revenue`
- `refunded_revenue`
- `avg_order_value`
- `unique_buyers_count`
- `late_shipments_count`
- `support_tickets_count`
- `avg_review_rating`
- `negative_reviews_count`
- `latest_successful_payout_at`
- `inventory_risk_score`
- `recent_product_views`
- `recent_add_to_cart_events`
- `conversion_rate`
- `dashboard_score`

Симптомы для исследования:

- Несколько коррелированных подзапросов многократно сканируют одни и те же большие таблицы.
- Поиск продавца применяет `lower(...)` к колонкам профиля.
- JSONB-фильтры по metadata сканируют события по containment и извлеченным seller-атрибутам.
- Низкоселективные статусы сочетаются с фильтрами по датам на больших таблицах.
- Materialized CTE, лишний `DISTINCT`, широкий `GROUP BY` и шумные `LEFT JOIN` убирают размножение строк постфактум.
- Финальная страница использует `OFFSET` после сортировки по вычисленному score.
- Refunds, payouts, shipments, reviews, support tickets и inventory требуют разных компромиссов для composite, partial, expression, covering и GIN индексов.

Ограничения:

- Можно переписывать SQL в своем scratch-файле.
- Можно вручную создавать экспериментальные индексы в локальной базе или в `workspace/indexes/`.
- Можно менять параметры внутри scratch SQL во время исследования, но финальная проверяемая версия должна сохранить семантику и выходные колонки.
- Не меняйте seed data, чтобы ускорить запрос.
- Не редактируйте expected result contract.
- Не используйте optional reference solution, пока намеренно не выходите из режима упражнения.

Критерий успеха: переписанный SQL возвращает те же строки и колонки, что baseline при тех же параметрах, а измеренный план показывает заметно меньше повторных сканов, сортировок, размножения строк и buffer pressure. Точные timing не являются критерием.

Ручной workflow:

```bash
make seed SEED_SCALE=medium
make run-sql CHALLENGE=13-boss-fight-marketplace-operations-dashboard \
  SQL=sql/challenges/13-boss-fight-marketplace-operations-dashboard/baseline.sql
make explain-file CHALLENGE=13-boss-fight-marketplace-operations-dashboard \
  SQL=sql/challenges/13-boss-fight-marketplace-operations-dashboard/baseline.sql
cp sql/challenges/13-boss-fight-marketplace-operations-dashboard/baseline.sql \
  workspace/sql/13-boss-fight-attempt-1.sql
make validate-file CHALLENGE=13-boss-fight-marketplace-operations-dashboard \
  SQL=workspace/sql/13-boss-fight-attempt-1.sql
make benchmark-file CHALLENGE=13-boss-fight-marketplace-operations-dashboard \
  SQL=workspace/sql/13-boss-fight-attempt-1.sql ITERATIONS=3
```

Рекомендуемый порядок исследования:

1. Запустите `EXPLAIN (ANALYZE, BUFFERS)` на baseline и отметьте самые дорогие повторные сканы.
2. Найдите подзапросы, которые можно заменить одной агрегацией по fact table.
3. Проверьте, где join размножает строки до `DISTINCT` или `GROUP BY`.
4. Тестируйте индексы по одному и сравнивайте планы перед тем, как оставлять их.
5. Переписывайте запрос по этапам и валидируйте каждый этап.
6. Используйте `diff-results`, если нужно посмотреть расхождения по строкам.

Подсказки: см. `hints/hints_RU.md`.

Доступ к решению: suggested solutions лежат в `optional/` и не входят в default exercise flow. Используйте их только через явную команду `compare-with-suggested-solution` после самостоятельного исследования.

Документация: см. `docs/how-to-explain.md`, `docs/indexing-cheatsheet.md` и `docs/query-optimization-workflow.md`.
