-- ============================================================
-- 数据库表结构定义文件
-- 说明：包含所有表的完整结构定义，包括基础字段
-- 创建时间：2025-11
-- ============================================================

-- 创建数据库（PostgreSQL 语法）
-- 注意：PostgreSQL 中创建数据库需要单独执行，不能在脚本中使用
-- 使用命令：CREATE DATABASE demo_db WITH ENCODING 'UTF8' LC_COLLATE='zh_CN.UTF-8' LC_CTYPE='zh_CN.UTF-8';

-- ============================================================
-- 基础字段说明
-- ============================================================
-- id: 主键，32位随机字符（小写字母和数字）
-- create_date: 创建时间，TIMESTAMP类型，插入时自动填充
-- create_user: 创建用户ID，VARCHAR(32)，插入时自动填充
-- update_date: 修改时间，TIMESTAMP类型，更新时自动填充
-- update_user: 修改用户ID，VARCHAR(32)，更新时自动填充
-- deleted: 是否删除，INTEGER类型，0=未删除，1=已删除，默认0，插入时自动填充
-- db_version: 版本号，INTEGER类型，用于乐观锁，默认1
-- tenant_id: 租户ID，VARCHAR(32)，用于多租户支持，可为空

-- ============================================================
-- 1. 用户表
-- ============================================================
CREATE TABLE IF NOT EXISTS "user" (
    id VARCHAR(32) NOT NULL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    create_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    create_user VARCHAR(32) NOT NULL,
    update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_user VARCHAR(32),
    deleted INTEGER NOT NULL DEFAULT 0,
    db_version INTEGER NOT NULL DEFAULT 1,
    tenant_id VARCHAR(32)
);

COMMENT ON TABLE "user" IS '用户表';
COMMENT ON COLUMN "user".id IS '用户ID（32位随机字符）';
COMMENT ON COLUMN "user".username IS '用户名';
COMMENT ON COLUMN "user".password IS '密码（BCrypt加密）';
COMMENT ON COLUMN "user".create_date IS '创建时间';
COMMENT ON COLUMN "user".create_user IS '创建用户ID';
COMMENT ON COLUMN "user".update_date IS '修改时间';
COMMENT ON COLUMN "user".update_user IS '修改用户ID';
COMMENT ON COLUMN "user".deleted IS '是否删除（0=未删除，1=已删除）';
COMMENT ON COLUMN "user".db_version IS '版本号（乐观锁）';
COMMENT ON COLUMN "user".tenant_id IS '租户ID';

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_username ON "user"(username);
CREATE INDEX IF NOT EXISTS idx_user_deleted ON "user"(deleted);
CREATE INDEX IF NOT EXISTS idx_user_tenant_id ON "user"(tenant_id);

-- ============================================================
-- 2. 角色表
-- ============================================================
CREATE TABLE IF NOT EXISTS "role" (
    id VARCHAR(32) NOT NULL PRIMARY KEY,
    role_name VARCHAR(100) NOT NULL,
    role_code VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    create_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    create_user VARCHAR(32) NOT NULL,
    update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_user VARCHAR(32),
    deleted INTEGER NOT NULL DEFAULT 0,
    db_version INTEGER NOT NULL DEFAULT 1,
    tenant_id VARCHAR(32)
);

COMMENT ON TABLE "role" IS '角色表';
COMMENT ON COLUMN "role".id IS '角色ID（32位随机字符）';
COMMENT ON COLUMN "role".role_name IS '角色名称';
COMMENT ON COLUMN "role".role_code IS '角色代码（唯一）';
COMMENT ON COLUMN "role".description IS '角色描述';
COMMENT ON COLUMN "role".create_date IS '创建时间';
COMMENT ON COLUMN "role".create_user IS '创建用户ID';
COMMENT ON COLUMN "role".update_date IS '修改时间';
COMMENT ON COLUMN "role".update_user IS '修改用户ID';
COMMENT ON COLUMN "role".deleted IS '是否删除（0=未删除，1=已删除）';
COMMENT ON COLUMN "role".db_version IS '版本号（乐观锁）';
COMMENT ON COLUMN "role".tenant_id IS '租户ID';

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_role_role_code ON "role"(role_code);
CREATE INDEX IF NOT EXISTS idx_role_deleted ON "role"(deleted);
CREATE INDEX IF NOT EXISTS idx_role_tenant_id ON "role"(tenant_id);

