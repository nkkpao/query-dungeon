CREATE TABLE IF NOT EXISTS solution_state (
  challenge_id TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
