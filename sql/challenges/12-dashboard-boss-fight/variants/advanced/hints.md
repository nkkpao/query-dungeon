# Hints

1. Check the cardinality of `order_items` before and after the product filter.
2. Compare estimated and actual rows around hot product joins.
3. Look for large hash tables, repeated loops, or high shared buffer counts.
4. Consider whether filtering products earlier changes the join input size.