-- ============================================================
-- 3. 用户角色关联表
-- ============================================================
CREATE TABLE IF NOT EXISTS "user_role" (
    id VARCHAR(32) NOT NULL PRIMARY KEY,
    user_id VARCHAR(32) NOT NULL,
    role_id VARCHAR(32) NOT NULL,
    create_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    create_user VARCHAR(32) NOT NULL,
    update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_user VARCHAR(32),
    deleted INTEGER NOT NULL DEFAULT 0,
    db_version INTEGER NOT NULL DEFAULT 1,
    tenant_id VARCHAR(32),
    CONSTRAINT uk_user_role UNIQUE (user_id, role_id)
);

COMMENT ON TABLE "user_role" IS '用户角色关联表';
COMMENT ON COLUMN "user_role".id IS '关联ID（32位随机字符）';
COMMENT ON COLUMN "user_role".user_id IS '用户ID（逻辑外键）';
COMMENT ON COLUMN "user_role".role_id IS '角色ID（逻辑外键）';
COMMENT ON COLUMN "user_role".create_date IS '创建时间';
COMMENT ON COLUMN "user_role".create_user IS '创建用户ID';
COMMENT ON COLUMN "user_role".update_date IS '修改时间';
COMMENT ON COLUMN "user_role".update_user IS '修改用户ID';
COMMENT ON COLUMN "user_role".deleted IS '是否删除（0=未删除，1=已删除）';
COMMENT ON COLUMN "user_role".db_version IS '版本号（乐观锁）';
COMMENT ON COLUMN "user_role".tenant_id IS '租户ID';

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_role_user_id ON "user_role"(user_id);
CREATE INDEX IF NOT EXISTS idx_user_role_role_id ON "user_role"(role_id);
CREATE INDEX IF NOT EXISTS idx_user_role_deleted ON "user_role"(deleted);
CREATE INDEX IF NOT EXISTS idx_user_role_tenant_id ON "user_role"(tenant_id);

-- ============================================================
-- 4. 商品类型表
-- ============================================================
CREATE TABLE IF NOT EXISTS "product_type" (
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
    db_version INTEGER NOT NULL DEFAULT 1,
    tenant_id VARCHAR(32)
);

COMMENT ON TABLE "product_type" IS '商品类型表';
COMMENT ON COLUMN "product_type".id IS '商品类型ID（32位随机字符）';
COMMENT ON COLUMN "product_type".type_name IS '商品类型名称';
COMMENT ON COLUMN "product_type".type_code IS '商品类型代码（唯一）';
COMMENT ON COLUMN "product_type".description IS '商品类型描述';
COMMENT ON COLUMN "product_type".sort_order IS '排序（数字越小越靠前）';
COMMENT ON COLUMN "product_type".enabled IS '是否启用';
COMMENT ON COLUMN "product_type".create_date IS '创建时间';
COMMENT ON COLUMN "product_type".create_user IS '创建用户ID';
COMMENT ON COLUMN "product_type".update_date IS '修改时间';
COMMENT ON COLUMN "product_type".update_user IS '修改用户ID';
COMMENT ON COLUMN "product_type".deleted IS '是否删除（0=未删除，1=已删除）';
COMMENT ON COLUMN "product_type".db_version IS '版本号（乐观锁）';
COMMENT ON COLUMN "product_type".tenant_id IS '租户ID';

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_product_type_code ON "product_type"(type_code);
CREATE INDEX IF NOT EXISTS idx_product_type_deleted ON "product_type"(deleted);
CREATE INDEX IF NOT EXISTS idx_product_type_tenant_id ON "product_type"(tenant_id);

-- ============================================================
-- 5. 商品表
-- ============================================================
CREATE TABLE IF NOT EXISTS "product" (
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
    db_version INTEGER NOT NULL DEFAULT 1,
    tenant_id VARCHAR(32)
);

