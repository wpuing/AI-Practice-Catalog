# 数据迁移指南

## 概述

本指南说明如何将现有数据库从旧表结构迁移到包含基础字段的新表结构。

## 迁移内容

### 1. 新增基础字段

所有表都会添加以下基础字段：

- `create_date` (TIMESTAMP) - 创建时间
- `create_user` (VARCHAR(32)) - 创建用户ID
- `update_date` (TIMESTAMP) - 修改时间
- `update_user` (VARCHAR(32)) - 修改用户ID
- `deleted` (INTEGER) - 是否删除（0=未删除，1=已删除）
- `db_version` (INTEGER) - 版本号（乐观锁）
- `tenant_id` (VARCHAR(32)) - 租户ID

### 2. ID字段调整

- 所有表的ID字段从 `VARCHAR(50)` 调整为 `VARCHAR(32)`
- 现有ID如果长度不足32位，会使用MD5哈希补齐
- 现有ID如果长度超过32位，会使用MD5哈希截断为32位
- 外键关联会自动更新，确保关联关系不丢失

### 3. 数据迁移

- 将 `create_time` 映射到 `create_date`
- 将 `update_time` 映射到 `update_date`
- 为新字段填充默认值：
  - `create_date`: 使用 `create_time` 或当前时间
  - `create_user`: 默认为 'system'
  - `deleted`: 默认为 0
  - `db_version`: 默认为 1

## 执行步骤

### 步骤1：备份数据库

**强烈建议在执行迁移前先备份数据库！**

```bash
# 使用pg_dump备份
pg_dump -U postgres -d demo_db > backup_before_migration.sql

# 或者使用数据库客户端工具备份
```

### 步骤2：执行迁移脚本

```bash
# 使用psql执行
psql -U postgres -d demo_db -f migrate_to_base_fields.sql

# 或者使用数据库客户端工具执行脚本
```

### 步骤3：验证迁移结果

执行以下SQL验证迁移结果：

```sql
-- 1. 检查所有表是否都有新字段
SELECT table_name, column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name IN ('user', 'role', 'product', 'product_type', 'menu', 
                     'user_role', 'role_menu', 'menu_permission', 
                     'security_whitelist', 'security_permission', 'operation_log')
  AND column_name IN ('id', 'create_date', 'create_user', 'deleted', 'db_version')
ORDER BY table_name, column_name;

-- 2. 检查是否有NULL值（不应该有）
SELECT 
    'user' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN length(id) = 32 THEN 1 END) as id_32_length,
    COUNT(CASE WHEN create_date IS NULL THEN 1 END) as null_create_date,
    COUNT(CASE WHEN create_user IS NULL THEN 1 END) as null_create_user,
    COUNT(CASE WHEN deleted IS NULL THEN 1 END) as null_deleted,
    COUNT(CASE WHEN db_version IS NULL THEN 1 END) as null_db_version
FROM "user"
UNION ALL
SELECT 
    'role',
    COUNT(*),
    COUNT(CASE WHEN length(id) = 32 THEN 1 END),
    COUNT(CASE WHEN create_date IS NULL THEN 1 END),
    COUNT(CASE WHEN create_user IS NULL THEN 1 END),
    COUNT(CASE WHEN deleted IS NULL THEN 1 END),
    COUNT(CASE WHEN db_version IS NULL THEN 1 END)
FROM "role"
UNION ALL
SELECT 
    'product',
    COUNT(*),
    COUNT(CASE WHEN length(id) = 32 THEN 1 END),
    COUNT(CASE WHEN create_date IS NULL THEN 1 END),
    COUNT(CASE WHEN create_user IS NULL THEN 1 END),
    COUNT(CASE WHEN deleted IS NULL THEN 1 END),
    COUNT(CASE WHEN db_version IS NULL THEN 1 END)
FROM "product";

-- 3. 检查外键关联是否完整
SELECT 
    'user_role' as table_name,
    COUNT(*) as total,
    COUNT(CASE WHEN user_id NOT IN (SELECT id FROM "user") THEN 1 END) as orphaned_user_id,
    COUNT(CASE WHEN role_id NOT IN (SELECT id FROM "role") THEN 1 END) as orphaned_role_id
FROM "user_role"
UNION ALL
SELECT 
    'product',
    COUNT(*),
    COUNT(CASE WHEN type_id NOT IN (SELECT id FROM "product_type") THEN 1 END) as orphaned_type_id,
    0
FROM "product"
WHERE type_id IS NOT NULL;

-- 4. 检查ID格式（应该都是32位小写字母和数字）
SELECT 
    'user' as table_name,
    COUNT(*) as total,
    COUNT(CASE WHEN id ~ '^[a-z0-9]{32}$' THEN 1 END) as valid_id_format
FROM "user"
UNION ALL
SELECT 
    'role',
    COUNT(*),
    COUNT(CASE WHEN id ~ '^[a-z0-9]{32}$' THEN 1 END)
FROM "role";
```

## 回滚方案

如果迁移失败，可以使用备份表恢复：

```sql
-- 恢复用户表
DROP TABLE IF EXISTS "user";
ALTER TABLE "user_backup" RENAME TO "user";

-- 恢复角色表
DROP TABLE IF EXISTS "role";
ALTER TABLE "role_backup" RENAME TO "role";

-- 其他表类似...
```

或者使用备份文件恢复：

```bash
psql -U postgres -d demo_db < backup_before_migration.sql
```

## 注意事项

1. **备份数据**：执行迁移前必须备份数据库
2. **ID处理**：如果现有ID不是32位，脚本会自动转换，外键关联会自动更新
3. **字段映射**：`create_time` 会映射到 `create_date`，`update_time` 会映射到 `update_date`
4. **默认值**：所有新字段都有默认值，现有数据会自动填充
5. **外键关联**：使用临时映射表确保外键关联不丢失
6. **执行时间**：迁移脚本执行时间取决于数据量，建议在低峰期执行
7. **验证**：执行完迁移后，务必验证数据完整性

## 常见问题

### Q1: 如果迁移过程中出现错误怎么办？

A: 使用备份表或备份文件恢复数据，检查错误原因后重新执行。

### Q2: ID字段转换会影响外键关联吗？

A: 不会。脚本使用临时映射表来确保外键关联自动更新。

### Q3: 如果现有ID已经是32位，还会修改吗？

A: 不会。如果ID已经是32位且格式正确（小写字母和数字），则不会修改。

### Q4: 迁移后旧字段（create_time, update_time）还存在吗？

A: 如果表中存在这些字段，它们会保留，但新代码应该使用新字段（create_date, update_date）。

### Q5: 如何清理备份表？

A: 迁移验证无误后，可以删除备份表：

```sql
DROP TABLE IF EXISTS "user_backup";
DROP TABLE IF EXISTS "role_backup";
-- 其他备份表...
```

