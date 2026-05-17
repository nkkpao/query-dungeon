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
  solutionIndexes: string[],
): Challenge {
  return {
    id,
    title,
    difficulty,
    antiPatternTags,
    planSymptoms,
    solutionIndexes,
    badSqlPath: `${base}/${id}/bad.sql`,
    solutionSqlPath: `${base}/${id}/solution.sql`,
    expectedSqlPath: `${base}/${id}/expected.sql`,
    baselinePlanPath: `${base}/${id}/baseline-plan.txt`,
    readmePath: `${base}/${id}/README.md`,
  };
}

export const challenges: Challenge[] = [
  challenge('01-user-orders-missing-index', 'User orders without index', 'easy', ['missing_index'], ['Seq Scan on orders', 'high shared reads'], ['idx_solution_orders_user_created']),
  challenge('02-sales-report-over-joining', 'Sales report with over-joining', 'easy', ['over_joining', 'low_selectivity'], ['Hash Join', 'unneeded row expansion'], ['idx_solution_orders_status_created']),
  challenge('03-latest-payment-correlated-subquery', 'Latest payment correlated subquery', 'medium', ['correlated_subquery'], ['SubPlan repeated scans', 'Nested Loop'], ['idx_solution_payments_order_created']),
  challenge('04-offset-pagination', 'Large table OFFSET pagination', 'medium', ['bad_pagination'], ['Limit with large Offset', 'Sort'], ['idx_solution_orders_created_id']),
  challenge('05-lower-email-expression-index', 'Case-insensitive email lookup', 'easy', ['function_on_column'], ['Seq Scan on users', 'filter on lower(email)'], ['idx_solution_users_lower_email']),
  challenge('06-jsonb-filter-gin-index', 'JSONB filter without GIN', 'medium', ['jsonb_scan'], ['Seq Scan on products', 'JSONB filter'], ['idx_solution_products_attributes_gin']),
  challenge('07-count-distinct-big-join', 'COUNT DISTINCT over big join', 'hard', ['over_joining', 'low_selectivity', 'cte_materialization'], ['HashAggregate', 'large join input'], ['idx_solution_order_items_product_order']),
  challenge('08-latest-user-events', 'Latest user events', 'medium', ['missing_index', 'sort_spill'], ['Sort', 'Seq Scan on user_events'], ['idx_solution_user_events_user_created']),
  challenge('09-unpaid-orders-partial-index', 'Unpaid orders partial index', 'medium', ['missing_index', 'low_selectivity'], ['Seq Scan on orders', 'low selectivity status filter'], ['idx_solution_orders_unpaid_created']),
  challenge('10-window-function-overuse', 'Window function overuse', 'hard', ['window_overuse'], ['WindowAgg', 'Sort'], ['idx_solution_orders_user_total']),
  challenge('11-inventory-aggregation', 'Inventory aggregation mistake', 'hard', ['over_joining', 'sort_spill'], ['HashAggregate', 'Sort'], ['idx_solution_inventory_product_created']),
  challenge('12-dashboard-boss-fight', 'Marketplace dashboard boss fight', 'boss', ['missing_index', 'correlated_subquery', 'bad_pagination', 'jsonb_scan', 'stale_stats', 'n_plus_one'], ['multiple SubPlan scans', 'Seq Scan', 'Sort'], ['idx_solution_dashboard_orders', 'idx_solution_dashboard_events_gin']),
];

export function getChallenge(id: string): Challenge {
  const found = challenges.find((challenge) => challenge.id === id);
  if (!found) {
    throw new Error(`UNKNOWN_CHALLENGE: Unknown challenge "${id}". Run "dungeon list" to see available challenges.`);
  }
  return found;
}
