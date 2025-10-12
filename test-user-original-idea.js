const fetch = require('node-fetch');

async function testUserOriginalIdea() {
  console.log('🎯 测试用户原始创意...\n');
  console.log('==========================================');
  console.log('创意: AI Agent创意竞价与商业计划生成平台');
  console.log('地点: 成都');
  console.log('背景: 非技术背景,有创业想法但不懂编程');
  console.log('==========================================\n');

  const requestData = {
    ideaTitle: "AI Agent创意竞价与商业计划生成平台",
    ideaDescription: "一个创新的AI驱动平台，帮助创业者完善和验证创意。核心功能包括：1) 多个AI Agent对用户创意进行竞价评估，从不同角度分析创意的可行性和市场价值；2) 智能引导系统通过对话式交互完善用户创意，补充缺失信息；3) 自动生成专业的商业计划书，包含市场分析、MVP原型、营销策略等模块；4) 提供个性化的落地指导，包括技术栈推荐、调研渠道、预算规划等。目标用户是有创意但缺乏商业规划能力的早期创业者，帮助他们快速验证想法并获得可执行的商业计划。",
    userLocation: "成都",
    userBackground: "非技术背景，有创业想法但不懂编程和产品开发"
  };

  const startTime = Date.now();

  try {
    console.log('🔬 开始调用多AI交叉验证API...\n');

    const response = await fetch('http://localhost:4000/api/business-plan/intelligent-analysis-verified', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData),
      timeout: 120000
    });

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || '分析失败');
    }

    console.log(`⏱️  总响应时间: ${duration}秒`);
    console.log(`📦 缓存状态: ${result.data.metadata.cached ? '✅ 命中缓存' : '❌ 新请求'}\n`);

    // 显示验证报告
    console.log('==========================================');
    console.log('📊 多AI交叉验证报告');
    console.log('==========================================');
    const verification = result.data.verification;
    console.log(`摘要: ${verification.summary}`);
    console.log(`数据质量: ${verification.dataQuality.status} (共识度${verification.dataQuality.consensusScore}%)`);
    console.log(`建议: ${verification.dataQuality.recommendation}\n`);

    // 显示各模型表现
    console.log('🤖 各模型表现:');
    result.data.modelResults.forEach(model => {
      const status = model.success ? '✅' : '❌';
      const time = model.success ? `${(model.duration / 1000).toFixed(2)}秒` : model.error;
      console.log(`   ${status} ${model.model}: ${time}`);
    });

    // 验证4个用户关注的问题
    console.log('\n==========================================');
    console.log('✅ 验证用户提出的4个问题');
    console.log('==========================================\n');

    // 问题1: 竞品对比
    const competitors = result.data.verified.competitorAnalysis?.competitors || [];
    console.log('1️⃣ 竞品对比分析:');
    if (competitors.length > 0) {
      console.log(`   ✅ 已生成! 发现${competitors.length}个竞品`);
      competitors.slice(0, 3).forEach((comp, index) => {
        console.log(`   ${index + 1}. ${comp.name}`);
        console.log(`      优势: ${comp.strength?.substring(0, 50)}...`);
        console.log(`      劣势: ${comp.weakness?.substring(0, 50)}...`);
        console.log(`      差异化: ${comp.differentiation?.substring(0, 50)}...`);
        console.log(`      可信度: ${comp.confidence} (被${comp.mentionedBy}个模型提及)`);
      });
    } else {
      console.log('   ❌ 未生成竞品分析');
    }

    // 问题2: 活动推荐
    const events = result.data.verified.recommendations?.offlineEvents?.nationalEvents || [];
    console.log('\n2️⃣ 线下活动推荐 (黑客松等):');
    if (events.length > 0) {
      console.log(`   ✅ 已推荐! 共${events.length}个活动`);
      events.forEach((event, index) => {
        console.log(`   ${index + 1}. ${event.name}`);
        console.log(`      时间: ${event.time}`);
        console.log(`      地点: ${event.location}`);
        console.log(`      费用: ${event.cost}`);
        console.log(`      可信度: ${event.confidence} (被${event.mentionedBy}个模型提及)`);
      });

      const hasHackathon = events.some(e =>
        e.name.includes('黑客松') ||
        e.name.includes('Hackathon') ||
        e.name.includes('开发者') ||
        e.name.includes('AI大会')
      );
      console.log(`   ${hasHackathon ? '✅' : '⚠️'} 是否包含黑客松/开发者活动: ${hasHackathon ? '是' : '否'}`);
    } else {
      console.log('   ❌ 未推荐活动');
    }

    // 问题3: 国产工具优先
    const techStack = result.data.verified.recommendations?.techStackRecommendations?.beginner?.primary || '';
    console.log('\n3️⃣ 技术栈推荐 (优先国产):');
    console.log(`   主要推荐: ${techStack}`);

    const hasDomesticTools =
      techStack.includes('Trae') ||
      techStack.includes('腾讯') ||
      techStack.includes('阿里') ||
      techStack.includes('智谱') ||
      techStack.includes('百度') ||
      techStack.includes('华为');

    console.log(`   ${hasDomesticTools ? '✅' : '❌'} 是否优先国产工具: ${hasDomesticTools ? '是' : '否'}`);

    if (hasDomesticTools) {
      const tools = techStack.match(/(Trae|腾讯[^、+,，\s]+|阿里[^、+,，\s]+|智谱[^、+,，\s]+|百度[^、+,，\s]+|华为[^、+,，\s]+)/g) || [];
      console.log(`   国产工具列表: ${tools.join(', ')}`);
    }

    // 问题4: 3个AI交叉验证
    console.log('\n4️⃣ 多AI交叉验证机制:');
    const modelCount = result.data.modelResults.filter(m => m.success).length;
    const totalModels = result.data.modelResults.length;
    console.log(`   ✅ 已实现! ${modelCount}/${totalModels}个模型参与验证`);
    console.log(`   模型列表: ${result.data.metadata.modelsUsed.join(', ')}`);
    console.log(`   共识度评分: ${result.data.metadata.consensusScore}%`);
    console.log(`   验证机制: 竞品去重、可信度标注、共识度计算`);

    // 显示关键数据摘要
    console.log('\n==========================================');
    console.log('📈 关键数据摘要');
    console.log('==========================================');
    console.log(`竞品数量: ${competitors.length}个`);
    console.log(`线下活动: ${events.length}个 (${events.filter(e => e.confidence === 'high').length}个高可信度)`);
    console.log(`推荐技术栈: ${techStack.substring(0, 80)}...`);
    console.log(`预算估算: 启动${result.data.verified.recommendations?.budgetPlan?.startupCosts?.total || '待评估'}, 月度${result.data.verified.recommendations?.budgetPlan?.monthlyCosts?.total || '待评估'}`);

    // 总结
    console.log('\n==========================================');
    console.log('🎉 测试结论');
    console.log('==========================================');
    const allPassed = competitors.length > 0 && events.length > 0 && hasDomesticTools && modelCount === 3;

    if (allPassed) {
      console.log('✅ 所有用户提出的问题都已解决!');
      console.log('✅ 1. 竞品对比 - 已生成');
      console.log('✅ 2. 活动推荐 - 已包含');
      console.log('✅ 3. 国产工具 - 优先推荐');
      console.log('✅ 4. 多AI验证 - 已实现');
    } else {
      console.log('⚠️ 部分功能需要优化');
      console.log(`${competitors.length > 0 ? '✅' : '❌'} 1. 竞品对比`);
      console.log(`${events.length > 0 ? '✅' : '❌'} 2. 活动推荐`);
      console.log(`${hasDomesticTools ? '✅' : '❌'} 3. 国产工具`);
      console.log(`${modelCount === 3 ? '✅' : '❌'} 4. 多AI验证`);
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testUserOriginalIdea();
