# Data Skew Profiles

The default learner and CI scale remains `SEED_SCALE=small`. Advanced variants
use `SEED_SCALE=medium` when you want planner behavior that is hard to see on a
tiny uniform dataset.

Medium scale is deterministic and intentionally uneven:

- hot users: a small set of users receives a disproportionate share of events
- hot products: products `1..20` appear far more often in order items
- heavy categories: early product categories are overrepresented
- long-tail products: most products still exist but appear less frequently
- uneven order volumes: order items are concentrated around hot products
- NULL-heavy optional attributes: event metadata includes nullable device,
  experiment, and region fields
- low-selectivity statuses: common order and event statuses match large table
  fractions
- time-based clustering: events are clustered into recent time windows instead
  of being uniformly spread

This profile is meant for investigation, not for producing one exact plan on
every machine. PostgreSQL version, hardware, cache state, and local settings can
change timings and sometimes costs. The recorded plans focus on stable symptoms
such as sequential scans, bad row estimates, expensive sorts, join shape, rows
removed by filter, and shared buffer activity.

## Advanced Variant Targets

- `04-offset-pagination/advanced`: large `user_events` pagination over
  low-selectivity event types and clustered timestamps.
- `06-jsonb-filter-gin-index/advanced`: JSONB filters over skewed event
  metadata with NULL-heavy optional keys.
- `12-dashboard-boss-fight/advanced`: dashboard aggregation over skewed
  `orders`, `order_items`, and hot products.

Use these variants when the baseline exercise is already understood and you want
to practice reading planner behavior under more realistic data distribution.
