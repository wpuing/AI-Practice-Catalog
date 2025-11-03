# 前端项目测试指南

## 测试步骤

### 1. 启动后端服务

确保Spring Boot后端服务运行在 `http://localhost:8081`

### 2. 打开前端页面

使用浏览器打开 `index.html` 或使用HTTP服务器：

```bash
# Python 3
python -m http.server 8000

# Node.js
npx http-server -p 8000
```

### 3. 功能测试清单

#### 认证功能
- [ ] 用户注册
- [ ] 用户登录
- [ ] Token自动保存
- [ ] 未登录访问主页自动跳转登录
- [ ] 退出登录

#### 用户管理
- [ ] 查看用户列表
- [ ] 创建新用户
- [ ] 编辑用户信息
- [ ] 删除用户
- [ ] 分页功能

#### 商品类型管理
- [ ] 查看商品类型列表
- [ ] 创建商品类型
- [ ] 编辑商品类型
- [ ] 删除商品类型
- [ ] 启用/禁用商品类型
- [ ] 搜索商品类型

#### 商品管理
- [ ] 查看商品列表
- [ ] 创建商品
- [ ] 编辑商品
- [ ] 删除商品
- [ ] 更新库存
- [ ] 启用/禁用商品
- [ ] 按类型筛选商品

#### 管理员功能（需要ADMIN角色）
- [ ] 查看角色列表
- [ ] 创建/编辑/删除角色
- [ ] 查看白名单列表
- [ ] 管理白名单
- [ ] 查看权限列表
- [ ] 管理权限
- [ ] 查看Redis信息

#### 接口测试
- [ ] 运行所有测试
- [ ] 查看测试结果
- [ ] 验证所有接口正常

#### 控制台
- [ ] 查看统计信息
- [ ] 数据正确显示

## 常见问题

### 1. CORS跨域问题

如果遇到CORS错误，需要在后端添加CORS配置：

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:8000")
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

### 2. Token失效

- 检查Token是否正确保存到localStorage
- 检查请求头是否包含Authorization
- 检查后端Token验证逻辑

### 3. 接口调用失败

- 检查后端服务是否正常运行
- 检查API_BASE_URL是否正确
- 查看浏览器控制台错误信息
- 使用接口测试工具验证接口

## 测试账号

- **管理员**: admin / 123456
- 或注册新账号进行测试

## 测试报告

测试完成后，记录：
- 通过的功能
- 发现的问题
- 需要优化的地方

