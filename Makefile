DATABASE_URL ?= postgresql://dungeon:dungeon@localhost:54329/dungeon
SEED_SCALE ?= small
QUERY_TIMEOUT_MS ?= 15000
SERVER_PORT ?= 3000
SERVER_SQL_MAX_BYTES ?= 65536
CHALLENGE ?= 01-user-orders-missing-index
SQL ?= sql/challenges/$(CHALLENGE)/baseline.sql
LEFT ?= workspace/sql/attempt-1.sql
RIGHT ?= workspace/sql/attempt-2.sql
ITERATIONS ?= 3
VARIANT ?=
SCALE ?= $(SEED_SCALE)

CLI = node dist/src/cli/index.js --database-url $(DATABASE_URL) --scale $(SEED_SCALE) --timeout-ms $(QUERY_TIMEOUT_MS)
VARIANT_FLAG = $(if $(VARIANT),--variant $(VARIANT),)

.PHONY: setup seed server list run-sql explain-file benchmark-file validate-file diff-results compare-with-suggested-solution record-plans validate-recorded-plans reset test build

setup:
	npm install
	npm run build
	docker compose up -d

seed:
	$(CLI) seed --scale $(SEED_SCALE)

server:
	DATABASE_URL=$(DATABASE_URL) QUERY_TIMEOUT_MS=$(QUERY_TIMEOUT_MS) SERVER_PORT=$(SERVER_PORT) SERVER_SQL_MAX_BYTES=$(SERVER_SQL_MAX_BYTES) node dist/src/server/index.js

list:
	$(CLI) list

run-sql:
	$(CLI) run-sql $(CHALLENGE) $(VARIANT_FLAG) --file $(SQL)

explain-file:
	$(CLI) explain-file $(CHALLENGE) $(VARIANT_FLAG) --file $(SQL)

benchmark-file:
	$(CLI) benchmark-file $(CHALLENGE) $(VARIANT_FLAG) --file $(SQL) --baseline --iterations $(ITERATIONS)

validate-file:
	$(CLI) validate-file $(CHALLENGE) $(VARIANT_FLAG) --file $(SQL)

diff-results:
	$(CLI) diff-results $(CHALLENGE) $(VARIANT_FLAG) --left $(LEFT) --right $(RIGHT)

compare-with-suggested-solution:
	$(CLI) compare-with-suggested-solution $(CHALLENGE) $(VARIANT_FLAG) --file $(SQL) --benchmark --iterations $(ITERATIONS)

record-plans:
	$(CLI) record-plans --scale $(SCALE)

validate-recorded-plans:
	$(CLI) validate-recorded-plans

reset: seed

test:
	npm test

build:
	npm run build
