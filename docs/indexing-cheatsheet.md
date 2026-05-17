# Indexing Cheatsheet

- B-tree: default choice for equality, ranges, and ordered scans.
- Composite: match leading columns to filters and later columns to order or covering needs.
- Covering: include columns in the index path so fewer heap pages are touched.
- Partial: index only rows matching a stable predicate, such as unpaid orders.
- Expression: index a computed expression such as `lower(email)`.
- GIN: useful for JSONB containment and array-like lookups.

Indexes are not free. They take storage, slow writes, and can be too query-specific.
