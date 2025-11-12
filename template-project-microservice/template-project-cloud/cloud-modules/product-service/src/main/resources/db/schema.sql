-- ============================================================
-- 商品服务数据库表结构
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

