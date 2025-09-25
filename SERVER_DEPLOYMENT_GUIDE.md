# AI创意竞价平台部署指南

## 服务器信息
- **IP**: 139.155.232.19
- **用户**: ubuntu
- **密码**: {y%OwD63Bi[7V?jEX
- **项目**: project-68d4f29defadf4d878ac0583
- **域名**: www.aijiayuan.top

## 部署步骤

### 1. 连接服务器
```bash
ssh ubuntu@139.155.232.19
# 输入密码: {y%OwD63Bi[7V?jEX
```

### 2. 检查现有部署
```bash
cd /home/ubuntu
ls -la
pm2 list
docker ps
```

### 3. 更新代码
```bash
# 如果项目已存在
cd project-68d4f29defadf4d878ac0583
git pull origin master

# 如果项目不存在
git clone https://github.com/845276678/AGENTshichang.git project-68d4f29defadf4d878ac0583
cd project-68d4f29defadf4d878ac0583
```

### 4. 安装依赖
```bash
npm install
```

### 5. 配置环境变量
```bash
cp .env.example .env.production
vim .env.production
```

需要配置的关键变量:
- DATABASE_URL=postgresql://...
- DEEPSEEK_API_KEY=sk-9f53027a39124ed1b93c7829edf7127a
- ZHIPU_API_KEY=3226f1f5f8f140e0862a5f6bbd3c30d4.qjAzzID6BYmmU0ok
- DASHSCOPE_API_KEY=sk-410c92dae50c4e3c964629fe6b91f4e2

### 6. 构建项目
```bash
npm run build
```

### 7. 启动服务
```bash
# 使用PM2
pm2 start ecosystem.config.js --env production

# 或使用Docker
docker-compose -f docker-compose.prod.yml up -d
```

### 8. 配置Nginx (如果需要)
```bash
sudo vim /etc/nginx/sites-available/aijiayuan.top
```

Nginx配置:
```nginx
server {
    listen 80;
    server_name www.aijiayuan.top aijiayuan.top;

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
    }
}
```

### 9. 重启Nginx
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 10. 验证部署
```bash
curl -I http://localhost:3000
curl -I http://www.aijiayuan.top
```