# 修复GitHub中文提交信息乱码问题

## 问题说明
在Windows PowerShell环境下，Git提交中文信息时可能会出现乱码问题，导致GitHub上显示为乱码。

## 根本原因
1. PowerShell默认编码不是UTF-8
2. Git在Windows上读取文件时可能使用系统默认编码（GBK）
3. 即使配置了`i18n.commitencoding=utf-8`，Git读取文件时仍可能使用错误编码

## 解决方案

### 方案1：使用Git Bash（推荐）

Git Bash在Windows上能正确处理UTF-8编码：

1. 打开Git Bash（在项目目录右键选择"Git Bash Here"）

2. 设置环境变量：
```bash
export LANG=zh_CN.UTF-8
export LC_ALL=zh_CN.UTF-8
```

3. 创建UTF-8编码的提交信息文件：
```bash
echo "你的中文提交信息" > commit_msg.txt
```

4. 提交：
```bash
git commit --amend -F commit_msg.txt
# 或新提交
git commit -F commit_msg.txt
```

5. 推送：
```bash
git push origin master --force
```

### 方案2：使用Git GUI工具

1. 打开Git GUI（在项目目录右键选择"Git GUI Here"）
2. 在提交信息框中直接输入中文
3. Git GUI会自动处理UTF-8编码

### 方案3：使用VSCode的Git功能

1. 在VSCode中打开项目
2. 使用VSCode的源代码管理面板提交
3. VSCode会自动使用UTF-8编码

### 方案4：使用PowerShell但确保编码正确

如果必须使用PowerShell，需要确保：

1. 创建UTF-8无BOM文件：
```powershell
$message = "你的中文提交信息"
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText("commit_msg.txt", $message, $utf8NoBom)
```

2. 设置环境变量并使用Git Bash执行：
```powershell
$env:LANG = "zh_CN.UTF-8"
$env:LC_ALL = "zh_CN.UTF-8"
# 然后使用Git Bash执行git命令
```

## 当前状态

由于PowerShell编码问题，最后一次提交已改为英文，确保GitHub上能正常显示：

```
Add log management module: implement operation log recording, query, export with Redis cache and scheduled cleanup; Optimize pagination: unify pagination style across all modules, remove page size selector from filter bar, integrate into pagination control; Fix MyBatis-Plus configuration; Add system startup log cache clearing
```

## 后续建议

1. **优先使用Git Bash**：对于包含中文的提交，建议使用Git Bash
2. **使用英文提交信息**：如果团队中有国际成员，使用英文提交信息更通用
3. **配置Git全局编码**：虽然不能完全解决问题，但仍建议配置：
   ```bash
   git config --global i18n.commitencoding utf-8
   git config --global i18n.logoutputencoding utf-8
   git config --global core.quotepath false
   ```

## 验证方法

提交后，在GitHub上查看提交记录，确认中文是否正常显示：
```
https://github.com/wpuing/AI-Practice-Catalog/commits/master
```

如果仍然显示乱码，说明提交信息在Git对象中就是以错误编码存储的，需要使用Git Bash重新提交。

