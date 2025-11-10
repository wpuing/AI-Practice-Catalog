-- ============================================================
-- 数据库初始数据文件
-- 说明：包含所有表的初始数据，ID使用32位随机字符（小写字母和数字）
-- 创建时间：2024
-- ============================================================

-- ============================================================
-- 辅助函数：生成32位随机ID（小写字母和数字）
-- ============================================================
-- 注意：PostgreSQL中可以使用以下方式生成32位随机ID
-- 示例：lower(substring(md5(random()::text || clock_timestamp()::text) from 1 for 32))
-- 或者使用：lower(encode(gen_random_bytes(16), 'hex'))

-- ============================================================
-- 1. 初始化角色数据
-- ============================================================
-- 密码 $2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK8pJ0K = 123456
INSERT INTO "role" (id, role_name, role_code, description, create_date, create_user, deleted, db_version) VALUES 
('a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6', '超级管理员', 'SUPER_ADMIN', '超级管理员，拥有所有权限，可以管理管理员和普通用户', CURRENT_TIMESTAMP, 'system', 0, 1),
('b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7', '管理员', 'ADMIN', '系统管理员，拥有所有权限', CURRENT_TIMESTAMP, 'system', 0, 1),
('c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8', '普通用户', 'USER', '普通用户，拥有基本权限', CURRENT_TIMESTAMP, 'system', 0, 1)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. 初始化用户数据
-- ============================================================
-- 密码 $2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK8pJ0K = 123456
INSERT INTO "user" (id, username, password, create_date, create_user, deleted, db_version) VALUES 
('d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9', 'wyz', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK8pJ0K', CURRENT_TIMESTAMP, 'system', 0, 1),
('e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0', 'admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK8pJ0K', CURRENT_TIMESTAMP, 'system', 0, 1),
('f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1', 'user', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK8pJ0K', CURRENT_TIMESTAMP, 'system', 0, 1)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 3. 初始化用户角色关联数据
-- ============================================================
INSERT INTO "user_role" (id, user_id, role_id, create_date, create_user, deleted, db_version) VALUES 
('g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2', 'd4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9', 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6', CURRENT_TIMESTAMP, 'system', 0, 1),
('h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3', 'e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0', 'b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7', CURRENT_TIMESTAMP, 'system', 0, 1),
('i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4', 'f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1', 'c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8', CURRENT_TIMESTAMP, 'system', 0, 1)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 4. 初始化安全白名单数据
-- ============================================================
INSERT INTO "security_whitelist" (id, path_pattern, http_method, description, enabled, sort_order, create_date, create_user, deleted, db_version) VALUES 
('j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5', '/api/auth/login', NULL, '用户登录接口', TRUE, 1, CURRENT_TIMESTAMP, 'system', 0, 1),
('k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6', '/api/auth/login', 'POST', '用户登录接口（POST）', TRUE, 2, CURRENT_TIMESTAMP, 'system', 0, 1),
('l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7', '/api/auth/register', NULL, '用户注册接口', TRUE, 3, CURRENT_TIMESTAMP, 'system', 0, 1),
('m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8', '/api/auth/register', 'POST', '用户注册接口（POST）', TRUE, 4, CURRENT_TIMESTAMP, 'system', 0, 1),
('n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9', '/api/public/**', NULL, '公共接口', TRUE, 5, CURRENT_TIMESTAMP, 'system', 0, 1),
('o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0', '/api/test/**', NULL, '测试接口（生产环境应禁用）', TRUE, 6, CURRENT_TIMESTAMP, 'system', 0, 1),
('p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1', '/swagger-ui/**', NULL, 'Swagger UI', TRUE, 10, CURRENT_TIMESTAMP, 'system', 0, 1),
('q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2', '/swagger-resources/**', NULL, 'Swagger资源', TRUE, 11, CURRENT_TIMESTAMP, 'system', 0, 1),
('r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3', '/v2/api-docs', NULL, 'Swagger API文档v2', TRUE, 12, CURRENT_TIMESTAMP, 'system', 0, 1),
('s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4', '/v3/api-docs/**', NULL, 'Swagger API文档v3', TRUE, 13, CURRENT_TIMESTAMP, 'system', 0, 1),
('t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5', '/webjars/**', NULL, 'WebJars资源', TRUE, 14, CURRENT_TIMESTAMP, 'system', 0, 1),
('u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6', '/actuator/**', NULL, 'Spring Boot Actuator', TRUE, 15, CURRENT_TIMESTAMP, 'system', 0, 1),
('v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7', '/error', NULL, '错误页面', TRUE, 16, CURRENT_TIMESTAMP, 'system', 0, 1),
('w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8', '/favicon.ico', NULL, '网站图标', TRUE, 17, CURRENT_TIMESTAMP, 'system', 0, 1)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 5. 初始化安全权限数据
-- ============================================================
INSERT INTO "security_permission" (id, path_pattern, http_method, required_roles, description, enabled, sort_order, create_date, create_user, deleted, db_version) VALUES 
('x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9', '/api/admin/**', NULL, 'ADMIN,SUPER_ADMIN', '管理员接口，需要ADMIN或SUPER_ADMIN角色', TRUE, 1, CURRENT_TIMESTAMP, 'system', 0, 1),
('y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0', '/api/users/**', NULL, 'USER,ADMIN,SUPER_ADMIN', '用户接口，需要USER、ADMIN或SUPER_ADMIN角色', TRUE, 2, CURRENT_TIMESTAMP, 'system', 0, 1)
ON CONFLICT (id) DO UPDATE SET required_roles = EXCLUDED.required_roles;

-- ============================================================
-- 6. 初始化菜单数据
-- ============================================================
INSERT INTO "menu" (id, menu_name, menu_code, parent_id, menu_type, path, icon, sort_order, enabled, description, create_date, create_user, deleted, db_version) VALUES 
('z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1', '控制台', 'DASHBOARD', NULL, 'MENU', 'dashboard', '📊', 1, TRUE, '系统控制台', CURRENT_TIMESTAMP, 'system', 0, 1),
('a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2', '用户管理', 'USERS', NULL, 'MENU', 'users', '👥', 2, TRUE, '用户管理', CURRENT_TIMESTAMP, 'system', 0, 1),
('b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3', '商品类型', 'PRODUCT_TYPES', NULL, 'MENU', 'product-types', '📦', 3, TRUE, '商品类型管理', CURRENT_TIMESTAMP, 'system', 0, 1),
('c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4', '商品管理', 'PRODUCTS', NULL, 'MENU', 'products', '🛍️', 4, TRUE, '商品管理', CURRENT_TIMESTAMP, 'system', 0, 1),
('d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5', '角色管理', 'ROLES', NULL, 'MENU', 'roles', '🔐', 5, TRUE, '角色管理', CURRENT_TIMESTAMP, 'system', 0, 1),
('e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6', '安全配置', 'SECURITY', NULL, 'MENU', 'security', '🛡️', 6, TRUE, '安全配置', CURRENT_TIMESTAMP, 'system', 0, 1),
('f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7', 'Redis管理', 'REDIS', NULL, 'MENU', 'redis', '🗄️', 7, TRUE, 'Redis管理', CURRENT_TIMESTAMP, 'system', 0, 1),
('g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8', '日志管理', 'LOGS', NULL, 'MENU', 'logs', '📋', 8, TRUE, '日志管理', CURRENT_TIMESTAMP, 'system', 0, 1),
('h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9', '菜单管理', 'MENUS', NULL, 'MENU', 'menus', '📑', 9, TRUE, '菜单管理', CURRENT_TIMESTAMP, 'system', 0, 1),
('i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0', '权限管理', 'PERMISSIONS', NULL, 'MENU', 'permissions', '🔑', 10, TRUE, '权限管理', CURRENT_TIMESTAMP, 'system', 0, 1),
('j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1', '接口测试', 'TEST', NULL, 'MENU', 'test', '🧪', 11, TRUE, '接口测试', CURRENT_TIMESTAMP, 'system', 0, 1)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 7. 初始化角色菜单关联数据
-- ============================================================
-- 为SUPER_ADMIN分配所有菜单权限
INSERT INTO "role_menu" (id, role_id, menu_id, create_date, create_user, deleted, db_version)
SELECT 
    lower(substring(md5(random()::text || clock_timestamp()::text || rm.role_id || rm.menu_id) from 1 for 32)),
    'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
    m.id,
    CURRENT_TIMESTAMP,
    'system',
    0,
    1
FROM "menu" m
CROSS JOIN (SELECT 1) rm
WHERE NOT EXISTS (
    SELECT 1 FROM "role_menu" rm2 
    WHERE rm2.role_id = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6' 
    AND rm2.menu_id = m.id
);

-- 为ADMIN分配部分菜单权限（不包括菜单管理和权限管理）
INSERT INTO "role_menu" (id, role_id, menu_id, create_date, create_user, deleted, db_version)
SELECT 
    lower(substring(md5(random()::text || clock_timestamp()::text || rm.role_id || rm.menu_id) from 1 for 32)),
    'b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7',
    m.id,
    CURRENT_TIMESTAMP,
    'system',
    0,
    1
FROM "menu" m
CROSS JOIN (SELECT 1) rm
WHERE m.menu_code NOT IN ('MENUS', 'PERMISSIONS')
AND NOT EXISTS (
    SELECT 1 FROM "role_menu" rm2 
    WHERE rm2.role_id = 'b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7' 
    AND rm2.menu_id = m.id
);

-- 为USER分配基本菜单权限
INSERT INTO "role_menu" (id, role_id, menu_id, create_date, create_user, deleted, db_version)
SELECT 
    lower(substring(md5(random()::text || clock_timestamp()::text || rm.role_id || rm.menu_id) from 1 for 32)),
    'c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8',
    m.id,
    CURRENT_TIMESTAMP,
    'system',
    0,
    1
FROM "menu" m
CROSS JOIN (SELECT 1) rm
WHERE m.menu_code IN ('DASHBOARD', 'USERS', 'PRODUCT_TYPES', 'PRODUCTS', 'TEST')
AND NOT EXISTS (
    SELECT 1 FROM "role_menu" rm2 
    WHERE rm2.role_id = 'c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8' 
    AND rm2.menu_id = m.id
);
