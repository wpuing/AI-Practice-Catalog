# 更新日志

## [2025-11-15] 管理页面优化和文件服务改进

### 前端优化
- 隐藏所有管理列表的ID列（商品、用户、报表、文件管理）
- 修复商品管理列表分类显示ID问题，改为显示分类名称或"-"
- 优化文件管理页面，移除前端查询用户名的逻辑，直接使用后端返回的用户名

### 后端改进
- 文件服务添加Feign客户端支持，通过UserFeignClient调用用户服务获取用户名
- 改进FileService错误处理，即使用户服务调用失败也不影响文件列表返回
- 添加UserFeignClient接口，支持通过用户ID查询用户信息
- 更新文件服务数据初始化脚本，使用user_info表的用户ID
- 添加完整的服务层实现（DFS、Product、Report、User服务）

### 数据库脚本
- 添加update-file-user-to-admin.sql脚本，用于批量更新文件的上传用户ID

## 主要更新内容

### 1. 登录页面重构和样式拆分
- 将登录页面样式拆分为多个模块化文件：
  * `login-base.css`: 基础布局样式
  * `login-background.css`: 背景特效样式
  * `login-cube.css`: 3D立方体样式
  * `login-code-rain.css`: 代码雨特效样式
  * `login-circuit.css`: 电路图背景样式
  * `login-form.css`: 表单样式
  * `login-footer.css`: 页脚样式
  * `index.css`: 样式入口文件
- 将登录相关JavaScript逻辑拆分为组件：
  * `ThemeManager.js`: 主题管理
  * `CubeAnimation.js`: 立方体动画
  * `CodeRain.js`: 代码雨效果
- 更新版权年份为2025
- 将版权信息移至页面底部

### 2. Gateway CORS和安全配置修复
- 修复CORS配置：明确指定允许的来源（localhost:3000, 3001, 5173）
- 禁用HTTP Basic Authentication，避免浏览器弹出基本认证框
- 添加`RemoveWWWAuthenticateFilter`全局过滤器，移除响应中的`WWW-Authenticate`头
- 更新Nacos配置，添加3001端口支持
- 设置Security配置优先级为`@Order(-1)`，确保在其他Security配置之前生效
- 添加日志记录，便于调试Security配置

### 2.1. Auth Service安全配置修复
- 添加`SecurityFilterChain`配置，禁用CSRF保护
- 禁用HTTP Basic Authentication和表单登录
- 配置`/api/auth/**`路径为公开访问，无需认证

### 3. 前端HTTP请求优化
- 添加`credentials: 'include'`确保携带认证信息
- 优化401错误处理，避免浏览器弹出基本认证框
- 改进错误响应处理逻辑
- 增强403错误日志，输出响应头、响应体等详细信息，便于调试

### 4. 登录流程优化
- 优化登录成功后的跳转逻辑，添加延迟确保状态更新
- 改进错误处理和用户反馈

### 5. Vite代理配置修复
- 修复代理配置，保持`/api`前缀（与Gateway路由配置一致）

### 6. 数据库密码配置更新
- 更新所有服务的数据库密码为 `123456`
- 更新的配置文件：
  * `auth-service.yml`
  * `user-service.yml`
  * `product-service.yml`
  * `report-service.yml`
  * `dfs-service.yml`
  * `README.md` (文档)

### 7. 数据库初始化脚本和密码工具
- 创建 `init-admin.sql` 脚本，用于初始化或更新 admin 用户
- 创建 `PasswordGenerator.java` 工具类，用于生成 BCrypt 密码哈希
- 添加密码验证调试日志，便于排查登录问题

### 8. 前端路由和页面组件补充
- 创建用户管理页面 (`UserManagement.js`)
- 创建商品管理页面 (`ProductManagement.js`)
- 创建报表管理页面 (`ReportManagement.js`)
- 创建文件管理页面 (`FileManagement.js`)
- 在 `main.js` 中注册所有管理页面的路由
- 修复导航菜单点击404的问题

