# Data Model: Postgres Query Dungeon

## Database Domain Entities

### users

- `id`: primary key
- `email`: unique logical email, intentionally missing expression index at baseline
- `created_at`: registration timestamp
- `status`: active, suspended, deleted
- `country`: market segmentation
- Relationships: has many `orders`, `reviews`, `user_events`, `support_tickets`

### categories

- `id`: primary key
- `parent_id`: nullable self-reference for category tree
- `name`: display name
- `slug`: unique category identifier
- Relationships: has many `products`

### products

- `id`: primary key
- `category_id`: references `categories`
- `sku`: unique product code
- `name`: display name
- `price_cents`: current listed price
- `attributes`: JSONB product attributes used by JSONB scan challenge
- `created_at`: catalog timestamp
- Relationships: has many `order_items`, `reviews`, `inventory_movements`

### orders

- `id`: primary key
- `user_id`: references `users`
- `status`: pending, paid, shipped, delivered, cancelled, unpaid
- `created_at`: order timestamp with seasonal skew
- `total_cents`: denormalized order total for selected reporting queries
- Relationships: has many `order_items`, has many `payments`

### order_items

- `id`: primary key
- `order_id`: references `orders`
- `product_id`: references `products`
- `quantity`: purchased quantity
- `unit_price_cents`: price at purchase time
- Relationships: belongs to `orders` and `products`

### payments

- `id`: primary key
- `order_id`: references `orders`
- `status`: pending, paid, failed, refunded
- `provider`: payment provider label
- `amount_cents`: payment amount
- `created_at`: payment timestamp
- Relationships: belongs to `orders`

### reviews

- `id`: primary key
- `user_id`: references `users`
- `product_id`: references `products`
- `rating`: integer rating
- `body`: review text
- `created_at`: review timestamp
- Relationships: belongs to `users` and `products`

### inventory_movements

- `id`: primary key
- `product_id`: references `products`
- `movement_type`: purchase, sale, return, adjustment
- `quantity_delta`: signed inventory change
- `warehouse_id`: local warehouse identifier
- `created_at`: movement timestamp
- Relationships: belongs to `products`

### user_events

- `id`: primary key
- `user_id`: references `users`
- `event_type`: view, search, cart_add, checkout_start, purchase, support_opened
- `metadata`: JSONB event payload for JSONB scan/dashboard lessons
- `created_at`: event timestamp
- Relationships: belongs to `users`

### support_tickets

- `id`: primary key
- `user_id`: references `users`
- `order_id`: nullable reference to `orders`
- `status`: open, pending, resolved, closed
- `priority`: low, normal, high, urgent
- `created_at`: ticket timestamp
- `resolved_at`: nullable resolution timestamp
- Relationships: belongs to `users`, optionally belongs to `orders`

## Training Entities

### Challenge

- `id`: stable directory-safe identifier, e.g. `01-user-orders-missing-index`
- `title`: learner-facing name
- `difficulty`: easy, medium, hard, or boss
- `antiPatternTags`: one or more canonical tags
- `planSymptoms`: expected plan symptoms to look for
- `badSqlPath`: `sql/challenges/<id>/bad.sql`
- `solutionSqlPath`: `sql/challenges/<id>/solution.sql`
- `expectedSqlPath`: query or fixture used for result comparison
- `readmePath`: challenge prompt, hints, and trade-offs
- Validation: every challenge must have raw bad SQL, solution SQL, expected
  result definition, README, difficulty, tags, and a unique ID.

### BenchmarkResult

- `challengeId`: challenge identifier
- `variant`: bad or solution
- `seedScale`: small, medium, or large
- `latencyMs`: measured wall-clock latency
- `planningTimeMs`: parsed from EXPLAIN output
- `executionTimeMs`: parsed from EXPLAIN output
- `rows`: relevant rows reported by execution/plan
- `sharedHitBlocks`, `sharedReadBlocks`, `tempReadBlocks`, `tempWrittenBlocks`
- `planText`: raw `EXPLAIN (ANALYZE, BUFFERS)` text

### SeedScale

- `small`: quick smoke data for tests and slow machines
- `medium`: default learning data, targeted at roughly 1-5 million total rows
- `large`: opt-in dataset for stronger plan symptoms
- Validation: scale must be selected through `SEED_SCALE=small|medium|large`.

## Baseline Index Policy

Baseline schema may include primary keys, foreign key supporting indexes where
needed for referential integrity, and a few ordinary application indexes. It
must intentionally omit indexes that are the lesson target, including expression,
partial, covering, composite, and GIN indexes for their respective challenges.

## Dataset Skew Rules

- A small percentage of products receive a large share of order_items.
- A small percentage of users create a large share of orders and events.
- Categories are uneven: a few categories dominate product and order volume.
- Orders and events include seasonal spikes.
- Payments include pending/failed/refunded distributions for partial-index and
  correlated-subquery lessons.
- JSONB attributes/events include selective and nonselective keys for JSONB scan
  and GIN index comparison.
