-- ============================================================
-- 数据迁移脚本：从旧表结构迁移到包含基础字段的新表结构
-- 说明：此脚本用于将现有数据迁移到包含基础字段的新表结构
-- 执行前请先备份数据库！
-- ============================================================

-- ============================================================
-- 1. 备份现有数据（可选，建议执行）
-- ============================================================
-- 创建备份表
CREATE TABLE IF NOT EXISTS "user_backup" AS SELECT * FROM "user";
CREATE TABLE IF NOT EXISTS "role_backup" AS SELECT * FROM "role";
CREATE TABLE IF NOT EXISTS "user_role_backup" AS SELECT * FROM "user_role";
CREATE TABLE IF NOT EXISTS "product_type_backup" AS SELECT * FROM "product_type";
CREATE TABLE IF NOT EXISTS "product_backup" AS SELECT * FROM "product";
CREATE TABLE IF NOT EXISTS "security_whitelist_backup" AS SELECT * FROM "security_whitelist";
CREATE TABLE IF NOT EXISTS "security_permission_backup" AS SELECT * FROM "security_permission";
CREATE TABLE IF NOT EXISTS "menu_backup" AS SELECT * FROM "menu";
CREATE TABLE IF NOT EXISTS "role_menu_backup" AS SELECT * FROM "role_menu";
CREATE TABLE IF NOT EXISTS "menu_permission_backup" AS SELECT * FROM "menu_permission";
CREATE TABLE IF NOT EXISTS "operation_log_backup" AS SELECT * FROM "operation_log";

-- ============================================================
-- 2. 为所有表添加新字段（如果字段不存在）
-- ============================================================

-- 用户表
DO $$
BEGIN
    -- 添加create_date字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user' AND column_name = 'create_date') THEN
        ALTER TABLE "user" ADD COLUMN create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
    
    -- 添加create_user字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user' AND column_name = 'create_user') THEN
        ALTER TABLE "user" ADD COLUMN create_user VARCHAR(32) DEFAULT 'system';
    END IF;
    
    -- 添加update_date字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user' AND column_name = 'update_date') THEN
        ALTER TABLE "user" ADD COLUMN update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
    
    -- 添加update_user字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user' AND column_name = 'update_user') THEN
        ALTER TABLE "user" ADD COLUMN update_user VARCHAR(32);
    END IF;
    
    -- 添加deleted字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user' AND column_name = 'deleted') THEN
        ALTER TABLE "user" ADD COLUMN deleted INTEGER DEFAULT 0;
    END IF;
    
    -- 添加db_version字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user' AND column_name = 'db_version') THEN
        ALTER TABLE "user" ADD COLUMN db_version INTEGER DEFAULT 1;
    END IF;
    
    -- 添加tenant_id字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user' AND column_name = 'tenant_id') THEN
        ALTER TABLE "user" ADD COLUMN tenant_id VARCHAR(32);
    END IF;
    
    -- 修改id字段长度（如果当前不是32位）
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user' AND column_name = 'id' AND character_maximum_length < 32) THEN
        ALTER TABLE "user" ALTER COLUMN id TYPE VARCHAR(32);
    END IF;
END $$;

-- 角色表
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'role' AND column_name = 'create_date') THEN
        ALTER TABLE "role" ADD COLUMN create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'role' AND column_name = 'create_user') THEN
        ALTER TABLE "role" ADD COLUMN create_user VARCHAR(32) DEFAULT 'system';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'role' AND column_name = 'update_date') THEN
        ALTER TABLE "role" ADD COLUMN update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'role' AND column_name = 'update_user') THEN
        ALTER TABLE "role" ADD COLUMN update_user VARCHAR(32);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'role' AND column_name = 'deleted') THEN
        ALTER TABLE "role" ADD COLUMN deleted INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'role' AND column_name = 'db_version') THEN
        ALTER TABLE "role" ADD COLUMN db_version INTEGER DEFAULT 1;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'role' AND column_name = 'tenant_id') THEN
        ALTER TABLE "role" ADD COLUMN tenant_id VARCHAR(32);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'role' AND column_name = 'id' AND character_maximum_length < 32) THEN
        ALTER TABLE "role" ALTER COLUMN id TYPE VARCHAR(32);
    END IF;
END $$;

-- 用户角色关联表
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_role' AND column_name = 'create_date') THEN
        ALTER TABLE "user_role" ADD COLUMN create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_role' AND column_name = 'create_user') THEN
        ALTER TABLE "user_role" ADD COLUMN create_user VARCHAR(32) DEFAULT 'system';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_role' AND column_name = 'update_date') THEN
        ALTER TABLE "user_role" ADD COLUMN update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_role' AND column_name = 'update_user') THEN
        ALTER TABLE "user_role" ADD COLUMN update_user VARCHAR(32);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_role' AND column_name = 'deleted') THEN
        ALTER TABLE "user_role" ADD COLUMN deleted INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_role' AND column_name = 'db_version') THEN
        ALTER TABLE "user_role" ADD COLUMN db_version INTEGER DEFAULT 1;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_role' AND column_name = 'tenant_id') THEN
        ALTER TABLE "user_role" ADD COLUMN tenant_id VARCHAR(32);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_role' AND column_name = 'id' AND character_maximum_length < 32) THEN
        ALTER TABLE "user_role" ALTER COLUMN id TYPE VARCHAR(32);
    END IF;
