-- ============================================================
-- 更新所有文件的用户ID为管理员
-- 注意：用户服务查询的是 user_info 表，不是 auth_user 表
-- user_info 表中管理员用户ID: u1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6 (admin)
-- auth_user 表中管理员用户ID: d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9 (admin)
-- ============================================================

-- 更新所有文件的upload_user_id为user_info表中的管理员ID
UPDATE dfs_file 
SET 
    upload_user_id = 'u1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
    update_date = CURRENT_TIMESTAMP,
    update_user = 'system',
    db_version = db_version + 1
WHERE 
    deleted = 0 
    AND (upload_user_id IS NULL OR upload_user_id != 'u1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6');

-- 同时更新create_user字段为user_info表中的管理员ID
UPDATE dfs_file 
SET 
    create_user = 'u1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
    update_date = CURRENT_TIMESTAMP,
    update_user = 'system',
    db_version = db_version + 1
WHERE 
    deleted = 0 
    AND (create_user IS NULL OR create_user != 'u1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6');

-- 查询更新结果
SELECT 
    COUNT(*) as total_files,
    COUNT(CASE WHEN upload_user_id = 'u1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6' THEN 1 END) as admin_files,
    upload_user_id,
    COUNT(*) as count_by_user
FROM dfs_file 
WHERE deleted = 0
GROUP BY upload_user_id;

