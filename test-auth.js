#!/usr/bin/env node

// 简单的认证测试脚本
const { validateEnvironment, printConfigStatus } = require('./src/lib/env-validator');

console.log('🔧 环境配置验证测试');
console.log('======================');

// 测试环境变量验证
try {
  printConfigStatus();
} catch (error) {
  console.error('环境配置验证失败:', error.message);
}

// 测试API端点（如果服务器在运行）
async function testApiEndpoints() {
  const baseUrl = 'http://localhost:3001';

  console.log('\n🌐 API端点测试');
  console.log('================');

  // 测试健康检查
  try {
    const healthResponse = await fetch(`${baseUrl}/api/health`);
    if (healthResponse.ok) {
      console.log('✅ 健康检查端点正常');
    } else {
      console.log('❌ 健康检查端点异常:', healthResponse.status);
    }
  } catch (error) {
    console.log('❌ 健康检查端点连接失败:', error.message);
  }

  // 测试登录端点（应该返回400，因为没有提供凭据）
  try {
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    if (loginResponse.status === 400) {
      console.log('✅ 登录端点正常响应（正确拒绝无效请求）');
    } else {
      console.log(`❌ 登录端点响应异常: ${loginResponse.status}`);
    }
  } catch (error) {
    console.log('❌ 登录端点连接失败:', error.message);
  }
}

// 如果有fetch支持，则运行API测试
if (typeof fetch !== 'undefined') {
  testApiEndpoints();
} else {
  console.log('\n⚠️  跳过API测试（需要Node.js 18+或安装node-fetch）');
}