# Template Project Frontend

企业级微服务前端项目 - 基于 JavaScript 原生实现

## 📋 项目简介

本项目是一个完整的企业级前端应用模板，采用原生 JavaScript 开发，不依赖任何框架，但提供了现代化的开发体验和工具链支持。

### 核心特性

- ✅ **原生 JavaScript** - 不依赖任何框架，纯原生实现
- ✅ **模块化设计** - ES6 模块化，清晰的代码组织
- ✅ **路由管理** - 基于 History API 的 SPA 路由
- ✅ **状态管理** - 轻量级状态管理方案
- ✅ **HTTP 封装** - 统一的 API 请求封装
- ✅ **组件化** - 可复用的组件系统
- ✅ **错误处理** - 全局错误捕获和处理
- ✅ **日志系统** - 完整的日志记录功能
- ✅ **代码规范** - ESLint + Prettier 代码规范
- ✅ **构建工具** - Vite 快速构建和开发

## 🛠️ 技术栈

### 核心
- **JavaScript ES6+** - 现代 JavaScript 语法
- **Vite** - 快速的前端构建工具
- **ESLint** - 代码检查工具
- **Prettier** - 代码格式化工具

### 功能模块
- **路由系统** - 自定义路由管理器
- **状态管理** - 基于观察者模式的状态管理
- **HTTP 客户端** - 封装的 fetch API
- **工具库** - 格式化、验证、存储等工具函数

## 📁 项目结构

```
template-project-frontend/
├── src/                      # 源代码目录
│   ├── api/                  # API 接口定义
│   │   ├── auth.js          # 认证 API
│   │   ├── user.js          # 用户 API
│   │   ├── product.js       # 商品 API
│   │   ├── report.js        # 报表 API
│   │   └── file.js          # 文件 API
│   ├── components/           # 组件
│   │   ├── Button.js        # 按钮组件
│   │   ├── Input.js         # 输入框组件
│   │   ├── Modal.js         # 模态框组件
│   │   └── Table.js         # 表格组件
│   ├── config/               # 配置文件
│   │   └── index.js         # 应用配置
│   ├── layouts/              # 布局组件
│   │   └── MainLayout.js    # 主布局
│   ├── pages/                # 页面组件
│   │   ├── Login.js         # 登录页
│   │   ├── Dashboard.js     # 仪表盘
│   │   └── NotFound.js      # 404 页面
│   ├── services/             # 业务服务
│   │   └── auth-service.js  # 认证服务
│   ├── styles/               # 样式文件
│   │   └── main.css         # 主样式
│   ├── utils/                # 工具函数
│   │   ├── error-handler.js # 错误处理
│   │   ├── format.js        # 格式化工具
│   │   ├── http.js          # HTTP 工具
│   │   ├── logger.js         # 日志工具
│   │   ├── router.js         # 路由工具
│   │   ├── storage.js        # 存储工具
│   │   ├── store.js          # 状态管理
│   │   └── validator.js      # 验证工具
│   ├── index.html            # HTML 模板
│   └── main.js               # 应用入口
├── public/                    # 静态资源
├── .eslintrc.cjs             # ESLint 配置
├── .prettierrc.json          # Prettier 配置
├── .editorconfig             # EditorConfig 配置
├── .gitignore                # Git 忽略文件
├── package.json              # 项目配置
├── vite.config.js            # Vite 配置
└── README.md                 # 项目文档
```

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0 或 yarn >= 1.22.0

### 安装依赖

```bash
npm install
# 或
yarn install
```

### 开发模式

```bash
npm run dev
# 或
yarn dev
```

应用将在 `http://localhost:3000` 启动

### 构建生产版本

```bash
npm run build
# 或
yarn build
```

构建产物将输出到 `dist/` 目录

### 预览生产构建

```bash
npm run preview
# 或
yarn preview
```

### 代码检查

```bash
# 检查代码
npm run lint

# 自动修复
npm run lint:fix
```

### 代码格式化

```bash
# 格式化代码
npm run format

# 检查格式
npm run format:check
```

## 📖 使用指南

### 路由使用

```javascript
import router from '@utils/router.js';
import { ROUTE_CONFIG } from '@config/index.js';

// 注册路由
router.addRoute('/users', UserPage, { requiresAuth: true });

// 导航
router.push('/users');
router.replace('/users');
router.back();
router.forward();

// 路由守卫
router.beforeEach((to, from) => {
  // 返回 false 阻止导航
  return true;
});
```

