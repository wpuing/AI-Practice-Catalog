-- ============================================================
-- 微服务系统初始数据汇总
-- 说明：包含所有服务模块的初始数据
-- 注意：所有服务共用 demo_cloud 数据库，执行时按表前缀区分服务
-- ============================================================

-- ============================================================
-- 1. 认证服务初始数据 (demo_cloud)
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

-- ============================================================
-- 2. 用户服务初始数据 (demo_cloud)
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

-- ============================================================
-- 3. 商品服务初始数据 (demo_cloud)
-- ============================================================

-- 初始化商品类型数据
INSERT INTO product_type (id, type_name, type_code, description, sort_order, enabled, create_date, create_user, deleted, db_version) VALUES 
('t1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6', '电子产品', 'ELECTRONICS', '电子产品分类', 1, TRUE, CURRENT_TIMESTAMP, 'system', 0, 1),
('t2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7', '服装', 'CLOTHING', '服装分类', 2, TRUE, CURRENT_TIMESTAMP, 'system', 0, 1),
('t3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8', '食品', 'FOOD', '食品分类', 3, TRUE, CURRENT_TIMESTAMP, 'system', 0, 1)
ON CONFLICT (id) DO NOTHING;

-- 初始化商品信息数据
INSERT INTO product_info (id, product_name, product_code, type_id, price, stock, description, enabled, create_date, create_user, deleted, db_version) VALUES 
('p1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6', 'iPhone 15', 'IPHONE15', 't1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6', 5999.00, 100, '苹果iPhone 15手机', TRUE, CURRENT_TIMESTAMP, 'system', 0, 1),
('p2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7', 'MacBook Pro', 'MACBOOK_PRO', 't1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6', 12999.00, 50, '苹果MacBook Pro笔记本电脑', TRUE, CURRENT_TIMESTAMP, 'system', 0, 1)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 4. 报表服务初始数据 (demo_cloud)
-- ============================================================

-- 初始化报表模板数据
INSERT INTO report_template (id, template_name, template_code, template_type, template_content, description, enabled, create_date, create_user, deleted, db_version) VALUES 
('r1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6', '销售报表模板', 'SALES_REPORT', 'SALES', '{"columns":["日期","销售额","订单数"]}', '销售报表模板', TRUE, CURRENT_TIMESTAMP, 'system', 0, 1),
('r2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7', '用户统计报表模板', 'USER_STATISTICS', 'STATISTICS', '{"columns":["日期","新增用户","活跃用户"]}', '用户统计报表模板', TRUE, CURRENT_TIMESTAMP, 'system', 0, 1)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 5. 文件服务初始数据 (demo_cloud)
-- ============================================================

-- 文件服务通常不需要初始数据，文件信息通过上传接口动态创建

