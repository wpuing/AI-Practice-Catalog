# 快速提交脚本
$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "添加所有文件到Git暂存区" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
git add -A

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "检查暂存区文件" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
git status --short

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "提交更改" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$commitMessage = @"
添加操作手册和截图，修复文档日期

主要更新：
1. 新增操作手册：创建OPERATION_MANUAL.md，包含详细使用说明和16个截图
2. 文档更新：修复所有文档日期为2025-11-09，修复图片路径确保GitHub正常显示
3. 代码清理：删除临时截图脚本和工具文件
"@

git commit -m $commitMessage

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "提交失败！" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "提交成功！准备推送到远程仓库" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "接下来请执行：git push origin master" -ForegroundColor Yellow
Write-Host ""

