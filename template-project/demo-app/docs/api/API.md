# API 接口文档

本文档详细说明所有API接口的使用方法。

## 基础信息

- **Base URL**: `http://localhost:8081`
- **认证方式**: Bearer Token（在请求头中添加 `Authorization: Bearer {token}`）
- **响应格式**: 统一使用 `Result<T>` 封装

## 统一响应格式

### 成功响应
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {...},
  "timestamp": 1234567890
}
```

### 错误响应
```json
{
  "code": 401,
  "message": "Token已失效，请重新登录",
  "data": null,
  "timestamp": 1234567890
}
```

## 认证接口

### 1. 用户登录
- **URL**: `POST /api/auth/login`
- **认证**: 无需Token
- **请求体**:
```json
{
  "username": "admin",
  "password": "123456"
}
```
- **响应**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "32位随机字符串",
    "username": "admin",
    "roles": ["ADMIN"],
    "message": "登录成功"
  },
  "timestamp": 1234567890
}
```

### 2. 用户注册
- **URL**: `POST /api/auth/register`
- **认证**: 无需Token
- **请求体**:
```json
{
  "username": "newuser",
  "password": "123456"
}
```

### 3. 获取当前用户信息
- **URL**: `GET /api/auth/me`
- **认证**: 需要Token
- **响应**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "user": {
      "id": "xxx",
      "username": "admin"
    },
    "roles": ["ADMIN"]
  },
  "timestamp": 1234567890
}
```

### 4. 刷新Token
- **URL**: `POST /api/auth/refresh`
- **认证**: 需要Token
- **说明**: 更新Token的最后刷新时间，延长过期时间

### 5. 退出登录
- **URL**: `POST /api/auth/logout`
- **认证**: 需要Token
- **说明**: 清除该用户的所有登录信息（包括所有浏览器和IP的token）

## 用户管理接口

### 1. 创建用户
- **URL**: `POST /api/users`
- **认证**: 需要Token + USER/ADMIN角色
- **请求体**:
```json
{
  "username": "newuser",
  "password": "123456"
}
```

### 2. 根据ID查询用户
- **URL**: `GET /api/users/{id}`
- **认证**: 需要Token + USER/ADMIN角色

### 3. 分页查询所有用户
- **URL**: `GET /api/users?current=1&size=10`
- **认证**: 需要Token + USER/ADMIN角色
- **参数**:
  - `current`: 当前页码（默认1）
  - `size`: 每页大小（默认10）

### 4. 更新用户
- **URL**: `PUT /api/users/{id}`
- **认证**: 需要Token + USER/ADMIN角色

### 5. 删除用户
- **URL**: `DELETE /api/users/{id}`
- **认证**: 需要Token + USER/ADMIN角色

### 6. 搜索用户
- **URL**: `GET /api/users/search?username=test`
- **认证**: 需要Token + USER/ADMIN角色

## 商品类型管理接口

### 1. 创建商品类型
- **URL**: `POST /api/product-types`
- **认证**: 需要Token + USER/ADMIN角色
- **请求体**:
```json
{
  "typeName": "电子产品",
  "typeCode": "ELECTRONICS",
  "description": "各类电子产品和数码设备",
  "sortOrder": 1,
  "enabled": true
}
```

### 2. 根据ID查询商品类型
- **URL**: `GET /api/product-types/{id}`
- **认证**: 需要Token + USER/ADMIN角色

### 3. 分页查询所有商品类型
- **URL**: `GET /api/product-types?current=1&size=10&enabled=true`
- **认证**: 需要Token + USER/ADMIN角色

### 4. 查询所有启用的商品类型（不分页）
- **URL**: `GET /api/product-types/enabled`
- **认证**: 需要Token + USER/ADMIN角色

### 5. 更新商品类型
- **URL**: `PUT /api/product-types/{id}`
- **认证**: 需要Token + USER/ADMIN角色

### 6. 删除商品类型
- **URL**: `DELETE /api/product-types/{id}`
- **认证**: 需要Token + USER/ADMIN角色

### 7. 搜索商品类型
- **URL**: `GET /api/product-types/search?keyword=电子`
- **认证**: 需要Token + USER/ADMIN角色

## 商品管理接口

### 1. 创建商品
- **URL**: `POST /api/products`
- **认证**: 需要Token + USER/ADMIN角色
- **请求体**:
```json
{
  "productName": "iPhone 15 Pro",
  "productCode": "IPHONE15PRO",
  "typeId": "pt001",
  "price": 8999.00,
  "stock": 50,
  "description": "苹果最新款手机",
  "imageUrl": "https://example.com/image.jpg",
  "enabled": true
}
```

### 2. 根据ID查询商品
- **URL**: `GET /api/products/{id}`
- **认证**: 需要Token + USER/ADMIN角色
- **响应**: 包含商品信息和关联的商品类型信息

### 3. 分页查询所有商品
- **URL**: `GET /api/products?current=1&size=10&typeId=pt001&enabled=true`
- **认证**: 需要Token + USER/ADMIN角色

### 4. 查询所有启用的商品（不分页）
- **URL**: `GET /api/products/enabled?typeId=pt001`
- **认证**: 需要Token + USER/ADMIN角色

### 5. 更新商品
- **URL**: `PUT /api/products/{id}`
- **认证**: 需要Token + USER/ADMIN角色

### 6. 删除商品
- **URL**: `DELETE /api/products/{id}`
- **认证**: 需要Token + USER/ADMIN角色

### 7. 搜索商品
- **URL**: `GET /api/products/search?keyword=iPhone&typeId=pt001`
- **认证**: 需要Token + USER/ADMIN角色

### 8. 更新库存
- **URL**: `PUT /api/products/{id}/stock?stock=100`
- **认证**: 需要Token + USER/ADMIN角色

## 管理员接口（需要 ADMIN 角色）

### 角色管理
- **URL**: `GET /api/admin/roles` - 查询所有角色
- **URL**: `POST /api/admin/roles` - 创建角色
- **URL**: `PUT /api/admin/roles/{id}` - 更新角色
- **URL**: `DELETE /api/admin/roles/{id}` - 删除角色
- **URL**: `POST /api/admin/roles/{id}/assign` - 为用户分配角色
- **URL**: `DELETE /api/admin/roles/{id}/unassign` - 移除用户角色

### 用户管理
- **URL**: `GET /api/admin/info` - 管理员信息
- **URL**: `GET /api/admin/users/all` - 查看所有用户（包含敏感信息）
- **URL**: `DELETE /api/admin/users/{id}` - 强制删除用户

### 安全配置管理
- **URL**: `GET /api/security/whitelist` - 查询所有白名单
- **URL**: `POST /api/security/whitelist` - 添加白名单
- **URL**: `PUT /api/security/whitelist/{id}` - 更新白名单
- **URL**: `DELETE /api/security/whitelist/{id}` - 删除白名单
- **URL**: `POST /api/security/whitelist/refresh` - 刷新白名单缓存

- **URL**: `GET /api/security/permission` - 查询所有权限
- **URL**: `POST /api/security/permission` - 添加权限
- **URL**: `PUT /api/security/permission/{id}` - 更新权限
- **URL**: `DELETE /api/security/permission/{id}` - 删除权限
- **URL**: `POST /api/security/permission/refresh` - 刷新权限缓存

### Redis管理
- **URL**: `GET /api/redis/info` - 获取Redis信息
- **URL**: `GET /api/redis/keys?pattern=*` - 查询Key（支持模式匹配）
- **URL**: `GET /api/redis/get?key=xxx` - 获取Key值
- **URL**: `POST /api/redis/set` - 设置Key值
- **URL**: `DELETE /api/redis/delete?key=xxx` - 删除Key
- **URL**: `GET /api/redis/ttl?key=xxx` - 获取Key过期时间
- **URL**: `POST /api/redis/expire` - 设置Key过期时间
- **URL**: `GET /api/redis/tokens` - 获取所有Token信息
- **URL**: `DELETE /api/redis/tokens/{token}` - 删除指定Token
- **URL**: `DELETE /api/redis/tokens/user/{username}` - 删除用户的所有Token

## 公共接口（无需认证）

- **URL**: `GET /api/public/info` - 公共信息
- **URL**: `GET /api/public/health` - 健康检查

## 测试接口（仅用于开发测试）

- **URL**: `GET /api/test/generate-password?rawPassword=123456` - 生成BCrypt密码
- **URL**: `POST /api/test/update-password?username=admin&newPassword=123456` - 更新用户密码
- **URL**: `POST /api/test/verify-password?username=admin&password=123456` - 验证密码

**注意**: `TestController` 仅用于测试，生产环境应删除或禁用。

## 错误码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 操作成功 |
| 400 | 请求参数错误 |
| 401 | 未授权，需要登录或Token已失效 |
| 403 | 无权限访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

详细的业务状态码请参考 `StatusCode` 枚举类。

## 使用示例

### 完整的登录和使用流程

```bash
# 1. 登录获取Token
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}'

