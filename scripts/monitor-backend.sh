#!/bin/bash
echo "🔍 开始监控AipexBase后端服务..."
echo "监控开始时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================="
echo ""

attempts=0
max_attempts=20

while [ $attempts -lt $max_attempts ]; do
  attempts=$((attempts + 1))
  echo "[$attempts/$max_attempts] 尝试连接后端 - $(date '+%H:%M:%S')"
  
  # 测试API
  if curl -s -m 3 http://localhost:8080/admin/version > /dev/null 2>&1; then
    echo "✅ 后端API已启动！"
    echo ""
    echo "获取版本信息:"
    curl -s http://localhost:8080/admin/version | head -20
    echo ""
    echo "=========================================="
    echo "后端服务启动成功！总等待时间: $((attempts * 30))秒"
    exit 0
  fi
  
  # 显示最新日志
  echo "📋 最新日志:"
  docker logs --tail=5 aipexbase-backend 2>&1 | tail -3
  echo ""
  
  if [ $attempts -lt $max_attempts ]; then
    echo "⏳ 等待30秒后重试..."
    echo ""
    sleep 30
  fi
done

echo "⚠️ 监控超时: 经过 $((max_attempts * 30))秒 (约10分钟) 后端仍未就绪"
echo "建议: 检查Docker资源配置或查看详细日志"