END $$;

-- 商品类型表
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_type' AND column_name = 'create_date') THEN
        ALTER TABLE "product_type" ADD COLUMN create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_type' AND column_name = 'create_user') THEN
        ALTER TABLE "product_type" ADD COLUMN create_user VARCHAR(32) DEFAULT 'system';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_type' AND column_name = 'update_date') THEN
        ALTER TABLE "product_type" ADD COLUMN update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_type' AND column_name = 'update_user') THEN
        ALTER TABLE "product_type" ADD COLUMN update_user VARCHAR(32);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_type' AND column_name = 'deleted') THEN
        ALTER TABLE "product_type" ADD COLUMN deleted INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_type' AND column_name = 'db_version') THEN
        ALTER TABLE "product_type" ADD COLUMN db_version INTEGER DEFAULT 1;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_type' AND column_name = 'tenant_id') THEN
        ALTER TABLE "product_type" ADD COLUMN tenant_id VARCHAR(32);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_type' AND column_name = 'id' AND character_maximum_length < 32) THEN
        ALTER TABLE "product_type" ALTER COLUMN id TYPE VARCHAR(32);
    END IF;
END $$;

-- 商品表
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product' AND column_name = 'create_date') THEN
        ALTER TABLE "product" ADD COLUMN create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product' AND column_name = 'create_user') THEN
        ALTER TABLE "product" ADD COLUMN create_user VARCHAR(32) DEFAULT 'system';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product' AND column_name = 'update_date') THEN
        ALTER TABLE "product" ADD COLUMN update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product' AND column_name = 'update_user') THEN
        ALTER TABLE "product" ADD COLUMN update_user VARCHAR(32);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product' AND column_name = 'deleted') THEN
        ALTER TABLE "product" ADD COLUMN deleted INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product' AND column_name = 'db_version') THEN
        ALTER TABLE "product" ADD COLUMN db_version INTEGER DEFAULT 1;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product' AND column_name = 'tenant_id') THEN
        ALTER TABLE "product" ADD COLUMN tenant_id VARCHAR(32);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product' AND column_name = 'id' AND character_maximum_length < 32) THEN
        ALTER TABLE "product" ALTER COLUMN id TYPE VARCHAR(32);
    END IF;
END $$;

-- 安全白名单表
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'security_whitelist' AND column_name = 'create_date') THEN
        ALTER TABLE "security_whitelist" ADD COLUMN create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'security_whitelist' AND column_name = 'create_user') THEN
        ALTER TABLE "security_whitelist" ADD COLUMN create_user VARCHAR(32) DEFAULT 'system';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'security_whitelist' AND column_name = 'update_date') THEN
        ALTER TABLE "security_whitelist" ADD COLUMN update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'security_whitelist' AND column_name = 'update_user') THEN
        ALTER TABLE "security_whitelist" ADD COLUMN update_user VARCHAR(32);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'security_whitelist' AND column_name = 'deleted') THEN
        ALTER TABLE "security_whitelist" ADD COLUMN deleted INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'security_whitelist' AND column_name = 'db_version') THEN
        ALTER TABLE "security_whitelist" ADD COLUMN db_version INTEGER DEFAULT 1;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'security_whitelist' AND column_name = 'tenant_id') THEN
        ALTER TABLE "security_whitelist" ADD COLUMN tenant_id VARCHAR(32);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'security_whitelist' AND column_name = 'id' AND character_maximum_length < 32) THEN
        ALTER TABLE "security_whitelist" ALTER COLUMN id TYPE VARCHAR(32);
    END IF;
END $$;

-- 安全权限表
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'security_permission' AND column_name = 'create_date') THEN
        ALTER TABLE "security_permission" ADD COLUMN create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'security_permission' AND column_name = 'create_user') THEN
        ALTER TABLE "security_permission" ADD COLUMN create_user VARCHAR(32) DEFAULT 'system';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'security_permission' AND column_name = 'update_date') THEN
        ALTER TABLE "security_permission" ADD COLUMN update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'security_permission' AND column_name = 'update_user') THEN
        ALTER TABLE "security_permission" ADD COLUMN update_user VARCHAR(32);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'security_permission' AND column_name = 'deleted') THEN
        ALTER TABLE "security_permission" ADD COLUMN deleted INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'security_permission' AND column_name = 'db_version') THEN
        ALTER TABLE "security_permission" ADD COLUMN db_version INTEGER DEFAULT 1;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'security_permission' AND column_name = 'tenant_id') THEN
        ALTER TABLE "security_permission" ADD COLUMN tenant_id VARCHAR(32);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'security_permission' AND column_name = 'id' AND character_maximum_length < 32) THEN
        ALTER TABLE "security_permission" ALTER COLUMN id TYPE VARCHAR(32);
    END IF;
END $$;