COMMENT ON TABLE "product" IS '商品表';
COMMENT ON COLUMN "product".id IS '商品ID（32位随机字符）';
COMMENT ON COLUMN "product".product_name IS '商品名称';
COMMENT ON COLUMN "product".product_code IS '商品代码（唯一）';
COMMENT ON COLUMN "product".type_id IS '商品类型ID（逻辑外键）';
COMMENT ON COLUMN "product".price IS '商品价格';
COMMENT ON COLUMN "product".stock IS '库存数量';
COMMENT ON COLUMN "product".description IS '商品描述';
COMMENT ON COLUMN "product".image_url IS '商品图片URL';
COMMENT ON COLUMN "product".enabled IS '是否启用';
COMMENT ON COLUMN "product".create_date IS '创建时间';
COMMENT ON COLUMN "product".create_user IS '创建用户ID';
COMMENT ON COLUMN "product".update_date IS '修改时间';
COMMENT ON COLUMN "product".update_user IS '修改用户ID';
COMMENT ON COLUMN "product".deleted IS '是否删除（0=未删除，1=已删除）';
COMMENT ON COLUMN "product".db_version IS '版本号（乐观锁）';
COMMENT ON COLUMN "product".tenant_id IS '租户ID';

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_product_type_id ON "product"(type_id);
CREATE INDEX IF NOT EXISTS idx_product_code ON "product"(product_code);
CREATE INDEX IF NOT EXISTS idx_product_deleted ON "product"(deleted);
CREATE INDEX IF NOT EXISTS idx_product_tenant_id ON "product"(tenant_id);

-- ============================================================
-- 6. 安全白名单表
-- ============================================================
CREATE TABLE IF NOT EXISTS "security_whitelist" (
    id VARCHAR(32) NOT NULL PRIMARY KEY,
    path_pattern VARCHAR(255) NOT NULL,
    http_method VARCHAR(10),
    description VARCHAR(255),
    enabled BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    create_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    create_user VARCHAR(32) NOT NULL,
    update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_user VARCHAR(32),
    deleted INTEGER NOT NULL DEFAULT 0,
    db_version INTEGER NOT NULL DEFAULT 1,
    tenant_id VARCHAR(32)
);

COMMENT ON TABLE "security_whitelist" IS '安全白名单表（无需认证的路径）';
COMMENT ON COLUMN "security_whitelist".id IS '白名单ID（32位随机字符）';
COMMENT ON COLUMN "security_whitelist".path_pattern IS '路径模式（支持Ant风格）';
COMMENT ON COLUMN "security_whitelist".http_method IS 'HTTP方法（GET,POST,PUT,DELETE等，为空表示所有方法）';
COMMENT ON COLUMN "security_whitelist".description IS '描述';
COMMENT ON COLUMN "security_whitelist".enabled IS '是否启用';
COMMENT ON COLUMN "security_whitelist".sort_order IS '排序（数字越小越先匹配）';
COMMENT ON COLUMN "security_whitelist".create_date IS '创建时间';
COMMENT ON COLUMN "security_whitelist".create_user IS '创建用户ID';
COMMENT ON COLUMN "security_whitelist".update_date IS '修改时间';
COMMENT ON COLUMN "security_whitelist".update_user IS '修改用户ID';
COMMENT ON COLUMN "security_whitelist".deleted IS '是否删除（0=未删除，1=已删除）';
COMMENT ON COLUMN "security_whitelist".db_version IS '版本号（乐观锁）';
COMMENT ON COLUMN "security_whitelist".tenant_id IS '租户ID';

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_security_whitelist_deleted ON "security_whitelist"(deleted);
CREATE INDEX IF NOT EXISTS idx_security_whitelist_tenant_id ON "security_whitelist"(tenant_id);

-- ============================================================
-- 7. 安全权限表
-- ============================================================
CREATE TABLE IF NOT EXISTS "security_permission" (
    id VARCHAR(32) NOT NULL PRIMARY KEY,
    path_pattern VARCHAR(255) NOT NULL,
    http_method VARCHAR(10),
    required_roles TEXT,
    description VARCHAR(255),
    enabled BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    create_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    create_user VARCHAR(32) NOT NULL,
    update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_user VARCHAR(32),
    deleted INTEGER NOT NULL DEFAULT 0,
    db_version INTEGER NOT NULL DEFAULT 1,
    tenant_id VARCHAR(32)
);

