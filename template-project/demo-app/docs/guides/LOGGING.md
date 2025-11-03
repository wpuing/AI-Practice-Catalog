# 接口日志说明

本项目已集成完整的接口访问日志功能，自动记录所有 Controller 接口的访问信息。

## 功能特性

### 1. 自动日志记录
- 所有 Controller 接口自动记录日志
- 无需在每个方法中手动添加日志代码
- 基于 AOP 切面实现，对业务代码零侵入

### 2. 记录的信息

#### 请求信息
- **请求路径**: 接口的 URI
- **请求方法**: HTTP 方法（GET、POST、PUT、DELETE 等）
- **类名和方法名**: 执行的类和方法
- **客户端 IP**: 请求来源 IP（支持代理场景）
- **请求参数**: 所有方法参数（自动过滤敏感信息）

#### 用户信息
- **用户名**: 当前登录用户
- **认证状态**: 是否已认证
- **权限列表**: 用户拥有的权限

#### 线程信息
- **线程 ID**: 执行线程的唯一标识
- **线程名称**: 线程名称
- **线程组**: 线程所属的线程组
- **线程类型**: 是否守护线程
- **线程优先级**: 线程优先级

#### 响应信息
- **执行耗时**: 接口执行时间（毫秒）
- **响应状态**: 成功或异常
- **响应结果**: 返回的数据（超过一定大小会省略）

## 日志格式

### 请求日志示例

```
========== API 请求开始 ==========
请求路径: /api/users
请求方法: GET
类名.方法名: UserController.getAllUsers
客户端IP: 127.0.0.1
用户信息: {用户名=admin, 是否已认证=true, 权限列表=[ROLE_ADMIN]}
线程信息: 线程ID=1, 线程名=http-nio-8080-exec-1
请求参数: {
  "current" : 1,
  "size" : 10
}
```

### 响应日志示例

```
========== API 请求结束 ==========
执行耗时: 45ms
响应状态: 成功
响应结果: {"success":true,"data":[...]}
```

### 异常日志示例

```
========== API 请求异常 ==========
执行耗时: 120ms
异常类型: java.lang.NullPointerException
异常消息: null

java.lang.NullPointerException
    at com.example.demo.controller.UserController.getUserById(UserController.java:65)
    ...
```

## 敏感信息过滤

系统自动识别并过滤以下敏感参数：
- **password**: 密码字段
- **pwd**: 密码相关字段
- **secret**: 密钥字段
- **token**: Token 字段
- **key**: 密钥字段

敏感字段在日志中会显示为：`***敏感信息已隐藏***`

## MDC（映射诊断上下文）

系统自动设置以下 MDC 字段，可用于日志追踪：

- `userId`: 用户ID（用户名）
- `threadId`: 线程ID
- `requestURI`: 请求 URI

可以在 `logback-spring.xml` 中使用这些字段：

```xml
<pattern>%d{yyyy-MM-dd HH:mm:ss} [%thread] [%X{userId}] [%X{threadId}] %-5level %logger{36} - %msg%n</pattern>
```

## 配置说明

### 日志级别

在 `application.yml` 中配置日志级别：

```yaml
logging:
  level:
    root: INFO
    com.example.demo.aspect: DEBUG  # 切面日志级别
```

### 日志输出

日志会输出到：
- **控制台**: 默认输出到控制台
- **日志文件**: 如果配置了 `logging.file.path`，会同时输出到文件

### 禁用日志

如果需要禁用某个接口的日志（不推荐），可以：

1. **排除特定 Controller**:
```java
@Pointcut("execution(* com.example.demo.controller..*.*(..)) && " +
          "!execution(* com.example.demo.controller.PublicController.*(..))")
```

2. **使用自定义注解**:
可以扩展切面，支持 `@NoLog` 注解来跳过日志记录。

## 性能影响

- 日志记录使用异步方式，对接口性能影响极小
- 参数序列化使用 Jackson，性能优秀
- 大对象自动截断，避免日志文件过大

## 最佳实践

1. **生产环境**: 建议将日志级别设置为 INFO 或 WARN
2. **开发环境**: 可以使用 DEBUG 级别查看详细日志
3. **日志保留**: 配置日志文件大小和保留天数，避免占用过多磁盘
4. **敏感信息**: 确保敏感参数使用规范的命名（如 password），系统会自动过滤

## 示例场景

### 场景 1: 用户登录

```log
========== API 请求开始 ==========
请求路径: /api/auth/login
请求方法: POST
类名.方法名: AuthController.login
客户端IP: 192.168.1.100
用户信息: {用户名=anonymous, 是否已认证=false}
线程信息: 线程ID=25, 线程名=http-nio-8080-exec-5
请求参数: {
  "loginRequest" : {
    "username" : "admin",
    "password" : "***敏感信息已隐藏***"
  }
}

========== API 请求结束 ==========
执行耗时: 120ms
响应状态: 成功
响应结果: {"token":"eyJhbGci...","username":"admin","roles":["ADMIN"]}
```

### 场景 2: 查询用户列表

```log
========== API 请求开始 ==========
请求路径: /api/users
请求方法: GET
类名.方法名: UserController.getAllUsers
客户端IP: 192.168.1.100
用户信息: {用户名=admin, 是否已认证=true, 权限列表=[ROLE_ADMIN]}
线程信息: 线程ID=28, 线程名=http-nio-8080-exec-8
请求参数: {
  "current" : 1,
  "size" : 10
}

========== API 请求结束 ==========
执行耗时: 35ms
响应状态: 成功
响应结果: {"success":true,"data":[...],"total":100}
```

### 场景 3: 接口异常

```log
========== API 请求开始 ==========
请求路径: /api/users/123
请求方法: GET
类名.方法名: UserController.getUserById
客户端IP: 192.168.1.100
用户信息: {用户名=admin, 是否已认证=true}
线程信息: 线程ID=30, 线程名=http-nio-8080-exec-10
请求参数: {
  "id" : "123"
}

========== API 请求异常 ==========
执行耗时: 15ms
异常类型: org.springframework.dao.DataAccessException
异常消息: 数据库访问异常

org.springframework.dao.DataAccessException: 数据库访问异常
    ...
```

## 技术实现

- **AOP 框架**: Spring AOP
- **切点表达式**: `execution(* com.example.demo.controller..*.*(..))`
- **通知类型**: 环绕通知（@Around）
- **参数解析**: Spring DefaultParameterNameDiscoverer
- **JSON 序列化**: Jackson ObjectMapper
- **线程追踪**: SLF4J MDC

## 扩展功能

如需扩展日志功能，可以：

1. **添加自定义字段**: 在 `ApiLogAspect` 中添加更多信息
2. **异步日志**: 使用异步日志框架（如 Logback AsyncAppender）
3. **日志存储**: 集成 ELK、Loki 等日志收集系统
4. **性能监控**: 结合 Micrometer 记录性能指标
5. **链路追踪**: 集成 SkyWalking、Zipkin 等追踪系统

