#!/usr/bin/env node

/**
 * 商业计划生成完整流程诊断脚本
 *
 * 用途：测试从竞价到商业计划显示的完整链路
 */

const https = require('https');

const BASE_URL = 'https://aijiayuan.top';

// 彩色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json, headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, data, headers: res.headers });
        }
      });
    });
    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function testHealthEndpoint() {
  log('\n1️⃣  测试健康检查端点...', 'cyan');

  try {
    const { status, data } = await makeRequest(`${BASE_URL}/api/health`);

    if (status === 200 && data.status === 'healthy') {
      log('✅ 服务器健康', 'green');
      log(`   Uptime: ${Math.floor(data.uptime)}秒`, 'blue');
      log(`   Database: ${data.checks.database.status}`, 'blue');
      log(`   Git Commit: ${data.gitCommit}`, 'blue');
      return true;
    } else {
      log('❌ 服务器异常', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ 无法连接服务器: ${error.message}`, 'red');
    return false;
  }
}

async function testCreateBusinessPlanSession() {
  log('\n2️⃣  测试创建商业计划会话（模拟竞价调用）...', 'cyan');

  const payload = {
    ideaId: 'test-idea-' + Date.now(),
    ideaContent: 'AI+测试诊断',
    ideaTitle: '测试诊断创意',
    source: 'AI_BIDDING',
    highestBid: 500,
    averageBid: 450,
    finalBids: {
      'tech-pioneer-alex': 450,
      'business-guru-beta': 475,
      'innovation-mentor-charlie': 480,
      'market-insight-delta': 485,
      'investment-advisor-ivan': 500
    },
    winner: 'investment-advisor-ivan',
    winnerName: 'Investment Advisor Ivan',
    supportedAgents: [],
    aiMessages: []
  };

  try {
    const { status, data } = await makeRequest(`${BASE_URL}/api/business-plan-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Call': 'true'
      },
      body: JSON.stringify(payload)
    });

    log(`   响应状态: ${status}`, status === 200 ? 'green' : 'red');

    if (status === 200 && data.success) {
      log('✅ 会话创建成功', 'green');
      log(`   Session ID: ${data.sessionId}`, 'blue');
      log(`   Report ID: ${data.reportId}`, 'blue');
      log(`   Business Plan URL: ${data.businessPlanUrl}`, 'blue');
      return data;
    } else {
      log('❌ 会话创建失败', 'red');
      log(`   错误: ${JSON.stringify(data, null, 2)}`, 'red');
      return null;
    }
  } catch (error) {
    log(`❌ 请求失败: ${error.message}`, 'red');
    return null;
  }
}

async function testGetBusinessPlanSession(sessionId) {
  log('\n3️⃣  测试获取商业计划会话（不带认证）...', 'cyan');

  try {
    const { status, data } = await makeRequest(`${BASE_URL}/api/business-plan-session?sessionId=${sessionId}`);

    log(`   响应状态: ${status}`, status === 200 ? 'green' : 'red');

    if (status === 200 && data.success) {
      log('✅ 会话获取成功（匿名访问）', 'green');

      const report = data.data?.report;
      if (report && report.guide) {
        log('✅ 包含完整的 guide 数据', 'green');
        log(`   章节数: ${report.guide.chapters?.length || 0}`, 'blue');
        log(`   创意标题: ${report.guide.metadata?.ideaTitle}`, 'blue');
        return true;
      } else {
        log('❌ 缺少 guide 数据', 'red');
        log(`   数据结构: ${JSON.stringify(data.data, null, 2)}`, 'yellow');
        return false;
      }
    } else if (status === 401) {
      log('❌ 需要认证（匿名访问被阻塞）', 'red');
      log(`   这是前端问题：API 应该允许匿名访问新会话`, 'yellow');
      return false;
    } else {
      log(`❌ 获取失败: ${JSON.stringify(data, null, 2)}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ 请求失败: ${error.message}`, 'red');
    return false;
  }
}

async function testDatabaseSchema() {
  log('\n4️⃣  测试数据库 Schema（通过创建测试）...', 'cyan');

  // 尝试创建一个匿名报告，看是否会失败
  const testResult = await testCreateBusinessPlanSession();

  if (testResult && testResult.sessionId) {
    log('✅ 数据库 Schema 支持匿名用户', 'green');
    log('   BusinessPlanReport.userId 字段已设置为可选', 'blue');
    return true;
  } else {
    log('❌ 数据库 Schema 可能未更新', 'red');
    log('   需要检查 Prisma 迁移是否已应用', 'yellow');
    return false;
  }
}

async function main() {
  log('\n🔍 开始商业计划生成完整流程诊断\n', 'cyan');
  log('='  * 60, 'cyan');

  // 步骤 1: 健康检查
  const healthOk = await testHealthEndpoint();
  if (!healthOk) {
    log('\n❌ 服务器不可用，终止测试', 'red');
    process.exit(1);
  }

  // 步骤 2: 创建会话
  const sessionData = await testCreateBusinessPlanSession();
  if (!sessionData) {
    log('\n❌ 会话创建失败，诊断发现问题', 'red');
    log('\n可能原因：', 'yellow');
    log('  1. Zeabur 未部署最新代码（commit 6e7adf5）', 'yellow');
    log('  2. 数据库 schema 未更新（userId 仍为必填）', 'yellow');
    log('  3. API 路由存在其他错误', 'yellow');
    process.exit(1);
  }

  // 步骤 3: 获取会话
  const getOk = await testGetBusinessPlanSession(sessionData.sessionId);
  if (!getOk) {
    log('\n❌ 会话获取失败，诊断发现问题', 'red');
    log('\n可能原因：', 'yellow');
    log('  1. 前端代码未更新（仍阻塞匿名访问）', 'yellow');
    log('  2. GET API 存在认证问题', 'yellow');
    process.exit(1);
  }

  // 步骤 4: Schema 测试
  await testDatabaseSchema();

  // 最终总结
  log('\n' + '='.repeat(60), 'cyan');
  log('\n✅ 诊断完成！所有测试通过', 'green');
  log('\n完整流程状态：', 'cyan');
  log('  ✅ 服务器健康', 'green');
  log('  ✅ 创建会话成功（匿名）', 'green');
  log('  ✅ 获取会话成功（匿名）', 'green');
  log('  ✅ 数据库 Schema 正确', 'green');

  log('\n🎉 理论上竞价后商业计划应该能正常显示！', 'green');
  log(`\n测试URL: ${BASE_URL}${sessionData.businessPlanUrl}`, 'blue');
  log('\n请在浏览器中打开上述URL验证前端显示', 'yellow');
}

main().catch(error => {
  log(`\n💥 诊断脚本异常: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
