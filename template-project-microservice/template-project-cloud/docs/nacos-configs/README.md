# Nacos 配置中心配置文件

本目录包含所有服务的 Nacos 配置文件模板，用于在 Nacos 控制台中手动创建配置。

## 📋 配置文件列表

| 文件名 | Data ID | 服务说明 |
|--------|---------|----------|
| `gateway-service.yml` | `gateway-service.yml` | Gateway 网关服务 |
| `auth-service.yml` | `auth-service.yml` | 认证服务 |
| `user-service.yml` | `user-service.yml` | 用户服务 |
| `product-service.yml` | `product-service.yml` | 商品服务 |
| `report-service.yml` | `report-service.yml` | 报表服务 |
| `dfs-service.yml` | `dfs-service.yml` | 文件服务 |
| `common-config.yml` | `common-config.yml` | 公共配置（所有服务共享） |

## 🚀 使用步骤

### 1. 访问 Nacos 控制台

打开浏览器访问：http://localhost:8080/

使用账号登录：
- 用户名：`nacos`
- 密码：`nacos`

**注意**：本项目使用 `demo-cloud` 命名空间（ID: b9282c04-bc19-46a6-a08f-6d303641c7f9），所有配置都需要在该命名空间下创建。

### 2. 创建配置

1. **进入配置管理**
   - 点击左侧菜单 "配置管理" -> "配置列表"
   - 点击右上角 "+" 按钮创建配置

2. **选择命名空间**
   - 在命名空间下拉框中选择：`demo-cloud`（ID: b9282c04-bc19-46a6-a08f-6d303641c7f9）
   - 如果不存在，需要先在 Nacos 控制台创建命名空间

3. **填写配置信息**
   - **Data ID**: 填写对应的文件名（如 `gateway-service.yml`）
   - **Group**: `DEFAULT_GROUP`
   - **配置格式**: `YAML`
   - **配置内容**: 复制对应文件的内容

3. **保存配置**
   - 点击 "发布" 按钮保存配置

### 3. 配置示例

#### 创建 Gateway 服务配置

```
命名空间: demo-cloud (b9282c04-bc19-46a6-a08f-6d303641c7f9)
Data ID: gateway-service.yml
Group: DEFAULT_GROUP
配置格式: YAML
配置内容: [复制 gateway-service.yml 文件内容]
```

#### 创建认证服务配置

```
Data ID: auth-service.yml
Group: DEFAULT_GROUP
配置格式: YAML
配置内容: [复制 auth-service.yml 文件内容]
```

## ⚙️ 配置说明

### 配置策略

**本项目统一从 Nacos 配置中心读取配置**，所有业务配置都在 Nacos 中管理。

### 配置优先级

```
Nacos 配置中心 > application.yml > bootstrap.yml
```

- ✅ **主要配置来源**：Nacos 配置中心（本目录下的配置文件）
- ✅ **本地配置**：使用 `bootstrap.yml` + `application.yml` 方式，`bootstrap.yml` 包含 Nacos 连接配置，`application.yml` 仅保留最小配置
- ⚠️ **重要**：启动服务前，请先在 Nacos 中创建各服务的配置文件

**配置加载顺序**：
1. `bootstrap.yml` - 加载 Nacos 连接配置
2. `application.yml` - 加载 `spring.config.import`，触发 Nacos 配置加载
3. Nacos 配置 - 从 Nacos 配置中心加载业务配置
4. 数据源初始化 - 使用 Nacos 中的配置

如果 Nacos 中存在配置，服务启动时会自动加载并覆盖本地配置。

### 配置刷新

服务启动后，如果修改了 Nacos 中的配置：
- 默认情况下，配置会自动刷新（`refresh: true`）
- 服务会重新加载配置，无需重启

### 命名空间配置

本项目使用 **demo-cloud** 命名空间（ID: b9282c04-bc19-46a6-a08f-6d303641c7f9）

**创建命名空间**（如果不存在）：
1. 在 Nacos 控制台点击 "命名空间" 菜单
2. 点击 "+" 创建命名空间
3. 填写：
   - **命名空间ID**: `b9282c04-bc19-46a6-a08f-6d303641c7f9`
   - **命名空间名**: `demo-cloud`
   - **描述**: `Demo Cloud 项目命名空间`

**注意**：所有服务的配置都需要在 `demo-cloud` 命名空间下创建。

## 📝 配置内容说明

### 1. 数据库配置

