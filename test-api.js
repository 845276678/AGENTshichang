const fetch = require('node-fetch');

async function testAPI() {
  console.log('🚀 开始测试AI分析API...\n');

  const requestData = {
    ideaTitle: "AI Agent创意竞价与商业计划生成平台",
    ideaDescription: "一个创新的AI驱动平台，帮助创业者完善和验证创意。核心功能包括：1) 多个AI Agent对用户创意进行竞价评估，从不同角度分析创意的可行性和市场价值；2) 智能引导系统通过对话式交互完善用户创意，补充缺失信息；3) 自动生成专业的商业计划书，包含市场分析、MVP原型、营销策略等模块；4) 提供个性化的落地指导，包括技术栈推荐、调研渠道、预算规划等。目标用户是有创意但缺乏商业规划能力的早期创业者，帮助他们快速验证想法并获得可执行的商业计划。",
    userLocation: "成都",
    userBackground: "非技术背景，有创业想法但不懂编程和产品开发"
  };

  const startTime = Date.now();

  try {
    const response = await fetch('http://localhost:4000/api/business-plan/intelligent-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log(`⏱️  API响应时间: ${duration}秒\n`);

    const result = await response.json();

    if (result.success) {
      console.log('✅ AI分析成功！\n');
      console.log('==========================================');
      console.log('📊 创意特征分析');
      console.log('==========================================');
      console.log(JSON.stringify(result.data.characteristics, null, 2));

      console.log('\n==========================================');
      console.log('💡 个性化推荐方案');
      console.log('==========================================');
      console.log(JSON.stringify(result.data.recommendations, null, 2));
    } else {
      console.error('❌ AI分析失败:', result.error);
    }

  } catch (error) {
    console.error('❌ 请求失败:', error.message);
  }
}

testAPI();
