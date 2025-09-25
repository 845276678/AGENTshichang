#!/bin/bash
# Nginx配置脚本 for 139.155.232.19

echo "🌐 配置Nginx for AI创意竞价平台..."

# 创建Nginx站点配置
sudo tee /etc/nginx/sites-available/aijiayuan > /dev/null << 'EOF'
# AI创意竞价平台 Nginx 配置
server {
    listen 80;
    server_name 139.155.232.19 www.aijiayuan.top aijiayuan.top;

    # 请求体大小限制
    client_max_body_size 10M;

    # 主应用代理
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

        # 超时设置
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }

    # API路由优化
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300;

        # API特定头部
        proxy_set_header Content-Type application/json;
    }

    # 静态文件缓存
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        expires 365d;
        add_header Cache-Control "public, immutable";
        add_header Vary Accept-Encoding;
    }

    # 图片和媒体文件缓存
    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp)$ {
        proxy_pass http://localhost:3000;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # 字体文件缓存
    location ~* \.(woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
    }

    # 健康检查端点
    location /health {
        proxy_pass http://localhost:3000/api/health;
        access_log off;
    }

    # 安全头部
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # 访问日志
    access_log /var/log/nginx/aijiayuan_access.log;
    error_log /var/log/nginx/aijiayuan_error.log;
}
EOF

# 测试配置
echo "🔧 测试Nginx配置..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx配置语法正确"

    # 启用站点
    echo "🔗 启用站点..."
    sudo rm -f /etc/nginx/sites-enabled/default
    sudo ln -sf /etc/nginx/sites-available/aijiayuan /etc/nginx/sites-enabled/

    # 重载Nginx
    echo "🔄 重载Nginx..."
    sudo systemctl reload nginx

    echo "✅ Nginx配置完成！"
    echo "🌐 网站现在可以通过以下地址访问："
    echo "   - http://139.155.232.19"
    echo "   - http://www.aijiayuan.top (需要DNS指向139.155.232.19)"
else
    echo "❌ Nginx配置有错误，请检查"
    exit 1
fi