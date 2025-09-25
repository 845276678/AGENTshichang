#!/bin/bash

# AI创意竞价平台快速部署脚本
# 服务器: 139.155.232.19
# 用户: ubuntu
# 项目: project-68d4f29defadf4d878ac0583

set -e

echo "🚀 开始部署AI创意竞价平台..."

# 1. 检查并创建项目目录
PROJECT_DIR="/home/ubuntu/project-68d4f29defadf4d878ac0583"
if [ -d "$PROJECT_DIR" ]; then
    echo "📁 项目目录已存在，更新代码..."
    cd "$PROJECT_DIR"
    git pull origin master
else
    echo "📁 克隆项目代码..."
    cd /home/ubuntu
    git clone https://github.com/845276678/AGENTshichang.git project-68d4f29defadf4d878ac0583
    cd project-68d4f29defadf4d878ac0583
fi

# 2. 安装依赖
echo "📦 安装项目依赖..."
npm install

# 3. 设置生产环境变量
echo "⚙️  配置环境变量..."
cat > .env.production << EOF
# Database
DATABASE_URL=file:./production.db

# NextAuth.js
NEXTAUTH_URL=https://www.aijiayuan.top
NEXTAUTH_SECRET=aijiayuan-super-secret-production-key-2024

# AI Services - 已配置实际API密钥
DEEPSEEK_API_KEY=sk-9f53027a39124ed1b93c7829edf7127a
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat

ZHIPU_API_KEY=3226f1f5f8f140e0862a5f6bbd3c30d4.qjAzzID6BYmmU0ok

DASHSCOPE_API_KEY=sk-410c92dae50c4e3c964629fe6b91f4e2

# Application Settings
NODE_ENV=production
APP_URL=https://www.aijiayuan.top

# JWT
JWT_SECRET=aijiayuan-jwt-secret-production-2024

# Rate Limiting
RATE_LIMIT_MAX=1000
RATE_LIMIT_WINDOW_MS=900000

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=.pdf,.doc,.docx,.txt,.json
EOF

# 4. 设置数据库
echo "🗄️  设置数据库..."
npx prisma generate
npx prisma db push

# 5. 构建项目
echo "🔨 构建项目..."
npm run build

# 6. 停止旧服务
echo "🛑 停止旧服务..."
pm2 stop aijiayuan-app 2>/dev/null || true
pm2 delete aijiayuan-app 2>/dev/null || true

# 7. 启动新服务
echo "🚀 启动新服务..."
pm2 start npm --name "aijiayuan-app" -- start
pm2 save

# 8. 配置Nginx
echo "🌐 配置Nginx..."
sudo tee /etc/nginx/sites-available/aijiayuan.top > /dev/null << 'EOF'
server {
    listen 80;
    server_name www.aijiayuan.top aijiayuan.top;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name www.aijiayuan.top aijiayuan.top;

    # SSL configuration would go here if certificates are available

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

    # API routes
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300;
    }

    # Static files
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# 9. 启用站点并重新加载Nginx
echo "🔄 重新加载Nginx..."
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/aijiayuan.top /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 10. 验证部署
echo "✅ 验证部署..."
sleep 5
curl -I http://localhost:3000 || echo "本地端口检查失败"
pm2 status
pm2 logs aijiayuan-app --lines 10

echo "🎉 部署完成！"
echo "📋 部署信息："
echo "   - 项目地址: https://www.aijiayuan.top"
echo "   - 本地端口: http://localhost:3000"
echo "   - PM2进程: aijiayuan-app"
echo "   - 日志查看: pm2 logs aijiayuan-app"
echo "   - 重启应用: pm2 restart aijiayuan-app"