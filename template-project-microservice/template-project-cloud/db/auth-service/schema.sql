-- ============================================================
-- 认证服务数据库表结构
-- 数据库前缀：auth_
-- 数据库名：demo_cloud
-- ============================================================

-- 认证用户表
CREATE TABLE IF NOT EXISTS auth_user (
    id VARCHAR(32) NOT NULL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    status INTEGER NOT NULL DEFAULT 1,
    create_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    create_user VARCHAR(32) NOT NULL,
    update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_user VARCHAR(32),
    deleted INTEGER NOT NULL DEFAULT 0,
    db_version INTEGER NOT NULL DEFAULT 1
);

COMMENT ON TABLE auth_user IS '认证用户表';
COMMENT ON COLUMN auth_user.id IS '用户ID（32位随机字符）';
COMMENT ON COLUMN auth_user.username IS '用户名';
COMMENT ON COLUMN auth_user.password IS '密码（BCrypt加密）';
COMMENT ON COLUMN auth_user.email IS '邮箱';
COMMENT ON COLUMN auth_user.phone IS '手机号';
COMMENT ON COLUMN auth_user.status IS '状态（0-禁用，1-启用）';

CREATE INDEX IF NOT EXISTS idx_auth_user_username ON auth_user(username);
CREATE INDEX IF NOT EXISTS idx_auth_user_deleted ON auth_user(deleted);

-- 角色表
CREATE TABLE IF NOT EXISTS auth_role (
    id VARCHAR(32) NOT NULL PRIMARY KEY,
    role_name VARCHAR(100) NOT NULL,
    role_code VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    create_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    create_user VARCHAR(32) NOT NULL,
    update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_user VARCHAR(32),
    deleted INTEGER NOT NULL DEFAULT 0,
    db_version INTEGER NOT NULL DEFAULT 1
);

COMMENT ON TABLE auth_role IS '角色表';
COMMENT ON COLUMN auth_role.id IS '角色ID（32位随机字符）';
COMMENT ON COLUMN auth_role.role_name IS '角色名称';
COMMENT ON COLUMN auth_role.role_code IS '角色代码（唯一）';

CREATE INDEX IF NOT EXISTS idx_auth_role_role_code ON auth_role(role_code);
CREATE INDEX IF NOT EXISTS idx_auth_role_deleted ON auth_role(deleted);

-- 用户角色关联表
CREATE TABLE IF NOT EXISTS auth_user_role (
    id VARCHAR(32) NOT NULL PRIMARY KEY,
    user_id VARCHAR(32) NOT NULL,
    role_id VARCHAR(32) NOT NULL,
    create_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    create_user VARCHAR(32) NOT NULL,
    update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_user VARCHAR(32),
    deleted INTEGER NOT NULL DEFAULT 0,
    db_version INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT uk_auth_user_role UNIQUE (user_id, role_id)
);

COMMENT ON TABLE auth_user_role IS '用户角色关联表';
COMMENT ON COLUMN auth_user_role.user_id IS '用户ID';
COMMENT ON COLUMN auth_user_role.role_id IS '角色ID';

CREATE INDEX IF NOT EXISTS idx_auth_user_role_user_id ON auth_user_role(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_user_role_role_id ON auth_user_role(role_id);

