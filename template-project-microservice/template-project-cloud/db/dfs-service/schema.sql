-- ============================================================
-- 文件服务数据库表结构
-- 数据库前缀：dfs_
-- 数据库名：demo_cloud
-- ============================================================

-- 文件信息表
CREATE TABLE IF NOT EXISTS dfs_file (
    id VARCHAR(32) NOT NULL PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(50),
    file_ext VARCHAR(20),
    upload_user_id VARCHAR(32),
    upload_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    access_url VARCHAR(500),
    create_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    create_user VARCHAR(32) NOT NULL,
    update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_user VARCHAR(32),
    deleted INTEGER NOT NULL DEFAULT 0,
    db_version INTEGER NOT NULL DEFAULT 1
);

COMMENT ON TABLE dfs_file IS '文件信息表';
COMMENT ON COLUMN dfs_file.id IS '文件ID（32位随机字符）';
COMMENT ON COLUMN dfs_file.file_name IS '文件名';
COMMENT ON COLUMN dfs_file.file_path IS '文件路径';
COMMENT ON COLUMN dfs_file.file_size IS '文件大小（字节）';
COMMENT ON COLUMN dfs_file.file_type IS '文件类型';
COMMENT ON COLUMN dfs_file.file_ext IS '文件扩展名';
COMMENT ON COLUMN dfs_file.upload_user_id IS '上传用户ID';
COMMENT ON COLUMN dfs_file.access_url IS '访问URL';

CREATE INDEX IF NOT EXISTS idx_dfs_file_upload_user_id ON dfs_file(upload_user_id);
CREATE INDEX IF NOT EXISTS idx_dfs_file_upload_time ON dfs_file(upload_time);
CREATE INDEX IF NOT EXISTS idx_dfs_file_deleted ON dfs_file(deleted);

