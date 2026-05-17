DATABASE_URL ?= postgresql://dungeon:dungeon@localhost:54329/dungeon
SEED_SCALE ?= small
QUERY_TIMEOUT_MS ?= 15000
CHALLENGE ?= 01-user-orders-missing-index
ITERATIONS ?= 3

CLI = node dist/src/cli/index.js --database-url $(DATABASE_URL) --scale $(SEED_SCALE) --timeout-ms $(QUERY_TIMEOUT_MS)

.PHONY: setup seed run explain benchmark compare apply-solution reset-solutions test build

setup:
	npm install
	npm run build
	docker compose up -d

seed:
	$(CLI) seed --scale $(SEED_SCALE)

run:
	$(CLI) run $(CHALLENGE)

explain:
	$(CLI) explain $(CHALLENGE)

benchmark:
	$(CLI) benchmark $(CHALLENGE) --iterations $(ITERATIONS)

compare:
	$(CLI) compare $(CHALLENGE)

apply-solution:
	$(CLI) apply-solution $(CHALLENGE)

reset-solutions:
	$(CLI) reset-solutions

test:
	npm test

build:
	npm run build
