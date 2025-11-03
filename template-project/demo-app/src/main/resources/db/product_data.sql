-- 商品类型初始数据
INSERT INTO "product_type" (id, type_name, type_code, description, sort_order, enabled) 
VALUES 
    ('pt001', '电子产品', 'ELECTRONICS', '各类电子产品和数码设备', 1, TRUE),
    ('pt002', '服装鞋帽', 'CLOTHING', '服装、鞋类、配饰等', 2, TRUE),
    ('pt003', '食品饮料', 'FOOD', '各类食品和饮料', 3, TRUE),
    ('pt004', '图书文具', 'BOOKS', '图书、文具用品', 4, TRUE),
    ('pt005', '家居用品', 'HOME', '家居装饰和日用品', 5, TRUE)
ON CONFLICT (id) DO NOTHING;

-- 商品初始数据
INSERT INTO "product" (id, product_name, product_code, type_id, price, stock, description, enabled) 
VALUES 
    ('p001', 'iPhone 15 Pro', 'IPHONE15PRO', 'pt001', 8999.00, 50, '苹果最新款手机，256GB存储', TRUE),
    ('p002', 'MacBook Pro 14', 'MACBOOK14', 'pt001', 14999.00, 30, '14英寸MacBook Pro，M3芯片', TRUE),
    ('p003', '休闲T恤', 'TEE001', 'pt002', 99.00, 200, '纯棉休闲T恤，多色可选', TRUE),
    ('p004', '运动鞋', 'SHOE001', 'pt002', 399.00, 150, '舒适运动鞋，透气设计', TRUE),
    ('p005', '咖啡豆', 'COFFEE001', 'pt003', 89.00, 500, '优质阿拉比卡咖啡豆，500g装', TRUE),
    ('p006', '《Java编程思想》', 'BOOK001', 'pt004', 128.00, 100, '经典Java编程书籍', TRUE),
    ('p007', '办公桌', 'DESK001', 'pt005', 599.00, 80, '实木办公桌，简约设计', TRUE)
ON CONFLICT (id) DO NOTHING;

