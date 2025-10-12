const fetch = require('node-fetch');

// 测试不同的创意
const testCases = [
  {
    name: "测试1: AI Agent平台 (缓存测试)",
    data: {
      ideaTitle: "AI Agent创意竞价与商业计划生成平台",
      ideaDescription: "一个创新的AI驱动平台，帮助创业者完善和验证创意。核心功能包括：1) 多个AI Agent对用户创意进行竞价评估，从不同角度分析创意的可行性和市场价值；2) 智能引导系统通过对话式交互完善用户创意，补充缺失信息；3) 自动生成专业的商业计划书，包含市场分析、MVP原型、营销策略等模块；4) 提供个性化的落地指导，包括技术栈推荐、调研渠道、预算规划等。目标用户是有创意但缺乏商业规划能力的早期创业者，帮助他们快速验证想法并获得可执行的商业计划。",
      userLocation: "成都",
      userBackground: "非技术背景，有创业想法但不懂编程和产品开发"
    },
    expectCached: true
  },
  {
    name: "测试2: 在线教育平台 (新请求)",
    data: {
      ideaTitle: "青少年编程在线教育平台",
      ideaDescription: "针对6-18岁青少年的编程教育平台，采用游戏化教学方式，从图形化编程到Python、JavaScript等主流语言，提供完整的学习路径。平台特色：1) AI助教实时解答问题；2) 项目制学习，学生可以做出真实作品；3) 线上编程竞赛激发兴趣；4) 家长端实时查看学习进度。目标解决传统编程教育枯燥、缺乏实践的问题。",
      userLocation: "上海",
      userBackground: "教育行业从业者，有5年少儿教育经验"
    },
    expectCached: false
  },
  {
    name: "测试3: 智能健康管理 (新请求)",
    data: {
      ideaTitle: "AI智能慢病管理助手",
      ideaDescription: "面向糖尿病、高血压等慢性病患者的智能健康管理工具。核心功能：1) 智能饮食建议，根据血糖、血压数据推荐饮食方案；2) 用药提醒和用药记录管理；3) 健康数据可视化分析；4) 连接智能硬件（血糖仪、血压计）自动采集数据；5) AI健康顾问提供24/7咨询。目标用户是中老年慢病患者及其家属，帮助他们科学管理健康。",
      userLocation: "北京",
      userBackground: "医疗器械行业，有医疗资源和渠道"
    },
    expectCached: false
  }
];

async function runTests() {
  console.log('🧪 开始完整的端到端测试...\n');
  console.log('==========================================');
  console.log('测试计划:');
  console.log('  1. 测试缓存命中 (相同请求)');
  console.log('  2. 测试新创意分析 (教育领域)');
  console.log('  3. 测试新创意分析 (医疗健康领域)');
  console.log('==========================================\n');

  const results = [];

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📋 ${testCase.name}`);
    console.log(`${'='.repeat(60)}\n`);

    const startTime = Date.now();

    try {
      const response = await fetch('http://localhost:4000/api/business-plan/intelligent-analysis-verified', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testCase.data),
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

      // 验证结果
      const isCached = result.data.metadata.cached === true;
      const successRate = result.data.metadata.successRate;
      const consensusScore = result.data.metadata.consensusScore;
      const verification = result.data.verification;

      console.log(`⏱️  响应时间: ${duration}秒`);
      console.log(`📦 缓存状态: ${isCached ? '✅ 命中缓存' : '❌ 新请求'}`);
      console.log(`🎯 模型成功率: ${successRate}`);
      console.log(`📊 共识度: ${consensusScore}%`);
      console.log(`💡 数据质量: ${verification.dataQuality.status}`);
      console.log(`📝 建议: ${verification.dataQuality.recommendation}`);

      // 显示各模型表现
      console.log('\n🤖 模型表现:');
      result.data.modelResults.forEach(model => {
        const status = model.success ? '✅' : '❌';
        const time = model.success ? `${(model.duration / 1000).toFixed(2)}秒` : model.error;
        console.log(`   ${status} ${model.model}: ${time}`);
      });

      // 显示关键数据
      const competitors = result.data.verified.competitorAnalysis?.competitors?.length || 0;
      const events = result.data.verified.recommendations?.offlineEvents?.nationalEvents?.length || 0;
      const techStack = result.data.verified.recommendations?.techStackRecommendations?.beginner?.primary || '未知';

      console.log('\n📈 生成的数据:');
      console.log(`   竞品数量: ${competitors}个`);
      console.log(`   线下活动: ${events}个`);
      console.log(`   推荐技术栈: ${techStack.substring(0, 50)}...`);

      // 验证预期
      const cacheMatched = isCached === testCase.expectCached;
      console.log(`\n✅ 缓存预期: ${testCase.expectCached ? '应该命中' : '应该miss'} - ${cacheMatched ? '✅ 符合' : '❌ 不符'}`);

      results.push({
        name: testCase.name,
        success: true,
        duration,
        cached: isCached,
        successRate,
        consensusScore,
        cacheMatched
      });

    } catch (error) {
      console.error(`❌ 测试失败: ${error.message}`);
      results.push({
        name: testCase.name,
        success: false,
        error: error.message
      });
    }

    // 等待一下再继续下一个测试
    if (i < testCases.length - 1) {
      console.log('\n⏳ 等待2秒后继续下一个测试...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // 输出总结
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 测试总结');
  console.log('='.repeat(60));

  results.forEach((result, index) => {
    console.log(`\n${index + 1}. ${result.name}`);
    if (result.success) {
      console.log(`   状态: ✅ 成功`);
      console.log(`   响应时间: ${result.duration}秒`);
      console.log(`   缓存: ${result.cached ? '✅ 命中' : '❌ Miss'}`);
      console.log(`   成功率: ${result.successRate}`);
      console.log(`   共识度: ${result.consensusScore}%`);
      console.log(`   预期验证: ${result.cacheMatched ? '✅ 通过' : '❌ 失败'}`);
    } else {
      console.log(`   状态: ❌ 失败`);
      console.log(`   错误: ${result.error}`);
    }
  });

  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  const successRate = ((successCount / totalCount) * 100).toFixed(0);

  console.log('\n' + '='.repeat(60));
  console.log(`🎯 总体成功率: ${successCount}/${totalCount} (${successRate}%)`);
  console.log('='.repeat(60));
}

runTests().catch(console.error);
