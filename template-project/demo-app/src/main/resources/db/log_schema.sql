-- 操作日志表
CREATE TABLE IF NOT EXISTS "operation_log" (
    id VARCHAR(50) NOT NULL PRIMARY KEY,
    user_id VARCHAR(50),
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
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE "operation_log" IS '操作日志表';
COMMENT ON COLUMN "operation_log".id IS '日志ID';
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
COMMENT ON COLUMN "operation_log".create_time IS '创建时间';

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_operation_log_user_id ON "operation_log"(user_id);
CREATE INDEX IF NOT EXISTS idx_operation_log_username ON "operation_log"(username);
CREATE INDEX IF NOT EXISTS idx_operation_log_operation_type ON "operation_log"(operation_type);
CREATE INDEX IF NOT EXISTS idx_operation_log_module ON "operation_log"(module);
CREATE INDEX IF NOT EXISTS idx_operation_log_operation_time ON "operation_log"(operation_time);
CREATE INDEX IF NOT EXISTS idx_operation_log_create_time ON "operation_log"(create_time);

