# Template Project Cloud - 企业级微服务架构项目

基于 Spring Cloud Alibaba 的 DDD 风格微服务系统，采用服务拆分、低耦合、高内聚的设计理念。

## 📋 项目简介

本项目是一个完整的企业级微服务架构模板，采用领域驱动设计（DDD）思想，包含多个独立的微服务模块，每个服务都有独立的数据库和业务边界。

### 核心特性

- ✅ **微服务架构** - 基于 Spring Cloud Alibaba 的完整微服务解决方案
- ✅ **DDD 设计** - 领域驱动设计，清晰的业务边界和领域模型
- ✅ **服务拆分** - 按业务领域拆分服务，低耦合高内聚
- ✅ **服务注册与发现** - 基于 Nacos 的服务注册与发现
- ✅ **配置中心** - 基于 Nacos 的配置中心
- ✅ **API 网关** - Spring Cloud Gateway 统一入口
- ✅ **服务调用** - OpenFeign 声明式服务调用
- ✅ **消息队列** - RabbitMQ 异步消息处理
- ✅ **任务调度** - XXL-Job 分布式任务调度
- ✅ **缓存** - Redis 分布式缓存
- ✅ **CQRS** - 命令查询职责分离模式
- ✅ **数据库隔离** - 每个服务独立的数据库，表前缀区分

## 🛠️ 技术栈

### 核心框架
- **Java 21** - JDK 版本
- **Spring Boot 3.2.0** - 核心框架
- **Spring Cloud 2023.0.0** - 微服务框架
- **Spring Cloud Alibaba 2022.0.0.0** - 阿里巴巴微服务组件

### 服务治理
- **Nacos** - 服务注册与发现、配置中心
- **Spring Cloud Gateway** - API 网关
- **OpenFeign** - 声明式服务调用
- **Spring Cloud LoadBalancer** - 负载均衡

### 数据存储
- **PostgreSQL 15** - 关系型数据库（每个服务独立数据库）
- **Redis** - 分布式缓存和会话存储

### 数据访问
- **Druid 1.2.20** - 数据库连接池
- **MyBatis-Plus 3.5.8** - ORM 框架

### 消息与任务
- **RabbitMQ** - 消息队列
- **XXL-Job 2.4.0** - 分布式任务调度

### 工具库
- **Lombok 1.18.30** - 代码简化
- **Hutool 5.8.25** - Java 工具类库
- **MapStruct 1.5.5** - 对象映射
- **JJWT 0.12.3** - JWT 工具库

## 📐 项目结构

```
template-project-cloud/
├── core/                    # 核心模块（公共组件）
│   ├── core-common/         # 公共工具类、常量、枚举
│   ├── core-security/       # 安全组件（JWT、权限等）
│   ├── core-feign/          # Feign 公共配置
│   └── core-redis/          # Redis 公共配置
├── auth/                    # 认证鉴权服务
│   └── auth-service/        # 认证服务实现
├── gateway/                 # API 网关服务
│   └── gateway-service/     # 网关服务实现
├── dfs/                     # 文件服务
│   └── dfs-service/         # 文件服务实现
├── modules/                  # 业务模块
│   ├── user-service/        # 用户管理服务
│   ├── product-service/     # 商品管理服务
│   └── report-service/      # 报表管理服务
└── pom.xml                  # 父 POM
```

### 服务模块结构（DDD 风格）

每个服务模块都采用 DDD 分层架构：

```
service-name/
├── src/main/java/com/example/service/
│   ├── common/              # 公共模块（跨层共享）
│   │   ├── constants/       # 常量类
│   │   ├── enums/           # 枚举类
│   │   ├── exception/       # 异常处理
│   │   └── result/          # 统一响应格式
│   ├── domain/              # 领域层（业务领域模型）
│   │   ├── entity/          # 实体
│   │   ├── repository/      # 仓储接口
│   │   ├── service/         # 领域服务
│   │   └── event/            # 领域事件
│   ├── application/         # 应用层（业务逻辑编排）
│   │   ├── command/         # 命令（CQRS）
│   │   ├── query/           # 查询（CQRS）
│   │   ├── dto/             # 数据传输对象
│   │   └── service/         # 应用服务
│   ├── infrastructure/     # 基础设施层（技术实现）
│   │   ├── repository/      # 仓储实现
│   │   ├── config/          # 配置类
│   │   ├── mq/              # 消息队列
│   │   └── job/             # 定时任务
│   └── interfaces/          # 接口层（对外 API）
│       └── rest/            # REST 接口
└── src/main/resources/
    ├── application.yml      # 应用配置
    └── db/                  # 数据库脚本（带服务前缀）
```

