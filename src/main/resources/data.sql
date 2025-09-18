INSERT INTO users (username, password, email, role)
VALUES ('admin', '{noop}admin123', 'admin@example.com', 'ADMIN')
ON CONFLICT (username) DO NOTHING;
