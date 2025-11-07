# Git 编码配置脚本
# 运行此脚本以配置 Git 和 PowerShell 使用 UTF-8 编码，避免中文乱码问题

Write-Host "正在配置 Git 编码设置..." -ForegroundColor Green

# 1. 设置 Git 全局配置
Write-Host "`n1. 配置 Git 全局编码设置..." -ForegroundColor Yellow
git config --global core.quotepath false
git config --global i18n.commitencoding utf-8
git config --global i18n.logoutputencoding utf-8
git config --global gui.encoding utf-8

# 2. 设置 PowerShell 编码
Write-Host "`n2. 配置 PowerShell 编码..." -ForegroundColor Yellow
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# 3. 设置控制台代码页
Write-Host "`n3. 设置控制台代码页为 UTF-8..." -ForegroundColor Yellow
chcp 65001 | Out-Null

# 4. 设置环境变量
Write-Host "`n4. 设置环境变量..." -ForegroundColor Yellow
$env:LANG = "zh_CN.UTF-8"
$env:LC_ALL = "zh_CN.UTF-8"

# 5. 验证配置
Write-Host "`n5. 验证配置..." -ForegroundColor Yellow
Write-Host "`n当前 Git 编码配置：" -ForegroundColor Cyan
git config --global --get-regexp "encoding|i18n|quotepath"

Write-Host "`n当前控制台代码页：" -ForegroundColor Cyan
chcp

Write-Host "`n配置完成！" -ForegroundColor Green
Write-Host "`n提示：" -ForegroundColor Yellow
Write-Host "  - 这些设置仅在当前 PowerShell 会话中有效" -ForegroundColor Gray
Write-Host "  - 如需永久生效，请将编码设置添加到 PowerShell 配置文件（`$PROFILE）" -ForegroundColor Gray
Write-Host "  - 或者每次使用 Git 前运行此脚本" -ForegroundColor Gray

# 测试中文显示
Write-Host "`n测试中文显示：" -ForegroundColor Cyan
Write-Host "  你好，世界！" -ForegroundColor Green
Write-Host "  测试中文编码: Git 提交信息编码修复" -ForegroundColor Green

