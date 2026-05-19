import type {AntiPatternTag, Challenge, ChallengeVariant} from './types.js';

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
  variants?: Record<string, ChallengeVariant>,
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
    hintsPath: `${base}/${id}/hints/hints.md`,
    hintsRuPath: `${base}/${id}/hints/hints_RU.md`,
    optionalSuggestedSolutionSqlPath: `${base}/${id}/optional/suggested-solution.sql`,
    optionalSuggestedIndexesSqlPath: `${base}/${id}/optional/suggested-indexes.sql`,
    optionalBaselineExplainPath: `${base}/${id}/optional/baseline-explain.txt`,
    variants,
  };
}

function advancedVariant(
  parentChallengeId: string,
  title: string,
  antiPatternTags: AntiPatternTag[],
  planSymptoms: string[],
  structuralMarkers: string[],
): ChallengeVariant {
  const variantBase = `${base}/${parentChallengeId}/variants/advanced`;
  return {
    id: 'advanced',
    parentChallengeId,
    title,
    difficulty: 'hard',
    antiPatternTags,
    planSymptoms,
    challengePath: `${variantBase}/challenge.md`,
    baselineSqlPath: `${variantBase}/baseline.sql`,
    expectedResultPath: `${variantBase}/expected-result.json`,
    dataProfilePath: `${variantBase}/data-profile.md`,
    hintsPath: `${variantBase}/hints.md`,
    recordedPlanPath: `${variantBase}/recorded-plan.medium.txt`,
    optionalOfficialSolutionSqlPath: `${variantBase}/optional/official-solution.sql`,
    optionalOfficialIndexesSqlPath: `${variantBase}/optional/official-indexes.sql`,
    structuralMarkers,
  };
}

export const challenges: Challenge[] = [
  challenge('01-user-orders-missing-index', 'User orders without index', 'easy', ['missing_index'], ['Seq Scan on orders', 'high shared reads']),
  challenge('02-sales-report-over-joining', 'Sales report with over-joining', 'easy', ['over_joining', 'low_selectivity'], ['Hash Join', 'unneeded row expansion']),
  challenge('03-latest-payment-correlated-subquery', 'Latest payment correlated subquery', 'medium', ['correlated_subquery'], ['SubPlan repeated scans', 'Nested Loop']),
  challenge('04-offset-pagination', 'Large table OFFSET pagination', 'medium', ['bad_pagination'], ['Limit with large Offset', 'Sort'], {
    advanced: advancedVariant(
      '04-offset-pagination',
      'Advanced bad pagination on skewed events',
      ['bad_pagination', 'sort_spill', 'low_selectivity'],
      ['Seq Scan on user_events', 'expensive Sort', 'rows removed by filter', 'high shared buffers'],
      ['Seq Scan', 'Sort', 'Rows Removed by Filter', 'Buffers: shared'],
    ),
  }),
  challenge('05-lower-email-expression-index', 'Case-insensitive email lookup', 'easy', ['function_on_column'], ['Seq Scan on users', 'filter on lower(email)']),
  challenge('06-jsonb-filter-gin-index', 'JSONB filter without GIN', 'medium', ['jsonb_scan'], ['Seq Scan on products', 'JSONB filter'], {
    advanced: advancedVariant(
      '06-jsonb-filter-gin-index',
      'Advanced JSONB event filtering on skewed event metadata',
      ['jsonb_scan', 'low_selectivity'],
      ['Seq Scan on user_events', 'JSONB metadata filter', 'bad row estimates', 'rows removed by filter'],
      ['Seq Scan', 'Rows Removed by Filter', 'Buffers: shared', 'actual time'],
    ),
  }),
  challenge('07-count-distinct-big-join', 'COUNT DISTINCT over big join', 'hard', ['over_joining', 'low_selectivity', 'cte_materialization'], ['HashAggregate', 'large join input']),
  challenge('08-latest-user-events', 'Latest user events', 'medium', ['missing_index', 'sort_spill'], ['Sort', 'Seq Scan on user_events']),
  challenge('09-unpaid-orders-partial-index', 'Unpaid orders partial index', 'medium', ['missing_index', 'low_selectivity'], ['Seq Scan on orders', 'low selectivity status filter']),
  challenge('10-window-function-overuse', 'Window function overuse', 'hard', ['window_overuse'], ['WindowAgg', 'Sort']),
  challenge('11-inventory-aggregation', 'Inventory aggregation mistake', 'hard', ['over_joining', 'sort_spill'], ['HashAggregate', 'Sort']),
  challenge('12-dashboard-boss-fight', 'Marketplace dashboard boss fight', 'boss', ['missing_index', 'correlated_subquery', 'bad_pagination', 'jsonb_scan', 'stale_stats', 'n_plus_one'], ['multiple SubPlan scans', 'Seq Scan', 'Sort'], {
    advanced: advancedVariant(
      '12-dashboard-boss-fight',
      'Advanced dashboard over hot products and skewed order items',
      ['over_joining', 'low_selectivity', 'sort_spill', 'stale_stats'],
      ['Hash Join pressure', 'Nested Loop risk', 'bad row estimates', 'high shared buffers'],
      ['Hash Join', 'Nested Loop', 'Index Scan using idx_order_items_product_id', 'Buffers: shared', 'actual time'],
    ),
  }),
];

export function getChallenge(id: string): Challenge {
  const found = challenges.find((challenge) => challenge.id === id);
  if (!found) {
    throw new Error(`UNKNOWN_CHALLENGE: Unknown challenge "${id}". Run "dungeon list" to see available challenges.`);
  }
  return found;
}

export function getChallengeForVariant(id: string, variant?: string): Challenge {
  const challenge = getChallenge(id);
  if (!variant) {
    return challenge;
  }
  const found = challenge.variants?.[variant];
  if (!found) {
    throw new Error(`UNKNOWN_VARIANT: Challenge "${id}" has no variant "${variant}".`);
  }
  return {
    ...challenge,
    title: found.title,
    difficulty: found.difficulty,
    antiPatternTags: found.antiPatternTags,
    planSymptoms: found.planSymptoms,
    challengePath: found.challengePath,
    baselineSqlPath: found.baselineSqlPath,
    expectedResultPath: found.expectedResultPath,
    hintsPath: found.hintsPath,
    hintsRuPath: found.hintsPath,
    optionalSuggestedSolutionSqlPath: found.optionalOfficialSolutionSqlPath,
    optionalSuggestedIndexesSqlPath: found.optionalOfficialIndexesSqlPath,
    optionalBaselineExplainPath: found.recordedPlanPath,
    variants: challenge.variants,
  };
}

export function advancedVariants(): ChallengeVariant[] {
  return challenges.flatMap((challenge) => Object.values(challenge.variants ?? {}));
}
