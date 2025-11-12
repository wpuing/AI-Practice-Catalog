# 部署指南

## 1. 环境要求

### 1.1 基础环境

- **Java 21**：JDK 版本
- **Maven 3.6+**：构建工具
- **PostgreSQL 15**：数据库
- **Redis 6.0+**：缓存
- **RabbitMQ 3.8+**：消息队列
- **Nacos 2.x**：服务注册与发现、配置中心
- **XXL-Job 2.4.0**：任务调度中心（可选）

### 1.2 系统要求

- **操作系统**：Linux / Windows / macOS
- **内存**：建议 8GB 以上
- **磁盘**：建议 50GB 以上

## 2. 基础设施部署

### 2.1 部署 Nacos

```bash
# 下载 Nacos
wget https://github.com/alibaba/nacos/releases/download/2.3.0/nacos-server-2.3.0.tar.gz

# 解压
tar -xzf nacos-server-2.3.0.tar.gz
cd nacos/bin

# 启动（单机模式）
sh startup.sh -m standalone

# 访问控制台
# http://localhost:8848/nacos
# 默认账号/密码：nacos/nacos
```

### 2.2 部署 Redis

```bash
# 使用 Docker 部署
docker run -d --name redis -p 6379:6379 redis:6.2

# 或使用本地安装
redis-server
```

### 2.3 部署 RabbitMQ

```bash
# 使用 Docker 部署
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3.8-management

# 访问管理界面
# http://localhost:15672
# 默认账号/密码：guest/guest
```

### 2.4 部署 PostgreSQL

```bash
# 使用 Docker 部署
docker run -d --name postgres -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres \
  postgres:15

# 或使用本地安装
# 创建数据库脚本见下方
```

### 2.5 部署 XXL-Job（可选）

```bash
# 下载 XXL-Job
# https://github.com/xuxueli/xxl-job/releases

# 解压并配置数据库
# 执行 SQL 脚本初始化数据库

# 启动
java -jar xxl-job-admin-2.4.0.jar

# 访问管理界面
# http://localhost:8080/xxl-job-admin
```

## 3. 数据库初始化

### 3.1 创建数据库

```sql
-- 连接 PostgreSQL
psql -U postgres

-- 创建数据库
CREATE DATABASE demo_cloud WITH ENCODING 'UTF8';
```

### 3.2 初始化表结构

```bash
psql -U postgres -d demo_cloud -f db/schema.sql
psql -U postgres -d demo_cloud -f db/data.sql
```

## 4. Nacos 配置

### 4.1 创建命名空间

在 Nacos 控制台创建命名空间（可选，默认使用 public）

### 4.2 配置各服务配置

在 Nacos 控制台创建配置文件，DataId 格式：`{service-name}-dev.yml`

#### auth-service-dev.yml

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
  redis:
    host: localhost
    port: 6379
    password:
    database: 0
    timeout: 3000ms
    lettuce:
      pool:
        max-active: 8
        max-idle: 8
        min-idle: 0
  rabbitmq:
    host: localhost
    port: 5672
    username: guest
    password: guest
    virtual-host: /
```

#### user-service-dev.yml

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/demo_cloud
    username: postgres
    password: postgres
  redis:
    host: localhost
    port: 6379
    password:
    database: 0
```

#### product-service-dev.yml

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/demo_cloud
    username: postgres
    password: postgres
  redis:
    host: localhost
    port: 6379
    password:
    database: 0
```

#### report-service-dev.yml

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/demo_cloud
    username: postgres
    password: postgres
  redis:
    host: localhost
    port: 6379
    password:
    database: 0
```

#### dfs-service-dev.yml

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/demo_cloud
    username: postgres
    password: postgres
  redis:
    host: localhost
    port: 6379
    password:
    database: 0
```

#### gateway-service-dev.yml

```yaml
spring:
  redis:
    host: localhost
    port: 6379
    password:
    database: 0
```

## 5. 服务构建与启动

### 5.1 构建项目

```bash
# 进入项目根目录
cd template-project-cloud

