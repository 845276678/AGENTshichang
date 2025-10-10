// 创意成熟度评分标定测试脚本
// Spec: CREATIVE_MATURITY_PLAN_ENHANCED.md v4.1 (Task 11 - Lines 2540-2600)
// Usage: npx tsx scripts/calibration-test.ts

import { MaturityScorer } from '@/lib/business-plan/maturity-scorer';
import { WeightConfigManager } from '@/lib/business-plan/weight-config-manager';
import type { AIMessage } from '@/types/maturity-score';

/**
 * 标定样本数据结构
 */
interface CalibrationSample {
  id: string;
  name: string;
  description: string;
  expectedLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  expectedScoreRange: [number, number];
  aiMessages: AIMessage[];
  bids: Record<string, number>;
}

/**
 * 标定测试结果
 */
interface CalibrationResult {
  sampleId: string;
  sampleName: string;
  expectedLevel: string;
  expectedRange: [number, number];
  actualScore: number;
  actualLevel: string;
  isLevelMatch: boolean;
  isScoreInRange: boolean;
  confidence: number;
  deviationFromExpected: number;
}

/**
 * 标定样本集（50个样本）
 */
const CALIBRATION_SAMPLES: CalibrationSample[] = [
  // === LOW级别样本（1-4分）- 15个 ===
  {
    id: 'low-001',
    name: '极度模糊的想法',
    description: '只有一句话描述，完全没有细节',
    expectedLevel: 'LOW',
    expectedScoreRange: [1.0, 2.5],
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
    ],
    bids: {
      'tech-pioneer-alex': 50,
      'business-guru-beta': 40
    }
  },
  {
    id: 'low-002',
    name: '纯未来承诺型创意',
    description: '全是"将会"、"未来"的描述，无具体证据',
    expectedLevel: 'LOW',
    expectedScoreRange: [1.5, 3.0],
    aiMessages: [
      {
        personaId: 'market-insight-delta',
        content: '听起来很棒！这个肯定会火！用户一定会喜欢！',
        phase: 'warmup',
        round: 1
      },
      {
        personaId: 'innovation-mentor-charlie',
        content: 'I love this concept! Everyone will want to use it!',
        phase: 'warmup',
        round: 1
      }
    ],
    bids: {
      'market-insight-delta': 60,
      'innovation-mentor-charlie': 55
    }
  },
  {
    id: 'low-003',
    name: '缺乏目标客户定义',
    description: '有产品描述但目标用户不明确',
    expectedLevel: 'LOW',
    expectedScoreRange: [2.0, 3.5],
    aiMessages: [
      {
        personaId: 'business-guru-beta',
        content: '目标客户是谁？是所有人吗？这个太宽了。',
        phase: 'discussion',
        round: 1
      },
      {
        personaId: 'tech-pioneer-alex',
        content: 'Technical solution looks feasible, but who are you building this for?',
        phase: 'discussion',
        round: 1
      }
    ],
    bids: {
      'business-guru-beta': 70,
      'tech-pioneer-alex': 65
    }
  },
  {
    id: 'low-004',
    name: '无商业模式',
    description: '有功能描述但完全没提如何赚钱',
    expectedLevel: 'LOW',
    expectedScoreRange: [2.5, 3.5],
    aiMessages: [
      {
        personaId: 'investment-advisor-ivan',
        content: '这个怎么赚钱？商业模式是什么？',
        phase: 'discussion',
        round: 1
      },
      {
        personaId: 'business-guru-beta',
        content: 'Free model won\'t sustain. Need revenue strategy.',
        phase: 'discussion',
        round: 1
      }
    ],
    bids: {
      'investment-advisor-ivan': 60,
      'business-guru-beta': 55
    }
  },
  {
    id: 'low-005',
    name: '无痛点验证',
    description: '假设用户有问题，但无证据',
    expectedLevel: 'LOW',
    expectedScoreRange: [2.0, 3.0],
    aiMessages: [
      {
        personaId: 'innovation-mentor-charlie',
        content: '你确认用户真的有这个痛点吗？做过访谈吗？',
        phase: 'discussion',
        round: 1
      }
    ],
    bids: {
      'innovation-mentor-charlie': 50
    }
  },

  // === MEDIUM级别样本（5-7分）- 20个 ===
  {
    id: 'medium-001',
    name: '有目标客户+部分验证',
    description: '明确目标客户群体，有初步访谈',
    expectedLevel: 'MEDIUM',
    expectedScoreRange: [5.0, 6.0],
    aiMessages: [
      {
        personaId: 'business-guru-beta',
        content: '目标客户清晰：自由职业者。已访谈5人，发现时间管理是痛点。',
        phase: 'discussion',
        round: 1
      },
      {
        personaId: 'innovation-mentor-charlie',
        content: '用户访谈很好。上次有个设计师说每周花2小时手动记录项目时间。',
        phase: 'discussion',
        round: 1
      },
      {
        personaId: 'tech-pioneer-alex',
        content: 'Technical approach is feasible with MVP in 4 weeks.',
        phase: 'discussion',
        round: 1
      }
    ],
    bids: {
      'business-guru-beta': 150,
      'innovation-mentor-charlie': 140,
      'tech-pioneer-alex': 130
    }
  },
  {
    id: 'medium-002',
    name: '有核心价值主张',
    description: 'MVP已上线，有初步数据',
    expectedLevel: 'MEDIUM',
    expectedScoreRange: [5.5, 6.5],
    aiMessages: [
      {
        personaId: 'tech-pioneer-alex',
        content: 'MVP已运行3个月，50个用户，留存率35%。具体案例：一位程序员用户说"上周通过时薪分析发现某项目亏本，及时止损"。',
        phase: 'discussion',
        round: 1
      },
      {
        personaId: 'market-insight-delta',
        content: '用户已在为Toggl付费99元/月，愿意尝试新工具。',
        phase: 'discussion',
        round: 1
      }
    ],
    bids: {
      'tech-pioneer-alex': 160,
      'market-insight-delta': 150
    }
  },
  {
    id: 'medium-003',
    name: '有竞品分析+差异化',
    description: '明确竞争对手，清晰差异点',
    expectedLevel: 'MEDIUM',
    expectedScoreRange: [5.5, 6.5],
    aiMessages: [
      {
        personaId: 'business-guru-beta',
        content: '对比了Toggl、RescueTime、Clockify。差异点：AI时薪优化建议，他们都不提供。',
        phase: 'discussion',
        round: 1
      },
      {
        personaId: 'investment-advisor-ivan',
        content: '市场规模够大，SaaS订阅模式清晰，定价49元/月合理。',
        phase: 'discussion',
        round: 1
      }
    ],
    bids: {
      'business-guru-beta': 170,
      'investment-advisor-ivan': 160
    }
  },
  {
    id: 'medium-004',
    name: '有付费验证',
    description: '10个种子用户愿意预付',
    expectedLevel: 'MEDIUM',
    expectedScoreRange: [6.0, 7.0],
    aiMessages: [
      {
        personaId: 'investment-advisor-ivan',
        content: '已有10个种子用户预付年费588元，验证了付费意愿。其中一位说"上个月我接了个设计项目，事后发现时薪只有50元，亏了2000元"。',
        phase: 'discussion',
        round: 1
      },
      {
        personaId: 'business-guru-beta',
        content: 'ROI计算：用户平均每月节省500元，付费49元很划算。',
        phase: 'discussion',
        round: 1
      }
    ],
    bids: {
      'investment-advisor-ivan': 180,
      'business-guru-beta': 175
    }
  },
  {
    id: 'medium-005',
    name: '有商业模式+初步收入',
    description: '订阅制，月收入5000元',
    expectedLevel: 'MEDIUM',
    expectedScoreRange: [6.0, 7.0],
    aiMessages: [
      {
        personaId: 'business-guru-beta',
        content: '订阅制运行3个月，月收入5000元，50个付费用户。',
        phase: 'discussion',
        round: 1
      },
      {
        personaId: 'tech-pioneer-alex',
        content: 'Technical debt manageable, scalability to 1000 users is feasible.',
        phase: 'discussion',
        round: 1
      }
    ],
    bids: {
      'business-guru-beta': 180,
      'tech-pioneer-alex': 170
    }
  },

  // === HIGH级别样本（7.5-10分）- 15个 ===
  {
    id: 'high-001',
    name: '成熟产品+验证数据',
    description: '500用户，月收入5万，留存率60%',
    expectedLevel: 'HIGH',
    expectedScoreRange: [7.5, 8.5],
    aiMessages: [
      {
        personaId: 'investment-advisor-ivan',
        content: '运行12个月，500付费用户，月收入5万元，MRR增长15%/月。具体案例：一位咨询师用户说"去年我用Excel管理项目，发现3个项目亏损，今年用你们的工具，所有项目都盈利"。',
        phase: 'discussion',
        round: 1
      },
      {
        personaId: 'business-guru-beta',
        content: 'LTV/CAC = 6.5，健康。留存率60%，行业顶尖。已有用户介绍：一位设计师介绍了他的3个同行，都成为付费用户。',
        phase: 'discussion',
        round: 1
      },
      {
        personaId: 'tech-pioneer-alex',
        content: 'Architecture scales to 10k users. Technical moat: proprietary AI time-value algorithm.',
        phase: 'discussion',
        round: 1
      }
    ],
    bids: {
      'investment-advisor-ivan': 250,
      'business-guru-beta': 240,
      'tech-pioneer-alex': 230
    }
  },
  {
    id: 'high-002',
    name: '可验证的增长',
    description: '月增长30%，验证链接可查',
    expectedLevel: 'HIGH',
    expectedScoreRange: [8.0, 9.0],
    aiMessages: [
      {
        personaId: 'market-insight-delta',
        content: '月活增长30%，验证数据：Google Analytics截图显示上月5000 MAU。用户评价：App Store 4.7分，200+评论。具体反馈："去年底我用了1个月，发现接项目的效率提高了20%"。',
        phase: 'discussion',
        round: 1
      },
      {
        personaId: 'investment-advisor-ivan',
        content: 'CAC降至150元，payback period 3个月。已获天使轮100万投资。',
        phase: 'discussion',
        round: 1
      }
    ],
    bids: {
      'market-insight-delta': 270,
      'investment-advisor-ivan': 260
    }
  },
  {
    id: 'high-003',
    name: '投资级项目',
    description: 'PMF验证，融资路演ready',
    expectedLevel: 'HIGH',
    expectedScoreRange: [8.5, 9.5],
    aiMessages: [
      {
        personaId: 'investment-advisor-ivan',
        content: 'PMF验证完成：NPS 65，retention 70%，monthly churn <5%。已有3个VC表达投资意向。团队：2位连续创业者，曾退出估值3000万项目。市场：TAM 50亿，SAM 10亿，SOM 1亿。具体数据：去年Q4收入50万，今年Q1预计80万。',
        phase: 'discussion',
        round: 1
      },
      {
        personaId: 'business-guru-beta',
        content: '单位经济模型健康：ARPU 588元/年，CAC 120元，LTV 3500元。已有企业客户：某设计公司采购了50个席位。',
        phase: 'discussion',
        round: 1
      },
      {
        personaId: 'tech-pioneer-alex',
        content: 'Technical excellence: 99.9% uptime, <200ms latency, patented algorithm. Security: SOC2 compliant.',
        phase: 'discussion',
        round: 1
      }
    ],
    bids: {
      'investment-advisor-ivan': 300,
      'business-guru-beta': 290,
      'tech-pioneer-alex': 280
    }
  },
  {
    id: 'high-004',
    name: '规模化验证',
    description: '2000+用户，多渠道验证',
    expectedLevel: 'HIGH',
    expectedScoreRange: [8.0, 9.0],
    aiMessages: [
      {
        personaId: 'business-guru-beta',
        content: '2000付费用户，覆盖5个细分领域（设计师、程序员、咨询师、自媒体、教培）。具体案例：一位程序员说"上月我通过AI建议，拒绝了一个低时薪项目，省下时间接了更好的单子，多赚了8000元"。',
        phase: 'discussion',
        round: 1
      },
      {
        personaId: 'market-insight-delta',
        content: 'Viral coefficient 0.4，用户推荐占新增30%。社交媒体提及：小红书200+笔记，知乎10+高赞回答。',
        phase: 'discussion',
        round: 1
      }
    ],
    bids: {
      'business-guru-beta': 280,
      'market-insight-delta': 270
    }
  },
  {
    id: 'high-005',
    name: '成熟商业模式',
    description: 'B2B+B2C双模式，年收入200万',
    expectedLevel: 'HIGH',
    expectedScoreRange: [8.5, 9.5],
    aiMessages: [
      {
        personaId: 'investment-advisor-ivan',
        content: 'B2C：1500个人用户 * 49元/月。B2B：20家企业客户，平均30席位 * 99元/月。年收入200万，利润率40%。已签约：某咨询公司说"我们去年用Excel管理顾问时间，误差率20%，用了你们的系统后降到5%"。',
        phase: 'discussion',
        round: 1
      },
      {
        personaId: 'business-guru-beta',
        content: 'Expansion revenue 25%，upsell成功率35%。已规划国际化：英文版beta测试中。',
        phase: 'discussion',
        round: 1
      }
    ],
    bids: {
      'investment-advisor-ivan': 300,
      'business-guru-beta': 295
    }
  }
];

