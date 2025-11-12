# 开发规范

## 1. 代码规范

### 1.1 命名规范

#### 包命名

- 使用小写字母，多个单词用点分隔
- 包名应该反映模块的层次结构
- 示例：`com.example.user.domain.entity`

#### 类命名

- 使用大驼峰命名（PascalCase）
- 类名应该清晰表达其职责
- 示例：`UserService`, `UserRepository`, `UserController`

#### 方法命名

- 使用小驼峰命名（camelCase）
- 方法名应该清晰表达其功能
- 示例：`findByUsername()`, `saveUser()`, `deleteById()`

#### 变量命名

- 使用小驼峰命名（camelCase）
- 变量名应该清晰表达其含义
- 示例：`userId`, `userName`, `createDate`

#### 常量命名

- 使用全大写下划线分隔（UPPER_SNAKE_CASE）
- 常量名应该清晰表达其含义
- 示例：`MAX_RETRY_COUNT`, `DEFAULT_TIMEOUT`

### 1.2 注释规范

#### 类注释

```java
/**
 * 用户服务
 * 负责用户相关的业务逻辑处理
 *
 * @author Your Name
 * @date 2024-01-01
 */
@Service
public class UserService {
    // ...
}
```

#### 方法注释

```java
/**
 * 根据用户名查询用户
 *
 * @param username 用户名
 * @return 用户信息，如果不存在返回 null
 */
public User findByUsername(String username) {
    // ...
}
```

#### 字段注释

```java
/**
 * 用户ID
 */
private String userId;

/**
 * 用户名
 */
private String username;
```

## 2. DDD 开发规范

### 2.1 领域层（Domain）

#### 实体（Entity）

- 实体应该包含业务标识和业务逻辑
- 实体应该是不变的（Immutable），通过方法修改状态
- 示例：

```java
@Entity
public class User {
    private String id;
    private String username;
    private String email;
    
    public void changeEmail(String newEmail) {
        if (isValidEmail(newEmail)) {
            this.email = newEmail;
        } else {
            throw new BusinessException("邮箱格式不正确");
        }
    }
}
```

#### 值对象（Value Object）

- 值对象应该是不可变的
- 值对象通过属性值判断相等性
- 示例：

```java
public class Email {
    private final String value;
    
    public Email(String value) {
        if (!isValid(value)) {
            throw new IllegalArgumentException("邮箱格式不正确");
        }
        this.value = value;
    }
    
    public String getValue() {
        return value;
    }
}
```

#### 仓储接口（Repository）

- 仓储接口定义在 Domain 层
- 仓储接口应该使用领域语言
- 示例：

```java
public interface UserRepository {
    User findByUsername(String username);
    void save(User user);
    void delete(String userId);
}
```

### 2.2 应用层（Application）

#### 应用服务（Application Service）

- 应用服务负责编排领域对象完成业务用例
- 应用服务应该是无状态的
- 示例：

```java
@Service
@RequiredArgsConstructor
public class UserApplicationService {
    private final UserRepository userRepository;
    private final UserDomainService userDomainService;
    
    public void createUser(CreateUserCommand command) {
        // 1. 验证
        validateCommand(command);
        
        // 2. 创建领域对象
        User user = new User(command.getUsername(), command.getEmail());
        
        // 3. 调用领域服务
        userDomainService.validateUnique(user);
        
        // 4. 持久化
        userRepository.save(user);
    }
}
```

#### 命令（Command）

- 命令用于修改数据
- 命令应该包含验证逻辑
- 示例：

```java
@Data
public class CreateUserCommand {
    @NotBlank(message = "用户名不能为空")
    private String username;
    
    @Email(message = "邮箱格式不正确")
    private String email;
}
```

#### 查询（Query）

- 查询用于查询数据
- 查询应该明确查询条件
- 示例：

```java
@Data
public class UserQuery {
    private String username;
    private String email;
    private Integer pageNum = 1;
    private Integer pageSize = 10;
}
```

### 2.3 基础设施层（Infrastructure）

#### 仓储实现（Repository Implementation）

- 仓储实现在 Infrastructure 层
- 使用 MyBatis-Plus 或 JPA 实现
- 示例：

```java
@Repository
@RequiredArgsConstructor
public class UserRepositoryImpl implements UserRepository {
    private final UserMapper userMapper;
    
    @Override
    public User findByUsername(String username) {
        UserDO userDO = userMapper.selectOne(
            new LambdaQueryWrapper<UserDO>()
                .eq(UserDO::getUsername, username)
        );
        return convertToDomain(userDO);
    }
}
```

### 2.4 接口层（Interfaces）

#### 控制器（Controller）

- 控制器负责接收 HTTP 请求
- 控制器应该尽量简单，只负责参数验证和调用应用服务
- 示例：

```java
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserApplicationService userApplicationService;
    
    @PostMapping
    public Result<UserDTO> createUser(@RequestBody @Valid CreateUserCommand command) {
        User user = userApplicationService.createUser(command);
        return Result.success(convertToDTO(user));
    }
}
```

## 3. 数据库规范

### 3.1 表命名

- 使用服务前缀：`{service_prefix}_{table_name}`
- 表名使用小写下划线分隔（snake_case）
- 示例：`auth_user`, `user_info`, `product_info`

### 3.2 字段命名

- 字段名使用小写下划线分隔（snake_case）
- 字段名应该清晰表达其含义
- 示例：`user_id`, `user_name`, `create_date`

