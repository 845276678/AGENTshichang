#!/usr/bin/env node

/**
 * AI创意竞价平台远程部署执行器
 * 使用简化的SSH方法
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');

const CONFIG = {
    host: '139.155.232.19',
    username: 'ubuntu',
    password: '{y%OwD63Bi[7V?jEX',
    project: 'project-68d4f29defadf4d878ac0583'
};

// 部署命令序列
const DEPLOY_COMMANDS = [
    'whoami && pwd',
    `if [ -d '${CONFIG.project}' ]; then cd ${CONFIG.project} && git pull origin master; else git clone https://github.com/845276678/AGENTshichang.git ${CONFIG.project} && cd ${CONFIG.project}; fi`,
    'npm install',
    'chmod +x create_production_env.sh && ./create_production_env.sh',
    'npm run build',
    'npx prisma generate && npx prisma db push',
    'pm2 stop aijiayuan-app || true',
    'pm2 delete aijiayuan-app || true',
    'pm2 start npm --name "aijiayuan-app" -- start',
    'pm2 save',
    'chmod +x configure_nginx.sh && sudo ./configure_nginx.sh',
    'pm2 status && curl -I http://localhost:3000'
];

console.log('🚀 AI创意竞价平台远程部署工具');
console.log(`📍 目标服务器: ${CONFIG.host}`);
console.log(`👤 用户: ${CONFIG.username}`);
console.log('');

// 创建PowerShell脚本来处理SSH
const powershellScript = `
$securePassword = ConvertTo-SecureString "${CONFIG.password}" -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential("${CONFIG.username}", $securePassword)

Write-Host "🔐 正在连接到 ${CONFIG.host}..."

# 尝试使用 plink 如果可用
if (Get-Command plink -ErrorAction SilentlyContinue) {
    Write-Host "使用 PuTTY plink..."
    echo y | plink -ssh ${CONFIG.username}@${CONFIG.host} -pw ${CONFIG.password} "whoami && pwd"
} else {
    Write-Host "plink 不可用，需要手动SSH连接"
    Write-Host "请手动执行: ssh ${CONFIG.username}@${CONFIG.host}"
    Write-Host "密码: ${CONFIG.password}"
}
`;

// 写入临时PowerShell脚本
fs.writeFileSync('temp_ssh_deploy.ps1', powershellScript);

console.log('📋 创建的部署方法:');
console.log('1. PowerShell SSH (如果支持)');
console.log('2. 手动SSH连接指南');
console.log('');

try {
    // 尝试执行PowerShell脚本
    console.log('🔧 尝试PowerShell SSH连接...');
    execSync('powershell -ExecutionPolicy Bypass -File temp_ssh_deploy.ps1', { stdio: 'inherit' });
} catch (error) {
    console.log('❌ PowerShell SSH失败');
}

// 显示手动命令
console.log('');
console.log('📋 手动SSH部署命令:');
console.log(`ssh ${CONFIG.username}@${CONFIG.host}`);
console.log(`密码: ${CONFIG.password}`);
console.log('');
console.log('然后依次执行以下命令:');
console.log('');

DEPLOY_COMMANDS.forEach((cmd, index) => {
    console.log(`${index + 1}. ${cmd}`);
});

console.log('');
console.log('🌐 部署完成后访问: http://' + CONFIG.host);

// 清理临时文件
try {
    fs.unlinkSync('temp_ssh_deploy.ps1');
} catch (error) {
    // 忽略清理错误
}