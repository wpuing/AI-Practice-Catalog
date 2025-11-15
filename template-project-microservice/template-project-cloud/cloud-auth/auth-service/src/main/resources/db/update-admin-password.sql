-- ============================================================
-- 更新 admin 用户密码
-- 密码：123456
-- 
-- 使用方法：
-- 1. 运行 PasswordGenerator.java 生成新的 BCrypt 哈希
-- 2. 将生成的哈希值替换下面的 <BCRYPT_HASH>
-- 3. 执行此 SQL 脚本
-- ============================================================

-- 方法1：直接更新密码（需要先运行 PasswordGenerator.java 获取哈希值）
-- UPDATE auth_user 
-- SET 
--     password = '<BCRYPT_HASH>',
--     update_date = CURRENT_TIMESTAMP,
--     update_user = 'system',
--     db_version = db_version + 1
-- WHERE username = 'admin';

-- 方法2：使用多个已知有效的 BCrypt 哈希（密码：123456）
-- 注意：BCrypt 每次生成的哈希都不同，所以需要尝试不同的哈希
-- 如果这些都不工作，请使用方法1，运行 PasswordGenerator.java 生成新的哈希

-- 尝试哈希1（最常见）
UPDATE auth_user 
SET 
    password = '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK8pJ0K',
    update_date = CURRENT_TIMESTAMP,
    update_user = 'system',
    db_version = db_version + 1
WHERE username = 'admin';

-- 如果上面的不工作，尝试下面的哈希（取消注释并执行）
-- UPDATE auth_user 
-- SET 
--     password = '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
--     update_date = CURRENT_TIMESTAMP,
--     update_user = 'system',
--     db_version = db_version + 1
-- WHERE username = 'admin';

-- 验证更新结果
SELECT username, password, status, deleted FROM auth_user WHERE username = 'admin';