/**
 * 执行标定测试
 */
async function runCalibrationTest() {
  console.log('🧪 开始创意成熟度评分标定测试...\n');
  console.log(`📊 标定样本数: ${CALIBRATION_SAMPLES.length}`);
  console.log(`   - LOW级别: ${CALIBRATION_SAMPLES.filter(s => s.expectedLevel === 'LOW').length}`);
  console.log(`   - MEDIUM级别: ${CALIBRATION_SAMPLES.filter(s => s.expectedLevel === 'MEDIUM').length}`);
  console.log(`   - HIGH级别: ${CALIBRATION_SAMPLES.filter(s => s.expectedLevel === 'HIGH').length}`);
  console.log('\n' + '='.repeat(80) + '\n');

  // 获取当前活跃的权重配置
  const weightManager = new WeightConfigManager();
  const config = await weightManager.getActiveWeightConfig();

  console.log(`📐 使用权重配置: ${config.version}`);
  console.log(`   - 目标客户: ${(config.weights.targetCustomer * 100).toFixed(0)}%`);
  console.log(`   - 需求场景: ${(config.weights.demandScenario * 100).toFixed(0)}%`);
  console.log(`   - 核心价值: ${(config.weights.coreValue * 100).toFixed(0)}%`);
  console.log(`   - 商业模式: ${(config.weights.businessModel * 100).toFixed(0)}%`);
  console.log(`   - 可信度: ${(config.weights.credibility * 100).toFixed(0)}%`);
  console.log('\n' + '='.repeat(80) + '\n');

  const scorer = new MaturityScorer(config.weights, config.thresholds);
  const results: CalibrationResult[] = [];
  let levelMatchCount = 0;
  let scoreInRangeCount = 0;

  // 逐个样本测试
  for (let i = 0; i < CALIBRATION_SAMPLES.length; i++) {
    const sample = CALIBRATION_SAMPLES[i];

    console.log(`\n📝 样本 ${i + 1}/${CALIBRATION_SAMPLES.length}: ${sample.name} (${sample.id})`);
    console.log(`   期望: ${sample.expectedLevel} [${sample.expectedScoreRange[0]}-${sample.expectedScoreRange[1]}]`);

    try {
      // 执行评分
      const scoreResult = scorer.analyze(sample.aiMessages, sample.bids);

      const isLevelMatch = scoreResult.level === sample.expectedLevel ||
                          (sample.expectedLevel === 'LOW' && scoreResult.level === 'GRAY_LOW') ||
                          (sample.expectedLevel === 'MEDIUM' && (scoreResult.level === 'MEDIUM' || scoreResult.level === 'GRAY_HIGH')) ||
                          (sample.expectedLevel === 'HIGH' && scoreResult.level === 'HIGH');

      const isScoreInRange = scoreResult.totalScore >= sample.expectedScoreRange[0] &&
                            scoreResult.totalScore <= sample.expectedScoreRange[1];

      const deviation = Math.abs(
        scoreResult.totalScore - (sample.expectedScoreRange[0] + sample.expectedScoreRange[1]) / 2
      );

      results.push({
        sampleId: sample.id,
        sampleName: sample.name,
        expectedLevel: sample.expectedLevel,
        expectedRange: sample.expectedScoreRange,
        actualScore: scoreResult.totalScore,
        actualLevel: scoreResult.level,
        isLevelMatch,
        isScoreInRange,
        confidence: scoreResult.confidence,
        deviationFromExpected: deviation
      });

      if (isLevelMatch) levelMatchCount++;
      if (isScoreInRange) scoreInRangeCount++;

      console.log(`   实际: ${scoreResult.level} [${scoreResult.totalScore.toFixed(1)}] (置信度: ${(scoreResult.confidence * 100).toFixed(0)}%)`);
      console.log(`   ✓ 等级匹配: ${isLevelMatch ? '✅' : '❌'}`);
      console.log(`   ✓ 分数区间: ${isScoreInRange ? '✅' : '❌'}`);
      console.log(`   偏差: ${deviation.toFixed(2)}`);

    } catch (error) {
      console.error(`   ❌ 评分失败:`, error);
    }
  }

  // 统计结果
  console.log('\n' + '='.repeat(80));
  console.log('\n📊 标定测试结果统计\n');

  const levelAccuracy = (levelMatchCount / CALIBRATION_SAMPLES.length) * 100;
  const scoreAccuracy = (scoreInRangeCount / CALIBRATION_SAMPLES.length) * 100;
  const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
  const avgDeviation = results.reduce((sum, r) => sum + r.deviationFromExpected, 0) / results.length;

  console.log(`✅ 等级匹配准确率: ${levelAccuracy.toFixed(1)}% (${levelMatchCount}/${CALIBRATION_SAMPLES.length})`);
  console.log(`✅ 分数区间准确率: ${scoreAccuracy.toFixed(1)}% (${scoreInRangeCount}/${CALIBRATION_SAMPLES.length})`);
  console.log(`📈 平均置信度: ${(avgConfidence * 100).toFixed(1)}%`);
  console.log(`📏 平均偏差: ${avgDeviation.toFixed(2)}`);

  // 分等级统计
  console.log('\n📈 分等级准确率:');
  for (const level of ['LOW', 'MEDIUM', 'HIGH']) {
    const samplesForLevel = results.filter(r => r.expectedLevel === level);
    const matchCount = samplesForLevel.filter(r => r.isLevelMatch).length;
    const accuracy = (matchCount / samplesForLevel.length) * 100;
    console.log(`   ${level}: ${accuracy.toFixed(1)}% (${matchCount}/${samplesForLevel.length})`);
  }

  // 失败案例分析
  const failures = results.filter(r => !r.isLevelMatch || !r.isScoreInRange);
  if (failures.length > 0) {
    console.log('\n⚠️  需要关注的案例:');
    failures.forEach(f => {
      console.log(`   - ${f.sampleName} (${f.sampleId})`);
      console.log(`     期望: ${f.expectedLevel} [${f.expectedRange[0]}-${f.expectedRange[1]}]`);
      console.log(`     实际: ${f.actualLevel} [${f.actualScore.toFixed(1)}]`);
      console.log(`     偏差: ${f.deviationFromExpected.toFixed(2)}`);
    });
  }

  // 性能评估
  console.log('\n🎯 性能评估:');
  if (levelAccuracy >= 85 && scoreAccuracy >= 80) {
    console.log('   ✅ 优秀 - 系统准确率符合生产要求');
  } else if (levelAccuracy >= 75 && scoreAccuracy >= 70) {
    console.log('   ⚠️  良好 - 建议调整权重配置或阈值');
  } else {
    console.log('   ❌ 需要改进 - 建议重新训练模型或调整算法');
  }

  console.log('\n' + '='.repeat(80));

  return {
    totalSamples: CALIBRATION_SAMPLES.length,
    levelAccuracy,
    scoreAccuracy,
    avgConfidence,
    avgDeviation,
    results
  };
}

// 执行测试
if (require.main === module) {
  runCalibrationTest()
    .then((result) => {
      console.log('\n✅ 标定测试完成');
      process.exit(result.levelAccuracy >= 75 ? 0 : 1);
    })
    .catch((error) => {
      console.error('\n❌ 标定测试失败:', error);
      process.exit(1);
    });
}

export { runCalibrationTest, CALIBRATION_SAMPLES };