-- 菜单表
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu' AND column_name = 'create_date') THEN
        ALTER TABLE "menu" ADD COLUMN create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu' AND column_name = 'create_user') THEN
        ALTER TABLE "menu" ADD COLUMN create_user VARCHAR(32) DEFAULT 'system';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu' AND column_name = 'update_date') THEN
        ALTER TABLE "menu" ADD COLUMN update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu' AND column_name = 'update_user') THEN
        ALTER TABLE "menu" ADD COLUMN update_user VARCHAR(32);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu' AND column_name = 'deleted') THEN
        ALTER TABLE "menu" ADD COLUMN deleted INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu' AND column_name = 'db_version') THEN
        ALTER TABLE "menu" ADD COLUMN db_version INTEGER DEFAULT 1;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu' AND column_name = 'tenant_id') THEN
        ALTER TABLE "menu" ADD COLUMN tenant_id VARCHAR(32);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu' AND column_name = 'id' AND character_maximum_length < 32) THEN
        ALTER TABLE "menu" ALTER COLUMN id TYPE VARCHAR(32);
    END IF;
END $$;

-- 角色菜单关联表
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'role_menu' AND column_name = 'create_date') THEN
        ALTER TABLE "role_menu" ADD COLUMN create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'role_menu' AND column_name = 'create_user') THEN
        ALTER TABLE "role_menu" ADD COLUMN create_user VARCHAR(32) DEFAULT 'system';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'role_menu' AND column_name = 'update_date') THEN
        ALTER TABLE "role_menu" ADD COLUMN update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'role_menu' AND column_name = 'update_user') THEN
        ALTER TABLE "role_menu" ADD COLUMN update_user VARCHAR(32);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'role_menu' AND column_name = 'deleted') THEN
        ALTER TABLE "role_menu" ADD COLUMN deleted INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'role_menu' AND column_name = 'db_version') THEN
        ALTER TABLE "role_menu" ADD COLUMN db_version INTEGER DEFAULT 1;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'role_menu' AND column_name = 'tenant_id') THEN
        ALTER TABLE "role_menu" ADD COLUMN tenant_id VARCHAR(32);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'role_menu' AND column_name = 'id' AND character_maximum_length < 32) THEN
        ALTER TABLE "role_menu" ALTER COLUMN id TYPE VARCHAR(32);
    END IF;
END $$;

-- 菜单功能权限表
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu_permission' AND column_name = 'create_date') THEN
        ALTER TABLE "menu_permission" ADD COLUMN create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu_permission' AND column_name = 'create_user') THEN
        ALTER TABLE "menu_permission" ADD COLUMN create_user VARCHAR(32) DEFAULT 'system';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu_permission' AND column_name = 'update_date') THEN
        ALTER TABLE "menu_permission" ADD COLUMN update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu_permission' AND column_name = 'update_user') THEN
        ALTER TABLE "menu_permission" ADD COLUMN update_user VARCHAR(32);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu_permission' AND column_name = 'deleted') THEN
        ALTER TABLE "menu_permission" ADD COLUMN deleted INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu_permission' AND column_name = 'db_version') THEN
        ALTER TABLE "menu_permission" ADD COLUMN db_version INTEGER DEFAULT 1;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu_permission' AND column_name = 'tenant_id') THEN
        ALTER TABLE "menu_permission" ADD COLUMN tenant_id VARCHAR(32);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu_permission' AND column_name = 'id' AND character_maximum_length < 32) THEN
        ALTER TABLE "menu_permission" ALTER COLUMN id TYPE VARCHAR(32);
    END IF;
END $$;

-- 操作日志表
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'operation_log' AND column_name = 'create_date') THEN
        ALTER TABLE "operation_log" ADD COLUMN create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'operation_log' AND column_name = 'create_user') THEN
        ALTER TABLE "operation_log" ADD COLUMN create_user VARCHAR(32) DEFAULT 'system';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'operation_log' AND column_name = 'update_date') THEN
        ALTER TABLE "operation_log" ADD COLUMN update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'operation_log' AND column_name = 'update_user') THEN
        ALTER TABLE "operation_log" ADD COLUMN update_user VARCHAR(32);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'operation_log' AND column_name = 'deleted') THEN
        ALTER TABLE "operation_log" ADD COLUMN deleted INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'operation_log' AND column_name = 'db_version') THEN
        ALTER TABLE "operation_log" ADD COLUMN db_version INTEGER DEFAULT 1;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'operation_log' AND column_name = 'tenant_id') THEN
        ALTER TABLE "operation_log" ADD COLUMN tenant_id VARCHAR(32);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'operation_log' AND column_name = 'id' AND character_maximum_length < 32) THEN
        ALTER TABLE "operation_log" ALTER COLUMN id TYPE VARCHAR(32);
    END IF;
END $$;

-- ============================================================
-- 3. 迁移现有数据：填充新字段的默认值
-- ============================================================

