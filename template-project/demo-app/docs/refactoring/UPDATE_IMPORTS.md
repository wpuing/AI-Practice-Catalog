# 批量更新Import路径指南

由于重构涉及大量文件的import路径更新，以下是需要更新的import映射关系：

## 基础设施层（infrastructure）

```java
// 旧路径 → 新路径
import com.example.demo.config.* 
  → import com.example.demo.infrastructure.config.*;

import com.example.demo.security.* 
  → import com.example.demo.infrastructure.security.*;

import com.example.demo.service.TokenService 
  → import com.example.demo.infrastructure.cache.TokenService;

import com.example.demo.service.RoleCacheService 
  → import com.example.demo.infrastructure.cache.RoleCacheService;

import com.example.demo.aspect.* 
  → import com.example.demo.infrastructure.logging.*;

import com.example.demo.util.* 
  → import com.example.demo.infrastructure.util.*;
```

## 领域层（domain）

```java
// 旧路径 → 新路径
import com.example.demo.entity.User 
  → import com.example.demo.domain.user.entity.User;

import com.example.demo.entity.UserRole 
  → import com.example.demo.domain.user.entity.UserRole;

import com.example.demo.entity.Role 
  → import com.example.demo.domain.role.entity.Role;

import com.example.demo.entity.Product 
  → import com.example.demo.domain.product.entity.Product;

import com.example.demo.entity.ProductType 
  → import com.example.demo.domain.product.entity.ProductType;

import com.example.demo.entity.TokenInfo 
  → import com.example.demo.domain.security.entity.TokenInfo;

import com.example.demo.entity.SecurityWhitelist 
  → import com.example.demo.domain.security.entity.SecurityWhitelist;

import com.example.demo.entity.SecurityPermission 
  → import com.example.demo.domain.security.entity.SecurityPermission;

// Mapper
import com.example.demo.mapper.UserMapper 
  → import com.example.demo.domain.user.repository.UserMapper;

import com.example.demo.mapper.UserRoleMapper 
  → import com.example.demo.domain.user.repository.UserRoleMapper;

import com.example.demo.mapper.RoleMapper 
  → import com.example.demo.domain.role.repository.RoleMapper;

import com.example.demo.mapper.ProductMapper 
  → import com.example.demo.domain.product.repository.ProductMapper;

import com.example.demo.mapper.ProductTypeMapper 
  → import com.example.demo.domain.product.repository.ProductTypeMapper;

import com.example.demo.mapper.SecurityWhitelistMapper 
  → import com.example.demo.domain.security.repository.SecurityWhitelistMapper;

import com.example.demo.mapper.SecurityPermissionMapper 
  → import com.example.demo.domain.security.repository.SecurityPermissionMapper;
```

## 应用层（application）

```java
// 旧路径 → 新路径
import com.example.demo.dto.LoginRequest 
  → import com.example.demo.application.auth.dto.LoginRequest;

import com.example.demo.dto.LoginResponse 
  → import com.example.demo.application.auth.dto.LoginResponse;

import com.example.demo.service.UserService 
  → import com.example.demo.application.user.UserService;

import com.example.demo.service.impl.UserServiceImpl 
  → import com.example.demo.application.user.impl.UserServiceImpl;

import com.example.demo.service.UserDetailsServiceImpl 
  → import com.example.demo.application.user.impl.UserDetailsServiceImpl;

import com.example.demo.service.RoleService 
  → import com.example.demo.application.role.RoleService;

import com.example.demo.service.UserRoleService 
  → import com.example.demo.application.role.UserRoleService;

import com.example.demo.service.SecurityConfigService 
  → import com.example.demo.application.role.SecurityConfigService;

import com.example.demo.service.ProductService 
  → import com.example.demo.application.product.ProductService;

import com.example.demo.service.ProductTypeService 
  → import com.example.demo.application.product.ProductTypeService;

import com.example.demo.service.impl.ProductServiceImpl 
  → import com.example.demo.application.product.impl.ProductServiceImpl;

import com.example.demo.service.impl.ProductTypeServiceImpl 
  → import com.example.demo.application.product.impl.ProductTypeServiceImpl;
```

## 公共模块（common）

```java
// 旧路径 → 新路径
import com.example.demo.common.Result 
  → import com.example.demo.common.result.Result;

import com.example.demo.exception.GlobalExceptionHandler 
  → import com.example.demo.common.exception.GlobalExceptionHandler;

// constants 和 enums 保持不变
import com.example.demo.constants.*;
import com.example.demo.enums.*;
```

## 使用IDE批量替换

### IntelliJ IDEA:
1. 打开 `Edit` → `Find` → `Replace in Path` (Ctrl+Shift+R)
2. 启用正则表达式（Regex）
3. 逐个替换上面的映射关系

### VS Code:
1. 打开 `Search and Replace` (Ctrl+Shift+H)
2. 启用正则表达式
3. 逐个替换上面的映射关系

## 注意事项

⚠️ **重要**：替换时需要：
1. 确保使用正则表达式模式
2. 每次替换后检查是否有误替换
3. 优先替换具体的类名，避免误替换
4. 替换完成后进行编译验证

