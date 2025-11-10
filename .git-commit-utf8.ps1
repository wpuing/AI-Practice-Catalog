# Git提交脚本 - 确保UTF-8编码
# 使用方法: .\.git-commit-utf8.ps1 -Message "提交信息"

param(
    [Parameter(Mandatory=$true)]
    [string]$Message,
    
    [switch]$Amend
)

# 设置控制台编码为UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# 设置Git环境变量
$env:GIT_COMMITTER_NAME = git config user.name
$env:GIT_COMMITTER_EMAIL = git config user.email

# 创建临时文件存储提交信息（UTF-8编码）
$tempFile = [System.IO.Path]::GetTempFileName()
[System.IO.File]::WriteAllText($tempFile, $Message, [System.Text.Encoding]::UTF8)

try {
    if ($Amend) {
        git commit --amend -F $tempFile
    } else {
        git commit -F $tempFile
    }
} finally {
    # 清理临时文件
    Remove-Item $tempFile -ErrorAction SilentlyContinue
}

