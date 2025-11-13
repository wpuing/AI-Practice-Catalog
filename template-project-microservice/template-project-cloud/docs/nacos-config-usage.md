# Nacos 配置使用说明

## 📋 概述

本项目**统一从 Nacos 配置中心读取配置**，所有服务使用 **`bootstrap.yml` + `application.yml`** 的配置方式：

- **`bootstrap.yml`** - 在 `application.yml` 之前加载，包含 Nacos 连接配置（地址、命名空间、账号密码）
- **`application.yml`** - 仅包含 `spring.config.import` 和服务端口（最小默认值）

**配置策略**：
- ✅ **主要配置来源**：Nacos 配置中心（`docs/nacos-configs/` 目录下的配置文件）
- ✅ **本地配置**：仅保留 Nacos 连接配置和最小默认值，所有业务配置都从 Nacos 读取
- ✅ **配置优先级**：`Nacos 配置 > application.yml 默认值`

**重要说明**：
- ⚠️ **必须**：启动服务前，请在 Nacos 中创建各服务的配置文件（参考 `docs/nacos-configs/` 目录）
- 所有业务配置（数据源、Redis、MyBatis-Plus、JWT 等）都从 Nacos 配置中心读取
- `application.yml` 仅用于连接 Nacos，不包含任何业务配置

## 🔧 配置文件说明

### Bootstrap 配置（bootstrap.yml）

每个服务的 `bootstrap.yml` **包含 Nacos 连接配置**：
- 服务名称
- 激活的 Profile
- Nacos 连接配置（地址、命名空间、账号密码）

**作用**：
- `bootstrap.yml` 会在 `application.yml` **之前**加载
- 确保 Nacos 连接配置在数据源初始化之前就准备好
- 这样 Nacos 配置可以在数据源初始化之前加载

### Application 配置（application.yml）

每个服务的 `application.yml` **仅包含最小配置**：
- `spring.config.import` - 显式导入 Nacos 配置（必需）
- 服务端口（最小默认值，实际配置从 Nacos 读取）

**作用**：
- 显式导入 Nacos 配置，确保配置在数据源初始化之前加载
- 所有业务配置（数据源、Redis、MyBatis-Plus、JWT 等）都从 Nacos 配置中心读取
- 本地仅保留最小配置，实现配置集中管理

**配置加载顺序**：
1. `bootstrap.yml` - 加载 Nacos 连接配置
2. `application.yml` - 加载 `spring.config.import`，触发 Nacos 配置加载
3. Nacos 配置 - 从 Nacos 配置中心加载业务配置
4. 数据源初始化 - 使用 Nacos 中的配置

**配置优先级**：`Nacos 配置 > application.yml > bootstrap.yml`

**重要提示**：
- ⚠️ **必须**：启动服务前，请在 Nacos 中创建各服务的配置文件
- 使用 `bootstrap.yml` 确保 Nacos 配置在数据源初始化之前加载
- 配置中使用了 `nacos:`（非 `optional:nacos:`），确保 Nacos 配置必须存在
- 如果 Nacos 配置不存在，服务启动会失败（这是预期的行为，确保配置集中管理）

### Nacos 配置

所有业务配置都在 Nacos 配置中心中管理，包括：
- 数据库配置
- Redis 配置
- RabbitMQ 配置
- MyBatis-Plus 配置
- JWT 配置
- 日志配置
- Gateway 路由配置
- 其他业务配置

## 📝 配置模板位置

所有服务的 Nacos 配置模板位于：`docs/nacos-configs/` 目录

| 服务 | 配置文件 | Data ID |
|------|---------|---------|
| Gateway | `gateway-service.yml` | `gateway-service.yml` |
| Auth | `auth-service.yml` | `auth-service.yml` |
| User | `user-service.yml` | `user-service.yml` |
| Product | `product-service.yml` | `product-service.yml` |
| Report | `report-service.yml` | `report-service.yml` |
| DFS | `dfs-service.yml` | `dfs-service.yml` |
| 公共配置 | `common-config.yml` | `common-config.yml` |

