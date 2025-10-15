#!/bin/bash
# Production environment comprehensive check script

set -euo pipefail

DOMAIN="${1:-https://aijiayuan.top}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== Production Environment Check ==="
echo "Domain : $DOMAIN"
echo "Time   : $(date)"
echo ""

echo "1. Service Status:"
if command -v jq >/dev/null 2>&1; then
  curl -s "$DOMAIN/api/health" 2>/dev/null | jq '{status: .status, uptime: .uptime, responseTime: .responseTime}' || echo "  ⚠️  health endpoint unreachable"
else
  curl -s "$DOMAIN/api/health" 2>/dev/null || echo "  ⚠️  health endpoint unreachable"
fi

echo ""
echo "2. Core Pages:"
for page in / /marketplace /business-plan; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$DOMAIN$page" 2>/dev/null || echo "000")
  printf "  %s => %s\n" "$page" "$code"
done

echo ""
echo "3. API Endpoints:"
for endpoint in /api/health /api/websocket-status; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$DOMAIN$endpoint" 2>/dev/null || echo "000")
  printf "  %s => %s\n" "$endpoint" "$code"
done

echo ""
echo "4. Security Headers:"
curl -sI "$DOMAIN" 2>/dev/null | grep -E "(Strict-Transport-Security|X-Content-Type-Options|X-Frame-Options|X-XSS-Protection)" | sed 's/^/  /' || echo "  ⚠️  unable to fetch security headers"

echo ""
echo "5. Response Time (5 samples):"
for i in {1..5}; do
  time=$(curl -s -w "%{time_total}" -o /dev/null "$DOMAIN/api/health" 2>/dev/null || echo "0")
  printf "  Sample %d: %ss\n" "$i" "$time"
done

echo ""
echo "6. WebSocket Status:"
if command -v jq >/dev/null 2>&1; then
  curl -s "$DOMAIN/api/websocket-status" 2>/dev/null | jq '{running: .websocketServerRunning, connections: .activeConnections}' || echo "  ⚠️  unable to fetch WebSocket status"
else
  curl -s "$DOMAIN/api/websocket-status" 2>/dev/null || echo "  ⚠️  unable to fetch WebSocket status"
fi

echo ""
echo "7. Database Status:"
if command -v jq >/dev/null 2>&1; then
  DB_STATUS=$(curl -s "$DOMAIN/api/health" 2>/dev/null | jq -r '.checks.database.status')
  DB_LATENCY=$(curl -s "$DOMAIN/api/health" 2>/dev/null | jq -r '.checks.database.latency')
  if [ "$DB_STATUS" = "healthy" ]; then
    echo "  ✅ database healthy (latency: ${DB_LATENCY}ms)"
  else
    echo "  ⚠️  database status: ${DB_STATUS:-unknown}"
  fi
else
  echo "  ⚠️  install jq to display database metrics"
fi

echo ""
echo "8. AI Service Status:"
if command -v jq >/dev/null 2>&1; then
  AI_MSG=$(curl -s "$DOMAIN/api/health" 2>/dev/null | jq -r '.checks.aiServices.message')
  echo "  ${AI_MSG:-unavailable}"
else
  echo "  ⚠️  install jq to display AI service details"
fi

echo ""
echo "9. AI Marketplace Summary Check:"
if command -v node >/dev/null 2>&1; then
  node "$SCRIPT_DIR/ai-marketplace-checker.js" "$DOMAIN" --summary --no-save
else
  echo "  ⚠️  node executable not found; skip marketplace summary"
fi

echo ""
echo "=== Check Complete ==="
