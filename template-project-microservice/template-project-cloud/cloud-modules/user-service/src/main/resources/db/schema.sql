-- ============================================================
-- 用户服务数据库表结构
-- 数据库前缀：user_
-- ============================================================

-- 用户信息表
CREATE TABLE IF NOT EXISTS user_info (
    id VARCHAR(32) NOT NULL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    nickname VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    avatar VARCHAR(500),
    gender INTEGER DEFAULT 0,
    birthday DATE,
    address VARCHAR(500),
    create_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    create_user VARCHAR(32) NOT NULL,
    update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_user VARCHAR(32),
    deleted INTEGER NOT NULL DEFAULT 0,
    db_version INTEGER NOT NULL DEFAULT 1
);

COMMENT ON TABLE user_info IS '用户信息表';
COMMENT ON COLUMN user_info.id IS '用户ID（32位随机字符）';
COMMENT ON COLUMN user_info.username IS '用户名';
COMMENT ON COLUMN user_info.nickname IS '昵称';
COMMENT ON COLUMN user_info.email IS '邮箱';
COMMENT ON COLUMN user_info.phone IS '手机号';

CREATE INDEX IF NOT EXISTS idx_user_info_username ON user_info(username);
CREATE INDEX IF NOT EXISTS idx_user_info_deleted ON user_info(deleted);

-- 用户配置表
CREATE TABLE IF NOT EXISTS user_config (
    id VARCHAR(32) NOT NULL PRIMARY KEY,
    user_id VARCHAR(32) NOT NULL,
    config_key VARCHAR(100) NOT NULL,
    config_value TEXT,
    create_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    create_user VARCHAR(32) NOT NULL,
    update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_user VARCHAR(32),
    deleted INTEGER NOT NULL DEFAULT 0,
    db_version INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT uk_user_config UNIQUE (user_id, config_key)
);

COMMENT ON TABLE user_config IS '用户配置表';
COMMENT ON COLUMN user_config.user_id IS '用户ID';
COMMENT ON COLUMN user_config.config_key IS '配置键';
COMMENT ON COLUMN user_config.config_value IS '配置值';

CREATE INDEX IF NOT EXISTS idx_user_config_user_id ON user_config(user_id);

