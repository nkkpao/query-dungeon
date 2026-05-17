# 07 COUNT DISTINCT поверх большого JOIN

Базовый план: пересоздайте командой make explain CHALLENGE=07-count-distinct-big-join.

Бизнес-задача: посчитать оплаченные заказы по странам.

Подсказки: спросите себя, какие присоединенные таблицы влияют на итоговый ответ.

Компромиссы: сокращение JOIN улучшает этот отчет, но может убрать измерения, нужные будущим вариантам.

Документация: см. `docs/how-to-explain.md`, `docs/indexing-cheatsheet.md` и `docs/query-optimization-workflow.md`.
