# 项目重构指南

## 重构目标

将项目从平铺式结构重构为分层模块化结构，实现业务模块与基础设施模块的隔离和解耦。

## 新包结构

```
com.example.demo/
├── common/                    # 公共模块（保持，但调整内部结构）
│   ├── result/               # Result类
│   ├── exception/            # 异常处理
│   ├── constants/            # 常量（保持）
│   └── enums/                # 枚举（保持）
│
├── infrastructure/            # 基础设施层
│   ├── config/               # 配置类
│   │   ├── SecurityConfig.java
│   │   ├── RedisConfig.java
│   │   ├── WebConfig.java
│   │   ├── RoleCacheInitializer.java
│   │   └── LoggingConfig.java
│   ├── security/             # 安全框架
│   │   ├── JwtAuthenticationFilter.java
│   │   └── UserDetailsImpl.java
│   ├── cache/                # 缓存服务
│   │   ├── TokenService.java
│   │   └── RoleCacheService.java
│   ├── logging/              # 日志框架
│   │   └── ApiLogAspect.java
│   └── util/                 # 工具类
│       ├── IpUtil.java
│       ├── BrowserIdentifier.java
│       ├── JwtUtil.java
│       ├── PasswordGenerator.java
│       └── PasswordTestUtil.java
│
├── domain/                    # 领域层
│   ├── user/                 # 用户领域
│   │   ├── entity/
│   │   │   ├── User.java
│   │   │   └── UserRole.java
│   │   └── repository/
│   │       ├── UserMapper.java
│   │       └── UserRoleMapper.java
│   ├── role/                 # 角色领域
│   │   ├── entity/
│   │   │   └── Role.java
│   │   └── repository/
│   │       └── RoleMapper.java
│   ├── product/              # 商品领域
│   │   ├── entity/
│   │   │   ├── Product.java
│   │   │   └── ProductType.java
│   │   └── repository/
│   │       ├── ProductMapper.java
│   │       └── ProductTypeMapper.java
│   └── security/             # 安全配置领域（系统配置）
│       ├── entity/
│       │   ├── SecurityWhitelist.java
│       │   ├── SecurityPermission.java
│       │   └── TokenInfo.java
│       └── repository/
│           ├── SecurityWhitelistMapper.java
│           └── SecurityPermissionMapper.java
│
├── application/              # 应用层
│   ├── auth/                 # 认证应用服务
│   │   ├── AuthService.java
│   │   ├── impl/
│   │   │   └── AuthServiceImpl.java
│   │   └── dto/
│   │       ├── LoginRequest.java
│   │       └── LoginResponse.java
│   ├── user/                 # 用户应用服务
│   │   ├── UserService.java
│   │   └── impl/
│   │       └── UserServiceImpl.java
│   ├── role/                 # 角色应用服务
│   │   ├── RoleService.java
│   │   ├── UserRoleService.java
│   │   ├── SecurityConfigService.java
│   │   ├── impl/
│   │   │   ├── RoleServiceImpl.java
│   │   │   └── UserRoleServiceImpl.java
│   │   └── impl/
│   │       └── SecurityConfigServiceImpl.java
│   └── product/              # 商品应用服务
│       ├── ProductService.java
│       ├── ProductTypeService.java
│       └── impl/
│           ├── ProductServiceImpl.java
│           └── ProductTypeServiceImpl.java
│
└── interfaces/               # 接口层
    └── rest/                 # REST接口
        ├── auth/
        │   └── AuthController.java
        ├── user/
        │   └── UserController.java
        ├── role/
        │   ├── RoleController.java
        │   └── SecurityConfigController.java
        ├── product/
        │   ├── ProductController.java
        │   └── ProductTypeController.java
        ├── admin/
        │   └── AdminController.java
        ├── public/
        │   └── PublicController.java
        └── system/
            ├── RedisController.java
            └── TestController.java
```

## 文件迁移清单

### 1. 公共模块（common）- 已完成
- [x] `common/Result.java` → `common/result/Result.java`
- [x] `exception/GlobalExceptionHandler.java` → `common/exception/GlobalExceptionHandler.java`
- [ ] `constants/` → 保持，但确认位置
- [ ] `enums/` → 保持，但确认位置

### 2. 基础设施层（infrastructure）
- [ ] `config/*.java` → `infrastructure/config/*.java`
- [ ] `security/*.java` → `infrastructure/security/*.java`
- [ ] `service/TokenService.java` → `infrastructure/cache/TokenService.java`
- [ ] `service/RoleCacheService.java` → `infrastructure/cache/RoleCacheService.java`
- [ ] `aspect/ApiLogAspect.java` → `infrastructure/logging/ApiLogAspect.java`
- [ ] `util/*.java` → `infrastructure/util/*.java`