所有服务都包含 PostgreSQL 数据库配置：

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/demo_cloud
    username: postgres
    password: postgres
    driver-class-name: org.postgresql.Driver
    druid:
      initial-size: 5
      min-idle: 5
      max-active: 20
```

**生产环境修改**：
- 修改 `url` 为生产数据库地址
- 修改 `username` 和 `password` 为生产数据库账号密码

### 2. Redis 配置

所有服务都包含 Redis 配置：

```yaml
spring:
  redis:
    host: localhost
    port: 6379
    password:
    database: 0
```

**生产环境修改**：
- 修改 `host` 为生产 Redis 地址
- 修改 `password` 为生产 Redis 密码（如果有）

### 3. RabbitMQ 配置

部分服务包含 RabbitMQ 配置：

```yaml
spring:
  rabbitmq:
    host: localhost
    port: 5672
    username: guest
    password: guest
```

**生产环境修改**：
- 修改 `host` 为生产 RabbitMQ 地址
- 修改 `username` 和 `password` 为生产账号密码

### 4. 服务特定配置

#### Gateway 服务
- Gateway 路由配置（可选，也可以在 `application.yml` 中配置）

#### Auth 服务
- JWT 配置（密钥和过期时间）

#### Report 服务
- XXL-Job 配置（任务调度）

#### DFS 服务
- 文件上传配置（路径和大小限制）

## 🔧 配置修改

### 修改配置

1. 在 Nacos 控制台找到对应的配置
2. 点击 "编辑" 按钮
3. 修改配置内容
4. 点击 "发布" 保存

### 删除配置

1. 在 Nacos 控制台找到对应的配置
2. 点击 "删除" 按钮
3. 确认删除

**注意**：删除配置后，服务会使用本地的最小默认配置（仅包含服务端口），可能导致服务无法正常启动。**请确保在 Nacos 中创建了所有必需的配置文件**。

## 📌 注意事项

1. **Data ID 必须与服务名一致**
   - 例如：`auth-service.yml` 对应 `auth-service` 服务
   - 必须与 `application.yml` 中的 `spring.config.import` 配置一致（格式：`nacos:auth-service.yml`）

2. **Group 必须为 DEFAULT_GROUP**
   - 必须与 `application.yml` 中的 `group` 配置一致

3. **配置格式必须为 YAML**
   - 确保配置内容格式正确，否则服务启动会失败

4. **配置内容中的注释**
   - YAML 配置文件中可以使用 `#` 添加注释
   - 注释不会影响配置的加载

5. **敏感信息加密**
   - 生产环境的密码等敏感信息建议使用 Nacos 的配置加密功能
   - 或使用环境变量、密钥管理服务等

## 🔍 验证配置

### 1. 检查配置是否加载

启动服务后，查看日志：

```
[Nacos] Loaded config from Nacos: gateway-service.yml
```

### 2. 检查配置值

在服务中打印配置值，确认是否正确加载：

```java
@Value("${spring.datasource.url}")
private String datasourceUrl;
```

### 3. 测试配置刷新

1. 修改 Nacos 中的配置
2. 观察服务日志，应该看到配置刷新日志
3. 验证配置是否生效

## 📚 相关文档

- [Nacos 配置导入问题解决](../nacos-config-import.md)
- [启动指南](../startup-guide.md)
- [数据源配置说明](../datasource-config.md)

## 🎯 快速开始

1. **启动 Nacos**
   ```bash
   cd D:\install\develop\nacos\bin
   startup.cmd -m standalone
   ```

2. **访问 Nacos 控制台**
   - 打开：http://localhost:8080/
   - 登录：`nacos` / `nacos`

3. **创建配置**
   - 按照上述步骤创建各个服务的配置文件

4. **启动服务**
   - 服务启动时会自动从 Nacos 加载配置

## 💡 提示

- ⚠️ **重要**：本项目统一从 Nacos 读取配置，**必须**在 Nacos 中创建各服务的配置文件
- 所有业务配置（数据源、Redis、MyBatis-Plus、JWT 等）都在 Nacos 中管理
- 使用 `bootstrap.yml` + `application.yml` 方式，确保 Nacos 配置在数据源初始化之前加载
- `bootstrap.yml` 包含 Nacos 连接配置，`application.yml` 仅保留最小配置
- 可以通过命名空间区分不同环境的配置（开发、测试、生产）
- 配置修改后会自动刷新，无需重启服务（`refresh: true`）

