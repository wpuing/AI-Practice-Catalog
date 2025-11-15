-- ============================================================
-- 报表服务初始数据
-- ============================================================

-- 初始化报表模板数据
INSERT INTO report_template (id, template_name, template_code, template_type, template_content, description, enabled, create_date, create_user, deleted, db_version) VALUES 
('r1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6', '销售报表模板', 'SALES_REPORT', 'SALES', '{"columns":["日期","销售额","订单数"]}', '销售报表模板', TRUE, CURRENT_TIMESTAMP, 'system', 0, 1),
('r2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7', '用户统计报表模板', 'USER_STATISTICS', 'STATISTICS', '{"columns":["日期","新增用户","活跃用户"]}', '用户统计报表模板', TRUE, CURRENT_TIMESTAMP, 'system', 0, 1),
('r3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8', '财务报表模板', 'FINANCE_REPORT', 'FINANCE', '{"columns":["日期","收入","支出","利润"]}', '财务报表模板', TRUE, CURRENT_TIMESTAMP, 'system', 0, 1)
ON CONFLICT (id) DO NOTHING;

-- 初始化报表数据
INSERT INTO report_data (id, template_id, report_name, report_data, report_status, create_date, create_user, deleted, db_version) VALUES 
('rd1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o', 'r1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6', '2025年1月销售报表', '{"data":[{"日期":"2025-01-01","销售额":50000,"订单数":120}]}', 'COMPLETED', CURRENT_TIMESTAMP, 'system', 0, 1),
('rd2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p', 'r1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6', '2025年2月销售报表', '{"data":[{"日期":"2025-02-01","销售额":60000,"订单数":150}]}', 'COMPLETED', CURRENT_TIMESTAMP, 'system', 0, 1),
('rd3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q', 'r2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7', '2025年1月用户统计报表', '{"data":[{"日期":"2025-01-01","新增用户":200,"活跃用户":1500}]}', 'COMPLETED', CURRENT_TIMESTAMP, 'system', 0, 1),
('rd4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r', 'r2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7', '2025年2月用户统计报表', '{"data":[{"日期":"2025-02-01","新增用户":250,"活跃用户":1800}]}', 'COMPLETED', CURRENT_TIMESTAMP, 'system', 0, 1),
('rd5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s', 'r3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8', '2025年1月财务报表', '{"data":[{"日期":"2025-01-01","收入":100000,"支出":60000,"利润":40000}]}', 'COMPLETED', CURRENT_TIMESTAMP, 'system', 0, 1)
ON CONFLICT (id) DO NOTHING;
