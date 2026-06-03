export type SubmissionStatus = 'pending' | 'running' | 'completed' | 'failed';

export type EvaluationErrorCode =
  | 'syntax_error'
  | 'safety_rejected'
  | 'timeout'
  | 'result_mismatch'
  | 'execution_error'
  | 'internal_error';

export interface SubmissionCreateRequest {
  challengeId: string;
  variant?: string;
  participantName?: string;
  participantId?: string;
  sql: string;
  notes?: string;
}

export interface SubmissionResponse {
  submissionId: string;
  status: SubmissionStatus;
  correctness: boolean | null;
  errorCode: EvaluationErrorCode | null;
  latencyMs: number | null;
  executionTimeMs: number | null;
  planningTimeMs: number | null;
  rowsReturned: number | null;
  errorMessage: string | null;
}

export interface LeaderboardEntryResponse {
  submissionId: string;
  participantName: string | null;
  participantId: string | null;
  latencyMs: number | null;
  executionTimeMs: number | null;
  planningTimeMs: number | null;
  rowsReturned: number;
  submittedAt: string;
  completedAt: string | null;
}

export interface ChallengeListResponse {
  challenges: Array<{
    id: string;
    title: string;
    difficulty: string;
    variants: Array<{id: string; title: string; difficulty: string}>;
  }>;
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

export interface SubmissionRecord {
  id: string;
  challengeId: string;
  variant: string | null;
  participantName: string | null;
  participantId: string | null;
  sqlText: string;
  sqlHash: string;
  notes: string | null;
  status: SubmissionStatus;
  validationError: string | null;
  submittedAt: string;
  startedAt: string | null;
  completedAt: string | null;
}

export interface EvaluateStoredSubmissionInput {
  submissionId: string;
}

export interface EvaluateExplicitInput {
  challengeId: string;
  variant?: string | null;
  submissionId?: string;
  sql: string;
  participantName?: string | null;
  participantId?: string | null;
}

export type EvaluationInput = EvaluateStoredSubmissionInput | EvaluateExplicitInput;

export interface ExplainMetrics {
  planningTimeMs: number | null;
  executionTimeMs: number | null;
  actualRows: number | null;
  sharedHitBlocks: number;
  sharedReadBlocks: number;
  tempReadBlocks: number;
  tempWrittenBlocks: number;
  planText?: string;
}

export interface EvaluationResult {
  submissionId: string;
  status: SubmissionStatus;
  correct: boolean | null;
  errorCode: EvaluationErrorCode | null;
  errorMessage: string | null;
  latencyMs: number | null;
  executionTimeMs: number | null;
  planningTimeMs: number | null;
  rowCount: number | null;
  diffSummary: unknown | null;
  explainMetrics: ExplainMetrics | null;
  leaderboardEligible: boolean;
}

export interface EvaluationResultRecord {
  id: string;
  submissionId: string;
  correct: boolean;
  errorCode: EvaluationErrorCode | null;
  rowCount: number | null;
  latencyMs: number | null;
  executionTimeMs: number | null;
  planningTimeMs: number | null;
  errorMessage: string | null;
  diffSummary: unknown | null;
  explainMetrics: ExplainMetrics | null;
  createdAt: string;
}

export interface SubmissionWithResult {
  submission: SubmissionRecord;
  result: EvaluationResultRecord | null;
}
