export type SubmissionStatus = 'pending' | 'running' | 'completed' | 'failed';

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

export interface EvaluationResultRecord {
  id: string;
  submissionId: string;
  correct: boolean;
  rowCount: number | null;
  latencyMs: number | null;
  executionTimeMs: number | null;
  planningTimeMs: number | null;
  errorMessage: string | null;
  diffSummary: unknown | null;
  createdAt: string;
}

export interface SubmissionWithResult {
  submission: SubmissionRecord;
  result: EvaluationResultRecord | null;
}
