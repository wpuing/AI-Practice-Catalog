#!/bin/bash

# 日志目录
LOG_DIR=./logs
mkdir -p $LOG_DIR

# JVM 参数
JVM_OPTS="-Xms512m -Xmx1024m \
  -XX:MetaspaceSize=256m \
  -XX:MaxMetaspaceSize=512m \
  -XX:+UseG1GC \
  -XX:MaxGCPauseMillis=200 \
  -XX:+HeapDumpOnOutOfMemoryError \
  -XX:HeapDumpPath=$LOG_DIR/heapdump.hprof \
  -Dfile.encoding=UTF-8 \
  -Duser.timezone=Asia/Shanghai"

# 检查 jar 文件是否存在
JAR_FILE="target/demo-app-1.0.0.jar"
if [ ! -f "$JAR_FILE" ]; then
    echo "错误: $JAR_FILE 不存在，请先执行 mvn clean package"
    exit 1
fi

# 启动应用
echo "正在启动应用..."
nohup java $JVM_OPTS \
  -jar $JAR_FILE \
  --logging.file.path=$LOG_DIR \
  --logging.file.name=$LOG_DIR/application.log \
  --logging.level.root=INFO \
  --logging.level.com.example.demospringboot=DEBUG \
  --logging.file.max-size=10MB \
  --logging.file.max-history=30 \
  > $LOG_DIR/console.log 2>&1 &

# 获取进程 ID
PID=$!

# 等待应用启动
sleep 3

# 检查进程是否还在运行
if ps -p $PID > /dev/null; then
    echo "========================================"
    echo "应用已启动成功！"
    echo "进程 ID: $PID"
    echo "日志文件: $LOG_DIR/application.log"
    echo "控制台输出: $LOG_DIR/console.log"
    echo "堆转储路径: $LOG_DIR/heapdump.hprof"
    echo "========================================"
    echo "查看日志: tail -f $LOG_DIR/application.log"
    echo "停止应用: kill $PID"
else
    echo "应用启动失败，请查看日志: $LOG_DIR/console.log"
    exit 1
fi