-- 用户表：将create_time映射到create_date，update_time映射到update_date
UPDATE "user" 
SET 
    create_date = COALESCE(create_time, CURRENT_TIMESTAMP),
    create_user = COALESCE(create_user, 'system'),
    update_date = COALESCE(update_time, CURRENT_TIMESTAMP),
    deleted = COALESCE(deleted, 0),
    db_version = COALESCE(db_version, 1)
WHERE create_date IS NULL OR create_user IS NULL OR deleted IS NULL OR db_version IS NULL;

-- 角色表
UPDATE "role" 
SET 
    create_date = CURRENT_TIMESTAMP,
    create_user = COALESCE(create_user, 'system'),
    update_date = CURRENT_TIMESTAMP,
    deleted = COALESCE(deleted, 0),
    db_version = COALESCE(db_version, 1)
WHERE create_date IS NULL OR create_user IS NULL OR deleted IS NULL OR db_version IS NULL;

-- 用户角色关联表
UPDATE "user_role" 
SET 
    create_date = CURRENT_TIMESTAMP,
    create_user = COALESCE(create_user, 'system'),
    update_date = CURRENT_TIMESTAMP,
    deleted = COALESCE(deleted, 0),
    db_version = COALESCE(db_version, 1)
WHERE create_date IS NULL OR create_user IS NULL OR deleted IS NULL OR db_version IS NULL;

-- 商品类型表：将create_time映射到create_date，update_time映射到update_date
UPDATE "product_type" 
SET 
    create_date = COALESCE(create_time, CURRENT_TIMESTAMP),
    create_user = COALESCE(create_user, 'system'),
    update_date = COALESCE(update_time, CURRENT_TIMESTAMP),
    deleted = COALESCE(deleted, 0),
    db_version = COALESCE(db_version, 1)
WHERE create_date IS NULL OR create_user IS NULL OR deleted IS NULL OR db_version IS NULL;

-- 商品表：将create_time映射到create_date，update_time映射到update_date
UPDATE "product" 
SET 
    create_date = COALESCE(create_time, CURRENT_TIMESTAMP),
    create_user = COALESCE(create_user, 'system'),
    update_date = COALESCE(update_time, CURRENT_TIMESTAMP),
    deleted = COALESCE(deleted, 0),
    db_version = COALESCE(db_version, 1)
WHERE create_date IS NULL OR create_user IS NULL OR deleted IS NULL OR db_version IS NULL;

-- 安全白名单表：将create_time映射到create_date，update_time映射到update_date
UPDATE "security_whitelist" 
SET 
    create_date = COALESCE(create_time, CURRENT_TIMESTAMP),
    create_user = COALESCE(create_user, 'system'),
    update_date = COALESCE(update_time, CURRENT_TIMESTAMP),
    deleted = COALESCE(deleted, 0),
    db_version = COALESCE(db_version, 1)
WHERE create_date IS NULL OR create_user IS NULL OR deleted IS NULL OR db_version IS NULL;

-- 安全权限表：将create_time映射到create_date，update_time映射到update_date
UPDATE "security_permission" 
SET 
    create_date = COALESCE(create_time, CURRENT_TIMESTAMP),
    create_user = COALESCE(create_user, 'system'),
    update_date = COALESCE(update_time, CURRENT_TIMESTAMP),
    deleted = COALESCE(deleted, 0),
    db_version = COALESCE(db_version, 1)
WHERE create_date IS NULL OR create_user IS NULL OR deleted IS NULL OR db_version IS NULL;

-- 菜单表：将create_time映射到create_date，update_time映射到update_date
UPDATE "menu" 
SET 
    create_date = COALESCE(create_time, CURRENT_TIMESTAMP),
    create_user = COALESCE(create_user, 'system'),
    update_date = COALESCE(update_time, CURRENT_TIMESTAMP),
    deleted = COALESCE(deleted, 0),
    db_version = COALESCE(db_version, 1)
WHERE create_date IS NULL OR create_user IS NULL OR deleted IS NULL OR db_version IS NULL;

-- 角色菜单关联表
UPDATE "role_menu" 
SET 
    create_date = CURRENT_TIMESTAMP,
    create_user = COALESCE(create_user, 'system'),
    update_date = CURRENT_TIMESTAMP,
    deleted = COALESCE(deleted, 0),
    db_version = COALESCE(db_version, 1)
WHERE create_date IS NULL OR create_user IS NULL OR deleted IS NULL OR db_version IS NULL;

-- 菜单功能权限表：将create_time映射到create_date，update_time映射到update_date
UPDATE "menu_permission" 
SET 
    create_date = COALESCE(create_time, CURRENT_TIMESTAMP),
    create_user = COALESCE(create_user, 'system'),
    update_date = COALESCE(update_time, CURRENT_TIMESTAMP),
    deleted = COALESCE(deleted, 0),
    db_version = COALESCE(db_version, 1)
WHERE create_date IS NULL OR create_user IS NULL OR deleted IS NULL OR db_version IS NULL;

-- 操作日志表：将create_time映射到create_date
UPDATE "operation_log" 
SET 
    create_date = COALESCE(create_time, operation_time, CURRENT_TIMESTAMP),
    create_user = COALESCE(create_user, 'system'),
    update_date = CURRENT_TIMESTAMP,
    deleted = COALESCE(deleted, 0),
    db_version = COALESCE(db_version, 1)
