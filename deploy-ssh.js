#!/usr/bin/env node

/**
 * AI创意竞价平台 SSH 自动部署脚本
 * 部署到服务器: 139.155.232.19
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// 服务器配置
const SERVER_CONFIG = {
    host: '139.155.232.19',
    username: 'ubuntu',
    password: '{y%OwD63Bi[7V?jEX',
    project: 'project-68d4f29defadf4d878ac0583',
    repo: 'https://github.com/845276678/AGENTshichang.git'
};

// 颜色输出
const colors = {
    red: '\x1b[31m%s\x1b[0m',
    green: '\x1b[32m%s\x1b[0m',
    yellow: '\x1b[33m%s\x1b[0m',
    blue: '\x1b[34m%s\x1b[0m',
    cyan: '\x1b[36m%s\x1b[0m'
};

function log(message, color = 'cyan') {
    console.log(colors[color], message);
}

function error(message) {
    console.log(colors.red, `❌ ${message}`);
}

function success(message) {
    console.log(colors.green, `✅ ${message}`);
}

function info(message) {
    console.log(colors.blue, `ℹ️  ${message}`);
}

// 执行Shell命令的Promise包装
function execCommand(command, description = '') {
    return new Promise((resolve, reject) => {
        if (description) {
            log(`📋 ${description}`, 'yellow');
        }

        log(`🔧 执行: ${command}`, 'cyan');

        const child = spawn('bash', ['-c', command], {
            stdio: ['pipe', 'pipe', 'pipe']
        });

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (data) => {
            stdout += data.toString();
            process.stdout.write(data);
        });

        child.stderr.on('data', (data) => {
            stderr += data.toString();
            process.stderr.write(data);
        });

        child.on('close', (code) => {
            if (code === 0) {
                success(`命令执行成功`);
                resolve({ stdout, stderr, code });
            } else {
                error(`命令执行失败，退出码: ${code}`);
                reject(new Error(`Command failed with code ${code}`));
            }
        });

        child.on('error', (err) => {
            error(`命令执行出错: ${err.message}`);
            reject(err);
        });
    });
}

// 检查SSH连接
async function checkSSHConnection() {
    try {
        info('检查SSH连接...');
        await execCommand(`timeout 10 ssh -o BatchMode=yes -o ConnectTimeout=5 ${SERVER_CONFIG.username}@${SERVER_CONFIG.host} exit`, 'SSH密钥认证测试');
        return true;
    } catch (error) {
        log('SSH密钥认证失败，需要密码认证', 'yellow');
        return false;
    }
}

// 使用SSH执行命令（需要密码）
async function sshWithPassword(command, description = '') {
    const sshCommand = `ssh -o StrictHostKeyChecking=no ${SERVER_CONFIG.username}@${SERVER_CONFIG.host} "${command}"`;

    log(`🔐 需要手动输入SSH密码执行: ${command}`, 'yellow');
    log(`💡 手动执行命令: ${sshCommand}`, 'blue');
    log(`🔑 密码: ${SERVER_CONFIG.password}`, 'blue');

    // 尝试自动化方式（可能不工作）
    try {
        const expect_script = `
expect -c "
set timeout 60
spawn ${sshCommand}
expect \\"*password*\\" { send \\"${SERVER_CONFIG.password}\\r\\" }
expect eof
"`;

        await execCommand(expect_script, description);
    } catch (error) {
        log('自动执行失败，需要手动操作', 'yellow');
        throw error;
    }
}

// 部署步骤
async function deployApplication() {
    try {
        log('🚀 开始部署AI创意竞价平台...', 'green');

        // 1. 检查SSH连接
        const hasKeyAuth = await checkSSHConnection();

        if (!hasKeyAuth) {
            log('⚠️  需要密码认证，将显示手动命令', 'yellow');

            // 显示手动命令序列
            const commands = [
                'whoami && pwd && ls -la',
                `if [ -d '${SERVER_CONFIG.project}' ]; then cd ${SERVER_CONFIG.project} && git pull origin master; else git clone ${SERVER_CONFIG.repo} ${SERVER_CONFIG.project} && cd ${SERVER_CONFIG.project}; fi`,
                'npm install',
                'cp .env.example .env.production',
                'npm run build',
                'npx prisma generate && npx prisma db push',
                'pm2 stop aijiayuan-app || true',
                'pm2 delete aijiayuan-app || true',
                'pm2 start npm --name "aijiayuan-app" -- start',
                'pm2 save'
            ];

            log('\n📋 请手动执行以下命令:', 'cyan');
            log(`ssh ${SERVER_CONFIG.username}@${SERVER_CONFIG.host}`, 'blue');
            log(`密码: ${SERVER_CONFIG.password}`, 'blue');
            log('', 'blue');

            commands.forEach((cmd, index) => {
                log(`${index + 1}. ${cmd}`, 'white');
            });

            return false;
        }

        // 如果有密钥认证，继续自动部署
        // ... 这里可以添加自动部署逻辑

    } catch (error) {
        error(`部署失败: ${error.message}`);
        return false;
    }
}

// 检查部署状态
async function checkDeploymentStatus() {
    try {
        info('检查部署状态...');

        // 检查本地端口
        await execCommand('curl -I --connect-timeout 5 http://139.155.232.19:3000', '检查应用端口3000');

        // 检查PM2状态（需要SSH）
        log('需要SSH连接检查PM2状态', 'yellow');

        return true;
    } catch (error) {
        error(`状态检查失败: ${error.message}`);
        return false;
    }
}

// 主函数
async function main() {
    try {
        log('🎯 AI创意竞价平台自动部署工具', 'green');
        log(`📍 目标服务器: ${SERVER_CONFIG.host}`, 'blue');
        log(`👤 用户: ${SERVER_CONFIG.username}`, 'blue');
        log(`📁 项目: ${SERVER_CONFIG.project}`, 'blue');
        log('', 'blue');

        // 执行部署
        const deployResult = await deployApplication();

        if (!deployResult) {
            log('⚠️  自动部署受限，请按提示手动执行', 'yellow');
            return;
        }

        // 检查状态
        await checkDeploymentStatus();

        success('🎉 部署完成!');
        log(`🌐 访问地址: http://${SERVER_CONFIG.host}`, 'green');
        log(`🌐 域名: http://www.aijiayuan.top (需要DNS配置)`, 'green');

    } catch (error) {
        error(`部署过程出错: ${error.message}`);
        process.exit(1);
    }
}

// 运行主函数
if (require.main === module) {
    main();
}

module.exports = {
    deployApplication,
    checkDeploymentStatus,
    SERVER_CONFIG
};