# 项目架构说明

## 架构分层

本项目采用分层架构（Layered Architecture），将代码按照职责划分为不同的层次：

```
com.example.demo/
├── infrastructure/          # 基础设施层 - 技术实现细节
│   ├── config/              # 配置类（Spring配置、数据库配置等）
│   ├── security/            # 安全框架实现（JWT、过滤器、UserDetails等）
│   ├── cache/               # 缓存服务实现（Redis缓存、角色缓存等）
│   ├── logging/             # 日志框架实现（AOP切面等）
│   ├── persistence/         # 持久化配置（Mapper扫描等）
│   └── util/                # 工具类（IP工具、浏览器标识等）
│
├── domain/                  # 领域层 - 业务领域模型
│   ├── user/                # 用户领域
│   │   ├── entity/          # 用户实体（User, UserRole）
│   │   └── repository/      # 用户仓储接口（UserMapper, UserRoleMapper）
│   ├── role/                # 角色领域
│   │   ├── entity/          # 角色实体（Role）
│   │   └── repository/      # 角色仓储接口（RoleMapper）
│   └── product/              # 商品领域
│       ├── entity/          # 商品实体（Product, ProductType）
│       └── repository/      # 商品仓储接口（ProductMapper, ProductTypeMapper）
│
├── application/             # 应用层 - 业务逻辑编排
│   ├── auth/                # 认证应用服务
│   │   ├── AuthService.java           # 认证服务接口
│   │   ├── impl/                      # 认证服务实现
│   │   └── dto/                       # 认证DTO（LoginRequest, LoginResponse）
│   ├── user/                # 用户应用服务
│   │   ├── UserService.java           # 用户服务接口
│   │   └── impl/                      # 用户服务实现
│   ├── role/                # 角色应用服务
│   │   ├── RoleService.java           # 角色服务接口
│   │   ├── UserRoleService.java      # 用户角色服务接口
│   │   └── impl/                      # 角色服务实现
│   └── product/             # 商品应用服务
│       ├── ProductService.java        # 商品服务接口
│       ├── ProductTypeService.java    # 商品类型服务接口
│       └── impl/                      # 商品服务实现
│
├── interfaces/              # 接口层 - 对外暴露的API
│   ├── rest/                # REST接口
│   │   ├── auth/            # 认证接口（AuthController）
│   │   ├── user/            # 用户接口（UserController）
│   │   ├── role/            # 角色接口（RoleController）
│   │   ├── product/         # 商品接口（ProductController, ProductTypeController）
│   │   ├── admin/           # 管理员接口（AdminController）
│   │   ├── public/          # 公共接口（PublicController）
│   │   ├── security/       # 安全配置接口（SecurityConfigController）
│   │   └── system/           # 系统接口（RedisController, TestController）
│   └── dto/                 # 接口层DTO（如果需要与领域模型区分）
│
└── common/                  # 公共模块 - 跨层共享的通用组件
    ├── result/              # 统一响应类型（Result）
    ├── exception/           # 异常处理（GlobalExceptionHandler）
    ├── constants/           # 常量（RedisKeyConstants, LogMessages）
    └── enums/               # 枚举（StatusCode）
```

## 模块职责说明

### 1. Infrastructure（基础设施层）

**职责**：提供技术实现细节，不包含业务逻辑

- **config/**: Spring配置、数据库配置、Redis配置等
- **security/**: Spring Security配置、JWT过滤器、UserDetails实现等
- **cache/**: Redis缓存服务实现
- **logging/**: 日志AOP切面、日志配置等
- **persistence/**: MyBatis Mapper扫描配置等
- **util/**: 工具类（IP工具、浏览器标识、密码工具等）

**特点**：
- 与技术实现相关
- 可以被多个业务模块复用
- 不包含业务逻辑

### 2. Domain（领域层）

**职责**：定义业务领域模型和仓储接口

- **entity/**: 领域实体（对应数据库表）
- **repository/**: 仓储接口（Mapper接口）

**特点**：
- 纯业务领域概念
- 不依赖技术实现
- 定义业务规则的核心

### 3. Application（应用层）

**职责**：编排业务逻辑，协调领域对象完成业务用例

- **service/**: 应用服务接口
- **impl/**: 应用服务实现
- **dto/**: 应用层数据传输对象

**特点**：
- 包含业务逻辑编排
- 协调领域对象
- 处理事务边界
- 不包含技术细节

### 4. Interfaces（接口层）

**职责**：对外暴露API，处理HTTP请求和响应

- **rest/**: REST控制器
- **dto/**: 接口层DTO（如果需要）

**特点**：
- 处理HTTP协议
- 参数校验
- 调用应用服务
- 返回统一响应格式

### 5. Common（公共模块）

**职责**：提供跨层共享的通用组件

- **result/**: 统一响应类型
- **exception/**: 全局异常处理
- **constants/**: 常量定义
- **enums/**: 枚举定义

**特点**：
- 被所有层使用
- 不包含业务逻辑
- 通用工具和定义

## 模块依赖规则

```
Interfaces → Application → Domain
     ↓           ↓           ↓
  Common ←──────────────── Common
     ↓           ↓           ↓
Infrastructure ←──────────────┘
```

**依赖方向**：
1. **Interfaces层**依赖**Application层**和**Common层**
2. **Application层**依赖**Domain层**和**Common层**和**Infrastructure层**
3. **Domain层**只依赖**Common层**（如果需要）
4. **Infrastructure层**依赖**Common层**
5. **Common层**不依赖任何其他层

**禁止反向依赖**：
- Infrastructure层不能依赖Application层
- Domain层不能依赖Application层或Infrastructure层
- Application层不能依赖Interfaces层

## 模块划分明细

### 业务模块

#### 1. 用户管理模块（user）
- Domain: `User`, `UserRole`实体和对应Mapper
- Application: `UserService`, `UserRoleService`
- Interfaces: `UserController`, `AuthController`（认证部分）

#### 2. 角色权限模块（role）
- Domain: `Role`实体和对应Mapper
- Application: `RoleService`, `UserRoleService`
- Interfaces: `RoleController`

#### 3. 商品管理模块（product）
- Domain: `Product`, `ProductType`实体和对应Mapper
- Application: `ProductService`, `ProductTypeService`
- Interfaces: `ProductController`, `ProductTypeController`

#### 4. 认证授权模块（auth）
- Domain: 依赖用户和角色领域
- Application: `AuthService`（登录、注册、Token管理）
- Interfaces: `AuthController`

### 基础设施模块

#### 1. 安全框架（security）
- `SecurityConfig`: Spring Security配置
- `JwtAuthenticationFilter`: JWT认证过滤器
- `UserDetailsImpl`: UserDetails实现

#### 2. 缓存服务（cache）
- `TokenService`: Token缓存服务
- `RoleCacheService`: 角色缓存服务
- `RedisConfig`: Redis配置

#### 3. 日志框架（logging）
- `ApiLogAspect`: 接口日志切面
- `LoggingConfig`: 日志配置

#### 4. 工具类（util）
- `IpUtil`: IP工具类
- `BrowserIdentifier`: 浏览器标识工具
- `JwtUtil`: JWT工具类（保留兼容）
- `PasswordGenerator`, `PasswordTestUtil`: 密码工具（测试用）

## 重构步骤

1. ✅ 分析当前项目结构
2. 🔄 创建新的包结构
3. ⏳ 迁移基础设施模块
4. ⏳ 迁移业务领域模块
5. ⏳ 迁移应用服务层
6. ⏳ 迁移接口层
7. ⏳ 迁移公共模块
8. ⏳ 更新所有导入路径
9. ⏳ 验证编译和测试

