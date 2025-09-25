#!/bin/bash

# 使用 sshpass 的部署脚本
# 注意：需要先安装 sshpass

SERVER="139.155.232.19"
USERNAME="ubuntu"
PASSWORD="{y%OwD63Bi[7V?jEX"
PROJECT_NAME="project-68d4f29defadf4d878ac0583"

echo "🚀 开始使用 sshpass 部署到 $SERVER..."

# 检查 sshpass 是否可用
if ! command -v sshpass &> /dev/null; then
    echo "❌ sshpass 未找到，尝试安装..."

    # 在不同系统上尝试安装 sshpass
    if command -v apt-get &> /dev/null; then
        sudo apt-get update && sudo apt-get install -y sshpass
    elif command -v yum &> /dev/null; then
        sudo yum install -y sshpass
    elif command -v brew &> /dev/null; then
        brew install sshpass
    elif command -v pacman &> /dev/null; then
        sudo pacman -S sshpass
    else
        echo "❌ 无法自动安装 sshpass，请手动安装后重试"
        echo "📋 手动命令："
        echo "ssh $USERNAME@$SERVER"
        echo "密码: $PASSWORD"
        echo "然后运行: cd $PROJECT_NAME && ./quick_deploy.sh"
        exit 1
    fi
fi

# 使用 sshpass 执行 SSH 命令
run_ssh() {
    local cmd="$1"
    local desc="$2"

    echo "📋 $desc"
    echo "🔧 执行: $cmd"

    sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no "$USERNAME@$SERVER" "$cmd"
    local result=$?

    if [ $result -eq 0 ]; then
        echo "✅ 成功"
    else
        echo "❌ 失败 (退出码: $result)"
        return $result
    fi

    echo ""
}

# 检查服务器状态
run_ssh "whoami && pwd && ls -la" "检查服务器环境"

# 克隆或更新项目
run_ssh "if [ -d '$PROJECT_NAME' ]; then
    echo '📁 项目目录已存在，更新代码...'
    cd '$PROJECT_NAME' && git pull origin master
else
    echo '📁 克隆项目代码...'
    git clone https://github.com/845276678/AGENTshichang.git '$PROJECT_NAME'
fi" "设置项目代码"

# 执行部署脚本
run_ssh "cd '$PROJECT_NAME' && chmod +x quick_deploy.sh && ./quick_deploy.sh" "执行自动部署脚本"

# 检查部署状态
run_ssh "pm2 status && curl -I http://localhost:3000" "检查部署状态"

echo "🎉 部署完成！"
echo "🌐 访问地址："
echo "   - http://www.aijiayuan.top"
echo "   - http://$SERVER"