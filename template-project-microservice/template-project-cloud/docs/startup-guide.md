# 微服务启动指南

## ⚠️ 重要提示

**本项目统一从 Nacos 配置中心读取配置**，所有服务使用 **`bootstrap.yml` + `application.yml`** 的配置方式：

- **`bootstrap.yml`** - 包含 Nacos 连接配置（在 application.yml 之前加载）
- **`application.yml`** - 仅包含 `spring.config.import` 和服务端口（最小默认值）

**配置说明**：
- ✅ **主要配置来源**：Nacos 配置中心（`docs/nacos-configs/` 目录下的配置文件）
- ✅ **本地配置**：仅保留 Nacos 连接配置和最小默认值，所有业务配置都从 Nacos 读取
- ✅ **配置优先级**：`Nacos 配置 > application.yml 默认值`
- ✅ **配置加载顺序**：`bootstrap.yml` → `application.yml` → Nacos 配置 → 数据源初始化（确保 Nacos 配置在数据源初始化之前加载）
- ⚠️ **重要**：**必须**在 Nacos 中创建各服务的配置文件，否则服务无法启动

**配置文件位置**：`docs/nacos-configs/` 目录

详细说明请参考：[Nacos 配置使用说明](./nacos-config-usage.md)

## 启动顺序

微服务系统需要按照以下顺序启动：

### 1. 基础设施服务（必须先启动）

#### 1.1 Nacos 服务注册与配置中心
```bash
# 下载并启动 Nacos
# Windows: 运行 startup.cmd -m standalone
# Linux/Mac: 运行 startup.sh -m standalone
# 访问 http://localhost:8080/ (控制台地址，默认账号/密码: nacos/nacos)
```

**必须首先启动 Nacos**，因为所有微服务都依赖它进行服务注册和配置管理。

#### 1.2 在 Nacos 中创建配置

**重要**：在启动服务前，必须在 Nacos 中创建各服务的配置文件：

1. **创建命名空间**（如果不存在）
   - 命名空间ID: `b9282c04-bc19-46a6-a08f-6d303641c7f9`
   - 命名空间名: `demo-cloud`

2. **创建各服务的配置**
   - 在 `demo-cloud` 命名空间下创建配置文件
   - Data ID: `服务名.yml`（如 `gateway-service.yml`）
   - Group: `DEFAULT_GROUP`
   - 配置格式: `YAML`
   - 配置内容: 复制 `docs/nacos-configs/` 目录下对应文件的内容

详细步骤请参考：[Nacos 配置使用说明](./nacos-config-usage.md)

### 2. 核心服务

#### 2.1 认证服务 (auth-service)
```bash
cd cloud-auth/auth-service
mvn spring-boot:run
# 或
java -jar target/auth-service-1.0.0.jar
```
- **端口**: 8081
- **作用**: 提供用户认证和授权功能
- **依赖**: Nacos、PostgreSQL、Redis

### 3. 网关服务

#### 3.1 API 网关 (gateway-service)
```bash
cd cloud-gateway/gateway-service
mvn spring-boot:run
# 或
java -jar target/gateway-service-1.0.0.jar
```
- **端口**: 8080
- **作用**: 统一入口，路由转发，认证拦截
- **依赖**: Nacos、认证服务

### 4. 业务服务（可并行启动）

#### 4.1 用户服务 (user-service)
```bash
cd cloud-modules/user-service
mvn spring-boot:run
```
- **端口**: 8082
- **依赖**: Nacos、PostgreSQL、Redis

#### 4.2 商品服务 (product-service)
```bash
cd cloud-modules/product-service
mvn spring-boot:run
```
- **端口**: 8083
- **依赖**: Nacos、PostgreSQL、Redis

#### 4.3 报表服务 (report-service)
```bash
cd cloud-modules/report-service
mvn spring-boot:run
```
- **端口**: 8084
- **依赖**: Nacos、PostgreSQL、Redis

#### 4.4 文件服务 (dfs-service)
```bash
cd cloud-dfs/dfs-service
mvn spring-boot:run
```
- **端口**: 8085
- **依赖**: Nacos、PostgreSQL、Redis

## 完整启动流程

### 步骤 1: 启动基础设施
1. 启动 PostgreSQL 数据库
2. 启动 Redis
3. 启动 RabbitMQ（可选）
4. **启动 Nacos**（必须）

### 步骤 2: 初始化数据库
```bash
# 创建数据库
psql -U postgres
CREATE DATABASE demo_cloud WITH ENCODING 'UTF8';

# 执行表结构脚本
psql -U postgres -d demo_cloud -f db/schema.sql

# 执行初始数据脚本
psql -U postgres -d demo_cloud -f db/data.sql
```

### 步骤 3: 启动核心服务
```bash
# 1. 启动认证服务
cd cloud-auth/auth-service
mvn spring-boot:run
```

### 步骤 4: 启动网关服务
```bash
# 2. 启动网关服务
cd cloud-gateway/gateway-service
mvn spring-boot:run
```

### 步骤 5: 启动业务服务（可并行）
```bash
# 3. 启动用户服务
cd cloud-modules/user-service
mvn spring-boot:run

# 4. 启动商品服务
cd cloud-modules/product-service
mvn spring-boot:run

# 5. 启动报表服务
cd cloud-modules/report-service
mvn spring-boot:run

# 6. 启动文件服务
cd cloud-dfs/dfs-service
mvn spring-boot:run
```

## 服务端口列表

