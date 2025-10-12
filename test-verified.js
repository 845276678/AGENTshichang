const fetch = require('node-fetch');

async function testVerifiedAPI() {
  console.log('🔬 测试多AI交叉验证智能分析API...\n');
  console.log('📋 验证机制:');
  console.log('  1. ✅ 同时调用DeepSeek、智谱GLM、通义千问');
  console.log('  2. ✅ 对比三个模型的分析结果');
  console.log('  3. ✅ 识别一致性数据和差异性数据');
  console.log('  4. ✅ 生成综合验证报告\n');

  const requestData = {
    ideaTitle: "AI Agent创意竞价与商业计划生成平台",
    ideaDescription: "一个创新的AI驱动平台，帮助创业者完善和验证创意。核心功能包括：1) 多个AI Agent对用户创意进行竞价评估，从不同角度分析创意的可行性和市场价值；2) 智能引导系统通过对话式交互完善用户创意，补充缺失信息；3) 自动生成专业的商业计划书，包含市场分析、MVP原型、营销策略等模块；4) 提供个性化的落地指导，包括技术栈推荐、调研渠道、预算规划等。目标用户是有创意但缺乏商业规划能力的早期创业者，帮助他们快速验证想法并获得可执行的商业计划。",
    userLocation: "成都",
    userBackground: "非技术背景，有创业想法但不懂编程和产品开发"
  };

  const startTime = Date.now();

  try {
    console.log('⏳ 正在调用3个AI模型进行交叉验证...\n');

    const response = await fetch('http://localhost:4000/api/business-plan/intelligent-analysis-verified', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData),
      timeout: 120000 // 2分钟超时（3个模型并行调用）
    });

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log(`⏱️  总响应时间: ${duration}秒\n`);

    const result = await response.json();

    if (result.success) {
      console.log('✅ 多AI交叉验证成功！\n');

      console.log('==========================================');
      console.log('🔍 验证报告');
      console.log('==========================================');
      console.log(JSON.stringify(result.data.verification, null, 2));

      console.log('\n==========================================');
      console.log('📊 各模型表现');
      console.log('==========================================');
      result.data.modelResults.forEach(model => {
        const status = model.success ? '✅' : '❌';
        console.log(`${status} ${model.model}: ${model.duration}ms ${model.error ? `(${model.error})` : ''}`);
      });

      console.log('\n==========================================');
      console.log('🆚 验证后的竞品分析');
      console.log('==========================================');
      console.log(JSON.stringify(result.data.verified.competitorAnalysis, null, 2));

      console.log('\n==========================================');
      console.log('💡 验证后的技术栈推荐');
      console.log('==========================================');
      console.log(JSON.stringify(result.data.verified.recommendations.techStackRecommendations, null, 2));

      console.log('\n==========================================');
      console.log('🎯 验证后的线下活动');
      console.log('==========================================');
      console.log(JSON.stringify(result.data.verified.recommendations.offlineEvents, null, 2));

      console.log('\n==========================================');
      console.log('ℹ️  元数据');
      console.log('==========================================');
      console.log(JSON.stringify(result.data.metadata, null, 2));

      // 验证交叉验证效果
      console.log('\n==========================================');
      console.log('✅ 交叉验证效果评估');
      console.log('==========================================');

      const successRate = result.data.metadata.successRate;
      const consensusScore = result.data.metadata.consensusScore;

      console.log(`1. 模型成功率: ${successRate}`);
      console.log(`2. 共识度得分: ${consensusScore}%`);
      console.log(`3. 数据质量: ${result.data.verification.dataQuality.status}`);
      console.log(`4. 建议: ${result.data.verification.dataQuality.recommendation}`);

      // 检查竞品验证效果
      const competitors = result.data.verified.competitorAnalysis?.competitors || [];
      const highConfidenceCompetitors = competitors.filter(c => c.confidence === 'high').length;
      console.log(`5. 竞品验证: 发现${competitors.length}个竞品，其中${highConfidenceCompetitors}个高可信度`);

      // 检查活动验证效果
      const events = result.data.verified.recommendations.offlineEvents?.nationalEvents || [];
      const highConfidenceEvents = events.filter(e => e.confidence === 'high').length;
      console.log(`6. 活动验证: 发现${events.length}个活动，其中${highConfidenceEvents}个高可信度`);

    } else {
      console.error('❌ 多AI交叉验证失败:', result.error);
    }

  } catch (error) {
    console.error('❌ 请求失败:', error.message);
  }
}

testVerifiedAPI();
