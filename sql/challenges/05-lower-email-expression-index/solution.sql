CREATE INDEX IF NOT EXISTS idx_solution_users_lower_email ON users((lower(email)));

-- query
SELECT id, email, status, country
FROM users
WHERE lower(email) = lower('USER42@EXAMPLE.COM')