COMMENT ON TABLE "security_permission" IS '安全权限表（路径权限配置）';
COMMENT ON COLUMN "security_permission".id IS '权限ID（32位随机字符）';
COMMENT ON COLUMN "security_permission".path_pattern IS '路径模式（支持Ant风格）';
COMMENT ON COLUMN "security_permission".http_method IS 'HTTP方法（为空表示所有方法）';
COMMENT ON COLUMN "security_permission".required_roles IS '所需角色（多个角色用逗号分隔）';
COMMENT ON COLUMN "security_permission".description IS '描述';
COMMENT ON COLUMN "security_permission".enabled IS '是否启用';
COMMENT ON COLUMN "security_permission".sort_order IS '排序（数字越小越先匹配）';
COMMENT ON COLUMN "security_permission".create_date IS '创建时间';
COMMENT ON COLUMN "security_permission".create_user IS '创建用户ID';
COMMENT ON COLUMN "security_permission".update_date IS '修改时间';
COMMENT ON COLUMN "security_permission".update_user IS '修改用户ID';
COMMENT ON COLUMN "security_permission".deleted IS '是否删除（0=未删除，1=已删除）';
COMMENT ON COLUMN "security_permission".db_version IS '版本号（乐观锁）';
COMMENT ON COLUMN "security_permission".tenant_id IS '租户ID';

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_security_permission_deleted ON "security_permission"(deleted);
CREATE INDEX IF NOT EXISTS idx_security_permission_tenant_id ON "security_permission"(tenant_id);

-- ============================================================
-- 8. 菜单表
-- ============================================================
CREATE TABLE IF NOT EXISTS "menu" (
    id VARCHAR(32) NOT NULL PRIMARY KEY,
    menu_name VARCHAR(100) NOT NULL,
    menu_code VARCHAR(50) NOT NULL UNIQUE,
    parent_id VARCHAR(32),
    menu_type VARCHAR(20) NOT NULL DEFAULT 'MENU',
    path VARCHAR(200),
    icon VARCHAR(100),
    sort_order INTEGER DEFAULT 0,
    enabled BOOLEAN DEFAULT TRUE,
    description VARCHAR(255),
    create_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    create_user VARCHAR(32) NOT NULL,
    update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_user VARCHAR(32),
    deleted INTEGER NOT NULL DEFAULT 0,
    db_version INTEGER NOT NULL DEFAULT 1,
    tenant_id VARCHAR(32)
);

COMMENT ON TABLE "menu" IS '菜单表';
COMMENT ON COLUMN "menu".id IS '菜单ID（32位随机字符）';
COMMENT ON COLUMN "menu".menu_name IS '菜单名称';
COMMENT ON COLUMN "menu".menu_code IS '菜单代码（唯一）';
COMMENT ON COLUMN "menu".parent_id IS '父菜单ID（NULL表示顶级菜单）';
COMMENT ON COLUMN "menu".menu_type IS '菜单类型（MENU: 菜单, BUTTON: 按钮）';
COMMENT ON COLUMN "menu".path IS '前端路由路径';
COMMENT ON COLUMN "menu".icon IS '图标';
COMMENT ON COLUMN "menu".sort_order IS '排序';
COMMENT ON COLUMN "menu".enabled IS '是否启用';
COMMENT ON COLUMN "menu".description IS '描述';
COMMENT ON COLUMN "menu".create_date IS '创建时间';
COMMENT ON COLUMN "menu".create_user IS '创建用户ID';
COMMENT ON COLUMN "menu".update_date IS '修改时间';
COMMENT ON COLUMN "menu".update_user IS '修改用户ID';
COMMENT ON COLUMN "menu".deleted IS '是否删除（0=未删除，1=已删除）';
COMMENT ON COLUMN "menu".db_version IS '版本号（乐观锁）';
COMMENT ON COLUMN "menu".tenant_id IS '租户ID';

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_menu_parent_id ON "menu"(parent_id);
CREATE INDEX IF NOT EXISTS idx_menu_menu_code ON "menu"(menu_code);
CREATE INDEX IF NOT EXISTS idx_menu_enabled ON "menu"(enabled);
CREATE INDEX IF NOT EXISTS idx_menu_deleted ON "menu"(deleted);
CREATE INDEX IF NOT EXISTS idx_menu_tenant_id ON "menu"(tenant_id);

