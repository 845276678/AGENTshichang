#!/bin/bash

# 尝试多种方法连接SSH的脚本

SERVER="139.155.232.19"
USERNAME="ubuntu"
PASSWORD="{y%OwD63Bi[7V?jEX"
PROJECT="project-68d4f29defadf4d878ac0583"

echo "🔍 尝试SSH连接方法..."

# 方法1: 检查SSH是否可用
ssh_available() {
    timeout 5 ssh -o BatchMode=yes -o ConnectTimeout=3 ${USERNAME}@${SERVER} exit 2>/dev/null
    return $?
}

# 方法2: 创建临时expect脚本
create_expect_script() {
    cat > /tmp/ssh_deploy.exp << 'EOF'
#!/usr/bin/expect -f
set timeout 60
set server [lindex $argv 0]
set username [lindex $argv 1]
set password [lindex $argv 2]

spawn ssh -o StrictHostKeyChecking=no $username@$server

expect {
    "*password*" {
        send "$password\r"
        expect "*$*"

        # 执行部署命令
        send "whoami && pwd\r"
        expect "*$*"

        send "if \[ -d 'project-68d4f29defadf4d878ac0583' \]; then cd project-68d4f29defadf4d878ac0583 && git pull origin master; else git clone https://github.com/845276678/AGENTshichang.git project-68d4f29defadf4d878ac0583 && cd project-68d4f29defadf4d878ac0583; fi\r"
        expect "*$*"

        send "chmod +x quick_deploy.sh && ./quick_deploy.sh\r"
        expect "*$*"

        send "exit\r"
    }
    timeout {
        puts "连接超时"
        exit 1
    }
}
expect eof
EOF
    chmod +x /tmp/ssh_deploy.exp
}

# 方法3: 使用PowerShell (如果在Windows上)
powershell_ssh() {
    if command -v powershell.exe &> /dev/null; then
        echo "尝试使用 PowerShell SSH..."
        # 这里可以添加 PowerShell SSH 逻辑
    fi
}

echo "📋 SSH连接状态检查："
if ssh_available; then
    echo "✅ SSH密钥认证可用"
    ssh ${USERNAME}@${SERVER} "cd ${PROJECT} && git pull && ./quick_deploy.sh"
else
    echo "❌ SSH密钥认证不可用，需要密码认证"

    # 检查expect是否可用
    if command -v expect &> /dev/null; then
        echo "📝 创建expect脚本..."
        create_expect_script
        /tmp/ssh_deploy.exp $SERVER $USERNAME $PASSWORD
    else
        echo "❌ expect 不可用"

        echo "📋 手动执行步骤："
        echo "1. ssh ${USERNAME}@${SERVER}"
        echo "2. 输入密码: ${PASSWORD}"
        echo "3. cd ${PROJECT}"
        echo "4. git pull origin master"
        echo "5. ./quick_deploy.sh"
    fi
fi