### 状态管理

```javascript
import store from '@utils/store.js';

// 获取状态
const state = store.getState();

// 设置状态
store.setState({ user: { name: 'John' } });

// 订阅状态变化
store.subscribe((newState, prevState) => {
  console.log('State changed', newState);
});

// 注册 mutation
store.registerMutation('SET_USER', (state, payload) => {
  return { user: payload };
});

// 提交 mutation
store.commit('SET_USER', { name: 'John' });

// 注册 action
store.registerAction('FETCH_USER', async ({ commit }, userId) => {
  const user = await fetchUser(userId);
  commit('SET_USER', user);
});

// 分发 action
await store.dispatch('FETCH_USER', '123');
```

### HTTP 请求

```javascript
import http from '@utils/http.js';

// GET 请求
const users = await http.get('/users', { page: 1, size: 10 });

// POST 请求
const user = await http.post('/users', { name: 'John' });

// PUT 请求
await http.put('/users/123', { name: 'Jane' });

// DELETE 请求
await http.delete('/users/123');

// 上传文件
await http.upload('/files/upload', file, {
  onUploadProgress: (percent) => {
    console.log(`Upload progress: ${percent}%`);
  }
});
```

### 组件使用

```javascript
import { Button } from '@components/Button.js';
import { Input } from '@components/Input.js';
import { Modal } from '@components/Modal.js';

// 创建按钮
const button = Button({
  text: '点击我',
  type: 'primary',
  onClick: () => console.log('Clicked')
});

// 创建输入框
const input = Input({
  placeholder: '请输入',
  onChange: (value) => console.log(value)
});

// 创建模态框
const modal = Modal({
  title: '确认',
  content: '确定要删除吗？',
  onConfirm: () => console.log('Confirmed')
});
document.body.appendChild(modal);
```

### 工具函数

```javascript
import { formatDate, formatNumber, formatCurrency } from '@utils/format.js';
import { validateEmail, validatePhone } from '@utils/validator.js';
import { localStore, sessionStore } from '@utils/storage.js';
import logger from '@utils/logger.js';

// 格式化
formatDate(new Date(), 'YYYY-MM-DD');
formatNumber(1234.56);
formatCurrency(1234.56, 'CNY');

// 验证
validateEmail('test@example.com');
validatePhone('13800138000');

// 存储
localStore.set('key', { data: 'value' });
const data = localStore.get('key');

// 日志
logger.info('Info message');
logger.error('Error message', error);
```

## 🔧 配置说明

### 环境变量

创建 `.env` 文件：

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

### API 配置

在 `src/config/index.js` 中配置 API 基础 URL 和其他配置项。

### 路由配置

在 `src/config/index.js` 中的 `ROUTE_CONFIG` 配置路由路径。

## 📝 开发规范

### 代码风格

- 使用 ESLint 和 Prettier 保持代码风格一致
- 遵循 ES6+ 语法规范
- 使用单引号
- 使用 2 空格缩进
- 行尾不使用分号（Prettier 会自动添加）

### 命名规范

- 文件名：使用 PascalCase（组件）或 camelCase（工具函数）
- 变量名：使用 camelCase
- 常量名：使用 UPPER_SNAKE_CASE
- 类名：使用 PascalCase

### 文件组织

- 按功能模块组织文件
- 每个模块应该有清晰的职责
- 公共工具函数放在 `utils/` 目录
- 业务逻辑放在 `services/` 目录
- 页面组件放在 `pages/` 目录

## 🐛 调试

### 浏览器控制台

应用在 `window.__APP__` 上暴露了以下对象供调试：

```javascript
// 路由
window.__APP__.router

// 状态管理
window.__APP__.store

// 认证服务
window.__APP__.authService

// 日志
window.__APP__.logger
```

### 日志查看

日志会自动记录到浏览器控制台和 localStorage，可以通过以下方式查看：

```javascript
// 查看存储的日志
window.__APP__.logger.getStoredLogs()

// 清空日志
window.__APP__.logger.clearStoredLogs()
```

## 📄 许可证

MIT License

## 👥 贡献

欢迎提交 Issue 和 Pull Request！

