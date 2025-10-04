#!/bin/bash
# 生产环境全面检查脚本

DOMAIN="${1:-https://aijiayuan.top}"

echo "=== 生产环境全面检查 ==="
echo "域名: $DOMAIN"
echo "时间: $(date)"
echo ""

# 1. 服务状态
echo "1. 服务状态:"
curl -s "$DOMAIN/api/health" 2>/dev/null | jq '{status: .status, uptime: .uptime, responseTime: .responseTime}' || echo "❌ 无法连接到健康检查端点"

# 2. 核心页面
echo -e "\n2. 核心页面:"
for page in / /marketplace /business-plan; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$DOMAIN$page" 2>/dev/null)
  [ "$code" = "200" ] && echo "✅ $page: $code" || echo "❌ $page: $code"
done

# 3. API端点
echo -e "\n3. API端点:"
for endpoint in /api/health /api/websocket-status; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$DOMAIN$endpoint" 2>/dev/null)
  [ "$code" = "200" ] && echo "✅ $endpoint: $code" || echo "❌ $endpoint: $code"
done

# 4. 安全头部
echo -e "\n4. 安全头部:"
curl -sI "$DOMAIN" 2>/dev/null | grep -E "(Strict-Transport-Security|X-Content-Type-Options|X-Frame-Options|X-XSS-Protection)" | sed 's/^/  /' || echo "  ⚠️ 无法获取安全头部"

# 5. 响应时间测试
echo -e "\n5. 响应时间测试(5次):"
for i in {1..5}; do
  time=$(curl -s -w "%{time_total}" -o /dev/null "$DOMAIN/api/health" 2>/dev/null)
  echo "  尝试 $i: ${time}s"
done

# 6. WebSocket状态
echo -e "\n6. WebSocket状态:"
curl -s "$DOMAIN/api/websocket-status" 2>/dev/null | jq '{running: .websocketServerRunning, connections: .activeConnections}' || echo "❌ 无法获取WebSocket状态"

# 7. 数据库检查
echo -e "\n7. 数据库状态:"
DB_STATUS=$(curl -s "$DOMAIN/api/health" 2>/dev/null | jq -r '.checks.database.status')
DB_LATENCY=$(curl -s "$DOMAIN/api/health" 2>/dev/null | jq -r '.checks.database.latency')
if [ "$DB_STATUS" = "healthy" ]; then
  echo "✅ 数据库健康 (延迟: ${DB_LATENCY}ms)"
else
  echo "❌ 数据库状态: $DB_STATUS"
fi

# 8. AI服务检查
echo -e "\n8. AI服务状态:"
AI_MSG=$(curl -s "$DOMAIN/api/health" 2>/dev/null | jq -r '.checks.aiServices.message')
echo "  $AI_MSG"

echo -e "\n=== 检查完成 ==="
