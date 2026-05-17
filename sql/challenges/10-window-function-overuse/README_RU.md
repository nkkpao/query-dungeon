# 10 Чрезмерное использование оконных функций

Базовый план: пересоздайте командой make explain CHALLENGE=10-window-function-overuse.

Бизнес-задача: найти самый крупный оплаченный заказ каждого пользователя.

Подсказки: не каждый запрос top-per-group требует нескольких оконных функций.

Компромиссы: `DISTINCT ON` специфичен для PostgreSQL и зависит от аккуратной сортировки.

Документация: см. `docs/how-to-explain.md`, `docs/indexing-cheatsheet.md` и `docs/query-optimization-workflow.md`.
