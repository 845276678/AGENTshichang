// 部署场景测试脚本
// Spec: CREATIVE_MATURITY_PLAN_ENHANCED.md v4.1 (Task 12)
// Usage: npx tsx scripts/deployment-test.ts

import { MaturityScorer } from '@/lib/business-plan/maturity-scorer';
import { WeightConfigManager } from '@/lib/business-plan/weight-config-manager';
import type { AIMessage } from '@/types/maturity-score';

/**
 * 4个部署测试场景
 */
const DEPLOYMENT_SCENARIOS = [
  // ========================================
  // 场景1: 极低分创意 (1-2分)
  // 期望: 返回聚焦引导模板
  // ========================================
  {
    id: 'scenario-1',
    name: '场景1: 极低分创意',
    description: '只有模糊描述，无具体细节，期望1-2分',
    expectedScore: [1.0, 2.5],
    expectedLevel: 'LOW',
    expectedOutput: '聚焦引导模板（The Mom Test问题清单）',
    ideaContent: '一个AI工具',
    aiMessages: [
      {
        personaId: 'tech-pioneer-alex',
        content: 'This idea is too vague. What specific problem does it solve?',
        phase: 'discussion',
        round: 1
      },
      {
        personaId: 'business-guru-beta',
        content: '这个创意太宽泛了，目标客户是谁？',
        phase: 'discussion',
        round: 1
      }
    ] as AIMessage[],
    bids: {
      'tech-pioneer-alex': 40,
      'business-guru-beta': 35
    }
  },

  // ========================================
  // 场景2: 灰色区低分 (4.0-5.0)
  // 期望: 显示"补充信息（免费）"提示
  // ========================================
  {
    id: 'scenario-2',
    name: '场景2: 灰色区低分 (想法→方向)',
    description: '有基本描述，但缺少验证，期望4.0-5.0分',
    expectedScore: [4.0, 5.0],
    expectedLevel: 'GRAY_LOW',
    expectedOutput: '灰色区提示：补充3个问题（免费），可能升级',
    ideaContent: '自由职业者时间管理工具，帮助追踪项目时间和计算时薪',
    aiMessages: [
      {
        personaId: 'business-guru-beta',
        content: '目标客户是谁？是自由职业者吗？',
        phase: 'discussion',
        round: 1
      },
      {
        personaId: 'tech-pioneer-alex',
        content: 'Technical approach looks feasible. MVP can be built in 4-6 weeks.',
        phase: 'discussion',
        round: 1
      },
      {
        personaId: 'innovation-mentor-charlie',
        content: '用户场景需要更明确，具体是什么场景下用？',
        phase: 'discussion',
        round: 1
      }
    ] as AIMessage[],
    bids: {
      'business-guru-beta': 100,
      'tech-pioneer-alex': 110,
      'innovation-mentor-charlie': 95
    }
  },

  // ========================================
  // 场景3: 中等成熟度 (5-7分)
  // 期望: 生成详细商业计划书
  // ========================================
  {
    id: 'scenario-3',
    name: '场景3: 中等成熟度 (方向阶段)',
    description: '有目标客户验证和初步数据，期望5-7分',
    expectedScore: [5.0, 7.0],
    expectedLevel: 'MEDIUM',
    expectedOutput: '详细商业计划书（15-25页）',
    ideaContent: '自由职业者时间管理工具，已访谈5位设计师确认痛点：手动记录时间效率低，难以准确计算时薪',
    aiMessages: [
      {
        personaId: 'business-guru-beta',
        content: '目标客户清晰：自由职业者（设计师、程序员）。已访谈5人，发现时间管理是痛点。上次有个设计师说"上周我花了3小时整理项目时间，结果发现算错了时薪"。',
        phase: 'discussion',
        round: 1
      },
      {
        personaId: 'tech-pioneer-alex',
        content: 'MVP已在开发，预计4周完成。技术方案可行，使用React+Node.js。',
        phase: 'discussion',
        round: 1
      },
      {
        personaId: 'innovation-mentor-charlie',
        content: '用户旅程清晰：开始项目→追踪时间→查看报告→优化时薪。体验不错。',
        phase: 'discussion',
        round: 1
      },
      {
        personaId: 'market-insight-delta',
        content: '竞品分析做了：Toggl、RescueTime。差异点：AI时薪优化建议。',
        phase: 'discussion',
        round: 1
      }
    ] as AIMessage[],
    bids: {
      'business-guru-beta': 150,
      'tech-pioneer-alex': 140,
      'innovation-mentor-charlie': 135,
      'market-insight-delta': 145
    }
  },

  // ========================================
  // 场景4: 灰色区高分 (7.0-7.5)
  // 期望: 显示"开始验证（需补600积分）"提示
  // ========================================
  {
    id: 'scenario-4',
    name: '场景4: 灰色区高分 (方向→方案)',
    description: '有真实数据和付费用户，期望7.0-7.5分',
    expectedScore: [7.0, 7.5],
    expectedLevel: 'GRAY_HIGH',
    expectedOutput: '灰色区提示：验证升级（需补600积分），可获投资级计划书',
    ideaContent: '自由职业者时间管理工具，运行6个月，200付费用户，月收入1万元，留存率55%',
    aiMessages: [
      {
        personaId: 'investment-advisor-ivan',
        content: '运行6个月，200付费用户，月收入1万元，MRR增长10%/月。上月一位咨询师用户说"去年我用Excel管理项目时间，发现3个项目亏损，今年用你们的工具，所有项目都盈利了"。LTV/CAC = 4.5，健康。',
        phase: 'discussion',
        round: 1
      },
      {
        personaId: 'business-guru-beta',
        content: '商业模式清晰：订阅制49元/月。已有企业客户：某设计公司采购了20个席位。留存率55%，不错。已有用户介绍：一位设计师介绍了他的2个同行。',
        phase: 'discussion',
        round: 1
      },
      {
        personaId: 'tech-pioneer-alex',
        content: 'Technical moat: proprietary AI time-value algorithm. Architecture scales to 1000 users. MVP已验证，现在优化性能。',
        phase: 'discussion',
        round: 1
      },
      {
        personaId: 'market-insight-delta',
        content: '用户评价好：App Store 4.6分，50+评论。社交媒体提及：小红书有20+笔记推荐。增长数据：上月新增50用户，自然增长占30%。',
        phase: 'discussion',
        round: 1
      },
      {
        personaId: 'innovation-mentor-charlie',
        content: '用户反馈真实："上个月我通过AI建议，拒绝了一个低时薪项目，省下时间接了更好的单子，多赚了5000元"。',
        phase: 'discussion',
        round: 1
      }
    ] as AIMessage[],
    bids: {
      'investment-advisor-ivan': 220,
      'business-guru-beta': 210,
      'tech-pioneer-alex': 200,
      'market-insight-delta': 205,
      'innovation-mentor-charlie': 195
    }
  }
];

