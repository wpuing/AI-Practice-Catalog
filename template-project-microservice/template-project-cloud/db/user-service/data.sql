-- ============================================================
-- 用户服务初始数据
-- ============================================================

-- 初始化用户信息数据
INSERT INTO user_info (id, username, nickname, email, phone, gender, create_date, create_user, deleted, db_version) VALUES 
('u1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6', 'admin', '管理员', 'admin@example.com', '13800138000', 1, CURRENT_TIMESTAMP, 'system', 0, 1),
('u2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7', 'user', '普通用户', 'user@example.com', '13800138001', 0, CURRENT_TIMESTAMP, 'system', 0, 1)
ON CONFLICT (id) DO NOTHING;

-- 初始化用户配置数据
INSERT INTO user_config (id, user_id, config_key, config_value, create_date, create_user, deleted, db_version) VALUES 
('c1d2e3f4g5h6i7j8k9l0m1n2o3p4q5r6', 'u1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6', 'theme', 'dark', CURRENT_TIMESTAMP, 'system', 0, 1),
('c2e3f4g5h6i7j8k9l0m1n2o3p4q5r6s7', 'u1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6', 'language', 'zh-CN', CURRENT_TIMESTAMP, 'system', 0, 1)
ON CONFLICT (id) DO NOTHING;

