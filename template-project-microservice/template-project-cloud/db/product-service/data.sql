-- ============================================================
-- 商品服务初始数据
-- ============================================================

-- 初始化商品类型数据
INSERT INTO product_type (id, type_name, type_code, description, sort_order, enabled, create_date, create_user, deleted, db_version) VALUES 
('t1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6', '电子产品', 'ELECTRONICS', '电子产品分类', 1, TRUE, CURRENT_TIMESTAMP, 'system', 0, 1),
('t2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7', '服装', 'CLOTHING', '服装分类', 2, TRUE, CURRENT_TIMESTAMP, 'system', 0, 1),
('t3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8', '食品', 'FOOD', '食品分类', 3, TRUE, CURRENT_TIMESTAMP, 'system', 0, 1)
ON CONFLICT (id) DO NOTHING;

-- 初始化商品信息数据
INSERT INTO product_info (id, product_name, product_code, type_id, price, stock, description, enabled, create_date, create_user, deleted, db_version) VALUES 
('p1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6', 'iPhone 15', 'IPHONE15', 't1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6', 5999.00, 100, '苹果iPhone 15手机', TRUE, CURRENT_TIMESTAMP, 'system', 0, 1),
('p2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7', 'MacBook Pro', 'MACBOOK_PRO', 't1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6', 12999.00, 50, '苹果MacBook Pro笔记本电脑', TRUE, CURRENT_TIMESTAMP, 'system', 0, 1)
ON CONFLICT (id) DO NOTHING;