# 响应示例
# {
#   "code": 200,
#   "message": "登录成功",
#   "data": {
#     "token": "abc123...",
#     "username": "admin",
#     "roles": ["ADMIN"]
#   }
# }

# 2. 使用Token查询用户列表
curl -X GET "http://localhost:8081/api/users?current=1&size=10" \
  -H "Authorization: Bearer abc123..."

# 3. 创建商品类型
curl -X POST http://localhost:8081/api/product-types \
  -H "Authorization: Bearer abc123..." \
  -H "Content-Type: application/json" \
  -d '{
    "typeName": "电子产品",
    "typeCode": "ELECTRONICS",
    "description": "各类电子产品和数码设备",
    "sortOrder": 1,
    "enabled": true
  }'

# 4. 创建商品
curl -X POST http://localhost:8081/api/products \
  -H "Authorization: Bearer abc123..." \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "iPhone 15 Pro",
    "productCode": "IPHONE15PRO",
    "typeId": "pt001",
    "price": 8999.00,
    "stock": 50,
    "description": "苹果最新款手机",
    "enabled": true
  }'

# 5. 刷新Token
curl -X POST http://localhost:8081/api/auth/refresh \
  -H "Authorization: Bearer abc123..."

# 6. 退出登录
curl -X POST http://localhost:8081/api/auth/logout \
  -H "Authorization: Bearer abc123..."
```

