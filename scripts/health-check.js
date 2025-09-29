#!/usr/bin/env node
/**
 * 生产环境健康检查脚本
 * 用于验证网站和API端点的可用性
 */

const https = require('https');
const http = require('http');

const PRODUCTION_URL = 'https://aijiayuan.top';
const TIMEOUT = 10000; // 10秒超时

console.log('🏥 开始生产环境健康检查...\n');

// 健康检查端点列表
const endpoints = [
  { path: '/', name: '主页', critical: true },
  { path: '/api/health', name: '健康检查API', critical: true },
  { path: '/api/health/simple', name: '简单健康检查', critical: true },
  { path: '/auth/login', name: '登录页面', critical: false },
  { path: '/marketplace', name: '市场页面', critical: false },
  { path: '/favicon.ico', name: 'Favicon', critical: false }
];

async function checkEndpoint(endpoint) {
  return new Promise((resolve) => {
    const url = new URL(endpoint.path, PRODUCTION_URL);
    const client = url.protocol === 'https:' ? https : http;

    const startTime = Date.now();

    const req = client.get(url, {
      timeout: TIMEOUT,
      headers: {
        'User-Agent': 'HealthCheck/1.0'
      }
    }, (res) => {
      const responseTime = Date.now() - startTime;
      const status = res.statusCode;

      let result = {
        path: endpoint.path,
        name: endpoint.name,
        status: status,
        responseTime: responseTime,
        critical: endpoint.critical,
        success: status >= 200 && status < 400
      };

      // 对于某些端点，404也算正常
      if (endpoint.path === '/favicon.ico' && status === 404) {
        result.success = true;
        result.note = '文件不存在但服务器响应正常';
      }

      resolve(result);
    });

    req.on('error', (error) => {
      resolve({
        path: endpoint.path,
        name: endpoint.name,
        status: 0,
        responseTime: Date.now() - startTime,
        critical: endpoint.critical,
        success: false,
        error: error.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        path: endpoint.path,
        name: endpoint.name,
        status: 0,
        responseTime: TIMEOUT,
        critical: endpoint.critical,
        success: false,
        error: 'Request timeout'
      });
    });
  });
}

async function runHealthCheck() {
  const results = [];

  console.log(`🌐 检查目标: ${PRODUCTION_URL}\n`);

  // 并行检查所有端点
  const checks = endpoints.map(checkEndpoint);
  const checkResults = await Promise.all(checks);

  let criticalErrors = 0;
  let totalErrors = 0;

  console.log('📊 检查结果:\n');
  console.log('端点'.padEnd(25) + '状态'.padEnd(8) + '响应时间'.padEnd(12) + '结果');
  console.log('-'.repeat(60));

  checkResults.forEach(result => {
    const statusIcon = result.success ? '✅' : '❌';
    const criticalIcon = result.critical ? '🔴' : '⚠️';
    const errorIcon = result.success ? statusIcon : (result.critical ? criticalIcon : '⚠️');

    const name = result.name.padEnd(20);
    const status = result.status.toString().padEnd(5);
    const responseTime = `${result.responseTime}ms`.padEnd(10);
    const resultText = result.success ? '正常' : (result.error || '失败');

    console.log(`${errorIcon} ${name} ${status} ${responseTime} ${resultText}`);

    if (result.note) {
      console.log(`   💡 ${result.note}`);
    }

    if (!result.success) {
      totalErrors++;
      if (result.critical) {
        criticalErrors++;
      }
    }

    results.push(result);
  });

  console.log('\n📈 总结:');
  console.log(`总检查项: ${endpoints.length}`);
  console.log(`成功: ${endpoints.length - totalErrors}`);
  console.log(`失败: ${totalErrors}`);
  console.log(`关键性错误: ${criticalErrors}`);

  if (criticalErrors > 0) {
    console.log('\n🚨 发现关键性问题！');
    console.log('建议：');
    console.log('1. 检查Zeabur部署状态');
    console.log('2. 验证环境变量配置');
    console.log('3. 查看部署日志');
    console.log('4. 运行: node scripts/production-diagnosis.js');
    process.exit(1);
  } else if (totalErrors > 0) {
    console.log('\n⚠️ 发现非关键性问题，但服务基本可用');
    process.exit(0);
  } else {
    console.log('\n🎉 所有检查项通过！服务运行正常');
    process.exit(0);
  }
}

// 运行健康检查
runHealthCheck().catch(error => {
  console.error('❌ 健康检查脚本执行失败:', error);
  process.exit(1);
});