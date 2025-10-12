const fetch = require('node-fetch');

async function testImprovedAPI() {
  console.log('🚀 测试改进版AI分析API (V2)...\n');
  console.log('📋 改进点:');
  console.log('  1. ✅ 增加竞品对比分析');
  console.log('  2. ✅ 推荐实时活动（如黑客松）');
  console.log('  3. ✅ 优先推荐中国本土工具（Trae.ai等）');
  console.log('  4. ✅ 支持多AI模型选择\n');

  const requestData = {
    ideaTitle: "AI Agent创意竞价与商业计划生成平台",
    ideaDescription: "一个创新的AI驱动平台，帮助创业者完善和验证创意。核心功能包括：1) 多个AI Agent对用户创意进行竞价评估，从不同角度分析创意的可行性和市场价值；2) 智能引导系统通过对话式交互完善用户创意，补充缺失信息；3) 自动生成专业的商业计划书，包含市场分析、MVP原型、营销策略等模块；4) 提供个性化的落地指导，包括技术栈推荐、调研渠道、预算规划等。目标用户是有创意但缺乏商业规划能力的早期创业者，帮助他们快速验证想法并获得可执行的商业计划。",
    userLocation: "成都",
    userBackground: "非技术背景，有创业想法但不懂编程和产品开发",
    preferredAIModel: "deepseek" // 可以改为 "zhipu" 或 "qwen" 测试不同模型
  };

  const startTime = Date.now();

  try {
    console.log('⏳ 正在调用API...\n');

    const response = await fetch('http://localhost:4000/api/business-plan/intelligent-analysis-v2', {
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
      console.log('🆚 竞品分析（新增功能！）');
      console.log('==========================================');
      if (result.data.competitorAnalysis) {
        console.log(JSON.stringify(result.data.competitorAnalysis, null, 2));
      } else {
        console.log('⚠️  未返回竞品分析');
      }

      console.log('\n==========================================');
      console.log('💡 技术栈推荐（优先国产工具）');
      console.log('==========================================');
      console.log(JSON.stringify(result.data.recommendations.techStackRecommendations, null, 2));

      console.log('\n==========================================');
      console.log('🎯 线下活动推荐（实时活动）');
      console.log('==========================================');
      console.log(JSON.stringify(result.data.recommendations.offlineEvents, null, 2));

      console.log('\n==========================================');
      console.log('📈 预算规划');
      console.log('==========================================');
      console.log(JSON.stringify(result.data.recommendations.budgetPlan, null, 2));

      console.log('\n==========================================');
      console.log('ℹ️  元数据');
      console.log('==========================================');
      console.log(JSON.stringify(result.data.metadata, null, 2));

      // 验证改进点
      console.log('\n==========================================');
      console.log('✅ 改进点验证');
      console.log('==========================================');

      const hasCompetitors = result.data.competitorAnalysis?.competitors?.length > 0;
      console.log(`1. 竞品分析: ${hasCompetitors ? '✅ 已包含' : '❌ 缺失'}`);

      const techStack = result.data.recommendations.techStackRecommendations.beginner.primary || '';
      const hasDomesticTools = techStack.includes('Trae') ||
                              techStack.includes('腾讯') ||
                              techStack.includes('阿里') ||
                              techStack.includes('智谱') ||
                              techStack.includes('千问');
      console.log(`2. 国产工具推荐: ${hasDomesticTools ? '✅ 已优先' : '⚠️  未优先'}`);

      const events = result.data.recommendations.offlineEvents.nationalEvents || [];
      const hasRecentEvents = events.some(e =>
        e.time?.includes('2025') ||
        e.name?.includes('黑客松') ||
        e.name?.includes('Hackathon')
      );
      console.log(`3. 实时活动信息: ${hasRecentEvents ? '✅ 已更新' : '⚠️  待优化'}`);

      console.log(`4. AI模型选择: ✅ 使用${result.data.metadata.aiModel}`);

    } else {
      console.error('❌ AI分析失败:', result.error);
    }

  } catch (error) {
    console.error('❌ 请求失败:', error.message);
  }
}

testImprovedAPI();
