# 最终重构步骤清单

## ✅ 已完成的迁移

### 基础设施层（infrastructure）
所有文件已迁移到新位置，import路径已更新。

### 领域层（domain）
所有实体类和Mapper已迁移到新位置。

### 应用层（application）
所有Service和DTO已迁移到新位置。

### 接口层（interfaces）
所有Controller已迁移到新位置。

### 公共模块（common）
Result和GlobalExceptionHandler已迁移，constants和enums保持不变。

## ⚠️ 需要手动更新的引用

以下文件仍在使用旧的import路径，需要批量更新：

### 1. 旧Controller文件（需要删除）
以下旧Controller文件应该删除，因为新版本已创建在 `interfaces/rest/` 目录：
- `controller/AuthController.java`
- `controller/UserController.java`
- `controller/RoleController.java`
- `controller/ProductController.java`
- `controller/ProductTypeController.java`
- `controller/SecurityConfigController.java`
- `controller/AdminController.java`
- `controller/PublicController.java`
- `controller/RedisController.java`
- `controller/TestController.java`

### 2. 旧的Service和Entity文件（需要删除）
以下文件应该删除，因为新版本已创建：
- `service/TokenService.java` → 已迁移到 `infrastructure/cache/TokenService.java`
- `service/RoleCacheService.java` → 已迁移到 `infrastructure/cache/RoleCacheService.java`
- `service/UserService.java` → 已迁移到 `application/user/UserService.java`
- `service/UserServiceImpl.java` → 已迁移到 `application/user/impl/UserServiceImpl.java`
- `service/UserDetailsServiceImpl.java` → 已迁移到 `application/user/impl/UserDetailsServiceImpl.java`
- `service/RoleService.java` → 已迁移到 `application/role/RoleService.java`
- `service/UserRoleService.java` → 已迁移到 `application/role/UserRoleService.java`
- `service/SecurityConfigService.java` → 已迁移到 `application/role/SecurityConfigService.java`
- `service/ProductService.java` → 已迁移到 `application/product/ProductService.java`
- `service/ProductTypeService.java` → 已迁移到 `application/product/ProductTypeService.java`
- `service/impl/ProductServiceImpl.java` → 已迁移到 `application/product/impl/ProductServiceImpl.java`
- `service/impl/ProductTypeServiceImpl.java` → 已迁移到 `application/product/impl/ProductTypeServiceImpl.java`

### 3. 旧的Entity和Mapper文件（需要删除）
- `entity/User.java` → 已迁移到 `domain/user/entity/User.java`
- `entity/UserRole.java` → 已迁移到 `domain/user/entity/UserRole.java`
- `entity/Role.java` → 已迁移到 `domain/role/entity/Role.java`
- `entity/Product.java` → 已迁移到 `domain/product/entity/Product.java`
- `entity/ProductType.java` → 已迁移到 `domain/product/entity/ProductType.java`
- `entity/TokenInfo.java` → 已迁移到 `domain/security/entity/TokenInfo.java`
- `entity/SecurityWhitelist.java` → 已迁移到 `domain/security/entity/SecurityWhitelist.java`
- `entity/SecurityPermission.java` → 已迁移到 `domain/security/entity/SecurityPermission.java`
- `mapper/*.java` → 已迁移到 `domain/*/repository/*.java`

### 4. 旧的DTO文件（需要删除）
- `dto/LoginRequest.java` → 已迁移到 `application/auth/dto/LoginRequest.java`
- `dto/LoginResponse.java` → 已迁移到 `application/auth/dto/LoginResponse.java`

### 5. 旧的Config、Security、Util文件（需要删除）
- `config/*.java` → 已迁移到 `infrastructure/config/*.java`
- `security/*.java` → 已迁移到 `infrastructure/security/*.java`
- `aspect/ApiLogAspect.java` → 已迁移到 `infrastructure/logging/ApiLogAspect.java`
- `util/*.java` → 已迁移到 `infrastructure/util/*.java`

### 6. 旧的Common文件（需要删除）
- `common/Result.java` → 已迁移到 `common/result/Result.java`
- `exception/GlobalExceptionHandler.java` → 已迁移到 `common/exception/GlobalExceptionHandler.java`

## 🔍 验证步骤

### 步骤1：编译验证
```bash
cd demo-springboot-traditional
mvn clean compile
```

如果编译成功，说明所有import路径都已正确更新。

### 步骤2：运行测试
```bash
mvn test
```

### 步骤3：启动应用
```bash
mvn spring-boot:run
```

## 📝 注意事项

1. **删除旧文件**：只有在确认新文件编译通过且功能正常后，才能删除旧文件。
2. **备份**：建议在删除旧文件前先备份整个项目。
3. **逐步删除**：建议分批次删除，每次删除一部分后验证编译。

## 🎯 最终验证清单

- [ ] 所有新文件已创建
- [ ] 所有import路径已更新
- [ ] 编译通过
- [ ] 测试通过
- [ ] 应用能正常启动
- [ ] 旧文件已删除（可选，建议保留备份）