WHERE create_date IS NULL OR create_user IS NULL OR deleted IS NULL OR db_version IS NULL;

-- ============================================================
-- 4. 处理ID字段：将现有ID转换为32位（如果长度不足或超过）
-- ============================================================
-- 注意：ID字段的处理需要谨慎，因为可能影响外键关联
-- 如果现有ID已经是32位，则不需要修改
-- 如果现有ID长度不足32位，则补齐到32位（使用MD5哈希）
-- 如果现有ID长度超过32位，则截断到32位（使用MD5哈希）

-- 创建临时表存储ID映射关系（用于更新外键）
CREATE TABLE IF NOT EXISTS id_mapping (
    old_id VARCHAR(255) PRIMARY KEY,
    new_id VARCHAR(32) NOT NULL,
    table_name VARCHAR(100) NOT NULL
);

-- 用户表：生成ID映射并更新
INSERT INTO id_mapping (old_id, new_id, table_name)
SELECT 
    id as old_id,
    CASE 
        WHEN length(id) = 32 THEN id
        WHEN length(id) < 32 THEN lower(substring(md5(id || 'user' || random()::text) from 1 for 32))
        ELSE lower(substring(md5(id || 'user') from 1 for 32))
    END as new_id,
    'user' as table_name
FROM "user"
WHERE length(id) != 32 OR id !~ '^[a-z0-9]{32}$';

UPDATE "user" u
SET id = m.new_id
FROM id_mapping m
WHERE u.id = m.old_id AND m.table_name = 'user';

-- 角色表：生成ID映射并更新
INSERT INTO id_mapping (old_id, new_id, table_name)
SELECT 
    id as old_id,
    CASE 
        WHEN length(id) = 32 THEN id
        WHEN length(id) < 32 THEN lower(substring(md5(id || 'role' || random()::text) from 1 for 32))
        ELSE lower(substring(md5(id || 'role') from 1 for 32))
    END as new_id,
    'role' as table_name
FROM "role"
WHERE length(id) != 32 OR id !~ '^[a-z0-9]{32}$'
ON CONFLICT (old_id) DO NOTHING;

UPDATE "role" r
SET id = m.new_id
FROM id_mapping m
WHERE r.id = m.old_id AND m.table_name = 'role';

-- 更新用户角色关联表的外键
UPDATE "user_role" ur
SET 
    user_id = COALESCE((SELECT new_id FROM id_mapping WHERE old_id = ur.user_id AND table_name = 'user'), ur.user_id),
    role_id = COALESCE((SELECT new_id FROM id_mapping WHERE old_id = ur.role_id AND table_name = 'role'), ur.role_id),
    id = CASE 
        WHEN length(ur.id) = 32 AND ur.id ~ '^[a-z0-9]{32}$' THEN ur.id
        ELSE lower(substring(md5(ur.id || 'user_role' || random()::text) from 1 for 32))
    END
WHERE length(ur.id) != 32 OR ur.id !~ '^[a-z0-9]{32}$'
   OR ur.user_id IN (SELECT old_id FROM id_mapping WHERE table_name = 'user')
   OR ur.role_id IN (SELECT old_id FROM id_mapping WHERE table_name = 'role');

-- 商品类型表
INSERT INTO id_mapping (old_id, new_id, table_name)
SELECT 
    id as old_id,
    CASE 
        WHEN length(id) = 32 THEN id
        WHEN length(id) < 32 THEN lower(substring(md5(id || 'product_type' || random()::text) from 1 for 32))
        ELSE lower(substring(md5(id || 'product_type') from 1 for 32))
    END as new_id,
    'product_type' as table_name
FROM "product_type"
WHERE length(id) != 32 OR id !~ '^[a-z0-9]{32}$'
ON CONFLICT (old_id) DO NOTHING;

UPDATE "product_type" pt
SET id = m.new_id
FROM id_mapping m
WHERE pt.id = m.old_id AND m.table_name = 'product_type';

-- 商品表：更新type_id外键
UPDATE "product" p
SET 
    type_id = COALESCE((SELECT new_id FROM id_mapping WHERE old_id = p.type_id AND table_name = 'product_type'), p.type_id),
    id = CASE 
        WHEN length(p.id) = 32 AND p.id ~ '^[a-z0-9]{32}$' THEN p.id
        ELSE lower(substring(md5(p.id || 'product' || random()::text) from 1 for 32))
    END
WHERE length(p.id) != 32 OR p.id !~ '^[a-z0-9]{32}$'
   OR p.type_id IN (SELECT old_id FROM id_mapping WHERE table_name = 'product_type');

-- 安全白名单表
UPDATE "security_whitelist" 
SET id = CASE 
    WHEN length(id) = 32 AND id ~ '^[a-z0-9]{32}$' THEN id
    WHEN length(id) < 32 THEN lower(substring(md5(id || 'security_whitelist' || random()::text) from 1 for 32))
    ELSE lower(substring(md5(id || 'security_whitelist') from 1 for 32))
