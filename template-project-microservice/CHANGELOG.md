# 更新日志

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

### 3. 前端HTTP请求优化
- 添加`credentials: 'include'`确保携带认证信息
- 优化401错误处理，避免浏览器弹出基本认证框
- 改进错误响应处理逻辑

### 4. 登录流程优化
- 优化登录成功后的跳转逻辑，添加延迟确保状态更新
- 改进错误处理和用户反馈

### 5. Vite代理配置修复
- 修复代理配置，保持`/api`前缀（与Gateway路由配置一致）

## 修改的文件

### 前端 (template-project-frontend)
- `src/pages/Login.js`: 登录页面重构
- `src/services/auth-service.js`: 认证服务优化
- `src/utils/http.js`: HTTP请求优化
- `src/utils/router.js`: 路由优化
- `src/styles/main.css`: 移除登录样式（已拆分）
- `vite.config.js`: 代理配置修复
- `src/main.js`: 样式导入更新
- `src/layouts/MainLayout.js`: 布局优化
- `src/pages/Home.js`: 首页优化

### 后端 (template-project-cloud)
- `cloud-gateway/gateway-service/src/main/java/com/example/gateway/config/SecurityConfig.java`: 新增安全配置
- `cloud-gateway/gateway-service/src/main/java/com/example/gateway/config/CorsConfig.java`: CORS配置更新
- `cloud-gateway/gateway-service/src/main/java/com/example/gateway/filter/RemoveWWWAuthenticateFilter.java`: 新增过滤器
- `docs/nacos-configs/gateway-service.yml`: Nacos配置更新

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

## 统计信息
- 修改文件: 10个
- 新增文件: 11个
- 代码变更: +1342行, -308行

## 注意事项
- 需要重启Gateway服务使配置生效
- 需要更新Nacos配置中心的`gateway-service.yml`
- 前端样式已完全模块化，便于维护

