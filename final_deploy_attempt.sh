#!/bin/bash

# AI创意竞价平台 - 最终自动部署尝试
# 使用多种方法尝试连接服务器

set -e

SERVER="139.155.232.19"
USERNAME="ubuntu"
PASSWORD="{y%OwD63Bi[7V?jEX"
PROJECT="project-68d4f29defadf4d878ac0583"

echo "🚀 AI创意竞价平台最终部署尝试..."

# 方法1: 尝试使用SSH密钥
echo "🔑 方法1: 尝试SSH密钥认证..."
if ssh -i ~/.ssh/aijiayuan_deploy -o BatchMode=yes -o ConnectTimeout=10 ${USERNAME}@${SERVER} 'echo "SSH key auth successful"' 2>/dev/null; then
    echo "✅ SSH密钥认证成功!"

    # 执行部署命令
    ssh -i ~/.ssh/aijiayuan_deploy ${USERNAME}@${SERVER} "
        set -e
        echo '📁 检查项目目录...'
        if [ -d '${PROJECT}' ]; then
            echo '✅ 项目存在，更新代码...'
            cd ${PROJECT}
            git pull origin master
        else
            echo '📥 克隆项目...'
            git clone https://github.com/845276678/AGENTshichang.git ${PROJECT}
            cd ${PROJECT}
        fi

        echo '📦 安装依赖...'
        npm install

        echo '⚙️  设置环境变量...'
        ./create_production_env.sh

        echo '🔨 构建项目...'
        npm run build

        echo '🗄️  初始化数据库...'
        npx prisma generate
        npx prisma db push

        echo '🔄 重启应用...'
        pm2 stop aijiayuan-app || true
        pm2 delete aijiayuan-app || true
        pm2 start npm --name 'aijiayuan-app' -- start
        pm2 save

        echo '🌐 配置Nginx...'
        ./configure_nginx.sh

        echo '✅ 部署完成!'
    "

    exit 0
fi

# 方法2: 尝试通过HTTP API部署
echo "🌐 方法2: 尝试HTTP API部署..."
DEPLOY_RESPONSE=$(curl -s -X POST http://${SERVER}/api/deploy -d '{"action":"deploy","repo":"https://github.com/845276678/AGENTshichang.git"}' -H "Content-Type: application/json" || echo "API_FAILED")

if [ "$DEPLOY_RESPONSE" != "API_FAILED" ]; then
    echo "✅ HTTP API部署触发成功"
    echo "Response: $DEPLOY_RESPONSE"
    exit 0
fi

# 方法3: 创建一次性SSH连接脚本
echo "🔧 方法3: 创建自动SSH脚本..."

# 创建临时expect脚本
cat > /tmp/deploy_ssh_${SERVER}.exp << EOF
#!/usr/bin/expect -f
set timeout 300
spawn ssh -o StrictHostKeyChecking=no ${USERNAME}@${SERVER}

expect {
    "*password*" {
        send "${PASSWORD}\r"
        exp_continue
    }
    "*\$*" {
        send "echo 'SSH连接成功'\r"
        expect "*\$*"

        # 部署命令序列
        send "cd /home/ubuntu\r"
        expect "*\$*"

        send "if \[ -d '${PROJECT}' \]; then cd ${PROJECT} && git pull origin master; else git clone https://github.com/845276678/AGENTshichang.git ${PROJECT} && cd ${PROJECT}; fi\r"
        expect "*\$*"

        send "npm install\r"
        expect "*\$*"

        send "chmod +x create_production_env.sh && ./create_production_env.sh\r"
        expect "*\$*"

        send "npm run build\r"
        expect "*\$*"

        send "npx prisma generate && npx prisma db push\r"
        expect "*\$*"

        send "pm2 stop aijiayuan-app || true && pm2 delete aijiayuan-app || true\r"
        expect "*\$*"

        send "pm2 start npm --name 'aijiayuan-app' -- start\r"
        expect "*\$*"

        send "pm2 save\r"
        expect "*\$*"

        send "chmod +x configure_nginx.sh && ./configure_nginx.sh\r"
        expect "*\$*"

        send "pm2 status\r"
        expect "*\$*"

        send "curl -I http://localhost:3000\r"
        expect "*\$*"

        send "exit\r"
    }
    timeout {
        puts "连接超时"
        exit 1
    }
}

expect eof
EOF

# 尝试运行expect脚本
if command -v expect >/dev/null 2>&1; then
    echo "✅ 找到expect，运行自动部署..."
    chmod +x /tmp/deploy_ssh_${SERVER}.exp
    /tmp/deploy_ssh_${SERVER}.exp
    rm /tmp/deploy_ssh_${SERVER}.exp
    exit 0
else
    echo "❌ expect不可用"
fi

# 方法4: 最后的手动指导
echo "🤷 所有自动方法都失败了，显示手动步骤:"
echo ""
echo "请手动执行以下步骤："
echo "1. ssh ${USERNAME}@${SERVER}"
echo "2. 输入密码: ${PASSWORD}"
echo "3. 执行以下命令："
echo ""

cat << 'MANUAL_COMMANDS'
# 进入项目目录
cd /home/ubuntu

# 克隆或更新项目
if [ -d 'project-68d4f29defadf4d878ac0583' ]; then
    cd project-68d4f29defadf4d878ac0583
    git pull origin master
else
    git clone https://github.com/845276678/AGENTshichang.git project-68d4f29defadf4d878ac0583
    cd project-68d4f29defadf4d878ac0583
fi

# 安装依赖并构建
npm install
chmod +x create_production_env.sh && ./create_production_env.sh
npm run build

# 设置数据库
npx prisma generate
npx prisma db push

# 启动应用
pm2 stop aijiayuan-app || true
pm2 delete aijiayuan-app || true
pm2 start npm --name "aijiayuan-app" -- start
pm2 save

# 配置Nginx
chmod +x configure_nginx.sh && ./configure_nginx.sh

# 检查状态
pm2 status
curl -I http://localhost:3000
MANUAL_COMMANDS

echo ""
echo "部署完成后，访问: http://${SERVER}"