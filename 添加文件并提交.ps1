# 添加操作手册和截图文件到Git
$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "添加操作手册和截图文件到Git" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/4] 添加操作手册文件..." -ForegroundColor Yellow
git add template-project/OPERATION_MANUAL.md
if ($LASTEXITCODE -ne 0) {
    Write-Host "错误：添加操作手册失败" -ForegroundColor Red
    exit 1
}
Write-Host "✓ 操作手册已添加" -ForegroundColor Green

Write-Host ""
Write-Host "[2/4] 添加截图文件..." -ForegroundColor Yellow
git add template-project/screenshots/*.png
if ($LASTEXITCODE -ne 0) {
    Write-Host "错误：添加截图文件失败" -ForegroundColor Red
    exit 1
}
Write-Host "✓ 截图文件已添加" -ForegroundColor Green

Write-Host ""
Write-Host "[3/4] 添加截图README文件..." -ForegroundColor Yellow
git add template-project/screenshots/README.md
if ($LASTEXITCODE -ne 0) {
    Write-Host "错误：添加截图README失败" -ForegroundColor Red
    exit 1
}
Write-Host "✓ 截图README已添加" -ForegroundColor Green

Write-Host ""
Write-Host "[4/4] 添加其他修改的文件..." -ForegroundColor Yellow
git add -A
if ($LASTEXITCODE -ne 0) {
    Write-Host "错误：添加其他文件失败" -ForegroundColor Red
    exit 1
}
Write-Host "✓ 其他文件已添加" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "检查暂存区文件" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
git status --short

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "文件添加完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "接下来请执行：" -ForegroundColor Yellow
Write-Host "  git commit -F COMMIT_MSG.txt" -ForegroundColor White
Write-Host "  git push origin master" -ForegroundColor White
Write-Host ""