# 编译打包
mvn clean package -DskipTests
```

### 5.2 启动服务

**启动顺序**：

1. 基础设施服务（Nacos、Redis、RabbitMQ、PostgreSQL）
2. 认证服务（auth-service）
3. 业务服务（user-service、product-service、report-service、dfs-service）
4. 网关服务（gateway-service）

```bash
# 启动认证服务
cd auth/auth-service
java -jar target/auth-service-1.0.0.jar

# 启动用户服务
cd modules/user-service
java -jar target/user-service-1.0.0.jar

# 启动商品服务
cd modules/product-service
java -jar target/product-service-1.0.0.jar

# 启动报表服务
cd modules/report-service
java -jar target/report-service-1.0.0.jar

# 启动文件服务
cd dfs/dfs-service
java -jar target/dfs-service-1.0.0.jar

# 启动网关服务
cd gateway/gateway-service
java -jar target/gateway-service-1.0.0.jar
```

### 5.3 使用启动脚本

创建启动脚本 `start-all.sh`：

```bash
#!/bin/bash

# 启动认证服务
cd auth/auth-service
nohup java -jar target/auth-service-1.0.0.jar > logs/auth-service.log 2>&1 &

# 启动用户服务
cd ../../modules/user-service
nohup java -jar target/user-service-1.0.0.jar > logs/user-service.log 2>&1 &

# 启动商品服务
cd ../product-service
nohup java -jar target/product-service-1.0.0.jar > logs/product-service.log 2>&1 &

# 启动报表服务
cd ../report-service
nohup java -jar target/report-service-1.0.0.jar > logs/report-service.log 2>&1 &

# 启动文件服务
cd ../../dfs/dfs-service
nohup java -jar target/dfs-service-1.0.0.jar > logs/dfs-service.log 2>&1 &

# 启动网关服务
cd ../../gateway/gateway-service
nohup java -jar target/gateway-service-1.0.0.jar > logs/gateway-service.log 2>&1 &

echo "所有服务已启动"
```

## 6. Docker 部署

### 6.1 构建 Docker 镜像

为每个服务创建 Dockerfile：

```dockerfile
FROM openjdk:21-jre-slim

WORKDIR /app

COPY target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 6.2 Docker Compose 部署

创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  nacos:
    image: nacos/nacos-server:v2.3.0
    ports:
      - "8848:8848"
    environment:
      MODE: standalone

  redis:
    image: redis:6.2
    ports:
      - "6379:6379"

  rabbitmq:
    image: rabbitmq:3.8-management
    ports:
      - "5672:5672"
      - "15672:15672"

  postgres:
    image: postgres:15
    ports:
      - "5432:5432"
    environment:
      POSTGRES_PASSWORD: postgres

  auth-service:
    build: ./auth/auth-service
    ports:
      - "8081:8081"
    depends_on:
      - nacos
      - redis
      - postgres

  user-service:
    build: ./modules/user-service
    ports:
      - "8082:8082"
    depends_on:
      - nacos
      - redis
      - postgres

  gateway-service:
    build: ./gateway/gateway-service
    ports:
      - "8080:8080"
    depends_on:
      - auth-service
      - user-service
```

## 7. 验证部署

### 7.1 检查服务注册

访问 Nacos 控制台：http://localhost:8848/nacos

查看服务列表，确认所有服务已注册。

### 7.2 测试 API

```bash
# 测试登录接口
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}'

# 测试用户接口（需要 Token）
curl -X GET http://localhost:8080/api/users/info \
  -H "Authorization: Bearer {token}"
```

## 8. 生产环境部署建议

### 8.1 高可用部署

- **多实例部署**：每个服务至少部署 2 个实例
- **负载均衡**：使用 Nginx 或云负载均衡器
- **数据库主从**：配置数据库主从复制
- **Redis 集群**：使用 Redis 集群模式

### 8.2 监控告警

- **APM 监控**：集成 SkyWalking 或 Zipkin
- **日志收集**：使用 ELK 或类似工具
- **指标监控**：使用 Prometheus + Grafana
- **告警系统**：配置告警规则

### 8.3 安全加固

- **HTTPS**：使用 HTTPS 协议
- **防火墙**：配置防火墙规则
- **密钥管理**：使用密钥管理服务
- **访问控制**：配置访问控制策略