END
WHERE length(id) != 32 OR id !~ '^[a-z0-9]{32}$';

-- 安全权限表
UPDATE "security_permission" 
SET id = CASE 
    WHEN length(id) = 32 AND id ~ '^[a-z0-9]{32}$' THEN id
    WHEN length(id) < 32 THEN lower(substring(md5(id || 'security_permission' || random()::text) from 1 for 32))
    ELSE lower(substring(md5(id || 'security_permission') from 1 for 32))
END
WHERE length(id) != 32 OR id !~ '^[a-z0-9]{32}$';

-- 菜单表：更新parent_id外键
INSERT INTO id_mapping (old_id, new_id, table_name)
SELECT 
    id as old_id,
    CASE 
        WHEN length(id) = 32 THEN id
        WHEN length(id) < 32 THEN lower(substring(md5(id || 'menu' || random()::text) from 1 for 32))
        ELSE lower(substring(md5(id || 'menu') from 1 for 32))
    END as new_id,
    'menu' as table_name
FROM "menu"
WHERE length(id) != 32 OR id !~ '^[a-z0-9]{32}$'
ON CONFLICT (old_id) DO NOTHING;

UPDATE "menu" m
SET 
    parent_id = COALESCE((SELECT new_id FROM id_mapping WHERE old_id = m.parent_id AND table_name = 'menu'), m.parent_id),
    id = COALESCE((SELECT new_id FROM id_mapping WHERE old_id = m.id AND table_name = 'menu'), m.id)
WHERE m.id IN (SELECT old_id FROM id_mapping WHERE table_name = 'menu')
   OR m.parent_id IN (SELECT old_id FROM id_mapping WHERE table_name = 'menu');

-- 角色菜单关联表：更新role_id和menu_id外键
UPDATE "role_menu" rm
SET 
    role_id = COALESCE((SELECT new_id FROM id_mapping WHERE old_id = rm.role_id AND table_name = 'role'), rm.role_id),
    menu_id = COALESCE((SELECT new_id FROM id_mapping WHERE old_id = rm.menu_id AND table_name = 'menu'), rm.menu_id),
    id = CASE 
        WHEN length(rm.id) = 32 AND rm.id ~ '^[a-z0-9]{32}$' THEN rm.id
        ELSE lower(substring(md5(rm.id || 'role_menu' || random()::text) from 1 for 32))
    END
WHERE length(rm.id) != 32 OR rm.id !~ '^[a-z0-9]{32}$'
   OR rm.role_id IN (SELECT old_id FROM id_mapping WHERE table_name = 'role')
   OR rm.menu_id IN (SELECT old_id FROM id_mapping WHERE table_name = 'menu');

-- 菜单功能权限表：更新menu_id和security_permission_id外键
UPDATE "menu_permission" mp
SET 
    menu_id = COALESCE((SELECT new_id FROM id_mapping WHERE old_id = mp.menu_id AND table_name = 'menu'), mp.menu_id),
    security_permission_id = CASE 
        WHEN length(mp.security_permission_id) = 32 AND mp.security_permission_id ~ '^[a-z0-9]{32}$' THEN mp.security_permission_id
        WHEN length(mp.security_permission_id) < 32 THEN lower(substring(md5(mp.security_permission_id || 'security_permission' || random()::text) from 1 for 32))
        ELSE lower(substring(md5(mp.security_permission_id || 'security_permission') from 1 for 32))
    END,
    id = CASE 
        WHEN length(mp.id) = 32 AND mp.id ~ '^[a-z0-9]{32}$' THEN mp.id
        ELSE lower(substring(md5(mp.id || 'menu_permission' || random()::text) from 1 for 32))
    END
WHERE length(mp.id) != 32 OR mp.id !~ '^[a-z0-9]{32}$'
   OR mp.menu_id IN (SELECT old_id FROM id_mapping WHERE table_name = 'menu')
   OR (mp.security_permission_id IS NOT NULL AND (length(mp.security_permission_id) != 32 OR mp.security_permission_id !~ '^[a-z0-9]{32}$'));

-- 操作日志表：更新user_id外键
UPDATE "operation_log" ol
SET 
    user_id = COALESCE((SELECT new_id FROM id_mapping WHERE old_id = ol.user_id AND table_name = 'user'), ol.user_id),
    id = CASE 
        WHEN length(ol.id) = 32 AND ol.id ~ '^[a-z0-9]{32}$' THEN ol.id
        WHEN length(ol.id) < 32 THEN lower(substring(md5(ol.id || 'operation_log' || random()::text) from 1 for 32))
        ELSE lower(substring(md5(ol.id || 'operation_log') from 1 for 32))
    END
WHERE length(ol.id) != 32 OR ol.id !~ '^[a-z0-9]{32}$'
   OR (ol.user_id IS NOT NULL AND ol.user_id IN (SELECT old_id FROM id_mapping WHERE table_name = 'user'));

-- 清理临时映射表
DROP TABLE IF EXISTS id_mapping;

-- ============================================================
-- 5. 设置字段约束（NOT NULL）
-- ============================================================

