# 04 OFFSET-пагинация по большой таблице

Базовый план: пересоздайте командой make explain CHALLENGE=04-offset-pagination.

Бизнес-задача: получить глубокую страницу заказов.

Подсказки: OFFSET все равно проходит по пропущенным строкам; keyset-пагинации нужен стабильный курсор.

Компромиссы: keyset-пагинация меняет форму API, потому что клиенты должны передавать курсор.

Документация: см. `docs/how-to-explain.md`, `docs/indexing-cheatsheet.md` и `docs/query-optimization-workflow.md`.
