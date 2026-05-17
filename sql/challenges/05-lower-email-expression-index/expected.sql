SELECT id, email, status, country
FROM users
WHERE lower(email) = lower('USER42@EXAMPLE.COM')
