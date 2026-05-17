DATABASE_URL ?= postgresql://dungeon:dungeon@localhost:54329/dungeon
SEED_SCALE ?= small
QUERY_TIMEOUT_MS ?= 15000
CHALLENGE ?= 01-user-orders-missing-index
SQL ?= sql/challenges/$(CHALLENGE)/baseline.sql
LEFT ?= workspace/sql/attempt-1.sql
RIGHT ?= workspace/sql/attempt-2.sql
ITERATIONS ?= 3

CLI = node dist/src/cli/index.js --database-url $(DATABASE_URL) --scale $(SEED_SCALE) --timeout-ms $(QUERY_TIMEOUT_MS)

.PHONY: setup seed list run-sql explain-file benchmark-file validate-file diff-results compare-with-official-solution reset test build

setup:
	npm install
	npm run build
	docker compose up -d

seed:
	$(CLI) seed --scale $(SEED_SCALE)

list:
	$(CLI) list

run-sql:
	$(CLI) run-sql $(CHALLENGE) --file $(SQL)

explain-file:
	$(CLI) explain-file $(CHALLENGE) --file $(SQL)

benchmark-file:
	$(CLI) benchmark-file $(CHALLENGE) --file $(SQL) --baseline --iterations $(ITERATIONS)

validate-file:
	$(CLI) validate-file $(CHALLENGE) --file $(SQL)

diff-results:
	$(CLI) diff-results $(CHALLENGE) --left $(LEFT) --right $(RIGHT)

compare-with-official-solution:
	$(CLI) compare-with-official-solution $(CHALLENGE) --file $(SQL)

reset: seed

test:
	npm test

build:
	npm run build