## 修改的文件

### 前端 (template-project-frontend)
- `src/pages/Login.js`: 登录页面重构
- `src/services/auth-service.js`: 认证服务优化
- `src/utils/http.js`: HTTP请求优化
- `src/utils/router.js`: 路由优化
- `src/styles/main.css`: 移除登录样式（已拆分）
- `vite.config.js`: 代理配置修复
- `src/main.js`: 样式导入更新，添加管理页面路由注册
- `src/layouts/MainLayout.js`: 布局优化
- `src/pages/Home.js`: 首页优化
- `src/pages/UserManagement.js`: 新增用户管理页面
- `src/pages/ProductManagement.js`: 新增商品管理页面
- `src/pages/ReportManagement.js`: 新增报表管理页面
- `src/pages/FileManagement.js`: 新增文件管理页面

### 后端 (template-project-cloud)
- `cloud-gateway/gateway-service/src/main/java/com/example/gateway/config/SecurityConfig.java`: 新增安全配置
- `cloud-gateway/gateway-service/src/main/java/com/example/gateway/config/CorsConfig.java`: CORS配置更新
- `cloud-gateway/gateway-service/src/main/java/com/example/gateway/filter/RemoveWWWAuthenticateFilter.java`: 新增过滤器
- `cloud-auth/auth-service/src/main/java/com/example/auth/infrastructure/config/SecurityConfig.java`: 新增安全配置，禁用CSRF
- `docs/nacos-configs/gateway-service.yml`: Nacos配置更新
- `docs/nacos-configs/auth-service.yml`: 数据库密码更新为 123456
- `docs/nacos-configs/user-service.yml`: 数据库密码更新为 123456
- `docs/nacos-configs/product-service.yml`: 数据库密码更新为 123456
- `docs/nacos-configs/report-service.yml`: 数据库密码更新为 123456
- `docs/nacos-configs/dfs-service.yml`: 数据库密码更新为 123456
- `docs/nacos-configs/README.md`: 文档更新

## 新增的文件

### 前端样式模块 (src/styles/login/)
- `login-base.css`
- `login-background.css`
- `login-cube.css`
- `login-code-rain.css`
- `login-circuit.css`
- `login-form.css`
- `login-footer.css`
- `index.css`

### 前端组件模块 (src/components/login/)
- `ThemeManager.js`
- `CubeAnimation.js`
- `CodeRain.js`

### 后端Gateway配置
- `SecurityConfig.java`
- `RemoveWWWAuthenticateFilter.java`

### 后端Auth Service工具
- `PasswordGenerator.java`: BCrypt密码生成工具
- `db/init-admin.sql`: Admin用户初始化脚本
- `db/update-admin-password.sql`: Admin密码更新脚本
- `db/fix-admin-password.sql`: Admin密码修复脚本
- `AuthService.java`: 添加密码验证调试日志

### 后端服务层实现
- DFS服务：FileDTO、FileService、FileController等完整实现
- Product服务：ProductDTO、ProductService、ProductController等完整实现
- Report服务：ReportDTO、ReportService、ReportController等完整实现
- User服务：UserDTO、UserService、UserController等完整实现
- 前端服务层：file-service.js、product-service.js、report-service.js、user-service.js

## 统计信息
- 修改文件: 57个
- 新增文件: 46个
- 代码变更: +4404行, -5行

## 注意事项
- **需要重启Gateway服务和Auth Service使配置生效**
- **重要：需要在Nacos配置中心更新所有服务的数据库密码为 `123456`**
  - `auth-service.yml`
  - `user-service.yml`
  - `product-service.yml`
  - `report-service.yml`
  - `dfs-service.yml`
- **如果登录时提示"用户名或密码错误"，请执行以下操作：**
  1. 执行 `db/init-admin.sql` 脚本初始化 admin 用户
  2. 或者运行 `PasswordGenerator.java` 生成新的 BCrypt 密码哈希，然后更新数据库
- 前端样式已完全模块化，便于维护
