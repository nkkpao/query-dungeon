import type {AntiPatternTag, Challenge} from './types.js';

export const canonicalAntiPatternTags: AntiPatternTag[] = [
  'missing_index',
  'low_selectivity',
  'function_on_column',
  'correlated_subquery',
  'over_joining',
  'bad_pagination',
  'jsonb_scan',
  'sort_spill',
  'cte_materialization',
  'window_overuse',
  'n_plus_one',
  'stale_stats',
];

const base = 'sql/challenges';

function challenge(
  id: string,
  title: string,
  difficulty: Challenge['difficulty'],
  antiPatternTags: AntiPatternTag[],
  planSymptoms: string[],
): Challenge {
  return {
    id,
    title,
    difficulty,
    antiPatternTags,
    planSymptoms,
    challengePath: `${base}/${id}/challenge.md`,
    baselineSqlPath: `${base}/${id}/baseline.sql`,
    expectedResultPath: `${base}/${id}/expected-result.json`,
    hintsPath: `${base}/${id}/hints.md`,
    optionalSolutionSqlPath: `${base}/${id}/optional/official-solution.sql`,
    optionalIndexesSqlPath: `${base}/${id}/optional/official-indexes.sql`,
    optionalExplainPath: `${base}/${id}/optional/official-explain.txt`,
  };
}

export const challenges: Challenge[] = [
  challenge('01-user-orders-missing-index', 'User orders without index', 'easy', ['missing_index'], ['Seq Scan on orders', 'high shared reads']),
  challenge('02-sales-report-over-joining', 'Sales report with over-joining', 'easy', ['over_joining', 'low_selectivity'], ['Hash Join', 'unneeded row expansion']),
  challenge('03-latest-payment-correlated-subquery', 'Latest payment correlated subquery', 'medium', ['correlated_subquery'], ['SubPlan repeated scans', 'Nested Loop']),
  challenge('04-offset-pagination', 'Large table OFFSET pagination', 'medium', ['bad_pagination'], ['Limit with large Offset', 'Sort']),
  challenge('05-lower-email-expression-index', 'Case-insensitive email lookup', 'easy', ['function_on_column'], ['Seq Scan on users', 'filter on lower(email)']),
  challenge('06-jsonb-filter-gin-index', 'JSONB filter without GIN', 'medium', ['jsonb_scan'], ['Seq Scan on products', 'JSONB filter']),
  challenge('07-count-distinct-big-join', 'COUNT DISTINCT over big join', 'hard', ['over_joining', 'low_selectivity', 'cte_materialization'], ['HashAggregate', 'large join input']),
  challenge('08-latest-user-events', 'Latest user events', 'medium', ['missing_index', 'sort_spill'], ['Sort', 'Seq Scan on user_events']),
  challenge('09-unpaid-orders-partial-index', 'Unpaid orders partial index', 'medium', ['missing_index', 'low_selectivity'], ['Seq Scan on orders', 'low selectivity status filter']),
  challenge('10-window-function-overuse', 'Window function overuse', 'hard', ['window_overuse'], ['WindowAgg', 'Sort']),
  challenge('11-inventory-aggregation', 'Inventory aggregation mistake', 'hard', ['over_joining', 'sort_spill'], ['HashAggregate', 'Sort']),
  challenge('12-dashboard-boss-fight', 'Marketplace dashboard boss fight', 'boss', ['missing_index', 'correlated_subquery', 'bad_pagination', 'jsonb_scan', 'stale_stats', 'n_plus_one'], ['multiple SubPlan scans', 'Seq Scan', 'Sort']),
];

export function getChallenge(id: string): Challenge {
  const found = challenges.find((challenge) => challenge.id === id);
  if (!found) {
    throw new Error(`UNKNOWN_CHALLENGE: Unknown challenge "${id}". Run "dungeon list" to see available challenges.`);
  }
  return found;
}
