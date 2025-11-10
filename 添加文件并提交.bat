@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo 添加操作手册和截图文件到Git
echo ========================================
echo.

echo [1/4] 添加操作手册文件...
git add template-project/OPERATION_MANUAL.md
if %errorlevel% neq 0 (
    echo 错误：添加操作手册失败
    pause
    exit /b 1
)
echo ✓ 操作手册已添加

echo.
echo [2/4] 添加截图文件...
git add template-project/screenshots/*.png
if %errorlevel% neq 0 (
    echo 错误：添加截图文件失败
    pause
    exit /b 1
)
echo ✓ 截图文件已添加

echo.
echo [3/4] 添加截图README文件...
git add template-project/screenshots/README.md
if %errorlevel% neq 0 (
    echo 错误：添加截图README失败
    pause
    exit /b 1
)
echo ✓ 截图README已添加

echo.
echo [4/4] 添加其他修改的文件...
git add -A
if %errorlevel% neq 0 (
    echo 错误：添加其他文件失败
    pause
    exit /b 1
)
echo ✓ 其他文件已添加

echo.
echo ========================================
echo 检查暂存区文件
echo ========================================
git status --short

echo.
echo ========================================
echo 文件添加完成！
echo ========================================
echo.
echo 接下来请执行：
echo   git commit -F COMMIT_MSG.txt
echo   git push origin master
echo.
pause