### 3.3 基础字段

所有表必须包含以下基础字段：

- `id`：主键（VARCHAR(32)）
- `create_date`：创建时间（TIMESTAMP）
- `create_user`：创建用户（VARCHAR(32)）
- `update_date`：更新时间（TIMESTAMP）
- `update_user`：更新用户（VARCHAR(32)）
- `deleted`：逻辑删除标记（INTEGER，0-未删除，1-已删除）
- `db_version`：版本号（INTEGER，用于乐观锁）

### 3.4 索引规范

- 主键自动创建索引
- 外键字段创建索引
- 查询频繁的字段创建索引
- 唯一约束自动创建索引

## 4. API 规范

### 4.1 RESTful API 设计

#### URL 设计

- 使用名词，不使用动词
- 使用复数形式
- 使用小写下划线分隔
- 示例：
  - `GET /api/users` - 获取用户列表
  - `GET /api/users/{id}` - 获取用户详情
  - `POST /api/users` - 创建用户
  - `PUT /api/users/{id}` - 更新用户
  - `DELETE /api/users/{id}` - 删除用户

#### HTTP 方法

- `GET`：查询操作
- `POST`：创建操作
- `PUT`：更新操作（全量更新）
- `PATCH`：更新操作（部分更新）
- `DELETE`：删除操作

#### 状态码

- `200 OK`：请求成功
- `201 Created`：创建成功
- `400 Bad Request`：请求参数错误
- `401 Unauthorized`：未授权
- `403 Forbidden`：禁止访问
- `404 Not Found`：资源不存在
- `500 Internal Server Error`：服务器错误

### 4.2 统一响应格式

所有 API 响应使用统一格式：

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    // 响应数据
  },
  "timestamp": 1704067200000
}
```

### 4.3 分页响应

分页查询响应格式：

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "list": [
      // 数据列表
    ],
    "total": 100,
    "pageNum": 1,
    "pageSize": 10,
    "pages": 10
  },
  "timestamp": 1704067200000
}
```

## 5. 异常处理规范

### 5.1 异常分类

- **业务异常（BusinessException）**：业务逻辑错误，返回 400
- **系统异常（SystemException）**：系统错误，返回 500
- **认证异常（AuthenticationException）**：认证失败，返回 401
- **授权异常（AuthorizationException）**：授权失败，返回 403

### 5.2 异常处理

使用全局异常处理器：

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(BusinessException.class)
    public Result<Void> handleBusinessException(BusinessException e) {
        return Result.fail(e.getCode(), e.getMessage());
    }
    
    @ExceptionHandler(Exception.class)
    public Result<Void> handleException(Exception e) {
        log.error("系统异常", e);
        return Result.fail(ResultCode.INTERNAL_SERVER_ERROR);
    }
}
```

## 6. 日志规范

### 6.1 日志级别

- **ERROR**：错误信息，需要立即处理
- **WARN**：警告信息，需要注意
- **INFO**：重要信息，业务流程关键节点
- **DEBUG**：调试信息，开发调试使用

### 6.2 日志格式

使用统一的日志格式：

```java
log.info("用户登录成功，用户名：{}，IP：{}", username, ip);
log.error("用户登录失败，用户名：{}，原因：{}", username, e.getMessage(), e);
```

### 6.3 日志内容

- 记录关键业务操作
- 记录异常信息
- 记录性能关键点
- 不记录敏感信息（密码、Token 等）

## 7. 测试规范

### 7.1 单元测试

- 核心业务逻辑必须有单元测试
- 测试覆盖率应该达到 80% 以上
- 使用 JUnit 5 和 Mockito

### 7.2 集成测试

- 服务间调用必须有集成测试
- 使用 TestContainers 或 Mock 服务

### 7.3 接口测试

- 所有 API 接口必须有接口测试
- 使用 Postman 或类似工具

## 8. Git 规范

### 8.1 分支规范

- **main**：主分支，生产环境代码
- **develop**：开发分支，开发环境代码
- **feature/xxx**：功能分支，新功能开发
- **bugfix/xxx**：修复分支，Bug 修复
- **hotfix/xxx**：热修复分支，紧急修复

### 8.2 提交规范

提交信息格式：`<type>(<scope>): <subject>`

- **type**：提交类型（feat、fix、docs、style、refactor、test、chore）
- **scope**：影响范围（可选）
- **subject**：提交描述

示例：
- `feat(user): 添加用户注册功能`
- `fix(auth): 修复登录 Token 过期问题`
- `docs: 更新 API 文档`

## 9. 性能优化规范

### 9.1 数据库优化

- 合理使用索引
- 避免 N+1 查询
- 使用批量操作
- 合理使用分页

### 9.2 缓存优化

- 合理使用缓存
- 设置合理的过期时间
- 注意缓存穿透、缓存击穿、缓存雪崩

### 9.3 代码优化

- 避免不必要的对象创建
- 使用连接池
- 合理使用异步处理

## 10. 安全规范

### 10.1 数据安全

- 敏感数据加密存储
- 密码使用 BCrypt 加密
- 传输使用 HTTPS

### 10.2 接口安全

- 使用 Token 认证
- 接口权限验证
- 参数验证和过滤
- SQL 注入防护

### 10.3 日志安全

- 不记录敏感信息
- 日志文件权限控制
- 定期清理日志

