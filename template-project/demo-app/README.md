# Demo App - Spring Boot企业级管理系统

基于Spring Boot 3.1.5的企业级管理系统后端应用，采用分层模块化架构设计。

## 📋 项目简介

本项目是一个完整的Spring Boot应用，采用DDD（领域驱动设计）思想进行模块化分层，包含用户管理、角色权限、商品管理等核心业务功能。

### 核心特性

- ✅ **分层模块化架构** - common、infrastructure、domain、application、interfaces五层架构
- ✅ **用户管理** - 注册、登录、认证、用户CRUD操作
- ✅ **角色权限管理** - 基于RBAC的权限控制，支持数据库持久化配置
- ✅ **商品管理** - 商品类型和商品的完整CRUD操作
- ✅ **Redis Token管理** - 基于Redis的Token存储，30分钟无操作自动失效
- ✅ **Redis缓存** - 角色和权限信息自动缓存
- ✅ **安全特性** - 浏览器单用户限制、IP登录限制
- ✅ **接口日志** - 自动记录所有接口访问信息
- ✅ **统一规范** - 统一响应格式、状态码管理、Redis Key规范、日志消息规范

## 🛠️ 技术栈

### 核心框架
- **Java 21** - JDK版本
- **Spring Boot 3.1.5** - 核心框架
- **Spring Security 6.x** - 安全框架（JWT认证、RBAC授权）

### 数据存储
- **PostgreSQL 15** - 关系型数据库
- **Redis** - 缓存和Token存储

### 数据访问
- **Druid 1.2.20** - 数据库连接池
- **MyBatis-Plus 3.5.8** - ORM框架

### 工具库
- **JJWT 0.12.3** - JWT工具库
- **Lombok 1.18.30** - 代码简化
- **Jackson** - JSON序列化/反序列化

### 其他
- **Spring AOP** - 面向切面编程（接口日志）

## 📐 项目结构

```
demo-app/
├── src/
│   ├── main/
│   │   ├── java/com/example/demo/
│   │   │   ├── common/          # 公共模块（跨层共享）
│   │   │   │   ├── constants/   # 常量类（RedisKey、LogMessages）
│   │   │   │   ├── enums/       # 枚举类（StatusCode）
│   │   │   │   ├── exception/   # 异常处理
│   │   │   │   └── result/      # 统一响应格式
│   │   │   ├── infrastructure/  # 基础设施层（技术实现）
│   │   │   │   ├── cache/       # 缓存服务（Token、RoleCache）
│   │   │   │   ├── config/      # 配置类（Security、Web、Redis等）
│   │   │   │   ├── logging/     # 日志切面
│   │   │   │   ├── security/    # 安全相关（JWT Filter、UserDetails）
│   │   │   │   └── util/        # 工具类
│   │   │   ├── domain/          # 领域层（业务领域模型）
│   │   │   │   ├── user/        # 用户领域
│   │   │   │   ├── role/        # 角色领域
│   │   │   │   ├── product/     # 商品领域
│   │   │   │   └── security/    # 安全领域
│   │   │   ├── application/     # 应用层（业务逻辑编排）
│   │   │   │   ├── auth/        # 认证应用
│   │   │   │   ├── user/        # 用户应用
│   │   │   │   ├── role/        # 角色应用
│   │   │   │   └── product/    # 商品应用
│   │   │   └── interfaces/      # 接口层（对外API）
│   │   │       └── rest/        # REST接口
│   │   │           ├── auth/    # 认证接口
│   │   │           ├── user/    # 用户接口
│   │   │           ├── product/  # 商品接口
│   │   │           └── admin/    # 管理员接口
│   │   └── resources/
│   │       ├── application.yml   # 应用配置
│   │       └── db/              # 数据库脚本
│   └── test/                    # 测试代码
├── docs/                        # 项目文档
│   ├── architecture/           # 架构文档
│   ├── api/                    # API文档
│   ├── guides/                 # 使用指南
│   └── refactoring/            # 重构文档（历史）
├── pom.xml                      # Maven配置
├── README.md                    # 项目说明
├── start.sh                     # Linux/Mac启动脚本
└── start.bat                    # Windows启动脚本
```

### 分层架构

项目采用五层架构设计：

