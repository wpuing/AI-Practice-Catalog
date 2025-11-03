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