-- ============================================================
-- 9. 角色菜单关联表
-- ============================================================
CREATE TABLE IF NOT EXISTS "role_menu" (
    id VARCHAR(32) NOT NULL PRIMARY KEY,
    role_id VARCHAR(32) NOT NULL,
    menu_id VARCHAR(32) NOT NULL,
    create_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    create_user VARCHAR(32) NOT NULL,
    update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_user VARCHAR(32),
    deleted INTEGER NOT NULL DEFAULT 0,
    db_version INTEGER NOT NULL DEFAULT 1,
    tenant_id VARCHAR(32),
    CONSTRAINT uk_role_menu UNIQUE (role_id, menu_id)
);

COMMENT ON TABLE "role_menu" IS '角色菜单关联表';
COMMENT ON COLUMN "role_menu".id IS '关联ID（32位随机字符）';
COMMENT ON COLUMN "role_menu".role_id IS '角色ID（逻辑外键）';
COMMENT ON COLUMN "role_menu".menu_id IS '菜单ID（逻辑外键）';
COMMENT ON COLUMN "role_menu".create_date IS '创建时间';
COMMENT ON COLUMN "role_menu".create_user IS '创建用户ID';
COMMENT ON COLUMN "role_menu".update_date IS '修改时间';
COMMENT ON COLUMN "role_menu".update_user IS '修改用户ID';
COMMENT ON COLUMN "role_menu".deleted IS '是否删除（0=未删除，1=已删除）';
COMMENT ON COLUMN "role_menu".db_version IS '版本号（乐观锁）';
COMMENT ON COLUMN "role_menu".tenant_id IS '租户ID';

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_role_menu_role_id ON "role_menu"(role_id);
CREATE INDEX IF NOT EXISTS idx_role_menu_menu_id ON "role_menu"(menu_id);
CREATE INDEX IF NOT EXISTS idx_role_menu_deleted ON "role_menu"(deleted);
CREATE INDEX IF NOT EXISTS idx_role_menu_tenant_id ON "role_menu"(tenant_id);

-- ============================================================
-- 10. 菜单功能权限表
-- ============================================================
CREATE TABLE IF NOT EXISTS "menu_permission" (
    id VARCHAR(32) NOT NULL PRIMARY KEY,
    menu_id VARCHAR(32) NOT NULL,
    security_permission_id VARCHAR(32) NOT NULL,
    description VARCHAR(255),
    enabled BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    create_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    create_user VARCHAR(32) NOT NULL,
    update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_user VARCHAR(32),
    deleted INTEGER NOT NULL DEFAULT 0,
    db_version INTEGER NOT NULL DEFAULT 1,
    tenant_id VARCHAR(32),
    CONSTRAINT uk_menu_permission UNIQUE (menu_id, security_permission_id)
);

COMMENT ON TABLE "menu_permission" IS '菜单功能权限表（关联 security_permission）';
COMMENT ON COLUMN "menu_permission".id IS '关联ID（32位随机字符）';
COMMENT ON COLUMN "menu_permission".menu_id IS '菜单ID（逻辑外键）';
COMMENT ON COLUMN "menu_permission".security_permission_id IS '安全权限ID（逻辑外键）';
COMMENT ON COLUMN "menu_permission".description IS '描述';
COMMENT ON COLUMN "menu_permission".enabled IS '是否启用';
COMMENT ON COLUMN "menu_permission".sort_order IS '排序';
COMMENT ON COLUMN "menu_permission".create_date IS '创建时间';
COMMENT ON COLUMN "menu_permission".create_user IS '创建用户ID';
COMMENT ON COLUMN "menu_permission".update_date IS '修改时间';
COMMENT ON COLUMN "menu_permission".update_user IS '修改用户ID';
COMMENT ON COLUMN "menu_permission".deleted IS '是否删除（0=未删除，1=已删除）';
COMMENT ON COLUMN "menu_permission".db_version IS '版本号（乐观锁）';
COMMENT ON COLUMN "menu_permission".tenant_id IS '租户ID';

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_menu_permission_menu_id ON "menu_permission"(menu_id);
CREATE INDEX IF NOT EXISTS idx_menu_permission_security_id ON "menu_permission"(security_permission_id);
CREATE INDEX IF NOT EXISTS idx_menu_permission_enabled ON "menu_permission"(enabled);
CREATE INDEX IF NOT EXISTS idx_menu_permission_deleted ON "menu_permission"(deleted);
CREATE INDEX IF NOT EXISTS idx_menu_permission_tenant_id ON "menu_permission"(tenant_id);

