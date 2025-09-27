-- Tạo admin user mặc định
-- Password: admin123 (đã được hash bằng BCrypt)
INSERT IGNORE INTO users (email, password_hash, full_name, enabled) VALUES 
('admin@eventsphere.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'System Administrator', 1);

-- Gán role ADMIN cho user admin
INSERT IGNORE INTO user_roles (user_id, role_id) 
SELECT u.user_id, r.role_id 
FROM users u, roles r 
WHERE u.email = 'admin@eventsphere.com' AND r.role_name = 'ADMIN';

