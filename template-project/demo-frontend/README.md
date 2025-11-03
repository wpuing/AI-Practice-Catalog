# 前端管理系统

基于原生JavaScript开发的管理系统前端，对接Spring Boot后端API。

## 功能特性

- ✅ 用户登录/注册
- ✅ 用户管理（CRUD）
- ✅ 商品类型管理（CRUD）
- ✅ 商品管理（CRUD）
- ✅ 角色管理（管理员）
- ✅ 安全配置（白名单、权限管理）
- ✅ Redis管理（管理员）
- ✅ 接口测试工具

## 技术栈

- **HTML5** - 页面结构
- **CSS3** - 样式设计（蓝绿色风格）
- **原生JavaScript** - 业务逻辑
- **Fetch API** - HTTP请求

## 页面风格

- **主色调**: 蓝色 (#2E86AB) + 绿色 (#06A77D)
- **设计风格**: 简约大气、现代化
- **响应式设计**: 支持移动端和桌面端

## 项目结构

```
demo-frontend/
├── index.html          # 登录/注册页面
├── home.html          # 主页面
├── css/
│   ├── common.css     # 通用样式
│   ├── login.css      # 登录页样式
│   └── home.css       # 主页样式
├── js/
│   ├── api.js         # API请求工具类
│   ├── auth.js        # 认证相关
│   ├── login.js       # 登录页逻辑
│   ├── home.js        # 主页逻辑
│   ├── utils.js       # 工具函数
│   ├── users.js       # 用户管理
│   ├── product-types.js  # 商品类型管理
│   ├── products.js    # 商品管理
│   ├── roles.js       # 角色管理
│   ├── security.js    # 安全配置
│   ├── redis.js       # Redis管理
│   └── test.js        # 接口测试
└── README.md          # 项目说明
```

## 使用方法

### 1. 启动后端服务

确保后端服务运行在 `http://localhost:8081`

### 2. 打开前端页面

直接使用浏览器打开 `index.html` 文件，或使用本地服务器：

```bash
# 使用Python启动简单HTTP服务器
python -m http.server 8000

# 或使用Node.js的http-server
npx http-server -p 8000
```

然后访问 `http://localhost:8000`

### 3. 登录系统

- 默认测试账号：`admin` / `123456`
- 或使用注册功能创建新账号

### 4. 使用功能

登录后可以：
- 查看控制台统计信息
- 管理用户、商品类型、商品
- 管理员可以访问角色管理、安全配置、Redis管理等高级功能
- 使用接口测试工具验证所有API接口

## API配置

默认API地址：`http://localhost:8081/api`

如需修改，请编辑 `js/api.js` 文件中的 `API_BASE_URL` 常量。

## 功能说明

### 认证模块
- 用户登录/注册
- Token管理
- 自动Token刷新
- 退出登录

### 用户管理
- 用户列表（分页）
- 创建/编辑/删除用户
- 用户搜索

### 商品类型管理
- 商品类型列表（分页）
- 创建/编辑/删除商品类型
- 启用/禁用商品类型
- 搜索商品类型

### 商品管理
- 商品列表（分页）
- 创建/编辑/删除商品
- 更新库存
- 启用/禁用商品
- 按类型筛选

### 管理员功能
- 角色管理（CRUD）
- 白名单管理
- 权限管理
- Redis信息查看
- Token管理

### 接口测试
- 自动测试所有接口
- 显示测试结果和耗时
- 统计通过/失败数量

## 浏览器兼容性

- Chrome（推荐）
- Firefox
- Edge
- Safari

## 注意事项

1. 需要先启动后端服务
2. Token存储在localStorage中
3. Token失效会自动跳转到登录页
4. 管理员功能需要ADMIN角色权限

## 开发说明

### 添加新功能

1. 在 `js/api.js` 中添加对应的API方法
2. 创建对应的模块JS文件（如 `js/new-module.js`）
3. 在 `home.html` 中添加页面结构和导航
4. 在 `js/home.js` 中初始化新模块

### 修改样式

- 全局样式：`css/common.css`
- 颜色变量：`:root` 中定义
- 页面特定样式：对应的CSS文件

## 更新日志

### v1.0.0 (2024-11-02)
- 初始版本
- 完整的用户、商品、商品类型管理
- 管理员功能
- 接口测试工具