/**
 * 执行部署场景测试
 */
async function runDeploymentTest() {
  console.log('🚀 开始部署场景测试 (4个场景)...\n');
  console.log('=' .repeat(80) + '\n');

  // 获取当前权重配置
  const weightManager = new WeightConfigManager();
  const config = await weightManager.getActiveWeightConfig();

  console.log(`📐 使用权重配置: ${config.version}`);
  console.log(`   权重: TC(${config.weights.targetCustomer}), DS(${config.weights.demandScenario}), CV(${config.weights.coreValue}), BM(${config.weights.businessModel}), CR(${config.weights.credibility})`);
  console.log(`   阈值: LOW<${config.thresholds.lowMax}, GRAY_LOW<${config.thresholds.midMin}, MED<${config.thresholds.midMax}, GRAY_HIGH<${config.thresholds.highMin}, HIGH≥${config.thresholds.highMin}\n`);
  console.log('=' .repeat(80) + '\n');

  const scorer = new MaturityScorer(config.weights, config.thresholds);
  const results: any[] = [];

  for (let i = 0; i < DEPLOYMENT_SCENARIOS.length; i++) {
    const scenario = DEPLOYMENT_SCENARIOS[i];

    console.log(`\n📝 ${scenario.name}`);
    console.log(`   描述: ${scenario.description}`);
    console.log(`   期望分数: ${scenario.expectedScore[0]}-${scenario.expectedScore[1]}`);
    console.log(`   期望等级: ${scenario.expectedLevel}`);
    console.log(`   期望输出: ${scenario.expectedOutput}`);
    console.log(`   创意内容: ${scenario.ideaContent.substring(0, 60)}...`);
    console.log(`   AI消息数: ${scenario.aiMessages.length}`);

    try {
      // 执行评分
      const scoreResult = scorer.analyze(scenario.aiMessages, scenario.bids);

      const isScoreInRange =
        scoreResult.totalScore >= scenario.expectedScore[0] &&
        scoreResult.totalScore <= scenario.expectedScore[1];

      const isLevelMatch =
        scoreResult.level === scenario.expectedLevel ||
        (scenario.expectedLevel === 'LOW' && scoreResult.level === 'GRAY_LOW') ||
        (scenario.expectedLevel === 'MEDIUM' && (scoreResult.level === 'MEDIUM' || scoreResult.level === 'GRAY_HIGH'));

      results.push({
        scenarioId: scenario.id,
        scenarioName: scenario.name,
        expectedScore: scenario.expectedScore,
        expectedLevel: scenario.expectedLevel,
        actualScore: scoreResult.totalScore,
        actualLevel: scoreResult.level,
        confidence: scoreResult.confidence,
        isScoreInRange,
        isLevelMatch,
        dimensions: scoreResult.dimensions,
        validSignals: scoreResult.validSignals,
        invalidSignals: scoreResult.invalidSignals
      });

      console.log(`\n   ✅ 评分完成:`);
      console.log(`      实际分数: ${scoreResult.totalScore.toFixed(1)}/10`);
      console.log(`      实际等级: ${scoreResult.level}`);
      console.log(`      置信度: ${(scoreResult.confidence * 100).toFixed(0)}%`);
      console.log(`      分数匹配: ${isScoreInRange ? '✅ 是' : '❌ 否'}`);
      console.log(`      等级匹配: ${isLevelMatch ? '✅ 是' : '❌ 否'}`);

      // 显示五维评分
      console.log(`\n   📊 五维评分:`);
      console.log(`      目标客户: ${scoreResult.dimensions.targetCustomer.score.toFixed(1)} (${scoreResult.dimensions.targetCustomer.status})`);
      console.log(`      需求场景: ${scoreResult.dimensions.demandScenario.score.toFixed(1)} (${scoreResult.dimensions.demandScenario.status})`);
      console.log(`      核心价值: ${scoreResult.dimensions.coreValue.score.toFixed(1)} (${scoreResult.dimensions.coreValue.status})`);
      console.log(`      商业模式: ${scoreResult.dimensions.businessModel.score.toFixed(1)} (${scoreResult.dimensions.businessModel.status})`);
      console.log(`      可信度: ${scoreResult.dimensions.credibility.score.toFixed(1)} (${scoreResult.dimensions.credibility.status})`);

      // 显示The Mom Test信号
      console.log(`\n   🔍 The Mom Test信号:`);
      console.log(`      有效信号: 具体过去(${scoreResult.validSignals.specificPast}), 真实付费(${scoreResult.validSignals.realSpending}), 痛点(${scoreResult.validSignals.painPoints}), 推荐(${scoreResult.validSignals.userIntroductions}), 证据(${scoreResult.validSignals.evidence})`);
      console.log(`      无效信号: 赞美(${scoreResult.invalidSignals.compliments}), 泛泛(${scoreResult.invalidSignals.generalities}), 未来承诺(${scoreResult.invalidSignals.futurePromises})`);

      // 场景特定验证
      if (scenario.id === 'scenario-1') {
        console.log(`\n   🎯 场景验证:`);
        console.log(`      ${scoreResult.totalScore < 3 ? '✅' : '❌'} 极低分创意正确识别 (实际${scoreResult.totalScore.toFixed(1)}, 期望<3)`);
        console.log(`      ${scoreResult.level === 'LOW' ? '✅' : '❌'} 应返回聚焦引导模板`);
      } else if (scenario.id === 'scenario-2') {
        console.log(`\n   🎯 场景验证:`);
        console.log(`      ${scoreResult.level === 'GRAY_LOW' ? '✅' : '❌'} 灰色区低分正确识别`);
        console.log(`      ${scoreResult.level === 'GRAY_LOW' ? '✅' : '❌'} 前端应显示"补充信息（免费）"提示`);
      } else if (scenario.id === 'scenario-3') {
        console.log(`\n   🎯 场景验证:`);
        console.log(`      ${scoreResult.level === 'MEDIUM' ? '✅' : '❌'} 中等成熟度正确识别`);
        console.log(`      ${scoreResult.level === 'MEDIUM' ? '✅' : '❌'} 应生成详细商业计划书（15-25页）`);
      } else if (scenario.id === 'scenario-4') {
        console.log(`\n   🎯 场景验证:`);
        console.log(`      ${scoreResult.level === 'GRAY_HIGH' ? '✅' : '❌'} 灰色区高分正确识别`);
        console.log(`      ${scoreResult.level === 'GRAY_HIGH' ? '✅' : '❌'} 前端应显示"开始验证（需补600积分）"提示`);
      }

    } catch (error) {
      console.error(`\n   ❌ 评分失败:`, error);
      results.push({
        scenarioId: scenario.id,
        scenarioName: scenario.name,
        error: (error as Error).message
      });
    }

    console.log('\n' + '-'.repeat(80));
  }

  // 汇总结果
  console.log('\n\n' + '='.repeat(80));
  console.log('\n📊 部署测试结果汇总\n');

  const successfulTests = results.filter(r => !r.error && r.isScoreInRange && r.isLevelMatch);
  const partialTests = results.filter(r => !r.error && (r.isScoreInRange || r.isLevelMatch) && !(r.isScoreInRange && r.isLevelMatch));
  const failedTests = results.filter(r => r.error || (!r.isScoreInRange && !r.isLevelMatch));

  console.log(`✅ 完全通过: ${successfulTests.length}/4 (${(successfulTests.length / 4 * 100).toFixed(0)}%)`);
  console.log(`⚠️  部分通过: ${partialTests.length}/4 (${(partialTests.length / 4 * 100).toFixed(0)}%)`);
  console.log(`❌ 未通过: ${failedTests.length}/4 (${(failedTests.length / 4 * 100).toFixed(0)}%)`);

  console.log('\n📋 详细结果:\n');
  results.forEach((result, i) => {
    const status =
      result.error ? '❌ 失败' :
      result.isScoreInRange && result.isLevelMatch ? '✅ 通过' :
      '⚠️  部分通过';

    console.log(`${i + 1}. ${result.scenarioName}: ${status}`);
    if (!result.error) {
      console.log(`   期望: ${result.expectedLevel} [${result.expectedScore[0]}-${result.expectedScore[1]}]`);
      console.log(`   实际: ${result.actualLevel} [${result.actualScore.toFixed(1)}] (置信度: ${(result.confidence * 100).toFixed(0)}%)`);
    } else {
      console.log(`   错误: ${result.error}`);
    }
  });

  // 部署就绪评估
  console.log('\n' + '='.repeat(80));
  console.log('\n🎯 部署就绪评估:\n');

  if (successfulTests.length === 4) {
    console.log('   ✅ 优秀 - 所有场景通过，可立即部署到生产环境');
  } else if (successfulTests.length >= 3) {
    console.log('   ⚠️  良好 - 大部分场景通过，建议调整权重后再部署');
  } else if (successfulTests.length >= 2) {
    console.log('   ⚠️  及格 - 基本功能可用，但需要优化算法');
  } else {
    console.log('   ❌ 不合格 - 需要重新调整评分引擎参数');
  }

  console.log('\n📝 下一步建议:\n');
  if (successfulTests.length < 4) {
    console.log('   1. 根据失败场景调整权重配置或阈值');
    console.log('   2. 扩充关键词库以提高信号检测准确率');
    console.log('   3. 考虑引入LLM语义分析（中期方案）');
    console.log('   4. 重新运行部署测试验证改进效果');
  } else {
    console.log('   1. ✅ 部署到生产环境');
    console.log('   2. 📊 监控真实评分数据和用户反馈');
    console.log('   3. 🔄 基于生产数据调整v3.0权重配置');
    console.log('   4. 📈 准备引入LLM语义分析提升至80%准确率');
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n✅ 部署测试完成\n');

  return {
    totalScenarios: 4,
    successfulTests: successfulTests.length,
    partialTests: partialTests.length,
    failedTests: failedTests.length,
    passRate: (successfulTests.length / 4) * 100,
    results
  };
}

// 执行测试
if (require.main === module) {
  runDeploymentTest()
    .then((result) => {
      console.log(`最终通过率: ${result.passRate.toFixed(0)}%`);
      process.exit(result.successfulTests >= 3 ? 0 : 1);
    })
    .catch((error) => {
      console.error('\n❌ 部署测试失败:', error);
      process.exit(1);
    });
}

export { runDeploymentTest, DEPLOYMENT_SCENARIOS };
