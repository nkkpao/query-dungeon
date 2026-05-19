# Data Profile: Advanced Bad Pagination

Canonical scale: `SEED_SCALE=medium`

This variant is materially different from the parent `04-offset-pagination`
challenge because it paginates through the much larger and more skewed
`user_events` table instead of the smaller baseline `orders` page.

Skew requirements:

- hot users: users `42`, `77`, and `123` own a disproportionate share of events
- low-selectivity event types: `view` and `search` match most rows
- time-based clustering: recent events cluster into a short date range
- uneven event volume: hot users dominate the deepest pages

Expected planner symptoms:

- `Seq Scan`
- expensive `Sort`
- `Rows Removed by Filter`
- high `Buffers: shared` counts

Small scale remains useful for syntax and file-contract smoke checks, but the
planner symptoms are intended to be studied on medium scale.
