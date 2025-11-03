-- 初始化角色数据（PostgreSQL 语法）
INSERT INTO "role" (id, role_name, role_code, description) VALUES 
('role_admin_001', '管理员', 'ADMIN', '系统管理员，拥有所有权限'),
('role_user_001', '普通用户', 'USER', '普通用户，拥有基本权限')
ON CONFLICT (id) DO NOTHING;

-- 初始化用户数据（密码需要加密，这里使用 BCrypt 加密后的密码，原始密码都是123456）
-- 密码 $2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK8pJ0K = 123456
INSERT INTO "user" (id, username, password) VALUES 
('zxcvzxcvzxvc', 'dddsd', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK8pJ0K'),
('huihjskjdhfksjdf', 'dsfgsgsdfg', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK8pJ0K'),
('admin_user_001', 'admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK8pJ0K'),
('normal_user_001', 'user', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK8pJ0K')
ON CONFLICT (id) DO NOTHING;

-- 初始化用户角色关联数据
INSERT INTO "user_role" (id, user_id, role_id) VALUES 
('ur_001', 'admin_user_001', 'role_admin_001'),
('ur_002', 'normal_user_001', 'role_user_001'),
('ur_003', 'zxcvzxcvzxvc', 'role_user_001'),
('ur_004', 'huihjskjdhfksjdf', 'role_user_001')
ON CONFLICT (id) DO NOTHING;

-- 初始化安全白名单数据
INSERT INTO "security_whitelist" (id, path_pattern, http_method, description, enabled, sort_order) VALUES 
('wh_001', '/api/auth/login', NULL, '用户登录接口', TRUE, 1),
('wh_002', '/api/auth/login', 'POST', '用户登录接口（POST）', TRUE, 2),
('wh_003', '/api/auth/register', NULL, '用户注册接口', TRUE, 3),
('wh_004', '/api/auth/register', 'POST', '用户注册接口（POST）', TRUE, 4),
('wh_005', '/api/public/**', NULL, '公共接口', TRUE, 5),
('wh_006', '/api/test/**', NULL, '测试接口（生产环境应禁用）', TRUE, 6),
('wh_007', '/swagger-ui/**', NULL, 'Swagger UI', TRUE, 10),
('wh_008', '/swagger-resources/**', NULL, 'Swagger资源', TRUE, 11),
('wh_009', '/v2/api-docs', NULL, 'Swagger API文档v2', TRUE, 12),
('wh_010', '/v3/api-docs/**', NULL, 'Swagger API文档v3', TRUE, 13),
('wh_011', '/webjars/**', NULL, 'WebJars资源', TRUE, 14),
('wh_012', '/actuator/**', NULL, 'Spring Boot Actuator', TRUE, 15),
('wh_013', '/error', NULL, '错误页面', TRUE, 16),
('wh_014', '/favicon.ico', NULL, '网站图标', TRUE, 17)
ON CONFLICT (id) DO NOTHING;

-- 初始化安全权限数据
INSERT INTO "security_permission" (id, path_pattern, http_method, required_roles, description, enabled, sort_order) VALUES 
('perm_001', '/api/admin/**', NULL, 'ADMIN', '管理员接口，需要ADMIN角色', TRUE, 1),
('perm_002', '/api/users/**', NULL, 'USER,ADMIN', '用户接口，需要USER或ADMIN角色', TRUE, 2)
ON CONFLICT (id) DO NOTHING;