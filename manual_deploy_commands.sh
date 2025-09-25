#!/bin/bash
# Manual deployment commands for server 139.155.232.19

# Step 1: Connect to server (run this manually)
echo "ssh ubuntu@139.155.232.19"
echo "Password: {y%OwD63Bi[7V?jEX"
echo ""

# Step 2: Navigate and check current status
echo "# Check current directory and status"
echo "cd /home/ubuntu"
echo "pwd"
echo "ls -la"
echo "pm2 list"
echo "docker ps -a"
echo ""

# Step 3: Clone or update project
echo "# Clone/update project"
echo "if [ -d 'project-68d4f29defadf4d878ac0583' ]; then"
echo "    cd project-68d4f29defadf4d878ac0583"
echo "    git pull origin master"
echo "else"
echo "    git clone https://github.com/845276678/AGENTshichang.git project-68d4f29defadf4d878ac0583"
echo "    cd project-68d4f29defadf4d878ac0583"
echo "fi"
echo ""

# Step 4: Install dependencies
echo "# Install dependencies"
echo "npm install"
echo ""

# Step 5: Setup environment
echo "# Setup environment"
echo "cp .env.example .env.production"
echo "# Edit .env.production with the following:"
echo "# DATABASE_URL=file:./production.db"
echo "# DEEPSEEK_API_KEY=sk-9f53027a39124ed1b93c7829edf7127a"
echo "# ZHIPU_API_KEY=3226f1f5f8f140e0862a5f6bbd3c30d4.qjAzzID6BYmmU0ok"
echo "# DASHSCOPE_API_KEY=sk-410c92dae50c4e3c964629fe6b91f4e2"
echo "# NODE_ENV=production"
echo ""

# Step 6: Build and deploy
echo "# Build project"
echo "npm run build"
echo ""

# Step 7: Database setup
echo "# Setup database"
echo "npx prisma generate"
echo "npx prisma db push"
echo ""

# Step 8: Start application
echo "# Stop existing process"
echo "pm2 stop aijiayuan || true"
echo "pm2 delete aijiayuan || true"
echo ""
echo "# Start new process"
echo "pm2 start npm --name 'aijiayuan' -- start"
echo "pm2 save"
echo "pm2 startup"
echo ""

# Step 9: Configure Nginx
echo "# Configure Nginx (if not already configured)"
echo "sudo tee /etc/nginx/sites-available/aijiayuan.top > /dev/null << 'EOF'"
echo "server {"
echo "    listen 80;"
echo "    server_name www.aijiayuan.top aijiayuan.top;"
echo ""
echo "    location / {"
echo "        proxy_pass http://localhost:3000;"
echo "        proxy_http_version 1.1;"
echo "        proxy_set_header Upgrade \$http_upgrade;"
echo "        proxy_set_header Connection 'upgrade';"
echo "        proxy_set_header Host \$host;"
echo "        proxy_cache_bypass \$http_upgrade;"
echo "        proxy_set_header X-Real-IP \$remote_addr;"
echo "        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;"
echo "        proxy_set_header X-Forwarded-Proto \$scheme;"
echo "    }"
echo "}"
echo "EOF"
echo ""
echo "# Enable site"
echo "sudo ln -sf /etc/nginx/sites-available/aijiayuan.top /etc/nginx/sites-enabled/"
echo "sudo nginx -t"
echo "sudo systemctl reload nginx"
echo ""

# Step 10: Verify
echo "# Verify deployment"
echo "curl -I http://localhost:3000"
echo "pm2 status"
echo "pm2 logs aijiayuan --lines 20"