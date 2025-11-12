-- ============================================================
-- 报表服务数据库表结构
-- 数据库前缀：report_
-- 数据库名：demo_cloud
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

