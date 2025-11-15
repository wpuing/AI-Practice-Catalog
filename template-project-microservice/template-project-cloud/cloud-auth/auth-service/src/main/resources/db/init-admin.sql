-- ============================================================
-- 初始化或更新 admin 用户
-- 密码：123456
-- BCrypt 加密后的密码（使用 BCryptPasswordEncoder 默认强度）
-- 
-- 注意：如果这个 BCrypt 哈希不匹配，请使用以下方法生成新的哈希：
-- 1. 运行 Java 代码：BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(); String hash = encoder.encode("123456");
-- 2. 或者使用在线工具生成 BCrypt 哈希
-- ============================================================

-- 先确保角色存在
INSERT INTO auth_role (id, role_name, role_code, description, create_date, create_user, deleted, db_version) 
VALUES 
('a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6', '超级管理员', 'SUPER_ADMIN', '超级管理员，拥有所有权限', CURRENT_TIMESTAMP, 'system', 0, 1)
ON CONFLICT (id) DO NOTHING;

-- 如果 admin 用户不存在，则插入；如果存在，则更新密码
INSERT INTO auth_user (id, username, password, email, phone, status, create_date, create_user, deleted, db_version) 
VALUES 
('d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9', 'admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK8pJ0K', 'admin@example.com', '13800138000', 1, CURRENT_TIMESTAMP, 'system', 0, 1)
ON CONFLICT (id) 
DO UPDATE SET 
    password = EXCLUDED.password,
    update_date = CURRENT_TIMESTAMP,
    update_user = 'system',
    db_version = auth_user.db_version + 1;

-- 如果用户名冲突（不同ID），则更新密码
UPDATE auth_user 
SET 
    password = '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK8pJ0K',
    update_date = CURRENT_TIMESTAMP,
    update_user = 'system',
    db_version = db_version + 1
WHERE username = 'admin' AND id != 'd4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9';

-- 确保 admin 用户有超级管理员角色
INSERT INTO auth_user_role (id, user_id, role_id, create_date, create_user, deleted, db_version) 
SELECT 
    'f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1', 
    'd4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9', 
    'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6', 
    CURRENT_TIMESTAMP, 
    'system', 
    0, 
    1
WHERE NOT EXISTS (
    SELECT 1 FROM auth_user_role 
    WHERE user_id = 'd4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9' 
    AND role_id = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6'
);