1. **Common层** - 公共模块，跨层共享（常量、枚举、异常、响应格式）
2. **Infrastructure层** - 基础设施层，提供技术实现（缓存、配置、安全、工具）
3. **Domain层** - 领域层，业务领域模型（实体、Repository）
4. **Application层** - 应用层，业务逻辑编排（Service、DTO）
5. **Interfaces层** - 接口层，对外提供API（Controller）

### 架构特点

- **清晰分层**：五层架构，职责明确
- **模块隔离**：业务模块与基础设施隔离
- **依赖规则**：外层可依赖内层，内层不依赖外层
- **易于扩展**：模块化设计，便于添加新功能

详细架构说明请查看：[docs/architecture/ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md)

## 🚀 快速开始

### 前置要求

1. **PostgreSQL 15** - 数据库服务
2. **Redis** - 缓存服务
3. **Java 21** - JDK版本
4. **Maven 3.6+** - 构建工具

### 启动步骤

#### 1. 初始化数据库

```sql
-- 创建数据库
CREATE DATABASE demo WITH ENCODING 'UTF8';

-- 执行表结构脚本
\i src/main/resources/db/schema.sql

-- 执行初始化数据脚本
\i src/main/resources/db/data.sql

-- 可选：执行商品数据脚本
\i src/main/resources/db/product_data.sql
```

#### 2. 配置应用

修改 `src/main/resources/application.yml`：

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/demo
    username: postgres
    password: 123456
  data:
    redis:
      host: localhost
      port: 6379
      password: # 如果有密码请填写
```

#### 3. 启动应用

```bash
# 使用Maven启动
mvn spring-boot:run

# 或打包后运行
mvn clean package
java -jar target/demo-app-1.0.0.jar

# 或使用启动脚本
# Windows
start.bat

# Linux/Mac
chmod +x start.sh
./start.sh
```

应用将运行在：`http://localhost:8081`

#### 4. 验证启动

访问健康检查接口：
```bash
curl http://localhost:8081/api/public/health
```

## 📡 API接口

### 基础信息
- **Base URL**: `http://localhost:8081/api`
- **认证方式**: Bearer Token（请求头：`Authorization: Bearer {token}`）
- **响应格式**: 统一使用 `Result<T>` 封装

### 主要接口模块

- **认证接口** - `/api/auth/*` (登录、注册、获取用户信息、刷新Token、退出)
- **用户管理** - `/api/users/*` (CRUD操作，需要USER/ADMIN角色)
- **商品类型** - `/api/product-types/*` (CRUD操作，需要USER/ADMIN角色)
- **商品管理** - `/api/products/*` (CRUD操作、库存管理，需要USER/ADMIN角色)
- **管理员功能** - `/api/admin/*` (需要ADMIN角色)
- **角色管理** - `/api/admin/roles/*` (需要ADMIN角色)
- **安全配置** - `/api/security/*` (白名单、权限管理，需要ADMIN角色)
- **Redis管理** - `/api/redis/*` (Redis信息查看，需要ADMIN角色)

完整API文档请查看：[docs/api/API.md](docs/api/API.md)

## 🧪 运行测试

```bash
# 运行所有测试
mvn test

# 运行特定测试类
mvn test -Dtest=UserControllerTest
```

测试类包含：
- `UserControllerTest` - 用户接口测试
- `ProductControllerTest` - 商品接口测试
- `ProductTypeControllerTest` - 商品类型接口测试
- `UserServiceTest` - 用户服务测试

## 🔐 安全配置

### 认证机制
- **JWT Token认证** - 基于Redis存储的Token
- **Token过期时间** - 30分钟无操作自动失效
- **Token刷新** - 支持Token刷新延长有效期

### 权限控制
- **RBAC模型** - 基于角色的访问控制
- **角色类型** - ADMIN（管理员）、USER（普通用户）
- **权限配置** - 支持数据库持久化配置

### 安全特性
- **浏览器限制** - 同一浏览器只能有一个用户登录
- **IP限制** - 同一IP最多5个用户同时登录
- **密码加密** - BCrypt加密存储

详细安全配置请查看：[docs/guides/SECURITY.md](docs/guides/SECURITY.md)

### 测试账号

初始化数据包含以下测试账号（密码：`123456`）：
- **管理员**: `admin` (角色: ADMIN)
- **普通用户**: `user` (角色: USER)

## 📊 代码规范

### 统一响应格式

