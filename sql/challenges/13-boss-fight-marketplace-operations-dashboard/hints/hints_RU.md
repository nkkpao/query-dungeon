# Подсказки

## 1. Что смотреть в EXPLAIN

Начните с `loops` у subplans. Даже умеренно дорогой scan становится главной проблемой, если запускается один раз на каждого продавца. Затем смотрите `Buffers`, `Rows Removed by Filter`, память сортировки и насколько финальный результат мал по сравнению с объемом работы выше по плану.

## 2. Какие повторные сканы подозрительны

Ищите повторный доступ к `orders`, `order_items`, `payments`, `reviews`, `support_tickets`, `inventory_movements`, `shipments`, `payouts` и `user_events`. Дашборд считает много метрик по продавцу, но большие таблицы не нужно сканировать отдельно для каждого продавца.

## 3. Какие предикаты кандидаты на индексы

Очевидные кандидаты: фильтры status plus date для orders и shipments, join по `seller_id` через products, refunded payments, successful payouts, `lower(email)` и `lower(name)`, а также JSONB metadata filters в `user_events`.

## 4. Какие подзапросы можно предагрегировать

Попробуйте построить один CTE или derived table для order totals per seller/order, один для refunds, один для shipments, support tickets, reviews, inventory, traffic и latest payouts. Потом join маленьких агрегированных результатов к отфильтрованным продавцам.

## 5. Какие индексы могут помочь

Composite indexes помогают, когда equality или low-cardinality filters сочетаются с date ranges и joins. Partial indexes полезны для refunded payments, successful payouts, failed payouts и late-shipment candidates. Expression indexes могут поддержать `lower(...)` поиск и извлечение seller ID из JSONB. GIN index может помочь JSONB containment, если predicate достаточно селективный.

## 6. Как думать о pagination

OFFSET приемлем для маленького номера страницы, но все равно требует получить и отсортировать все предыдущие строки. Когда появится стабильный deterministic sort key, подумайте, подходит ли keyset predicate по `dashboard_score` plus `seller_id` для API дашборда.

## 7. Как валидировать эквивалентность

Валидируйте после каждого rewrite. Сохраните те же параметры, output columns, rounding, NULL behavior и порядок tie-break. Сначала используйте `make validate-file`, затем `make diff-results` против baseline, если появляется mismatch.
