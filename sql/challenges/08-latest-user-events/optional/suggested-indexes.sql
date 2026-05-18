CREATE INDEX IF NOT EXISTS idx_solution_user_events_user_created ON user_events(user_id, created_at DESC, id DESC);
