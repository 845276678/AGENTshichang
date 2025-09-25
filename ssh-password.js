#!/usr/bin/env node

/**
 * Node.js SSH Password Authentication Tool
 * 类似于sshpass的功能
 */

const { spawn } = require('child_process');
const process = require('process');

function sshWithPassword(password, sshArgs) {
    return new Promise((resolve, reject) => {
        console.log(`🔐 尝试SSH连接: ssh ${sshArgs.join(' ')}`);

        const sshProcess = spawn('ssh', sshArgs, {
            stdio: ['pipe', 'pipe', 'pipe']
        });

        let output = '';
        let errorOutput = '';

        // 处理输出
        sshProcess.stdout.on('data', (data) => {
            const text = data.toString();
            output += text;
            process.stdout.write(text);
        });

        sshProcess.stderr.on('data', (data) => {
            const text = data.toString();
            errorOutput += text;

            // 检查是否需要输入密码
            if (text.toLowerCase().includes('password')) {
                console.log('🔑 发现密码提示，输入密码...');
                sshProcess.stdin.write(password + '\n');
            } else {
                process.stderr.write(text);
            }
        });

        sshProcess.on('close', (code) => {
            if (code === 0) {
                console.log('✅ SSH命令执行成功');
                resolve({ code, output, errorOutput });
            } else {
                console.log(`❌ SSH命令执行失败，退出码: ${code}`);
                reject({ code, output, errorOutput });
            }
        });

        sshProcess.on('error', (error) => {
            console.error(`❌ SSH进程出错: ${error.message}`);
            reject({ error, output, errorOutput });
        });

        // 超时处理
        setTimeout(() => {
            console.log('⏰ SSH连接超时');
            sshProcess.kill();
            reject({ error: 'Timeout', output, errorOutput });
        }, 60000); // 60秒超时
    });
}

// 主函数
async function main() {
    const args = process.argv.slice(2);

    if (args.length < 2) {
        console.error('用法: node ssh-password.js <password> <ssh_args...>');
        console.error('示例: node ssh-password.js "mypassword" ubuntu@139.155.232.19 "whoami"');
        process.exit(1);
    }

    const password = args[0];
    const sshArgs = args.slice(1);

    try {
        await sshWithPassword(password, sshArgs);
    } catch (error) {
        process.exit(error.code || 1);
    }
}

if (require.main === module) {
    main();
}