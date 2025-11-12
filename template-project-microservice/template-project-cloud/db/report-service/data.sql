-- ============================================================
-- 报表服务初始数据
-- ============================================================

-- 初始化报表模板数据
INSERT INTO report_template (id, template_name, template_code, template_type, template_content, description, enabled, create_date, create_user, deleted, db_version) VALUES 
('r1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6', '销售报表模板', 'SALES_REPORT', 'SALES', '{"columns":["日期","销售额","订单数"]}', '销售报表模板', TRUE, CURRENT_TIMESTAMP, 'system', 0, 1),
('r2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7', '用户统计报表模板', 'USER_STATISTICS', 'STATISTICS', '{"columns":["日期","新增用户","活跃用户"]}', '用户统计报表模板', TRUE, CURRENT_TIMESTAMP, 'system', 0, 1)
ON CONFLICT (id) DO NOTHING;

