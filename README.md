# AI Practice Catalog

AI 实践项目目录，包含多个完整的全栈项目模板和演示项目，用于学习和参考。

## 📁 目录结构

```
AI-Practice-Catalog/
├── template-project/          # 模板项目（推荐）
│   ├── demo-app/             # 后端Spring Boot应用
│   │   ├── src/              # 源代码
│   │   ├── docs/             # 项目文档
│   │   ├── pom.xml           # Maven配置
│   │   └── README.md         # 后端项目说明
│   ├── demo-frontend/        # 前端管理系统
│   │   ├── css/              # 样式文件
│   │   ├── js/               # JavaScript文件
│   │   ├── index.html        # 登录页
│   │   ├── home.html         # 主页
│   │   └── README.md         # 前端项目说明
│   └── README.md             # 模板项目说明
├── miscellaneous/            # 其他项目集合
│   ├── demo-springboot/      # Spring Cloud微服务项目
│   ├── frontend-admin/        # 前端管理后台
│   └── README.md             # 其他项目说明
└── README.md                 # 本文件
```

## 🎯 项目概述

### template-project（模板项目）

**推荐使用** - 这是一个完整的全栈项目模板，包含后端Spring Boot应用和前端管理系统。

#### demo-app（后端）
- **技术栈**: Spring Boot 3.1.5 + PostgreSQL + Redis + MyBatis-Plus
- **架构**: 分层模块化架构（DDD风格）
- **功能**: 用户管理、角色权限管理（RBAC）、商品管理、Redis Token管理
- **特点**: 企业级架构设计，代码规范统一

#### demo-frontend（前端）
- **技术栈**: 原生JavaScript + HTML5 + CSS3
- **风格**: 蓝绿色简约风格，现代化设计
- **功能**: 完整的用户界面，对接所有后端接口
- **特点**: 无框架依赖，代码简洁易维护

**快速开始**: 查看 [template-project/README.md](template-project/README.md)

### miscellaneous（其他项目）

包含其他类型的项目和演示代码：

#### demo-springboot
- **技术栈**: Spring Boot 3.2.0 + Spring Cloud Alibaba + Nacos
- **特点**: 微服务架构，配置中心，Docker支持
- **用途**: 学习微服务架构和Nacos配置管理

#### frontend-admin
- **说明**: 前端管理后台项目
- **用途**: 配套后端服务使用

**详细信息**: 查看 [miscellaneous/README.md](miscellaneous/README.md)

## 🚀 快速开始

### 使用模板项目（推荐）

1. **启动后端服务**
   ```bash
   cd template-project/demo-app
   mvn spring-boot:run
   ```
   后端服务运行在：`http://localhost:8081`

2. **启动前端服务**
   ```bash
   cd template-project/demo-frontend
   # 使用 Python
   python -m http.server 8000
   # 或使用 Node.js
   npx http-server -p 8000
   ```
   前端地址：`http://localhost:8000`

3. **登录系统**
   - 默认管理员账号：`admin` / `123456`
   - 或使用注册功能创建新账号

### 使用其他项目

查看各项目目录下的 README.md 文件获取详细说明。

## 📚 文档说明

### 模板项目文档
- **项目说明**: [template-project/README.md](template-project/README.md)
- **后端文档**: [template-project/demo-app/README.md](template-project/demo-app/README.md)
- **前端文档**: [template-project/demo-frontend/README.md](template-project/demo-frontend/README.md)
- **架构文档**: [template-project/demo-app/docs/architecture/ARCHITECTURE.md](template-project/demo-app/docs/architecture/ARCHITECTURE.md)
- **API文档**: [template-project/demo-app/docs/api/API.md](template-project/demo-app/docs/api/API.md)

### 其他项目文档
- **项目说明**: [miscellaneous/README.md](miscellaneous/README.md)
- **demo-springboot**: [miscellaneous/demo-springboot/README.md](miscellaneous/demo-springboot/README.md)

## 🏗️ 技术栈对比

| 项目 | 后端框架 | 前端技术 | 数据库 | 特点 |
|------|---------|---------|--------|------|
| **template-project** | Spring Boot 3.1.5 | 原生JavaScript | PostgreSQL + Redis | 企业级架构，DDD风格 |
| **demo-springboot** | Spring Boot 3.2.0 + Spring Cloud | - | PostgreSQL | 微服务架构，Nacos配置 |

## 💡 使用建议

1. **新项目开发** - 使用 `template-project` 作为起始模板
2. **学习企业级架构** - 参考 `template-project/demo-app` 的分层设计
3. **学习微服务** - 参考 `miscellaneous/demo-springboot` 项目
4. **学习前端开发** - 参考 `template-project/demo-frontend` 的原生JavaScript实现

## ⚠️ 注意事项

1. **环境要求**
   - Java 21（后端项目）
   - PostgreSQL 15（数据库）
   - Redis（缓存服务，template-project需要）
   - Maven 3.6+（构建工具）

2. **配置要求**
   - 首次使用需要初始化数据库
   - 确保相关服务已启动（PostgreSQL、Redis等）
   - 根据实际环境调整配置文件

3. **生产环境**
   - 修改默认配置和密码
   - 配置HTTPS和安全策略
   - 优化性能和监控

## 📄 许可证

本项目集合作为学习和参考使用。

## 🔗 相关链接

- **模板项目**: [template-project/](template-project/)
- **其他项目**: [miscellaneous/](miscellaneous/)
- **上传指南**: [GITHUB_UPLOAD_GUIDE.md](GITHUB_UPLOAD_GUIDE.md)

---

**最后更新**: 2024年

