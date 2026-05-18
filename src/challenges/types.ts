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

export interface Challenge {
  id: string;
  title: string;
  difficulty: Difficulty;
  antiPatternTags: AntiPatternTag[];
  planSymptoms: string[];
  challengePath: string;
  baselineSqlPath: string;
  expectedResultPath: string;
  hintsPath: string;
  hintsRuPath: string;
  optionalSolutionSqlPath: string;
  optionalIndexesSqlPath: string;
  optionalBaselineExplainPath: string;
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
  label: string;
  sqlPath: string;
  seedScale: string;
  latencyMs: number;
}

export interface ExpectedResultContract {
  columns: string[];
  rows: Record<string, unknown>[];
  fixtureSqlPath?: string;
  orderSensitive: boolean;
  numericTolerance?: number;
  normalization?: {
    sortRows?: boolean;
    numericStrings?: boolean;
    datesToIso?: boolean;
  };
}
