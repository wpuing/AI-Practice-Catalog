# Git 编码问题修复指南

## 问题描述
Git 提交信息在 GitHub 上显示为乱码，通常是由于编码配置不正确导致的。

## 根本原因
1. Windows PowerShell 默认编码可能不是 UTF-8
2. Git 的 i18n 配置未正确设置
3. 控制台代码页未设置为 UTF-8

## 已应用的修复方案

### 1. Git 全局配置
已配置以下 Git 全局设置：
```bash
git config --global core.quotepath false          # 禁用路径引用，避免中文路径乱码
git config --global i18n.commitencoding utf-8    # 提交信息使用 UTF-8 编码
git config --global i18n.logoutputencoding utf-8 # 日志输出使用 UTF-8 编码
git config --global gui.encoding utf-8            # GUI 使用 UTF-8 编码
```

### 2. PowerShell 编码设置
在 PowerShell 中执行以下命令设置编码：
```powershell
# 设置控制台代码页为 UTF-8
chcp 65001

# 设置 PowerShell 编码
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# 设置环境变量
$env:LANG = "zh_CN.UTF-8"
$env:LC_ALL = "zh_CN.UTF-8"
```

### 3. 验证配置
检查 Git 配置是否生效：
```bash
git config --global --get-regexp "encoding|i18n|quotepath"
```

应该看到：
```
core.quotepath false
i18n.commitencoding utf-8
i18n.logoutputencoding utf-8
gui.encoding utf-8
```

## 预防措施

### 方案 1：在 PowerShell 配置文件中设置（推荐）
编辑 PowerShell 配置文件（`$PROFILE`），添加以下内容：
```powershell
# Git 编码设置
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null
$env:LANG = "zh_CN.UTF-8"
$env:LC_ALL = "zh_CN.UTF-8"
```

### 方案 2：使用 Git Bash 代替 PowerShell
Git Bash 默认使用 UTF-8 编码，可以避免编码问题。

### 方案 3：在提交前检查编码
提交前可以测试中文显示：
```bash
# 测试中文输出
echo "测试中文：你好世界" | git commit -F -
```

## 如果仍然出现乱码

1. **检查系统区域设置**：
   - 控制面板 → 区域 → 管理 → 更改系统区域设置
   - 确保已启用 "Beta: 使用 Unicode UTF-8 提供全球语言支持"

2. **使用 Git Bash**：
   - 在 Git Bash 中执行 Git 操作，默认使用 UTF-8

3. **提交时指定编码**：
   ```bash
   git -c i18n.commitencoding=utf-8 commit -m "你的中文提交信息"
   ```

4. **修改已提交的乱码信息**：
   ```bash
   # 修改最后一次提交信息
   git commit --amend -m "正确的中文提交信息"
   git push --force origin master
   ```

## 注意事项

- 修改已推送的提交信息需要使用 `--force`，请谨慎操作
- 如果是在团队协作中，修改提交历史前需要与团队成员沟通
- 建议在提交前先测试中文显示是否正常

## 相关资源

- [Git 官方文档 - 编码配置](https://git-scm.com/book/zh/v2/自定义-Git-配置-Git)
- [Windows UTF-8 支持](https://docs.microsoft.com/zh-cn/windows/apps/design/globalizing/use-utf8-code-page)

