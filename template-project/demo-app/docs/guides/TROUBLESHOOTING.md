# 故障排查指南

## factoryBeanObjectType 错误解决方案

### 已完成的修复

1. ✅ Spring Boot 版本：降级到 `3.1.5`（更稳定的版本）
2. ✅ MyBatis-Plus：使用 `mybatis-plus-spring-boot3-starter:3.5.7`
3. ✅ mybatis-spring：显式指定 `3.0.3` 版本
4. ✅ 依赖检查：确认最终使用的是 `mybatis-spring:3.0.3`

### 如果问题仍然存在，请按以下步骤操作

#### 1. 清理 Maven 本地仓库缓存

```bash
# 删除本地仓库中的 MyBatis 相关缓存
rm -rf ~/.m2/repository/com/baomidou/mybatis-plus*
rm -rf ~/.m2/repository/org/mybatis/mybatis-spring*
```

或者在 Windows PowerShell 中：
```powershell
Remove-Item -Recurse -Force $env:USERPROFILE\.m2\repository\com\baomidou\mybatis-plus* -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force $env:USERPROFILE\.m2\repository\org\mybatis\mybatis-spring* -ErrorAction SilentlyContinue
```

#### 2. 在 IDEA 中执行以下操作

1. **File** → **Invalidate Caches / Restart...**
   - 选择 **Invalidate and Restart**
   - 等待 IDEA 重启

2. **Maven 刷新**
   - 右键项目 → **Maven** → **Reload Project**
   - 或者在 Maven 工具窗口中点击刷新按钮

3. **重新导入项目**
   - **File** → **Project Structure**
   - 检查 **Project SDK** 是否为 **Java 21**
   - 检查 **Project language level** 是否为 **21**

4. **清理并重新构建**
   - **Build** → **Rebuild Project**
   - 或在终端执行：`mvn clean install -DskipTests`

#### 3. 验证依赖版本

在 IDEA 终端中执行：
```bash
mvn dependency:tree | findstr mybatis-spring
```

应该看到：
```
org.mybatis:mybatis-spring:jar:3.0.3:compile
```

#### 4. 检查项目设置

确保 IDEA 使用的是项目中的 Maven，而不是内置的：
- **File** → **Settings** → **Build, Execution, Deployment** → **Build Tools** → **Maven**
- **Maven home path**：使用项目中的 Maven 或系统安装的 Maven
- **User settings file**：确保指向正确的 settings.xml

#### 5. 如果以上都不行

尝试手动删除 IDEA 的工作空间缓存：
- 关闭 IDEA
- 删除项目下的 `.idea` 文件夹
- 重新打开项目，让 IDEA 重新导入

### 验证修复

修复成功后，应该能够正常启动应用，不再出现 `factoryBeanObjectType` 错误。

