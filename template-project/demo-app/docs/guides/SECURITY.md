# Spring Security 配置说明

本项目已配置完整的 Spring Security 认证和授权机制。

## 功能特性

### 1. 认证（Authentication）
- **JWT Token 认证**：基于 JWT 的无状态认证
- **密码加密**：使用 BCrypt 加密存储
- **用户登录**：`POST /api/auth/login`
- **用户注册**：`POST /api/auth/register`

### 2. 授权（Authorization）
- **基于角色的访问控制（RBAC）**
- **方法级权限控制**：使用 `@PreAuthorize` 注解
- **URL 级权限控制**：在 SecurityConfig 中配置

### 3. 白名单配置
以下接口无需认证即可访问：
- `/api/auth/login` - 登录接口
- `/api/auth/register` - 注册接口
- `/api/public/**` - 公共接口
- `/swagger-ui/**` - Swagger UI
- `/actuator/**` - 监控端点

## 角色说明

### ADMIN 角色
- 拥有所有权限
- 可以访问 `/api/admin/**` 下的所有接口
- 可以执行所有用户操作

### USER 角色
- 拥有基本权限
- 可以访问 `/api/users/**` 下的接口
- 可以管理自己的数据

## API 接口说明

### 认证接口

#### 1. 用户登录
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "123456"
}
```

响应：
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "username": "admin",
  "roles": ["ADMIN"],
  "message": "登录成功"
}
```

#### 2. 用户注册
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "newuser",
  "password": "123456"
}
```

#### 3. 获取当前用户信息
```
GET /api/auth/me
Authorization: Bearer {token}
```

### 权限接口

#### 1. 普通用户接口（需要 USER 或 ADMIN 角色）
- `GET /api/users` - 查询用户列表
- `GET /api/users/{id}` - 查询用户详情
- `POST /api/users` - 创建用户
- `PUT /api/users/{id}` - 更新用户
- `DELETE /api/users/{id}` - 删除用户

#### 2. 管理员接口（需要 ADMIN 角色）
- `GET /api/admin/info` - 管理员信息
- `GET /api/admin/users/all` - 查看所有用户
- `DELETE /api/admin/users/{id}` - 强制删除用户

#### 3. 公共接口（无需认证）
- `GET /api/public/info` - 公共信息
- `GET /api/public/health` - 健康检查

## 使用示例

### 1. 登录获取 Token
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}'
```

### 2. 使用 Token 访问受保护接口
```bash
curl -X GET http://localhost:8080/api/users \
  -H "Authorization: Bearer {your_token}"
```

### 3. 访问管理员接口
```bash
curl -X GET http://localhost:8080/api/admin/info \
  -H "Authorization: Bearer {admin_token}"
```

## 测试账号

初始化数据包含以下测试账号（密码都是 123456）：
- **管理员账号**：username: `admin`, 角色: `ADMIN`
- **普通用户**：username: `user`, 角色: `USER`
- **其他用户**：username: `dddsd`, `dsfgsgsdfg`, 角色: `USER`

## 配置说明

### JWT 配置（application.yml）
```yaml
jwt:
  secret: demospringbootsecretkey123456789012345678901234567890
  expiration: 86400000  # 24小时（毫秒）
```

### Security 配置要点
1. **禁用 CSRF**：因为使用 JWT 无状态认证
2. **会话策略**：STATELESS（无状态）
3. **密码编码器**：BCryptPasswordEncoder
4. **JWT 过滤器**：在 UsernamePasswordAuthenticationFilter 之前执行

## 安全建议

1. **生产环境**：
   - 修改 JWT secret 为更复杂的密钥
   - 启用 HTTPS
   - 配置适当的 CORS 策略
   - 考虑添加刷新 Token 机制

2. **密码策略**：
   - 强制密码复杂度
   - 实施密码过期策略
   - 记录登录失败次数

3. **Token 管理**：
   - 设置合理的过期时间
   - 考虑实现 Token 黑名单机制
   - 实现刷新 Token 功能