## 🚀 使用步骤

### 1. 创建命名空间

在 Nacos 控制台创建命名空间：
- **命名空间ID**: `b9282c04-bc19-46a6-a08f-6d303641c7f9`
- **命名空间名**: `demo-cloud`
- **描述**: `Demo Cloud 项目命名空间`

### 2. 创建配置

在 `demo-cloud` 命名空间下创建各服务的配置：

1. 进入 Nacos 控制台：http://localhost:8080/
2. 登录：`nacos` / `nacos`
3. 选择命名空间：`demo-cloud`
4. 进入"配置管理" -> "配置列表"
5. 点击 "+" 创建配置
6. 填写配置信息：
   - **Data ID**: `服务名.yml`（如 `gateway-service.yml`）
   - **Group**: `DEFAULT_GROUP`
   - **配置格式**: `YAML`
   - **配置内容**: 复制 `docs/nacos-configs/` 目录下对应文件的内容
7. 点击 "发布" 保存

### 3. 启动服务

服务启动时会：
1. 读取 `bootstrap.yml` 连接 Nacos
2. 从 Nacos 加载对应服务的配置（`服务名.yml`）
3. 合并配置并启动服务

## ⚙️ 配置优先级

```
Nacos 配置中心 > bootstrap.yml
```

如果 Nacos 中存在配置，会覆盖 `bootstrap.yml` 中的同名配置。

## 🔍 配置验证

### 检查配置是否加载

启动服务后，查看日志应该看到：

```
[Nacos] Loaded config from Nacos: gateway-service.yml
```

### 检查配置值

在服务中打印配置值，确认是否正确加载：

```java
@Value("${spring.datasource.url}")
private String datasourceUrl;
```

## 📌 重要配置说明

### Gateway 服务

Gateway 的 Nacos 配置必须包含：
```yaml
spring:
  main:
    web-application-type: reactive  # 必须配置，Gateway 使用响应式模式
```

### Auth 服务

Auth 服务的 Nacos 配置必须包含：
```yaml
jwt:
  secret: template-project-cloud-secret-key-2024
  expiration: 86400000
```

**注意**：Auth 服务启动类已添加 `@ComponentScan` 扫描 `com.example.core` 包，确保 `JwtUtil` Bean 能被正确加载。

## 🔄 配置刷新

服务启动后，如果修改了 Nacos 中的配置：
- 默认情况下，配置会自动刷新（`refresh: true`）
- 服务会重新加载配置，无需重启

## ⚠️ 注意事项

1. **必须先在 Nacos 中创建配置**
   - 服务启动前，必须在 Nacos 中创建对应的配置文件
   - 否则服务可能无法正常启动

2. **命名空间必须正确**
   - 所有配置必须在 `demo-cloud` 命名空间下创建
   - 命名空间 ID：`b9282c04-bc19-46a6-a08f-6d303641c7f9`

3. **Data ID 必须与服务名一致**
   - 例如：`auth-service.yml` 对应 `auth-service` 服务
   - 必须与 `bootstrap.yml` 中的 `spring.config.import` 配置一致

4. **配置格式必须为 YAML**
   - 确保配置内容格式正确，否则服务启动会失败

5. **敏感信息加密**
   - 生产环境的密码等敏感信息建议使用 Nacos 的配置加密功能
   - 或使用环境变量、密钥管理服务等

## 📚 相关文档

- [Nacos 配置导入问题解决](./nacos-config-import.md)
- [Nacos 配置中心配置文件](./nacos-configs/README.md)
- [启动指南](./startup-guide.md)

## 🎯 快速开始

1. **启动 Nacos**
   ```bash
   cd D:\install\develop\nacos\bin
   startup.cmd -m standalone
   ```

2. **创建命名空间**
   - 在 Nacos 控制台创建 `demo-cloud` 命名空间

3. **创建配置**
   - 在 `demo-cloud` 命名空间下创建各服务的配置文件

4. **启动服务**
   - 服务启动时会自动从 Nacos 加载配置

