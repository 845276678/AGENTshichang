const https = require('https');
const http = require('http');

const requestData = JSON.stringify({
  ideaTitle: "AI Agent创意竞价与商业计划生成平台",
  ideaDescription: "一个创新的AI驱动平台，帮助创业者完善和验证创意。核心功能包括：1) 多个AI Agent对用户创意进行竞价评估；2) 智能引导系统完善创意；3) 自动生成商业计划书；4) 提供个性化落地指导。",
  userLocation: "成都",
  userBackground: "非技术背景，有创业想法但不懂编程和产品开发",
  preferredAIModel: "deepseek"
});

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/business-plan/intelligent-analysis-v2',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(requestData)
  },
  timeout: 60000
};

console.log('🚀 发送请求...\n');
const startTime = Date.now();

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`⏱️  耗时: ${duration}秒\n`);

    try {
      const result = JSON.parse(data);

      if (result.success) {
        console.log('✅ 分析成功！\n');
        console.log('========== 竞品分析 (新增) ==========');
        console.log(JSON.stringify(result.data.competitorAnalysis, null, 2));

        console.log('\n========== 技术栈推荐 ==========');
        console.log(JSON.stringify(result.data.recommendations.techStackRecommendations, null, 2));

        console.log('\n========== 线下活动 ==========');
        console.log(JSON.stringify(result.data.recommendations.offlineEvents, null, 2));
      }
    } catch (e) {
      console.error('解析失败:', e.message);
      console.log('原始响应:', data.substring(0, 1000));
    }
  });
});

req.on('error', (e) => {
  console.error(`请求失败: ${e.message}`);
});

req.on('timeout', () => {
  req.destroy();
  console.error('请求超时');
});

req.write(requestData);
req.end();