### 3. 领域层（domain）
- [ ] `entity/User.java` → `domain/user/entity/User.java`
- [ ] `entity/UserRole.java` → `domain/user/entity/UserRole.java`
- [ ] `mapper/UserMapper.java` → `domain/user/repository/UserMapper.java`
- [ ] `mapper/UserRoleMapper.java` → `domain/user/repository/UserRoleMapper.java`
- [ ] `entity/Role.java` → `domain/role/entity/Role.java`
- [ ] `mapper/RoleMapper.java` → `domain/role/repository/RoleMapper.java`
- [ ] `entity/Product.java` → `domain/product/entity/Product.java`
- [ ] `entity/ProductType.java` → `domain/product/entity/ProductType.java`
- [ ] `mapper/ProductMapper.java` → `domain/product/repository/ProductMapper.java`
- [ ] `mapper/ProductTypeMapper.java` → `domain/product/repository/ProductTypeMapper.java`
- [ ] `entity/SecurityWhitelist.java` → `domain/security/entity/SecurityWhitelist.java`
- [ ] `entity/SecurityPermission.java` → `domain/security/entity/SecurityPermission.java`
- [ ] `entity/TokenInfo.java` → `domain/security/entity/TokenInfo.java`
- [ ] `mapper/SecurityWhitelistMapper.java` → `domain/security/repository/SecurityWhitelistMapper.java`
- [ ] `mapper/SecurityPermissionMapper.java` → `domain/security/repository/SecurityPermissionMapper.java`

### 4. 应用层（application）
- [ ] `service/UserService.java` → `application/user/UserService.java`
- [ ] `service/impl/UserServiceImpl.java` → `application/user/impl/UserServiceImpl.java`
- [ ] `service/RoleService.java` → `application/role/RoleService.java`
- [ ] `service/UserRoleService.java` → `application/role/UserRoleService.java`
- [ ] `service/SecurityConfigService.java` → `application/role/SecurityConfigService.java`
- [ ] `service/ProductService.java` → `application/product/ProductService.java`
- [ ] `service/ProductTypeService.java` → `application/product/ProductTypeService.java`
- [ ] `service/impl/*.java` → `application/*/impl/*.java`
- [ ] `service/UserDetailsServiceImpl.java` → 需要分析，可能是基础设施或应用层
- [ ] `dto/LoginRequest.java` → `application/auth/dto/LoginRequest.java`
- [ ] `dto/LoginResponse.java` → `application/auth/dto/LoginResponse.java`

### 5. 接口层（interfaces）
- [ ] `controller/AuthController.java` → `interfaces/rest/auth/AuthController.java`
- [ ] `controller/UserController.java` → `interfaces/rest/user/UserController.java`
- [ ] `controller/RoleController.java` → `interfaces/rest/role/RoleController.java`
- [ ] `controller/ProductController.java` → `interfaces/rest/product/ProductController.java`
- [ ] `controller/ProductTypeController.java` → `interfaces/rest/product/ProductTypeController.java`
- [ ] `controller/AdminController.java` → `interfaces/rest/admin/AdminController.java`
- [ ] `controller/PublicController.java` → `interfaces/rest/public/PublicController.java`
- [ ] `controller/SecurityConfigController.java` → `interfaces/rest/role/SecurityConfigController.java`
- [ ] `controller/RedisController.java` → `interfaces/rest/system/RedisController.java`
- [ ] `controller/TestController.java` → `interfaces/rest/system/TestController.java`

## 重构步骤

### 第一阶段：准备（已完成）
- [x] 创建架构文档
- [x] 创建重构指南
- [x] 迁移公共模块基础类

### 第二阶段：基础设施层
1. 迁移配置类
2. 迁移安全框架
3. 迁移缓存服务
4. 迁移日志框架
5. 迁移工具类

### 第三阶段：领域层
1. 迁移用户领域
2. 迁移角色领域
3. 迁移商品领域
4. 迁移安全配置领域

### 第四阶段：应用层
1. 创建应用服务接口
2. 迁移服务实现
3. 迁移DTO

### 第五阶段：接口层
1. 迁移所有Controller

### 第六阶段：更新和验证
1. 更新所有导入路径
2. 更新配置文件（@MapperScan等）
3. 验证编译
4. 运行测试

## 注意事项

1. **保持向后兼容**：在迁移过程中，可以先保留旧文件，新文件创建后再删除旧文件
2. **批量替换导入**：使用IDE的批量替换功能更新import语句
3. **更新@MapperScan**：更新DemoApplication中的@MapperScan路径
4. **更新AOP切点**：更新ApiLogAspect中的切点表达式
5. **测试验证**：每个阶段完成后进行编译验证

## 依赖关系检查清单

迁移后需要检查的依赖关系：
- [ ] Controller → Service（应用层）
- [ ] Service → Mapper（领域层仓储）
- [ ] Service → Entity（领域层实体）
- [ ] Service → Infrastructure（基础设施）
- [ ] Controller → DTO（应用层）
- [ ] Controller → Result（公共模块）
- [ ] Security → Service（应用层）
- [ ] Cache → Domain（领域层）

