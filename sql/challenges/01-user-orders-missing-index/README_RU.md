# 01 Заказы пользователя без индекса

Базовый план: пересоздайте командой make explain CHALLENGE=01-user-orders-missing-index.

Бизнес-задача: поддержке нужны последние заказы одного пользователя.

Запуск:

```bash
make run CHALLENGE=01-user-orders-missing-index
make explain CHALLENGE=01-user-orders-missing-index
make compare CHALLENGE=01-user-orders-missing-index
```

Подсказки:

- Найдите сканирование по `orders`.
- Сравните колонки фильтрации с колонками сортировки.
- Спроектируйте самый узкий путь доступа для этого запроса поддержки.

Компромиссы: эталонный индекс ускоряет этот lookup, но добавляет стоимость записи и хранения для каждой вставки заказа.

Документация: см. `docs/how-to-explain.md`, `docs/indexing-cheatsheet.md` и `docs/query-optimization-workflow.md`.
