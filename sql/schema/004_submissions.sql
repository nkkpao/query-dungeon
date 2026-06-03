CREATE TABLE IF NOT EXISTS submissions (
  id uuid PRIMARY KEY,
  challenge_id text NOT NULL,
  variant text NULL,
  participant_name text NULL,
  participant_id text NULL,
  sql_text text NOT NULL,
  sql_hash text NOT NULL,
  notes text NULL,
  status text NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  validation_error text NULL,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz NULL,
  completed_at timestamptz NULL,
  CHECK (participant_name IS NOT NULL OR participant_id IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS evaluation_results (
  id uuid PRIMARY KEY,
  submission_id uuid NOT NULL UNIQUE REFERENCES submissions(id) ON DELETE CASCADE,
  correct boolean NOT NULL,
  row_count integer NULL,
  latency_ms double precision NULL,
  execution_time_ms double precision NULL,
  planning_time_ms double precision NULL,
  error_code text NULL,
  error_message text NULL,
  diff_summary jsonb NULL,
  explain_metrics jsonb NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE evaluation_results
  ADD COLUMN IF NOT EXISTS error_code text NULL;

ALTER TABLE evaluation_results
  ADD COLUMN IF NOT EXISTS explain_metrics jsonb NULL;

ALTER TABLE evaluation_results
  DROP CONSTRAINT IF EXISTS evaluation_results_error_code_check;

ALTER TABLE evaluation_results
  ADD CONSTRAINT evaluation_results_error_code_check
  CHECK (error_code IS NULL OR error_code IN (
    'syntax_error',
    'safety_rejected',
    'timeout',
    'result_mismatch',
    'execution_error',
    'internal_error'
  ));

CREATE INDEX IF NOT EXISTS idx_submissions_challenge_variant_submitted
  ON submissions (challenge_id, variant, submitted_at);

CREATE INDEX IF NOT EXISTS idx_submissions_leaderboard_completed
  ON submissions (challenge_id, variant, submitted_at)
  WHERE status = 'completed';

CREATE INDEX IF NOT EXISTS idx_evaluation_results_leaderboard
  ON evaluation_results (correct, execution_time_ms, latency_ms, created_at);
