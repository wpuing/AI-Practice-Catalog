# 修复Git提交信息编码的脚本
# 使用Git Bash或直接操作Git对象

$message = "新增日志管理模块：实现操作日志的记录、查询、导出功能，支持Redis缓存和定时清理；优化分页控件：统一所有模块的分页样式，移除查询栏中的每页显示选择器，集成到分页控件中；修复MyBatis-Plus配置；添加系统启动时清除日志缓存功能"

# 创建UTF-8无BOM文件
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
$tempFile = Join-Path $PSScriptRoot "commit_msg_utf8.txt"
[System.IO.File]::WriteAllText($tempFile, $message, $utf8NoBom)

Write-Host "已创建提交信息文件: $tempFile"
Write-Host "文件内容:"
Get-Content $tempFile -Encoding UTF8
Write-Host ""

# 设置环境变量
$env:LANG = "zh_CN.UTF-8"
$env:LC_ALL = "zh_CN.UTF-8"
$env:GIT_COMMITTER_NAME = git config user.name
$env:GIT_COMMITTER_EMAIL = git config user.email

# 使用git commit -F
Write-Host "正在修改提交信息..."
git commit --amend -F $tempFile

# 验证
Write-Host "`n验证提交信息（原始字节）:"
git cat-file commit HEAD | Select-String -Pattern "^    " | Select-Object -First 1

# 清理
Remove-Item $tempFile -ErrorAction SilentlyContinue

Write-Host "`n完成！请检查GitHub上的显示。"

