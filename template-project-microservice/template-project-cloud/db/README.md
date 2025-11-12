# 数据库脚本目录

本目录包含所有微服务模块的数据库脚本。

## 目录结构

```
db/
├── schema.sql            # 所有服务的表结构汇总
├── data.sql              # 所有服务的初始数据汇总
├── auth-service/         # 认证服务数据库脚本（按模块分类）
│   ├── schema.sql
│   └── data.sql
├── user-service/         # 用户服务数据库脚本
│   ├── schema.sql
│   └── data.sql
├── product-service/      # 商品服务数据库脚本
│   ├── schema.sql
│   └── data.sql
├── report-service/       # 报表服务数据库脚本
│   ├── schema.sql
│   └── data.sql
└── dfs-service/          # 文件服务数据库脚本
    ├── schema.sql
    └── data.sql
```

## 使用方式

### 方式一：使用汇总文件（推荐）

使用根目录下的 `schema.sql` 和 `data.sql` 文件，包含所有服务的表结构和数据。

### 方式二：使用模块独立文件

使用各模块文件夹下的独立文件，按需执行。

## 数据库说明

### 认证服务 (auth-service)
- **数据库名**: `demo_cloud`
- **表前缀**: `auth_`
- **表**: `auth_user`, `auth_role`, `auth_user_role`

### 用户服务 (user-service)
- **数据库名**: `demo_cloud`
- **表前缀**: `user_`
- **表**: `user_info`, `user_config`

### 商品服务 (product-service)
- **数据库名**: `demo_cloud`
- **表前缀**: `product_`
- **表**: `product_type`, `product_info`

### 报表服务 (report-service)
- **数据库名**: `demo_cloud`
- **表前缀**: `report_`
- **表**: `report_template`, `report_data`

### 文件服务 (dfs-service)
- **数据库名**: `demo_cloud`
- **表前缀**: `dfs_`
- **表**: `dfs_file`

## 初始化步骤

### 1. 创建数据库

```sql
CREATE DATABASE demo_cloud WITH ENCODING 'UTF8';
```

### 2. 执行表结构脚本（使用汇总文件）

```bash
psql -U postgres -d demo_cloud -f db/schema.sql
```

**注意**：汇总文件包含所有服务的表结构，表名前缀用于区分所属服务（如 auth_ 表示认证服务）。

### 3. 执行初始数据脚本（使用汇总文件）

```bash
psql -U postgres -d demo_cloud -f db/data.sql
```

**注意**：初始数据同样依据表前缀区分服务，可重复执行。

### 方式二：使用模块独立文件

如果需要按模块单独执行，可以使用各模块文件夹下的独立文件：

```bash
# 认证服务
psql -U postgres -d demo_cloud -f db/auth-service/schema.sql
psql -U postgres -d demo_cloud -f db/auth-service/data.sql

# 用户服务
psql -U postgres -d demo_cloud -f db/user-service/schema.sql
psql -U postgres -d demo_cloud -f db/user-service/data.sql

# 其他服务类似...
```

## 注意事项

1. 所有服务共用 `demo_cloud` 数据库，通过表前缀实现逻辑隔离
2. 所有表都包含基础字段（id、create_date、update_date、deleted 等）
3. 表名使用服务前缀，便于区分和管理
4. 初始数据脚本使用 `ON CONFLICT DO NOTHING`，可重复执行

