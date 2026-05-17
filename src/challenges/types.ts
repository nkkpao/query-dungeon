export type Difficulty = 'easy' | 'medium' | 'hard' | 'boss';

export type AntiPatternTag =
  | 'missing_index'
  | 'low_selectivity'
  | 'function_on_column'
  | 'correlated_subquery'
  | 'over_joining'
  | 'bad_pagination'
  | 'jsonb_scan'
  | 'sort_spill'
  | 'cte_materialization'
  | 'window_overuse'
  | 'n_plus_one'
  | 'stale_stats';

export type QueryVariant = 'bad' | 'solution';

export interface Challenge {
  id: string;
  title: string;
  difficulty: Difficulty;
  antiPatternTags: AntiPatternTag[];
  planSymptoms: string[];
  badSqlPath: string;
  solutionSqlPath: string;
  expectedSqlPath: string;
  baselinePlanPath: string;
  readmePath: string;
  solutionIndexes: string[];
}

export interface ParsedExplain {
  planningTimeMs: number | null;
  executionTimeMs: number | null;
  rows: number | null;
  sharedHitBlocks: number;
  sharedReadBlocks: number;
  tempReadBlocks: number;
  tempWrittenBlocks: number;
  planText: string;
}

export interface BenchmarkResult extends ParsedExplain {
  challengeId: string;
  variant: QueryVariant;
  seedScale: string;
  latencyMs: number;
}