## 🚀 快速开始

### 前置要求

1. **Java 21** - JDK 版本
2. **Maven 3.6+** - 构建工具
3. **PostgreSQL 15** - 数据库服务
4. **Redis** - 缓存服务
5. **Nacos 2.x** - 服务注册与发现、配置中心
6. **RabbitMQ** - 消息队列
7. **XXL-Job** - 任务调度中心（可选）

### 启动步骤

#### 1. 启动基础设施服务

```bash
# 启动 Nacos
# 下载 Nacos 2.x，执行启动脚本
sh nacos/bin/startup.sh -m standalone

# 启动 Redis
redis-server

# 启动 RabbitMQ
rabbitmq-server

# 启动 PostgreSQL
# 确保 PostgreSQL 服务运行
```

#### 2. 初始化数据库

创建统一的业务数据库：

```sql
CREATE DATABASE demo_cloud WITH ENCODING 'UTF8';
```

然后执行 `db/schema.sql` 与 `db/data.sql` 进行初始化，或按需执行各模块目录中的脚本（位于 `db/` 子目录）。

#### 3. 配置 Nacos

在 Nacos 控制台（默认 http://localhost:8848/nacos）配置各服务的配置文件。

#### 4. 启动服务

按以下顺序启动服务：

```bash
# 1. 启动认证服务
cd auth/auth-service
mvn spring-boot:run

# 2. 启动用户服务
cd modules/user-service
mvn spring-boot:run

# 3. 启动商品服务
cd modules/product-service
mvn spring-boot:run

# 4. 启动报表服务
cd modules/report-service
mvn spring-boot:run

# 5. 启动文件服务
cd dfs/dfs-service
mvn spring-boot:run

# 6. 启动网关服务
cd gateway/gateway-service
mvn spring-boot:run
```

## 📚 服务说明

### Core 模块

核心公共模块，提供所有服务共享的基础组件：

- **core-common**: 公共工具类、常量、枚举、异常、统一响应格式
- **core-security**: 安全组件（JWT 工具、权限验证等）
- **core-feign**: Feign 公共配置（请求拦截器、错误处理等）
- **core-redis**: Redis 公共配置和工具类

### Auth 服务

认证鉴权服务，负责：

- 用户登录认证
- JWT Token 生成和验证
- 权限管理
- 用户会话管理

**数据库前缀**: `auth_`

### Gateway 服务

API 网关服务，负责：

- 统一入口路由
- 请求转发
- 认证拦截
- 限流熔断
- 日志记录

### DFS 服务

文件服务，负责：

- 文件上传
- 文件下载
- 文件存储管理
- 文件访问控制

**数据库前缀**: `dfs_`

### User 服务

用户管理服务，负责：

- 用户信息管理
- 用户角色管理
- 用户权限管理

**数据库前缀**: `user_`

### Product 服务

商品管理服务，负责：

- 商品信息管理
- 商品类型管理
- 库存管理

**数据库前缀**: `product_`

### Report 服务

报表管理服务，负责：

- 报表生成
- 报表查询
- 数据分析

**数据库前缀**: `report_`

## 🔧 配置说明

### Nacos 配置

各服务在 Nacos 中的配置 DataId 格式：`{service-name}-{profile}.yml`

例如：
- `auth-service-dev.yml`
- `user-service-dev.yml`
- `gateway-service-dev.yml`

### 数据库配置

每个服务使用独立的数据库，表名使用服务前缀区分：

- 认证服务：`auth_user`, `auth_role`, `auth_permission`
- 用户服务：`user_info`, `user_profile`
- 商品服务：`product_info`, `product_type`
- 报表服务：`report_template`, `report_data`

## 📖 详细文档

- [架构设计文档](docs/architecture.md)
- [部署指南](docs/deployment.md)
- [开发规范](docs/development.md)
- [API 文档](docs/api.md)

## 📝 许可证

MIT License

