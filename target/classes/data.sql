INSERT INTO users (username, password, email, role) 
VALUES ('admin', 'admin123', 'admin@example.com', 'ADMIN')
ON DUPLICATE KEY UPDATE
username = VALUES(username); 