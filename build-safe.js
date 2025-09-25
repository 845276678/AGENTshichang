// 安全的构建脚本
const { execSync } = require('child_process');
const path = require('path');

// 设置环境变量
process.env.NEXT_TELEMETRY_DISABLED = '1';
process.env.NODE_ENV = 'production';
process.env.CI = 'true';

// 设置工作目录
process.chdir(__dirname);

try {
  console.log('开始安全构建...');
  
  // 清理缓存
  console.log('清理缓存...');
  try {
    execSync('npm run clean', { stdio: 'inherit' });
  } catch (e) {
    console.log('清理命令不存在，跳过...');
  }
  
  // 生成Prisma客户端
  console.log('生成Prisma客户端...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // 构建应用
  console.log('构建Next.js应用...');
  execSync('npx next build', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      NEXT_TELEMETRY_DISABLED: '1',
      NODE_ENV: 'production'
    }
  });
  
  console.log('构建成功！');
} catch (error) {
  console.error('构建失败:', error.message);
  process.exit(1);
}