所有接口使用 `Result<T>` 统一封装：

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {...},
  "timestamp": 1234567890
}
```

### 状态码管理

所有状态码统一在 `StatusCode` 枚举中管理：
- `SUCCESS(200)` - 操作成功
- `BAD_REQUEST(400)` - 请求参数错误
- `UNAUTHORIZED(401)` - 未授权
- `FORBIDDEN(403)` - 无权限
- `NOT_FOUND(404)` - 资源不存在
- `INTERNAL_SERVER_ERROR(500)` - 服务器错误

### Redis Key规范

所有Redis Key统一在 `RedisKeyConstants` 中管理：
- Token相关：`token:{token}`, `user_token:{userId}:{token}`
- 角色相关：`user_roles:{userId}`, `roles:all`

### 日志消息规范

所有日志消息统一在 `LogMessages` 中管理：
- `LogMessages.Token.*` - Token相关日志
- `LogMessages.Auth.*` - 认证相关日志
- `LogMessages.RoleCache.*` - 角色缓存相关日志

## 📚 项目文档

所有文档位于 `docs/` 目录：

### 核心文档
- **[架构文档](docs/architecture/ARCHITECTURE.md)** - 项目架构详细说明
- **[API文档](docs/api/API.md)** - 完整API接口文档

### 使用指南
- **[安全配置](docs/guides/SECURITY.md)** - Spring Security配置说明
- **[日志配置](docs/guides/LOGGING.md)** - 日志配置和使用
- **[问题排查](docs/guides/TROUBLESHOOTING.md)** - 常见问题解决

### 文档索引
- **[文档目录](docs/README.md)** - 所有文档的索引和导航

## 🏗️ 模块说明

### Common模块
跨层共享的公共类：
- `Result<T>` - 统一响应封装
- `StatusCode` - 状态码枚举
- `RedisKeyConstants` - Redis Key常量
- `LogMessages` - 日志消息常量
- `GlobalExceptionHandler` - 全局异常处理

### Infrastructure模块
基础设施层，提供技术实现：
- **Cache服务** - TokenService、RoleCacheService
- **配置类** - SecurityConfig、WebConfig、RedisConfig
- **安全组件** - JwtAuthenticationFilter、UserDetailsImpl
- **日志切面** - ApiLogAspect
- **工具类** - JwtUtil、BrowserIdentifier、IpUtil等

### Domain模块
领域层，包含业务领域模型：
- **实体类** - User、Role、Product、ProductType等
- **Repository** - Mapper接口（MyBatis-Plus）

### Application模块
应用层，业务逻辑编排：
- **DTO** - 数据传输对象
- **Service** - 业务服务接口和实现
- **业务编排** - 协调领域模型完成业务功能

### Interfaces模块
接口层，对外提供API：
- **REST Controller** - 各种业务接口
- **请求/响应处理** - 参数验证、响应封装

## 🔧 配置说明

### 应用配置

主要配置在 `application.yml` 中：

```yaml
server:
  port: 8081

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/demo
    username: postgres
    password: 123456
  
  data:
    redis:
      host: localhost
      port: 6379

token:
  length: 32
  expire-time: 1800  # 30分钟
  refresh-interval: 1800
  ip-max-users: 5
```

### CORS配置

已配置CORS支持前端跨域访问：
- 允许所有来源
- 支持Credentials（Authorization header）
- 允许所有HTTP方法

## 📝 开发指南

### 添加新功能模块

1. **创建领域模型** - 在 `domain/` 下创建实体和Repository
2. **实现业务逻辑** - 在 `application/` 下创建Service
3. **创建API接口** - 在 `interfaces/rest/` 下创建Controller
4. **配置权限** - 在SecurityConfig中配置访问权限

### 代码规范

- 遵循分层架构原则
- 使用统一的响应格式
- 使用常量管理状态码、Redis Key、日志消息
- 添加必要的注释和文档

## ⚠️ 注意事项

1. **数据库** - 确保PostgreSQL服务运行，数据库已创建和初始化
2. **Redis** - 确保Redis服务运行（用于Token和缓存）
3. **端口** - 默认端口8081，确保端口未被占用
4. **Token** - Token存储在Redis中，Redis服务停止会导致所有Token失效
5. **角色权限** - 接口需要相应的角色权限才能访问
6. **CORS** - 已配置CORS支持前端跨域，如仍有问题请检查配置

## 🔗 相关项目

- **前端项目**: `../demo-frontend` - 配套的前端管理系统
- **项目模板**: `../README.md` - 模板项目说明

## 📄 许可证

本项目作为模板项目，供学习和参考使用。
