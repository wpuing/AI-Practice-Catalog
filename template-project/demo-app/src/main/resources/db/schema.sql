-- 创建数据库（PostgreSQL 语法）
-- 注意：PostgreSQL 中创建数据库需要单独执行，不能在脚本中使用
-- 使用命令：CREATE DATABASE demo_db WITH ENCODING 'UTF8' LC_COLLATE='zh_CN.UTF-8' LC_CTYPE='zh_CN.UTF-8';

-- 如果数据库已创建，连接到数据库后执行以下语句

-- 创建用户表
CREATE TABLE IF NOT EXISTS "user" (
    id VARCHAR(50) NOT NULL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

COMMENT ON TABLE "user" IS '用户表';
COMMENT ON COLUMN "user".id IS '用户ID';
COMMENT ON COLUMN "user".username IS '用户名';
COMMENT ON COLUMN "user".password IS '密码';

-- 创建角色表
CREATE TABLE IF NOT EXISTS "role" (
    id VARCHAR(50) NOT NULL PRIMARY KEY,
    role_name VARCHAR(100) NOT NULL,
    role_code VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
);

COMMENT ON TABLE "role" IS '角色表';
COMMENT ON COLUMN "role".id IS '角色ID';
COMMENT ON COLUMN "role".role_name IS '角色名称';
COMMENT ON COLUMN "role".role_code IS '角色代码';
COMMENT ON COLUMN "role".description IS '角色描述';

-- 创建用户角色关联表（使用逻辑外键，不设置物理外键约束）
CREATE TABLE IF NOT EXISTS "user_role" (
    id VARCHAR(50) NOT NULL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    role_id VARCHAR(50) NOT NULL,
    CONSTRAINT uk_user_role UNIQUE (user_id, role_id)
);

COMMENT ON TABLE "user_role" IS '用户角色关联表';
COMMENT ON COLUMN "user_role".id IS '关联ID';
COMMENT ON COLUMN "user_role".user_id IS '用户ID（逻辑外键，关联到user表的id字段）';
COMMENT ON COLUMN "user_role".role_id IS '角色ID（逻辑外键，关联到role表的id字段）';

-- 创建安全白名单表
CREATE TABLE IF NOT EXISTS "security_whitelist" (
    id VARCHAR(50) NOT NULL PRIMARY KEY,
    path_pattern VARCHAR(255) NOT NULL,
    http_method VARCHAR(10),
    description VARCHAR(255),
    enabled BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE "security_whitelist" IS '安全白名单表（无需认证的路径）';
COMMENT ON COLUMN "security_whitelist".id IS '白名单ID';
COMMENT ON COLUMN "security_whitelist".path_pattern IS '路径模式（支持Ant风格，如 /api/auth/**）';
COMMENT ON COLUMN "security_whitelist".http_method IS 'HTTP方法（GET,POST,PUT,DELETE等，为空表示所有方法）';
COMMENT ON COLUMN "security_whitelist".description IS '描述';
COMMENT ON COLUMN "security_whitelist".enabled IS '是否启用';
COMMENT ON COLUMN "security_whitelist".sort_order IS '排序（数字越小越先匹配）';
COMMENT ON COLUMN "security_whitelist".create_time IS '创建时间';
COMMENT ON COLUMN "security_whitelist".update_time IS '更新时间';

-- 创建安全权限表
CREATE TABLE IF NOT EXISTS "security_permission" (
    id VARCHAR(50) NOT NULL PRIMARY KEY,
    path_pattern VARCHAR(255) NOT NULL,
    http_method VARCHAR(10),
    required_roles TEXT,
    description VARCHAR(255),
    enabled BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE "security_permission" IS '安全权限表（路径权限配置）';
COMMENT ON COLUMN "security_permission".id IS '权限ID';
COMMENT ON COLUMN "security_permission".path_pattern IS '路径模式（支持Ant风格）';
COMMENT ON COLUMN "security_permission".http_method IS 'HTTP方法（为空表示所有方法）';
COMMENT ON COLUMN "security_permission".required_roles IS '所需角色（多个角色用逗号分隔，如：ADMIN,USER）';
COMMENT ON COLUMN "security_permission".description IS '描述';
COMMENT ON COLUMN "security_permission".enabled IS '是否启用';
COMMENT ON COLUMN "security_permission".sort_order IS '排序（数字越小越先匹配）';
COMMENT ON COLUMN "security_permission".create_time IS '创建时间';
COMMENT ON COLUMN "security_permission".update_time IS '更新时间';

-- 商品类型表
CREATE TABLE IF NOT EXISTS "product_type" (
    id VARCHAR(50) NOT NULL PRIMARY KEY,
    type_name VARCHAR(100) NOT NULL,
    type_code VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    enabled BOOLEAN DEFAULT TRUE,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE "product_type" IS '商品类型表';
COMMENT ON COLUMN "product_type".id IS '商品类型ID';
COMMENT ON COLUMN "product_type".type_name IS '商品类型名称';
COMMENT ON COLUMN "product_type".type_code IS '商品类型代码（唯一）';
COMMENT ON COLUMN "product_type".description IS '商品类型描述';
COMMENT ON COLUMN "product_type".sort_order IS '排序（数字越小越靠前）';
COMMENT ON COLUMN "product_type".enabled IS '是否启用';
COMMENT ON COLUMN "product_type".create_time IS '创建时间';
COMMENT ON COLUMN "product_type".update_time IS '更新时间';

-- 商品表
CREATE TABLE IF NOT EXISTS "product" (
    id VARCHAR(50) NOT NULL PRIMARY KEY,
    product_name VARCHAR(200) NOT NULL,
    product_code VARCHAR(50) NOT NULL UNIQUE,
    type_id VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    stock INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    image_url VARCHAR(500),
    enabled BOOLEAN DEFAULT TRUE,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE "product" IS '商品表';
COMMENT ON COLUMN "product".id IS '商品ID';
COMMENT ON COLUMN "product".product_name IS '商品名称';
COMMENT ON COLUMN "product".product_code IS '商品代码（唯一）';
COMMENT ON COLUMN "product".type_id IS '商品类型ID（逻辑外键，关联到product_type表的id字段）';
COMMENT ON COLUMN "product".price IS '商品价格';
COMMENT ON COLUMN "product".stock IS '库存数量';
COMMENT ON COLUMN "product".description IS '商品描述';
COMMENT ON COLUMN "product".image_url IS '商品图片URL';
COMMENT ON COLUMN "product".enabled IS '是否启用';
COMMENT ON COLUMN "product".create_time IS '创建时间';
COMMENT ON COLUMN "product".update_time IS '更新时间';

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_product_type_id ON "product"(type_id);
CREATE INDEX IF NOT EXISTS idx_product_code ON "product"(product_code);
CREATE INDEX IF NOT EXISTS idx_product_type_code ON "product_type"(type_code);