| 服务 | 端口 | 说明 |
|------|------|------|
| Nacos Console | 8080 | Nacos 控制台（Web UI） |
| Nacos Server | 8848 | Nacos 服务注册与配置中心（API） |
| Gateway | 8888 | API 网关（统一入口） |
| Auth Service | 8081 | 认证服务 |
| User Service | 8082 | 用户服务 |
| Product Service | 8083 | 商品服务 |
| Report Service | 8084 | 报表服务 |
| DFS Service | 8085 | 文件服务 |

**注意**: 
- **Nacos 控制台访问地址**：http://localhost:8080/ （Web UI 管理界面）
- **Nacos API 地址**：http://localhost:8848/nacos （服务注册与配置 API）
- **Gateway 端口**：8888（已修改，避免与 Nacos Console 冲突）
- 微服务配置 Nacos 时使用 **8848 端口**

## 验证服务启动

### 1. 检查 Nacos 控制台
- **访问地址**: http://localhost:8080/ （注意：控制台在 8080 端口，不是 8848）
- **默认账号密码**: `nacos` / `nacos`
- 查看"服务管理" -> "服务列表"，应该能看到所有已注册的服务

### 2. 检查服务健康状态
```bash
# 检查认证服务
curl http://localhost:8081/actuator/health

# 检查网关服务
curl http://localhost:8888/actuator/health
```

### 3. 测试 API
```bash
# 通过网关访问认证服务
curl http://localhost:8888/api/auth/current
```

## 常见问题

### 1. 服务启动失败：No spring.config.import property has been defined

**错误信息**：
```
APPLICATION FAILED TO START
No spring.config.import property has been defined
```

**原因**：Spring Cloud Alibaba 2022.x 版本要求显式配置 `spring.config.import` 来导入 Nacos 配置。

**解决方案**：已在所有服务的 `application.yml` 中添加了 `spring.config.import: nacos:服务名.yml` 配置，并在 `bootstrap.yml` 中配置了 Nacos 连接信息。

### 2. 服务启动失败：Spring MVC found on classpath, which is incompatible with Spring Cloud Gateway

**错误信息**：
```
Spring MVC found on classpath, which is incompatible with Spring Cloud Gateway.
Please set spring.main.web-application-type=reactive
```

**原因**：Spring Cloud Gateway 基于 WebFlux（响应式），不能与 Spring MVC 共存。core-common 模块引入了 spring-boot-starter-web。

**解决方案**：已在 Gateway 的 `application.yml` 中添加了 `spring.main.web-application-type: reactive` 配置。

### 3. 服务启动失败：连接 Nacos 失败
- 确保 Nacos 已启动
- 检查 Nacos 地址配置是否正确（默认 localhost:8848）

### 4. 服务启动失败：Failed to configure a DataSource

**错误信息**：
```
Failed to configure a DataSource: 'url' attribute is not specified
```

**原因**：服务引入了 MyBatis-Plus，但数据源配置被注释掉了。

**解决方案**：使用 `bootstrap.yml` + `application.yml` 方式，确保 Nacos 配置在数据源初始化之前加载。所有业务配置都从 Nacos 配置中心读取。

**注意事项**：
- 确保 PostgreSQL 已启动并创建了 `demo_cloud` 数据库
- 确保 Redis 已启动
- 所有业务配置都从 Nacos 配置中心读取，确保在 Nacos 中创建了各服务的配置文件

### 5. 服务启动失败：数据库连接失败
- 确保 PostgreSQL 已启动
- 检查数据库配置是否正确
- 确保数据库已创建并初始化
- 检查数据库用户名和密码是否正确

### 6. 服务启动失败：端口被占用
- 检查端口是否被其他程序占用
- 修改 application.yml 中的端口配置

### 7. 编译错误：类重复定义
- 清理编译缓存：`mvn clean`
- 重新编译：`mvn compile`
- 如果仍有问题，删除所有 target 目录后重新编译

## 快速启动脚本（Windows）

创建 `start-all.bat`:

```batch
@echo off
echo Starting Nacos...
start cmd /k "cd nacos\bin && startup.cmd -m standalone"

timeout /t 10

echo Starting Auth Service...
start cmd /k "cd cloud-auth\auth-service && mvn spring-boot:run"

timeout /t 5

echo Starting Gateway Service...
start cmd /k "cd cloud-gateway\gateway-service && mvn spring-boot:run"

timeout /t 5

echo Starting User Service...
start cmd /k "cd cloud-modules\user-service && mvn spring-boot:run"

echo Starting Product Service...
start cmd /k "cd cloud-modules\product-service && mvn spring-boot:run"

echo Starting Report Service...
start cmd /k "cd cloud-modules\report-service && mvn spring-boot:run"

echo Starting DFS Service...
start cmd /k "cd cloud-dfs\dfs-service && mvn spring-boot:run"

echo All services started!
```

## 快速启动脚本（Linux/Mac）

创建 `start-all.sh`:

```bash
#!/bin/bash

echo "Starting Nacos..."
cd nacos/bin && ./startup.sh -m standalone &
sleep 10

echo "Starting Auth Service..."
cd ../../cloud-auth/auth-service && mvn spring-boot:run &
sleep 5

echo "Starting Gateway Service..."
cd ../../cloud-gateway/gateway-service && mvn spring-boot:run &
sleep 5

echo "Starting User Service..."
cd ../../cloud-modules/user-service && mvn spring-boot:run &
sleep 2

echo "Starting Product Service..."
cd ../../cloud-modules/product-service && mvn spring-boot:run &
sleep 2

echo "Starting Report Service..."
cd ../../cloud-modules/report-service && mvn spring-boot:run &
sleep 2

echo "Starting DFS Service..."
cd ../../cloud-dfs/dfs-service && mvn spring-boot:run &

echo "All services started!"
```

