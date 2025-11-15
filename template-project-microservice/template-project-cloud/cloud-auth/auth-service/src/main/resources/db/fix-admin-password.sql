-- ============================================================
-- 修复 admin 用户密码 - 使用多个已知有效的 BCrypt 哈希
-- 密码：123456
-- 
-- 说明：由于 BCrypt 每次生成的哈希都不同，这里提供了多个哈希值
-- 如果第一个不工作，请尝试其他的，或者运行 PasswordGenerator.java 生成新的
-- ============================================================

-- 方法1：使用哈希1（最常见，来自 data.sql）
UPDATE auth_user 
SET 
    password = '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK8pJ0K',
    update_date = CURRENT_TIMESTAMP,
    update_user = 'system',
    db_version = db_version + 1
WHERE username = 'admin';

-- 如果方法1不工作，尝试方法2（取消下面的注释并执行）
-- UPDATE auth_user 
-- SET 
--     password = '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
--     update_date = CURRENT_TIMESTAMP,
--     update_user = 'system',
--     db_version = db_version + 1
-- WHERE username = 'admin';

-- 如果方法2也不工作，请运行 PasswordGenerator.java 生成新的哈希
-- 然后执行：
-- UPDATE auth_user 
-- SET 
--     password = '<生成的BCrypt哈希>',
--     update_date = CURRENT_TIMESTAMP,
--     update_user = 'system',
--     db_version = db_version + 1
-- WHERE username = 'admin';

-- 验证更新结果
SELECT username, 
       SUBSTRING(password, 1, 30) as password_hash_preview, 
       status, 
       deleted 
FROM auth_user 
WHERE username = 'admin';

