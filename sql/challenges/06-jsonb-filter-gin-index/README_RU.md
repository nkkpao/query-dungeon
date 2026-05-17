# 06 JSONB-фильтр без GIN

Базовый план: пересоздайте командой make explain CHALLENGE=06-jsonb-filter-gin-index.

Бизнес-задача: найти премиальные продукты, сохраненные в JSONB-атрибутах.

Подсказки: изучите JSONB containment и тип сканирования.

Компромиссы: GIN-индексы могут быть большими и медленнее обслуживаться при записях.

Документация: см. `docs/how-to-explain.md`, `docs/indexing-cheatsheet.md` и `docs/query-optimization-workflow.md`.
