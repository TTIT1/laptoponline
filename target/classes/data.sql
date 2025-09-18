INSERT INTO users (username, password, email, role)
VALUES ('admin', 'admin123', 'admin@example.com', 'ADMIN')
ON CONFLICT (username) DO UPDATE
SET password = EXCLUDED.password,
    email = EXCLUDED.email,
    role = EXCLUDED.role;
