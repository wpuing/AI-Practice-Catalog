# Git提交中文信息指南

## 问题说明
在Windows PowerShell环境下，Git提交中文信息时可能会出现乱码问题。这通常是由于终端编码和Git编码配置不一致导致的。

## 解决方案

### 1. 永久配置Git编码（推荐）

执行以下命令配置Git全局编码：

```powershell
git config --global i18n.commitencoding utf-8
git config --global i18n.logoutputencoding utf-8
git config --global core.quotepath false
git config --global gui.encoding utf-8
```

### 2. 使用提供的脚本（推荐）

项目根目录提供了 `.git-commit-utf8.ps1` 脚本，确保提交信息使用UTF-8编码：

**普通提交：**
```powershell
.\.git-commit-utf8.ps1 -Message "你的提交信息"
```

**修改最后一次提交：**
```powershell
.\.git-commit-utf8.ps1 -Message "你的提交信息" -Amend
```

### 3. 使用文件方式提交（备选方案）

如果脚本不可用，可以使用文件方式：

1. 创建提交信息文件（UTF-8编码）：
```powershell
$message = "你的提交信息"
$message | Out-File -FilePath commit_message.txt -Encoding UTF8
```

2. 使用文件提交：
```powershell
git commit -F commit_message.txt
# 或修改最后一次提交
git commit --amend -F commit_message.txt
```

3. 删除临时文件：
```powershell
Remove-Item commit_message.txt
```

### 4. 验证提交信息

提交后，可以通过以下方式验证：

```powershell
# 查看最后一次提交信息
git log -1 --pretty=format:"%s" HEAD

# 查看完整提交信息
git log -1
```

## 注意事项

1. **PowerShell显示乱码**：PowerShell终端显示乱码是正常的，这不影响GitHub上的显示。GitHub会正确显示UTF-8编码的中文。

2. **强制推送**：如果修改了已推送的提交信息，需要使用 `git push --force`，请谨慎使用。

3. **团队协作**：如果团队中有其他成员，建议统一使用UTF-8编码配置。

## 当前配置状态

执行以下命令查看当前Git编码配置：

```powershell
git config --global --list | Select-String -Pattern "i18n|encoding|quotepath"
```

应该看到：
```
core.quotepath=false
i18n.commitencoding=utf-8
i18n.logoutputencoding=utf-8
gui.encoding=utf-8
```

## 常见问题

**Q: 为什么PowerShell显示乱码？**
A: 这是PowerShell终端的编码显示问题，不影响实际提交。GitHub上会正确显示。

**Q: 如何修复已推送的乱码提交？**
A: 使用脚本或文件方式重新提交，然后强制推送：
```powershell
.\.git-commit-utf8.ps1 -Message "正确的提交信息" -Amend
git push --force
```

**Q: 是否每次都要使用脚本？**
A: 配置好全局编码后，可以直接使用 `git commit -m "信息"`，但使用脚本更保险。

