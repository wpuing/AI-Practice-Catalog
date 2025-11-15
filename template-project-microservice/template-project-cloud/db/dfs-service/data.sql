-- ============================================================
-- 文件服务初始数据
-- ============================================================

-- 注意：文件服务通常不需要初始数据，文件信息通过上传接口动态创建
-- 以下数据仅用于测试，实际文件需要手动上传

-- 初始化文件数据（注意：这些文件在实际文件系统中不存在，仅用于测试数据展示）
-- 注意：upload_user_id 使用 user_info 表中的用户ID，不是 auth_user 表的ID
-- user_info 表中管理员用户ID: u1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
INSERT INTO dfs_file (id, file_name, file_path, file_size, file_type, file_ext, upload_user_id, upload_time, access_url, create_date, create_user, deleted, db_version) VALUES 
('df1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o', '项目需求文档.pdf', '/data/uploads/test1.pdf', 2048576, 'application/pdf', '.pdf', 'u1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6', CURRENT_TIMESTAMP, '/api/dfs/df1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o/download', CURRENT_TIMESTAMP, 'system', 0, 1),
('df2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p', '系统架构图.png', '/data/uploads/test2.png', 1024000, 'image/png', '.png', 'u1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6', CURRENT_TIMESTAMP, '/api/dfs/df2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p/download', CURRENT_TIMESTAMP, 'system', 0, 1),
('df3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q', '用户手册.docx', '/data/uploads/test3.docx', 1536000, 'application/msword', '.docx', 'u1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6', CURRENT_TIMESTAMP, '/api/dfs/df3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q/download', CURRENT_TIMESTAMP, 'system', 0, 1),
('df4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r', '测试数据.xlsx', '/data/uploads/test4.xlsx', 512000, 'application/vnd.ms-excel', '.xlsx', 'u1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6', CURRENT_TIMESTAMP, '/api/dfs/df4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r/download', CURRENT_TIMESTAMP, 'system', 0, 1),
('df5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s', '产品图片.jpg', '/data/uploads/test5.jpg', 768000, 'image/jpeg', '.jpg', 'u1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6', CURRENT_TIMESTAMP, '/api/dfs/df5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s/download', CURRENT_TIMESTAMP, 'system', 0, 1)
ON CONFLICT (id) DO NOTHING;
