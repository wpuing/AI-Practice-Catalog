-- ============================================================
-- 微服务系统数据库表结构汇总
-- 说明：包含所有服务模块的数据库表结构
-- 注意：所有服务共用 demo_cloud 数据库，表名使用服务前缀区分
-- ============================================================

-- ============================================================
-- 1. 认证服务数据库表结构 (demo_cloud)
-- 数据库前缀：auth_
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

-- ============================================================
-- 2. 用户服务数据库表结构 (demo_cloud)
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

-- ============================================================
-- 3. 商品服务数据库表结构 (demo_cloud)
-- 数据库前缀：product_
-- ============================================================

-- 商品类型表
CREATE TABLE IF NOT EXISTS product_type (
    id VARCHAR(32) NOT NULL PRIMARY KEY,
    type_name VARCHAR(100) NOT NULL,
    type_code VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    enabled BOOLEAN DEFAULT TRUE,
    create_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    create_user VARCHAR(32) NOT NULL,
    update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_user VARCHAR(32),
    deleted INTEGER NOT NULL DEFAULT 0,
    db_version INTEGER NOT NULL DEFAULT 1
);

COMMENT ON TABLE product_type IS '商品类型表';
COMMENT ON COLUMN product_type.id IS '商品类型ID（32位随机字符）';
COMMENT ON COLUMN product_type.type_name IS '商品类型名称';
COMMENT ON COLUMN product_type.type_code IS '商品类型代码（唯一）';

CREATE INDEX IF NOT EXISTS idx_product_type_code ON product_type(type_code);
CREATE INDEX IF NOT EXISTS idx_product_type_deleted ON product_type(deleted);

-- 商品信息表
CREATE TABLE IF NOT EXISTS product_info (
    id VARCHAR(32) NOT NULL PRIMARY KEY,
    product_name VARCHAR(200) NOT NULL,
    product_code VARCHAR(50) NOT NULL UNIQUE,
    type_id VARCHAR(32) NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    stock INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    image_url VARCHAR(500),
    enabled BOOLEAN DEFAULT TRUE,
    create_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    create_user VARCHAR(32) NOT NULL,
    update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_user VARCHAR(32),
    deleted INTEGER NOT NULL DEFAULT 0,
    db_version INTEGER NOT NULL DEFAULT 1
);

COMMENT ON TABLE product_info IS '商品信息表';
COMMENT ON COLUMN product_info.id IS '商品ID（32位随机字符）';
COMMENT ON COLUMN product_info.product_name IS '商品名称';
COMMENT ON COLUMN product_info.product_code IS '商品代码（唯一）';
COMMENT ON COLUMN product_info.type_id IS '商品类型ID';
COMMENT ON COLUMN product_info.price IS '商品价格';
COMMENT ON COLUMN product_info.stock IS '库存数量';

CREATE INDEX IF NOT EXISTS idx_product_info_type_id ON product_info(type_id);
CREATE INDEX IF NOT EXISTS idx_product_info_code ON product_info(product_code);
CREATE INDEX IF NOT EXISTS idx_product_info_deleted ON product_info(deleted);

-- ============================================================
-- 4. 报表服务数据库表结构 (demo_cloud)
-- 数据库前缀：report_
-- ============================================================

-- 报表模板表
CREATE TABLE IF NOT EXISTS report_template (
    id VARCHAR(32) NOT NULL PRIMARY KEY,
    template_name VARCHAR(100) NOT NULL,
    template_code VARCHAR(50) NOT NULL UNIQUE,
    template_type VARCHAR(50),
    template_content TEXT,
    description VARCHAR(255),
    enabled BOOLEAN DEFAULT TRUE,
    create_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    create_user VARCHAR(32) NOT NULL,
    update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_user VARCHAR(32),
    deleted INTEGER NOT NULL DEFAULT 0,
    db_version INTEGER NOT NULL DEFAULT 1
);

COMMENT ON TABLE report_template IS '报表模板表';
COMMENT ON COLUMN report_template.id IS '模板ID（32位随机字符）';
COMMENT ON COLUMN report_template.template_name IS '模板名称';
COMMENT ON COLUMN report_template.template_code IS '模板代码（唯一）';
COMMENT ON COLUMN report_template.template_type IS '模板类型';

CREATE INDEX IF NOT EXISTS idx_report_template_code ON report_template(template_code);
CREATE INDEX IF NOT EXISTS idx_report_template_deleted ON report_template(deleted);

-- 报表数据表
CREATE TABLE IF NOT EXISTS report_data (
    id VARCHAR(32) NOT NULL PRIMARY KEY,
    template_id VARCHAR(32) NOT NULL,
    report_name VARCHAR(100) NOT NULL,
    report_data TEXT,
    report_status VARCHAR(20) DEFAULT 'PENDING',
    create_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    create_user VARCHAR(32) NOT NULL,
    update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_user VARCHAR(32),
    deleted INTEGER NOT NULL DEFAULT 0,
    db_version INTEGER NOT NULL DEFAULT 1
);

COMMENT ON TABLE report_data IS '报表数据表';
COMMENT ON COLUMN report_data.id IS '报表ID（32位随机字符）';
COMMENT ON COLUMN report_data.template_id IS '模板ID';
COMMENT ON COLUMN report_data.report_name IS '报表名称';
COMMENT ON COLUMN report_data.report_data IS '报表数据（JSON格式）';
COMMENT ON COLUMN report_data.report_status IS '报表状态（PENDING, PROCESSING, COMPLETED, FAILED）';

CREATE INDEX IF NOT EXISTS idx_report_data_template_id ON report_data(template_id);
CREATE INDEX IF NOT EXISTS idx_report_data_status ON report_data(report_status);
CREATE INDEX IF NOT EXISTS idx_report_data_deleted ON report_data(deleted);

-- ============================================================
-- 5. 文件服务数据库表结构 (demo_cloud)
-- 数据库前缀：dfs_
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

