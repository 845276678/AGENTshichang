#!/usr/bin/env node
/**
 * 生产环境诊断脚本
 * 检查可能导致502错误的各种配置问题
 */

console.log('🔍 开始生产环境诊断...\n');

// 1. 检查环境变量
console.log('📋 环境变量检查:');
const requiredEnvs = [
  'NODE_ENV',
  'PORT',
  'DATABASE_URL',
  'JWT_SECRET',
  'DEEPSEEK_API_KEY',
  'ZHIPU_API_KEY',
  'DASHSCOPE_API_KEY'
];

requiredEnvs.forEach(env => {
  const value = process.env[env];
  const status = value ? '✅' : '❌';
  const display = env.includes('SECRET') || env.includes('KEY') || env.includes('DATABASE_URL')
    ? (value ? `${value.substring(0, 10)}...` : 'undefined')
    : value || 'undefined';
  console.log(`  ${status} ${env}: ${display}`);
});

// 2. 检查Prisma
console.log('\n🗄️  Prisma检查:');
try {
  console.log('  📦 尝试导入 @prisma/client...');
  const { PrismaClient } = require('@prisma/client');
  console.log('  ✅ Prisma Client导入成功');

  console.log('  🔌 尝试创建Prisma实例...');
  const prisma = new PrismaClient();
  console.log('  ✅ Prisma实例创建成功');

  console.log('  🎯 尝试数据库连接...');
  // 简单的连接测试，不实际查询
  prisma.$connect().then(() => {
    console.log('  ✅ 数据库连接成功');
    prisma.$disconnect();
  }).catch(error => {
    console.log('  ❌ 数据库连接失败:', error.message);
  });

} catch (error) {
  console.log('  ❌ Prisma问题:', error.message);
  if (error.message.includes('binary')) {
    console.log('  💡 建议: 可能需要重新生成Prisma客户端');
  }
}

// 3. 检查Next.js配置
console.log('\n⚙️  Next.js配置检查:');
try {
  const nextConfig = require('../next.config.js');
  console.log('  ✅ next.config.js加载成功');
  console.log(`  📦 输出模式: ${nextConfig.output || 'default'}`);
  console.log(`  🧪 实验性功能: ${JSON.stringify(nextConfig.experimental || {})}`);
} catch (error) {
  console.log('  ❌ Next.js配置问题:', error.message);
}

// 4. 检查server.js
console.log('\n🚀 Server.js检查:');
try {
  console.log('  📁 检查server.js文件...');
  const fs = require('fs');
  const serverExists = fs.existsSync('./server.js');
  console.log(`  ${serverExists ? '✅' : '❌'} server.js存在: ${serverExists}`);

  if (serverExists) {
    const serverContent = fs.readFileSync('./server.js', 'utf8');
    const hasNextPrepare = serverContent.includes('app.prepare()');
    const hasWebSocket = serverContent.includes('WebSocketServer');
    const hasErrorHandling = serverContent.includes('catch');

    console.log(`  ${hasNextPrepare ? '✅' : '❌'} Next.js应用准备: ${hasNextPrepare}`);
    console.log(`  ${hasWebSocket ? '✅' : '❌'} WebSocket支持: ${hasWebSocket}`);
    console.log(`  ${hasErrorHandling ? '✅' : '❌'} 错误处理: ${hasErrorHandling}`);
  }
} catch (error) {
  console.log('  ❌ Server.js检查失败:', error.message);
}

// 5. 检查端口配置
console.log('\n🔌 端口配置检查:');
const port = process.env.PORT || process.env.WEB_PORT || 4000;
console.log(`  🎯 配置端口: ${port}`);
console.log(`  🌍 NODE_ENV: ${process.env.NODE_ENV}`);

// 6. 检查依赖项
console.log('\n📦 关键依赖检查:');
const criticalDeps = [
  'next',
  '@prisma/client',
  'ws',
  'jsonwebtoken'
];

criticalDeps.forEach(dep => {
  try {
    require(dep);
    console.log(`  ✅ ${dep}: 可用`);
  } catch (error) {
    console.log(`  ❌ ${dep}: 缺失或损坏`);
  }
});

console.log('\n🏁 诊断完成!');

// 7. 生成修复建议
console.log('\n💡 修复建议:');
console.log('1. 确保DATABASE_URL正确配置且数据库可访问');
console.log('2. 在Zeabur控制台运行: npm run db:generate');
console.log('3. 检查Prisma二进制文件是否兼容目标平台');
console.log('4. 验证所有必需的环境变量都已设置');
console.log('5. 如果问题持续，尝试清除构建缓存重新部署');