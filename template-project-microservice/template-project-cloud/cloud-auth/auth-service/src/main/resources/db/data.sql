-- ============================================================
-- 认证服务初始数据
-- ============================================================

-- 初始化角色数据
INSERT INTO auth_role (id, role_name, role_code, description, create_date, create_user, deleted, db_version) VALUES 
('a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6', '超级管理员', 'SUPER_ADMIN', '超级管理员，拥有所有权限', CURRENT_TIMESTAMP, 'system', 0, 1),
('b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7', '管理员', 'ADMIN', '系统管理员', CURRENT_TIMESTAMP, 'system', 0, 1),
('c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8', '普通用户', 'USER', '普通用户', CURRENT_TIMESTAMP, 'system', 0, 1)
ON CONFLICT (id) DO NOTHING;

-- 初始化用户数据（密码：123456，BCrypt加密后：$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK8pJ0K）
INSERT INTO auth_user (id, username, password, email, phone, status, create_date, create_user, deleted, db_version) VALUES 
('d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9', 'admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK8pJ0K', 'admin@example.com', '13800138000', 1, CURRENT_TIMESTAMP, 'system', 0, 1),
('e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0', 'user', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK8pJ0K', 'user@example.com', '13800138001', 1, CURRENT_TIMESTAMP, 'system', 0, 1)
ON CONFLICT (id) DO NOTHING;

-- 初始化用户角色关联数据
INSERT INTO auth_user_role (id, user_id, role_id, create_date, create_user, deleted, db_version) VALUES 
('f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1', 'd4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9', 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6', CURRENT_TIMESTAMP, 'system', 0, 1),
('g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2', 'e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0', 'c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8', CURRENT_TIMESTAMP, 'system', 0, 1)
ON CONFLICT (id) DO NOTHING;

