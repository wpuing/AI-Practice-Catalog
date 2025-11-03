@echo off
setlocal enabledelayedexpansion

set LOG_DIR=logs
if not exist %LOG_DIR% mkdir %LOG_DIR%

set JVM_OPTS=-Xms512m -Xmx1024m -XX:MetaspaceSize=256m -XX:MaxMetaspaceSize=512m -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=%LOG_DIR%\heapdump.hprof -Dfile.encoding=UTF-8 -Duser.timezone=Asia/Shanghai

set JAR_FILE=target\demo-app-1.0.0.jar
if not exist %JAR_FILE% (
    echo 错误: %JAR_FILE% 不存在，请先执行 mvn clean package
    pause
    exit /b 1
)

echo 正在启动应用...
start /b java %JVM_OPTS% -jar %JAR_FILE% --logging.file.path=%LOG_DIR% --logging.file.name=%LOG_DIR%\application.log --logging.level.root=INFO --logging.level.com.example.demo=DEBUG --logging.file.max-size=10MB --logging.file.max-history=30 > %LOG_DIR%\console.log 2>&1

timeout /t 3 /nobreak > nul

echo ========================================
echo 应用已启动！
echo 日志文件: %LOG_DIR%\application.log
echo 控制台输出: %LOG_DIR%\console.log
echo 堆转储路径: %LOG_DIR%\heapdump.hprof
echo ========================================
echo 查看日志: type %LOG_DIR%\application.log
pause

