// 测试LOW级别创意生成聚焦引导模板
// 验证修复后的系统能够为极低分创意生成The Mom Test引导

import { MaturityScorer } from '@/lib/business-plan/maturity-scorer';
import { WeightConfigManager } from '@/lib/business-plan/weight-config-manager';
import { composeBusinessPlanGuide } from '@/lib/business-plan/content-composer';
import type { AIMessage, BiddingSnapshot } from '@/lib/business-plan/types';

async function testLowMaturityGuidance() {
  console.log('🧪 测试LOW级别创意生成聚焦引导模板\n');
  console.log('=' .repeat(80) + '\n');

  // 获取当前权重配置
  const weightManager = new WeightConfigManager();
  const config = await weightManager.getActiveWeightConfig();
  const scorer = new MaturityScorer(config.weights, config.thresholds);

  // 测试场景: 极度模糊的创意 "做一个AI应用"
  const testIdea = {
    ideaContent: '做一个AI应用',
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
  };

  console.log(`📝 测试创意: "${testIdea.ideaContent}"`);
  console.log(`   AI消息数: ${testIdea.aiMessages.length}`);
  console.log(`   出价: ${JSON.stringify(testIdea.bids)}\n`);

  // Step 1: 评分
  console.log('🔍 Step 1: 执行成熟度评分...');
  const scoreResult = scorer.analyze(testIdea.aiMessages, testIdea.bids);

  console.log(`   ✅ 评分完成:`);
  console.log(`      总分: ${scoreResult.totalScore}/10`);
  console.log(`      等级: ${scoreResult.level}`);
  console.log(`      置信度: ${(scoreResult.confidence * 100).toFixed(0)}%`);
  console.log(`      有效信号: 具体过去(${scoreResult.validSignals.specificPast}), 真实付费(${scoreResult.validSignals.realSpending}), 痛点(${scoreResult.validSignals.painPoints})`);
  console.log(`      无效信号: 赞美(${scoreResult.invalidSignals.compliments}), 泛泛(${scoreResult.invalidSignals.generalities}), 未来承诺(${scoreResult.invalidSignals.futurePromises})\n`);

  // 验证评分是否为LOW
  if (scoreResult.level !== 'LOW' && scoreResult.level !== 'GRAY_LOW') {
    console.log(`   ⚠️  警告: 期望等级为LOW或GRAY_LOW，实际为${scoreResult.level}`);
    console.log(`   ⚠️  评分系统可能需要进一步调整\n`);
  } else {
    console.log(`   ✅ 评分等级正确: ${scoreResult.level}\n`);
  }

  // Step 2: 生成商业计划书/聚焦引导
  console.log('📄 Step 2: 生成商业计划书/聚焦引导...');

  const snapshot: BiddingSnapshot = {
    ideaId: 'test-low-001',
    ideaTitle: testIdea.ideaContent,
    source: 'TEST',
    ideaDescription: testIdea.ideaContent,
    highestBid: 40,
    averageBid: 37.5,
    finalBids: testIdea.bids,
    winnerId: 'tech-pioneer-alex',
    winnerName: 'Tech Pioneer Alex',
    supportedAgents: [],
    currentBids: testIdea.bids,
    aiMessages: testIdea.aiMessages
  };

  const { guide, metadata } = await composeBusinessPlanGuide(snapshot, {
    maturityScore: scoreResult
  });

  console.log(`   ✅ 生成完成:`);
  console.log(`      版本: ${metadata.version}`);
  console.log(`      来源: ${metadata.source}`);
  console.log(`      成熟度等级: ${metadata.maturityLevel}`);
  console.log(`      成熟度评分: ${metadata.maturityScore}/10\n`);

  // Step 3: 验证输出内容
  console.log('🔬 Step 3: 验证输出内容...');

  const isFocusGuidance = metadata.version === '2.0-focus-guidance';
  const hasExecutionPlan = !!guide.executionPlan;
  const hasPersonalizedRecommendations = !!guide.executionPlan?.personalizedRecommendations;

  console.log(`   ${isFocusGuidance ? '✅' : '❌'} 版本为聚焦引导模板: ${metadata.version}`);
  console.log(`   ${hasExecutionPlan ? '✅' : '❌'} 包含执行计划: ${hasExecutionPlan}`);
  console.log(`   ${hasPersonalizedRecommendations ? '✅' : '❌'} 包含个性化建议: ${hasPersonalizedRecommendations}`);

  if (isFocusGuidance && hasPersonalizedRecommendations) {
    const markdownLength = guide.executionPlan!.personalizedRecommendations!.length;
    console.log(`   ✅ 聚焦引导Markdown长度: ${markdownLength} 字符`);

    // 验证是否包含The Mom Test关键内容
    const markdown = guide.executionPlan!.personalizedRecommendations!;
    const hasMomTest = markdown.includes('The Mom Test');
    const hasQuestions = markdown.includes('问题清单');
    const hasWarnings = markdown.includes('为什么是低分');

    console.log(`   ${hasMomTest ? '✅' : '❌'} 包含"The Mom Test"引导`);
    console.log(`   ${hasQuestions ? '✅' : '❌'} 包含"问题清单"`);
    console.log(`   ${hasWarnings ? '✅' : '❌'} 包含"为什么是低分"警告\n`);

    // 打印前500字符预览
    console.log('📋 内容预览（前500字符）:');
    console.log('-'.repeat(80));
    console.log(markdown.substring(0, 500) + '...\n');
    console.log('-'.repeat(80) + '\n');

    // 验证结果
    if (hasMomTest && hasQuestions && hasWarnings) {
      console.log('✅ 测试通过: LOW级别创意正确生成聚焦引导模板');
      console.log('   系统能够识别极度模糊的创意，并提供The Mom Test引导\n');
      return true;
    } else {
      console.log('❌ 测试失败: 聚焦引导模板缺少关键内容');
      console.log('   请检查FocusGuidanceBuilder实现\n');
      return false;
    }
  } else {
    console.log('❌ 测试失败: 系统未生成聚焦引导模板');
    console.log(`   期望: version='2.0-focus-guidance'`);
    console.log(`   实际: version='${metadata.version}'`);
    console.log('   可能原因: 评分等级不是LOW/GRAY_LOW，或composeBusinessPlanGuide逻辑错误\n');
    return false;
  }
}

// 执行测试
if (require.main === module) {
  testLowMaturityGuidance()
    .then((success) => {
      console.log('='.repeat(80));
      if (success) {
        console.log('\n🎉 测试成功! 系统已正确修复');
        process.exit(0);
      } else {
        console.log('\n❌ 测试失败，需要进一步调试');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('\n💥 测试执行失败:', error);
      process.exit(1);
    });
}

export { testLowMaturityGuidance };
