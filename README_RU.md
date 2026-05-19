# Postgres Query Dungeon

Это практическая лаборатория по оптимизации PostgreSQL. Медленный базовый SQL
является стартовой точкой: участник сам запускает запрос, снимает
`EXPLAIN (ANALYZE, BUFFERS)`, формулирует гипотезу, меняет SQL или индексы в
своей рабочей области, проверяет корректность и повторяет бенчмарки.

## Исследовательский маршрут

1. Запустите PostgreSQL и соберите CLI:

   ```bash
   make setup
   ```

2. Загрузите воспроизводимый локальный набор данных:

   ```bash
   make seed SEED_SCALE=small
   ```

3. Посмотрите список задач и откройте описание:

   ```bash
   make list
   less sql/challenges/01-user-orders-missing-index/challenge.md
   ```

4. Запустите базовый запрос вручную:

   ```bash
   make run-sql CHALLENGE=01-user-orders-missing-index \
     SQL=sql/challenges/01-user-orders-missing-index/baseline.sql
   ```

5. Снимите план:

   ```bash
   make explain-file CHALLENGE=01-user-orders-missing-index \
     SQL=sql/challenges/01-user-orders-missing-index/baseline.sql
   ```

6. Создайте собственную попытку:

   ```bash
   cp sql/challenges/01-user-orders-missing-index/baseline.sql \
     workspace/sql/01-user-orders-attempt-1.sql
   ```

   Ручные эксперименты с индексами храните в `workspace/indexes/`, заметки - в
   `workspace/notes/`.

7. Проверьте корректность и измерьте попытку:

   ```bash
   make validate-file CHALLENGE=01-user-orders-missing-index \
     SQL=workspace/sql/01-user-orders-attempt-1.sql

   make benchmark-file CHALLENGE=01-user-orders-missing-index \
     SQL=workspace/sql/01-user-orders-attempt-1.sql ITERATIONS=3
   ```

8. Сравните две свои попытки:

   ```bash
   make diff-results CHALLENGE=01-user-orders-missing-index \
     LEFT=workspace/sql/01-user-orders-attempt-1.sql \
     RIGHT=workspace/sql/01-user-orders-attempt-2.sql
   ```

Предлагаемые решения находятся в `optional/` внутри каждой задачи и не входят в
обычный маршрут. Команду `compare-with-suggested-solution` запускайте только если
сознательно хотите выйти из режима упражнения.

## Каталог задач

В каталоге 13 задач по PostgreSQL: отсутствующие индексы, низкая
селективность, expression-индексы, коррелированные подзапросы, чрезмерные JOIN,
плохая пагинация, JSONB-сканирование, sort spill, материализация CTE, избыток
оконных функций, форма N+1, устаревшая статистика и итоговый boss fight по
операционному дашборду маркетплейса после первых 12 задач.

## Продвинутые варианты

Некоторые задачи имеют дополнительные варианты в `variants/advanced/`. Они не
меняют исходные ID и базовые задания, но рассчитаны на перекошенные данные
`SEED_SCALE=medium` и включают справочные планы
`recorded-plan.medium.txt`.

Запуск выполняется явно:

```bash
make seed SEED_SCALE=medium
make explain-file CHALLENGE=04-offset-pagination VARIANT=advanced \
  SQL=sql/challenges/04-offset-pagination/variants/advanced/baseline.sql
```

Записанные планы нужны как справка после собственного расследования. Обычные
команды их не пересоздают, а точные времена выполнения не являются критерием
корректности. Для сопровождения репозитория:

```bash
make record-plans SCALE=medium
make validate-recorded-plans
```

## Руководства

- [Как читать EXPLAIN](docs/how-to-explain_RU.md)
- [Шпаргалка по индексам](docs/indexing-cheatsheet_RU.md)
- [Рабочий процесс оптимизации](docs/query-optimization-workflow_RU.md)
- [Data Skew Profiles](docs/data-skew.md)
- [Recorded Plans](docs/recorded-plans.md)
- [Дорожная карта](docs/roadmap_RU.md)
