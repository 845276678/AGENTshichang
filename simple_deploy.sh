#!/bin/bash

# AI创意竞价平台简单部署脚本 (HTTP Only)
# 适用于没有SSL证书的情况

set -e

echo "🚀 开始HTTP部署AI创意竞价平台..."

# 确保在正确的目录
cd /home/ubuntu/project-68d4f29defadf4d878ac0583

# 停止旧服务
pm2 stop aijiayuan-app 2>/dev/null || true
pm2 delete aijiayuan-app 2>/dev/null || true

# 启动新服务
pm2 start npm --name "aijiayuan-app" -- start
pm2 save

# 简化的Nginx配置 (仅HTTP)
sudo tee /etc/nginx/sites-available/aijiayuan.top > /dev/null << 'EOF'
server {
    listen 80;
    server_name www.aijiayuan.top aijiayuan.top 139.155.232.19;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }
}
EOF

# 启用站点
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/aijiayuan.top /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

echo "✅ HTTP部署完成！"
echo "🌐 访问地址："
echo "   - http://www.aijiayuan.top"
echo "   - http://139.155.232.19"
echo "   - http://localhost:3000"

# 验证
curl -I http://localhost:3000 || echo "本地端口检查失败"
pm2 status