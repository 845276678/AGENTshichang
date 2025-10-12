const fetch = require('node-fetch');

// 测试缓存验证 - 重复之前的请求
async function testCache() {
  console.log('🔄 测试缓存功能验证...\n');

  const testCase = {
    ideaTitle: "青少年编程在线教育平台",
    ideaDescription: "针对6-18岁青少年的编程教育平台，采用游戏化教学方式，从图形化编程到Python、JavaScript等主流语言，提供完整的学习路径。平台特色：1) AI助教实时解答问题；2) 项目制学习，学生可以做出真实作品；3) 线上编程竞赛激发兴趣；4) 家长端实时查看学习进度。目标解决传统编程教育枯燥、缺乏实践的问题。",
    userLocation: "上海",
    userBackground: "教育行业从业者，有5年少儿教育经验"
  };

  console.log('📋 测试创意: 青少年编程在线教育平台');
  console.log('🎯 预期: 应该命中缓存 (刚刚请求过)\n');

  const startTime = Date.now();

  try {
    const response = await fetch('http://localhost:4000/api/business-plan/intelligent-analysis-verified', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testCase)
    });

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    const result = await response.json();

    if (result.success) {
      const isCached = result.data.metadata.cached === true;
      const cachedAt = result.data.metadata.cachedAt;

      console.log(`⏱️  响应时间: ${duration}秒`);
      console.log(`📦 缓存状态: ${isCached ? '✅ 命中缓存' : '❌ 未命中缓存'}`);

      if (isCached) {
        console.log(`🕒 缓存时间: ${cachedAt}`);
        console.log(`🎯 模型成功率: ${result.data.metadata.successRate}`);
        console.log(`📊 共识度: ${result.data.metadata.consensusScore}%`);
        console.log('\n✅ 缓存验证成功! 响应时间从55秒降低到' + duration + '秒');
        console.log(`💰 节省成本: 避免了3次AI模型调用`);
      } else {
        console.log('\n⚠️  警告: 预期命中缓存但实际未命中');
      }
    } else {
      console.error('❌ 请求失败:', result.error);
    }
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testCache();
