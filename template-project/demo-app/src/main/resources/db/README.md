# 数据库文件说明

## 文件结构

### 主要文件

- **`schema.sql`** - 数据库表结构定义文件
  - 包含所有表的完整结构定义
  - 所有表都包含基础字段：`create_date`, `create_user`, `update_date`, `update_user`, `deleted`, `db_version`, `tenant_id`
  - 所有表的ID字段为32位随机字符（小写字母和数字）

- **`data.sql`** - 数据库初始数据文件
  - 包含所有表的初始数据
  - ID使用32位随机字符（小写字母和数字）
  - 所有数据都包含基础字段的初始值

- **`migrate_to_base_fields.sql`** - 数据迁移脚本
  - 用于将现有数据库从旧表结构迁移到包含基础字段的新表结构
  - 自动添加新字段、迁移数据、更新ID格式、维护外键关联
  - **执行前请先备份数据库！**
  - 详细说明请参考 `MIGRATION_GUIDE.md`

- **`MIGRATION_GUIDE.md`** - 数据迁移指南
  - 详细的迁移步骤说明
  - 验证SQL和回滚方案
  - 常见问题解答


## 基础字段说明

所有表都包含以下基础字段：

| 字段名 | 类型 | 说明 | 默认值 | 是否必填 |
|--------|------|------|--------|----------|
| `id` | VARCHAR(32) | 主键，32位随机字符（小写字母和数字） | - | 是 |
| `create_date` | TIMESTAMP | 创建时间 | CURRENT_TIMESTAMP | 是 |
| `create_user` | VARCHAR(32) | 创建用户ID | - | 是 |
| `update_date` | TIMESTAMP | 修改时间 | CURRENT_TIMESTAMP | 否 |
| `update_user` | VARCHAR(32) | 修改用户ID | - | 否 |
| `deleted` | INTEGER | 是否删除（0=未删除，1=已删除） | 0 | 是 |
| `db_version` | INTEGER | 版本号（乐观锁） | 1 | 是 |
| `tenant_id` | VARCHAR(32) | 租户ID（多租户支持） | NULL | 否 |

## 使用说明

### 场景1：新建数据库

#### 1. 创建数据库

```sql
CREATE DATABASE demo_db WITH ENCODING 'UTF8' LC_COLLATE='zh_CN.UTF-8' LC_CTYPE='zh_CN.UTF-8';
```

#### 2. 执行表结构

```bash
psql -U postgres -d demo_db -f schema.sql
```

#### 3. 执行初始数据

```bash
psql -U postgres -d demo_db -f data.sql
```

### 场景2：迁移现有数据库

如果您的数据库已经存在数据，需要迁移到新表结构：

#### 1. 备份数据库

```bash
pg_dump -U postgres -d demo_db > backup_before_migration.sql
```

#### 2. 执行迁移脚本

```bash
psql -U postgres -d demo_db -f migrate_to_base_fields.sql
```

#### 3. 验证迁移结果

参考 `MIGRATION_GUIDE.md` 中的验证SQL

**详细说明请参考 `MIGRATION_GUIDE.md`**

## 自动填充逻辑

### 插入数据时的自动填充

当插入数据时，以下字段会自动填充（由后端代码处理）：

- `create_date`: 当前时间戳
- `create_user`: 当前登录用户ID
- `deleted`: 0（未删除）

### 更新数据时的自动填充

当更新数据时，以下字段会自动填充（由后端代码处理）：

- `update_date`: 当前时间戳
- `update_user`: 当前登录用户ID
- `db_version`: 自动递增（乐观锁）

## ID生成规则

所有表的ID字段都是32位随机字符，包含：
- 小写字母：a-z
- 数字：0-9

生成方式（PostgreSQL）：
```sql
lower(substring(md5(random()::text || clock_timestamp()::text) from 1 for 32))
```

或者使用：
```sql
lower(encode(gen_random_bytes(16), 'hex'))
```

## 注意事项

1. **ID字段**：所有表的ID字段都是32位随机字符，不能使用自增ID
2. **基础字段**：插入数据时必须提供 `create_user`，其他基础字段会自动填充
3. **逻辑删除**：删除操作使用逻辑删除（设置 `deleted = 1`），不会物理删除数据
4. **乐观锁**：更新数据时会自动检查 `db_version`，防止并发更新冲突
5. **多租户**：`tenant_id` 字段用于多租户支持，单租户系统可以留空

## 表列表

1. `user` - 用户表
2. `role` - 角色表
3. `user_role` - 用户角色关联表
4. `product_type` - 商品类型表
5. `product` - 商品表
6. `security_whitelist` - 安全白名单表
7. `security_permission` - 安全权限表
8. `menu` - 菜单表
9. `role_menu` - 角色菜单关联表
10. `menu_permission` - 菜单功能权限表
11. `operation_log` - 操作日志表

