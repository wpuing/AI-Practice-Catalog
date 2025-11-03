# GitHub上传指南

## ✅ 已完成的工作

1. ✅ 创建了 `.gitignore` 文件，已配置忽略以下内容：
   - `.idea/` - IntelliJ IDEA配置
   - `target/` - Maven构建输出
   - `.gitignore` 文件本身已经在仓库中（用于项目级配置）
   - 其他IDE配置文件和临时文件

2. ✅ 初始化了Git仓库
3. ✅ 添加了所有文件到暂存区（.gitignore已自动排除不需要的文件）
4. ✅ 创建了初始提交（122个文件已提交）

## 📋 上传到GitHub的步骤

### 方法一：使用GitHub Web界面创建仓库后推送

1. **在GitHub上创建新仓库**
   - 访问 https://github.com/new
   - 填写仓库名称（例如：`AI-Practice-Catalog`）
   - 选择 **Public** 或 **Private**
   - **不要**勾选 "Initialize this repository with a README"（因为我们已经有文件了）
   - 点击 "Create repository"

2. **添加远程仓库并推送**
   ```bash
   cd d:\code\cursor\test-project\AI-Practice-Catalog
   
   # 添加远程仓库（替换<your-username>和<repo-name>）
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   
   # 或者使用SSH（推荐）
   git remote add origin git@github.com:<your-username>/<repo-name>.git
   
   # 推送到GitHub（如果GitHub仓库默认分支是main）
   git branch -M main
   git push -u origin main
   
   # 或者如果GitHub仓库默认分支是master
   git push -u origin master
   ```

### 方法二：使用GitHub CLI（如果已安装）

```bash
cd d:\code\cursor\test-project\AI-Practice-Catalog

# 创建并推送仓库（需要先登录：gh auth login）
gh repo create AI-Practice-Catalog --public --source=. --remote=origin --push
```

## 🔍 验证已忽略的文件

运行以下命令确认 `.idea` 和 `target` 等目录已被正确忽略：

```bash
# 查看被忽略的文件
git status --ignored

# 确认特定目录是否被忽略
git check-ignore -v template-project/demo-app/target
git check-ignore -v .idea
```

**当前已被忽略的目录**：
- `template-project/demo-app/.idea/`
- `template-project/demo-app/target/`

## 📝 .gitignore配置说明

当前的 `.gitignore` 文件已配置忽略：

- **IDE配置**: `.idea/`, `.vscode/`, `*.iml`, `*.iws`, `*.ipr`
- **构建输出**: `target/`, `build/`, `out/`, `bin/`, `*.jar`, `*.war`
- **日志文件**: `logs/`, `*.log`
- **操作系统文件**: `.DS_Store`, `Thumbs.db`
- **Maven文件**: `.mvn/`, `mvnw`
- **临时文件**: `*.tmp`, `*.bak`, `*.cache`

## ⚠️ 注意事项

1. **分支名称**：GitHub默认分支可能是 `main` 或 `master`，根据你的GitHub设置选择
2. **认证方式**：
   - HTTPS：需要输入用户名和Personal Access Token（推荐）
   - SSH：需要配置SSH密钥
3. **首次推送**：如果遇到认证问题，请确保已配置Git凭证或SSH密钥

## 🔗 有用的命令

```bash
# 查看当前远程仓库
git remote -v

# 更改远程仓库URL
git remote set-url origin <new-url>

# 查看提交历史
git log --oneline

# 查看被跟踪的文件
git ls-files

# 查看被忽略的文件
git status --ignored
```

## 📦 后续维护

上传完成后，如果需要更新代码：

```bash
# 添加更改
git add .

# 提交更改
git commit -m "描述你的更改"

# 推送到GitHub
git push origin main  # 或 master
```

---

**提示**：如果遇到任何问题，请检查Git配置和GitHub认证设置。