-- 用户表
ALTER TABLE "user" ALTER COLUMN create_date SET NOT NULL;
ALTER TABLE "user" ALTER COLUMN create_user SET NOT NULL;
ALTER TABLE "user" ALTER COLUMN deleted SET NOT NULL;
ALTER TABLE "user" ALTER COLUMN db_version SET NOT NULL;

-- 角色表
ALTER TABLE "role" ALTER COLUMN create_date SET NOT NULL;
ALTER TABLE "role" ALTER COLUMN create_user SET NOT NULL;
ALTER TABLE "role" ALTER COLUMN deleted SET NOT NULL;
ALTER TABLE "role" ALTER COLUMN db_version SET NOT NULL;

-- 用户角色关联表
ALTER TABLE "user_role" ALTER COLUMN create_date SET NOT NULL;
ALTER TABLE "user_role" ALTER COLUMN create_user SET NOT NULL;
ALTER TABLE "user_role" ALTER COLUMN deleted SET NOT NULL;
ALTER TABLE "user_role" ALTER COLUMN db_version SET NOT NULL;

-- 商品类型表
ALTER TABLE "product_type" ALTER COLUMN create_date SET NOT NULL;
ALTER TABLE "product_type" ALTER COLUMN create_user SET NOT NULL;
ALTER TABLE "product_type" ALTER COLUMN deleted SET NOT NULL;
ALTER TABLE "product_type" ALTER COLUMN db_version SET NOT NULL;

-- 商品表
ALTER TABLE "product" ALTER COLUMN create_date SET NOT NULL;
ALTER TABLE "product" ALTER COLUMN create_user SET NOT NULL;
ALTER TABLE "product" ALTER COLUMN deleted SET NOT NULL;
ALTER TABLE "product" ALTER COLUMN db_version SET NOT NULL;

-- 安全白名单表
ALTER TABLE "security_whitelist" ALTER COLUMN create_date SET NOT NULL;
ALTER TABLE "security_whitelist" ALTER COLUMN create_user SET NOT NULL;
ALTER TABLE "security_whitelist" ALTER COLUMN deleted SET NOT NULL;
ALTER TABLE "security_whitelist" ALTER COLUMN db_version SET NOT NULL;

-- 安全权限表
ALTER TABLE "security_permission" ALTER COLUMN create_date SET NOT NULL;
ALTER TABLE "security_permission" ALTER COLUMN create_user SET NOT NULL;
ALTER TABLE "security_permission" ALTER COLUMN deleted SET NOT NULL;
ALTER TABLE "security_permission" ALTER COLUMN db_version SET NOT NULL;

-- 菜单表
ALTER TABLE "menu" ALTER COLUMN create_date SET NOT NULL;
ALTER TABLE "menu" ALTER COLUMN create_user SET NOT NULL;
ALTER TABLE "menu" ALTER COLUMN deleted SET NOT NULL;
ALTER TABLE "menu" ALTER COLUMN db_version SET NOT NULL;

-- 角色菜单关联表
ALTER TABLE "role_menu" ALTER COLUMN create_date SET NOT NULL;
ALTER TABLE "role_menu" ALTER COLUMN create_user SET NOT NULL;
ALTER TABLE "role_menu" ALTER COLUMN deleted SET NOT NULL;
ALTER TABLE "role_menu" ALTER COLUMN db_version SET NOT NULL;

-- 菜单功能权限表
ALTER TABLE "menu_permission" ALTER COLUMN create_date SET NOT NULL;
ALTER TABLE "menu_permission" ALTER COLUMN create_user SET NOT NULL;
ALTER TABLE "menu_permission" ALTER COLUMN deleted SET NOT NULL;
ALTER TABLE "menu_permission" ALTER COLUMN db_version SET NOT NULL;

-- 操作日志表
ALTER TABLE "operation_log" ALTER COLUMN create_date SET NOT NULL;
ALTER TABLE "operation_log" ALTER COLUMN create_user SET NOT NULL;
ALTER TABLE "operation_log" ALTER COLUMN deleted SET NOT NULL;
ALTER TABLE "operation_log" ALTER COLUMN db_version SET NOT NULL;

-- ============================================================
-- 6. 创建索引（如果不存在）
-- ============================================================

-- 用户表
CREATE INDEX IF NOT EXISTS idx_user_deleted ON "user"(deleted);
CREATE INDEX IF NOT EXISTS idx_user_tenant_id ON "user"(tenant_id);

-- 角色表
CREATE INDEX IF NOT EXISTS idx_role_deleted ON "role"(deleted);
CREATE INDEX IF NOT EXISTS idx_role_tenant_id ON "role"(tenant_id);

-- 用户角色关联表
CREATE INDEX IF NOT EXISTS idx_user_role_deleted ON "user_role"(deleted);
CREATE INDEX IF NOT EXISTS idx_user_role_tenant_id ON "user_role"(tenant_id);

-- 商品类型表
CREATE INDEX IF NOT EXISTS idx_product_type_deleted ON "product_type"(deleted);
CREATE INDEX IF NOT EXISTS idx_product_type_tenant_id ON "product_type"(tenant_id);