-- ============================================================
-- 11. 操作日志表
-- ============================================================
CREATE TABLE IF NOT EXISTS "operation_log" (
    id VARCHAR(32) NOT NULL PRIMARY KEY,
    user_id VARCHAR(32),
    username VARCHAR(100),
    operation_type VARCHAR(50) NOT NULL,
    module VARCHAR(100) NOT NULL,
    operation_desc VARCHAR(500),
    request_method VARCHAR(10),
    request_url VARCHAR(500),
    request_params TEXT,
    response_result TEXT,
    ip_address VARCHAR(50),
    user_agent VARCHAR(500),
    operation_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    create_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    create_user VARCHAR(32) NOT NULL,
    update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_user VARCHAR(32),
    deleted INTEGER NOT NULL DEFAULT 0,
    db_version INTEGER NOT NULL DEFAULT 1,
    tenant_id VARCHAR(32)
);

COMMENT ON TABLE "operation_log" IS '操作日志表';
COMMENT ON COLUMN "operation_log".id IS '日志ID（32位随机字符）';
COMMENT ON COLUMN "operation_log".user_id IS '操作用户ID';
COMMENT ON COLUMN "operation_log".username IS '操作用户名';
COMMENT ON COLUMN "operation_log".operation_type IS '操作类型（CREATE,UPDATE,DELETE,QUERY等）';
COMMENT ON COLUMN "operation_log".module IS '操作模块（用户管理、商品管理等）';
COMMENT ON COLUMN "operation_log".operation_desc IS '操作描述';
COMMENT ON COLUMN "operation_log".request_method IS '请求方法（GET,POST,PUT,DELETE等）';
COMMENT ON COLUMN "operation_log".request_url IS '请求URL';
COMMENT ON COLUMN "operation_log".request_params IS '请求参数（JSON格式）';
COMMENT ON COLUMN "operation_log".response_result IS '响应结果（JSON格式）';
COMMENT ON COLUMN "operation_log".ip_address IS 'IP地址';
COMMENT ON COLUMN "operation_log".user_agent IS '用户代理';
COMMENT ON COLUMN "operation_log".operation_time IS '操作时间';
COMMENT ON COLUMN "operation_log".create_date IS '创建时间';
COMMENT ON COLUMN "operation_log".create_user IS '创建用户ID';
COMMENT ON COLUMN "operation_log".update_date IS '修改时间';
COMMENT ON COLUMN "operation_log".update_user IS '修改用户ID';
COMMENT ON COLUMN "operation_log".deleted IS '是否删除（0=未删除，1=已删除）';
COMMENT ON COLUMN "operation_log".db_version IS '版本号（乐观锁）';
COMMENT ON COLUMN "operation_log".tenant_id IS '租户ID';

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_operation_log_user_id ON "operation_log"(user_id);
CREATE INDEX IF NOT EXISTS idx_operation_log_username ON "operation_log"(username);
CREATE INDEX IF NOT EXISTS idx_operation_log_operation_type ON "operation_log"(operation_type);
CREATE INDEX IF NOT EXISTS idx_operation_log_module ON "operation_log"(module);
CREATE INDEX IF NOT EXISTS idx_operation_log_operation_time ON "operation_log"(operation_time);
CREATE INDEX IF NOT EXISTS idx_operation_log_create_time ON "operation_log"(create_date);
CREATE INDEX IF NOT EXISTS idx_operation_log_deleted ON "operation_log"(deleted);
CREATE INDEX IF NOT EXISTS idx_operation_log_tenant_id ON "operation_log"(tenant_id);
