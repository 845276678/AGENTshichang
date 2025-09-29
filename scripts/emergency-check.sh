#!/bin/bash
# 紧急回滚脚本

echo "🚨 检测到生产环境502错误，开始紧急诊断..."

# 1. 检查基础连通性
echo "1. 检查DNS解析..."
nslookup aijiayuan.top

# 2. 检查HTTP响应
echo "2. 检查HTTP状态..."
curl -I https://aijiayuan.top

# 3. 检查健康端点
echo "3. 尝试健康检查..."
curl -v https://aijiayuan.top/api/health

# 4. 检查WebSocket端点
echo "4. 检查WebSocket..."
curl -v -H "Connection: Upgrade" -H "Upgrade: websocket" https://aijiayuan.top/api/bidding/test

echo "🔧 如果以上都失败，请检查Zeabur控制台的部署日志"
echo "💡 可能需要手动重启服务或回滚到上一个版本"