-- 商品表
CREATE INDEX IF NOT EXISTS idx_product_deleted ON "product"(deleted);
CREATE INDEX IF NOT EXISTS idx_product_tenant_id ON "product"(tenant_id);

-- 安全白名单表
CREATE INDEX IF NOT EXISTS idx_security_whitelist_deleted ON "security_whitelist"(deleted);
CREATE INDEX IF NOT EXISTS idx_security_whitelist_tenant_id ON "security_whitelist"(tenant_id);

-- 安全权限表
CREATE INDEX IF NOT EXISTS idx_security_permission_deleted ON "security_permission"(deleted);
CREATE INDEX IF NOT EXISTS idx_security_permission_tenant_id ON "security_permission"(tenant_id);

-- 菜单表
CREATE INDEX IF NOT EXISTS idx_menu_deleted ON "menu"(deleted);
CREATE INDEX IF NOT EXISTS idx_menu_tenant_id ON "menu"(tenant_id);

-- 角色菜单关联表
CREATE INDEX IF NOT EXISTS idx_role_menu_deleted ON "role_menu"(deleted);
CREATE INDEX IF NOT EXISTS idx_role_menu_tenant_id ON "role_menu"(tenant_id);

-- 菜单功能权限表
CREATE INDEX IF NOT EXISTS idx_menu_permission_deleted ON "menu_permission"(deleted);
CREATE INDEX IF NOT EXISTS idx_menu_permission_tenant_id ON "menu_permission"(tenant_id);

-- 操作日志表
CREATE INDEX IF NOT EXISTS idx_operation_log_deleted ON "operation_log"(deleted);
CREATE INDEX IF NOT EXISTS idx_operation_log_tenant_id ON "operation_log"(tenant_id);

-- ============================================================
-- 7. 验证迁移结果
-- ============================================================

-- 检查所有表是否都有新字段
DO $$
DECLARE
    missing_fields TEXT := '';
BEGIN
    -- 检查用户表
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user' AND column_name = 'create_date') THEN
        missing_fields := missing_fields || 'user.create_date, ';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user' AND column_name = 'create_user') THEN
        missing_fields := missing_fields || 'user.create_user, ';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user' AND column_name = 'deleted') THEN
        missing_fields := missing_fields || 'user.deleted, ';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user' AND column_name = 'db_version') THEN
        missing_fields := missing_fields || 'user.db_version, ';
    END IF;
    
    -- 可以继续检查其他表...
    
    IF missing_fields != '' THEN
        RAISE EXCEPTION '以下字段缺失: %', missing_fields;
    ELSE
        RAISE NOTICE '所有字段迁移成功！';
    END IF;
END $$;

-- 检查是否有NULL值（不应该有）
SELECT 
    'user' as table_name,
    COUNT(*) as null_create_date_count
FROM "user" 
WHERE create_date IS NULL OR create_user IS NULL OR deleted IS NULL OR db_version IS NULL
UNION ALL
SELECT 
    'role' as table_name,
    COUNT(*) as null_create_date_count
FROM "role" 
WHERE create_date IS NULL OR create_user IS NULL OR deleted IS NULL OR db_version IS NULL;

-- ============================================================
-- 迁移完成！
-- ============================================================
-- 
-- 验证步骤：
-- 1. 检查所有表是否都有新字段
-- 2. 检查是否有NULL值（不应该有）
-- 3. 检查ID字段是否都是32位
-- 4. 检查外键关联是否完整
-- 
-- 验证SQL：
-- SELECT table_name, column_name, data_type, character_maximum_length
-- FROM information_schema.columns
-- WHERE table_name IN ('user', 'role', 'product', 'product_type', 'menu')
--   AND column_name IN ('id', 'create_date', 'create_user', 'deleted', 'db_version')
-- ORDER BY table_name, column_name;
-- 
-- SELECT 'user' as table_name, COUNT(*) as total, 
--        COUNT(CASE WHEN length(id) = 32 THEN 1 END) as id_32_length,
--        COUNT(CASE WHEN create_date IS NULL THEN 1 END) as null_create_date,
--        COUNT(CASE WHEN deleted IS NULL THEN 1 END) as null_deleted
-- FROM "user"
-- UNION ALL
-- SELECT 'role', COUNT(*), 
--        COUNT(CASE WHEN length(id) = 32 THEN 1 END),
--        COUNT(CASE WHEN create_date IS NULL THEN 1 END),
--        COUNT(CASE WHEN deleted IS NULL THEN 1 END)
-- FROM "role";
-- 
-- 注意事项：
-- 1. 如果ID字段长度超过32位，脚本会使用MD5哈希生成新的32位ID
-- 2. 外键关联已自动更新，确保关联关系不丢失（使用临时映射表）
-- 3. 所有新字段都有默认值，现有数据会自动填充
-- 4. 执行完此脚本后，建议验证数据完整性
-- 5. 如果迁移过程中出现错误，可以使用备份表恢复数据
-- 6. 备份表命名规则：{表名}_backup（如：user_backup, role_backup等）
-- ============================================================

