# Hints

1. Check how many rows match `event_type IN ('view', 'search')`.
2. Compare the number of rows scanned and sorted with the 50 rows returned.
3. Look at the order by columns and the filter columns together.
4. Think about how deep OFFSET pagination behaves when recent events are highly clustered.
