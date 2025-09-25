#!/bin/bash

echo "🚀 使用PuTTY plink进行最终部署尝试..."

SERVER="139.155.232.19"
USERNAME="ubuntu"
PASSWORD="{y%OwD63Bi[7V?jEX"
PROJECT="project-68d4f29defadf4d878ac0583"

# 先测试plink连接
echo "🔐 步骤1: 测试plink连接..."

# 创建临时脚本来处理主机密钥
cat > temp_accept_key.txt << 'EOF'
y
EOF

echo "🔑 步骤2: 尝试接受主机密钥并连接..."

# 尝试连接并接受主机密钥
timeout 30 ./plink.exe -ssh -pw "$PASSWORD" "$USERNAME@$SERVER" "echo 'Connection successful'" < temp_accept_key.txt

if [ $? -eq 0 ]; then
    echo "✅ plink连接成功! 开始部署..."

    # 执行部署命令
    ./plink.exe -ssh -pw "$PASSWORD" "$USERNAME@$SERVER" "
        set -e
        echo '📁 检查当前目录...'
        whoami && pwd

        echo '📥 克隆/更新项目...'
        if [ -d '$PROJECT' ]; then
            cd $PROJECT && git pull origin master
        else
            git clone https://github.com/845276678/AGENTshichang.git $PROJECT
            cd $PROJECT
        fi

        echo '📦 安装依赖...'
        npm install

        echo '⚙️ 设置环境变量...'
        chmod +x create_production_env.sh && ./create_production_env.sh

        echo '🔨 构建项目...'
        npm run build

        echo '🗄️ 初始化数据库...'
        npx prisma generate && npx prisma db push

        echo '🔄 重启应用服务...'
        pm2 stop aijiayuan-app || true
        pm2 delete aijiayuan-app || true
        pm2 start npm --name 'aijiayuan-app' -- start
        pm2 save

        echo '📊 检查状态...'
        pm2 status
        curl -I http://localhost:3000 || echo 'Local check failed'

        echo '✅ 部署完成!'
    "

    echo "🎉 自动部署成功完成!"

else
    echo "❌ plink连接失败，使用手动部署方案"

    echo ""
    echo "📋 手动部署步骤："
    echo "1. 下载并打开 PuTTY 或使用命令行 SSH"
    echo "2. 连接到: $USERNAME@$SERVER"
    echo "3. 密码: $PASSWORD"
    echo "4. 执行命令:"
    echo ""

    cat << 'COMMANDS'
# 克隆项目
git clone https://github.com/845276678/AGENTshichang.git project-68d4f29defadf4d878ac0583
cd project-68d4f29defadf4d878ac0583

# 一键部署
chmod +x quick_deploy.sh
./quick_deploy.sh
COMMANDS

fi

# 清理临时文件
rm -f temp_accept_key.txt

echo ""
echo "🌐 访问地址: http://$SERVER"
echo "🌐 域名: http://www.aijiayuan.top (需要DNS配置)"