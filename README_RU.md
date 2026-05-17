# Postgres Query Dungeon

Этот репозиторий намеренно неэффективен по замыслу. Медленный базовый SQL - это учебный материал, а не рекомендация для продакшена.

## Путь квеста

1. Установите зависимости и запустите PostgreSQL:

   ```bash
   make setup
   ```

2. Загрузите безопасный локальный набор данных:

   ```bash
   make seed SEED_SCALE=small
   ```

3. Выведите список головоломок:

   ```bash
   npx tsx src/cli/index.ts list
   ```

4. Запустите плохой базовый вариант для первой головоломки:

   ```bash
   make run CHALLENGE=01-user-orders-missing-index
   ```

5. Прочитайте план:

   ```bash
   make explain CHALLENGE=01-user-orders-missing-index
   ```

6. Сравните корректность и бенчмарк до/после:

   ```bash
   make compare CHALLENGE=01-user-orders-missing-index
   make benchmark CHALLENGE=01-user-orders-missing-index
   ```

7. Примените и переиграйте эталонные решения:

   ```bash
   make apply-solution CHALLENGE=01-user-orders-missing-index
   make reset-solutions
   ```

Сначала используйте `SEED_SCALE=small`. `medium` нацелен на полноценную учебную форму, а `large` включается явно для более выраженных локальных симптомов в планах. Абсолютные времена зависят от машины; сравнивайте плохой вариант и вариант с решением на одном и том же seed-наборе.

## Каталог задач

Каталог содержит 12 головоломок по оптимизации PostgreSQL: отсутствующие индексы, низкая селективность, expression-индексы, коррелированные подзапросы, чрезмерные JOIN, плохая пагинация, сканирование JSONB, sort spill, материализация CTE, чрезмерное использование оконных функций, форма запроса в стиле N+1 и устаревшая статистика.

## Руководства

- [Как читать EXPLAIN](docs/how-to-explain.md)
- [Шпаргалка по индексированию](docs/indexing-cheatsheet.md)
- [Рабочий процесс оптимизации](docs/query-optimization-workflow.md)
- [Дорожная карта](docs/roadmap.md)
