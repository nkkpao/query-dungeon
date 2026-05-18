CREATE INDEX IF NOT EXISTS idx_solution_users_lower_email ON users((lower(email)));
