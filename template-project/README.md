# Template Project - 模板项目

这是一个完整的全栈项目模板，包含后端Spring Boot应用和前端管理系统，可作为新项目的起始模板。

## 📁 项目结构

```
template-project/
├── demo-app/              # 后端Spring Boot应用
│   ├── src/              # 源代码
│   ├── docs/             # 项目文档
│   ├── pom.xml           # Maven配置
│   └── README.md         # 后端项目说明
├── demo-frontend/        # 前端管理系统
│   ├── css/              # 样式文件
│   ├── js/               # JavaScript文件
│   ├── index.html        # 登录页
│   ├── home.html         # 主页
│   └── README.md         # 前端项目说明
└── README.md             # 本文件
```

## 🎯 项目概述

### demo-app（后端）
基于Spring Boot 3.1.5的企业级管理系统后端，采用分层模块化架构（DDD风格），包含：
- 用户管理
- 角色权限管理（RBAC）
- 商品类型管理
- 商品管理
- Redis Token管理
- 安全配置管理
- 完整的API接口

### demo-frontend（前端）
基于原生JavaScript的管理系统前端，蓝绿色简约风格：
- 用户认证与授权
- 用户管理界面
- 商品类型管理界面
- 商品管理界面
- 管理员功能界面
- 接口测试工具

## 🚀 快速开始

### 1. 启动后端服务

```bash
cd demo-app
mvn spring-boot:run
```

后端服务将运行在：`http://localhost:8081`

### 2. 启动前端服务

方式一：直接打开HTML文件
- 打开 `demo-frontend/index.html`

方式二：使用HTTP服务器
```bash
cd demo-frontend
# Python 3
python -m http.server 8000

# 或 Node.js
npx http-server -p 8000
```

前端地址：`http://localhost:8000`

### 3. 登录系统

- 默认管理员账号：`admin` / `123456`
- 或使用注册功能创建新账号

## 📚 文档说明

### 后端文档
后端项目的详细文档位于 `demo-app/docs/` 目录：
- **架构文档**: `demo-app/docs/architecture/ARCHITECTURE.md`
- **API文档**: `demo-app/docs/api/API.md`
- **使用指南**: `demo-app/docs/guides/`

### 前端文档
前端项目的说明文档：
- **项目说明**: `demo-frontend/README.md`
- **测试指南**: `demo-frontend/test-guide.md`

## 🏗️ 技术栈

### 后端技术
- **Java 21** + **Spring Boot 3.1.5**
- **PostgreSQL 15** + **MyBatis-Plus 3.5.8**
- **Redis** (Token存储和缓存)
- **Spring Security 6.x** (JWT认证、RBAC授权)

### 前端技术
- **原生JavaScript** (ES6+)
- **Fetch API** (HTTP请求)
- **HTML5** + **CSS3** (蓝绿色简约风格)

## 🔧 配置要求

### 后端环境
1. **PostgreSQL 15** - 数据库服务
2. **Redis** - 缓存服务
3. **Java 21** - JDK版本
4. **Maven 3.6+** - 构建工具

### 前端环境
- 现代浏览器（Chrome、Firefox、Edge、Safari）

## 📝 使用说明

1. **首次使用**：
   - 配置数据库连接（`demo-app/src/main/resources/application.yml`）
   - 执行数据库脚本初始化数据
   - 启动Redis服务
   - 启动后端和前端服务

2. **开发新功能**：
   - 参考现有模块的结构和代码规范
   - 遵循分层架构设计
   - 使用统一的响应格式和错误处理

3. **部署上线**：
   - 后端：使用 `mvn package` 打包，运行JAR文件
   - 前端：部署到Web服务器（Nginx、Apache等）

## 🎨 架构特点

### 后端架构
- **分层设计**: common, infrastructure, domain, application, interfaces
- **模块化**: 业务模块与基础设施模块隔离
- **DDD风格**: 领域驱动设计思想
- **规范统一**: 统一响应格式、状态码、日志消息

### 前端架构
- **原生实现**: 无框架依赖，代码简洁
- **模块化**: 功能模块独立，易于维护
- **统一风格**: 蓝绿色主题，简约大气
- **完整对接**: 所有后端接口已对接

## 📖 更多信息

- **后端详细文档**: 查看 `demo-app/README.md`
- **前端详细文档**: 查看 `demo-frontend/README.md`
- **API接口文档**: 查看 `demo-app/docs/api/API.md`
- **操作手册**: 查看 [OPERATION_MANUAL.md](OPERATION_MANUAL.md) - 详细的系统操作指南，包含所有功能模块的使用说明和截图

## ⚠️ 注意事项

1. 确保PostgreSQL和Redis服务已启动
2. 首次使用需要初始化数据库
3. 前端需要与后端配合使用
4. 生产环境部署前请修改默认配置

## 📝 更新日志

### 2025-11-09 重大更新

#### 数据库架构优化
- **统一基础字段**：所有数据库表统一添加基础字段（`create_date`, `create_user`, `update_date`, `update_user`, `deleted`, `db_version`, `tenant_id`）
- **ID字段标准化**：所有表的ID字段统一为32位随机字符（小写字母和数字）
- **自动填充机制**：通过 `MetaObjectHandler` 自动填充创建时间、创建用户、更新时间等字段
- **逻辑删除支持**：通过 `BaseServiceImpl` 实现统一的逻辑删除功能
- **数据迁移脚本**：提供完整的数据库迁移脚本 `migrate_to_base_fields.sql` 和迁移指南

#### 后端代码优化
- **字段名统一**：将 `create_time`/`update_time` 统一改为 `create_date`/`update_date`
- **修复字段引用**：修复所有Controller、Service、Mapper中使用的旧字段名
- **自动ID生成**：通过 `IdGenerator` 和 `BaseServiceImpl` 实现自动ID生成
- **查询过滤优化**：默认过滤已删除的数据（`deleted = 0`）

#### 前端代码优化
- **字段名同步**：前端代码同步更新为使用 `createDate`/`updateDate`
- **修复显示问题**：修复用户列表、日志详情等页面中的时间字段显示

#### 代码目录清理
- **删除临时文件**：清理了12个临时、重复、不必要的SQL脚本和文档文件
- **简化目录结构**：数据库目录从17个文件精简到5个必要文件
- **保留核心文件**：只保留 `schema.sql`、`data.sql`、`migrate_to_base_fields.sql`、`MIGRATION_GUIDE.md`、`README.md`

#### 主要变更文件
- **新增**：`IdGenerator.java`、`BaseEntity.java`、`BaseServiceImpl.java`、`MetaObjectHandler.java`
- **修改**：所有实体类、Service类、Controller类、Mapper XML文件
- **删除**：12个临时SQL脚本和文档文件

## 📄 许可证

本项目作为模板项目，供学习和参考使用。

