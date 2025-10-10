// 调整后的权重配置 v2.0.0 - 基于标定测试结果
// Spec: CREATIVE_MATURITY_PLAN_ENHANCED.md v4.1
// Usage: npx tsx prisma/seed/adjust-weights-v2.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * v2.0.0 权重配置 - 基于标定测试调整
 *
 * 调整理由：
 * - 标定测试显示HIGH级别样本全部被评为MEDIUM (5.0-5.2分)
 * - 有效信号加成不足，需要提高credibility和businessModel权重
 * - 降低targetCustomer权重，因为它对高成熟度项目的区分度较低
 */
const ADJUSTED_WEIGHT_CONFIG_V2 = {
  version: '2.0.0',
  isActive: false, // 先设为false，需要手动激活
  isCanary: true,  // 作为canary版本测试
  canaryPercentage: 10, // 先给10%流量测试

  // 调整后的5维权重（总和=1.0）
  targetCustomer: 0.15,  // 20% → 15% (降低，因为区分度低)
  demandScenario: 0.20,  // 保持20%
  coreValue: 0.25,       // 保持25%
  businessModel: 0.25,   // 20% → 25% (提高，realSpending信号重要)
  credibility: 0.15,     // 15% → 15% (保持，但需要提高有效信号加成)

  // 阈值配置（调整HIGH门槛）
  thresholdLowMax: 4.0,   // 保持
  thresholdMidMin: 5.0,   // 保持
  thresholdMidMax: 7.0,   // 保持
  thresholdHighMin: 7.2,  // 7.5 → 7.2 (稍微降低，让HIGH级别更容易达到)

  description: 'v2.0.0 - Adjusted based on calibration test results. Increased businessModel weight, lowered HIGH threshold to 7.2.',

  // 标定数据（来自测试）
  calibrationSetSize: 15,
  calibrationAccuracy: 53.3 // v1.0.0准确率
};

async function main() {
  console.log('🔧 创建调整后的权重配置 v2.0.0...');

  // 检查是否已存在v2.0.0
  const existing = await prisma.scoringWeightConfig.findUnique({
    where: { version: '2.0.0' }
  });

  if (existing) {
    console.log('⚠️  权重配置 v2.0.0 已存在，将更新...');
    const updated = await prisma.scoringWeightConfig.update({
      where: { version: '2.0.0' },
      data: ADJUSTED_WEIGHT_CONFIG_V2
    });
    console.log('✅ 已更新权重配置 v2.0.0');
    return updated;
  }

  // 创建新配置
  const weightConfig = await prisma.scoringWeightConfig.create({
    data: ADJUSTED_WEIGHT_CONFIG_V2
  });

  console.log('✅ 创建权重配置 v2.0.0:', {
    version: weightConfig.version,
    isCanary: weightConfig.isCanary,
    canaryPercentage: weightConfig.canaryPercentage,
    weights: {
      targetCustomer: weightConfig.targetCustomer,
      demandScenario: weightConfig.demandScenario,
      coreValue: weightConfig.coreValue,
      businessModel: weightConfig.businessModel,
      credibility: weightConfig.credibility
    },
    thresholds: {
      lowMax: weightConfig.thresholdLowMax,
      midMin: weightConfig.thresholdMidMin,
      midMax: weightConfig.thresholdMidMax,
      highMin: weightConfig.thresholdHighMin
    }
  });

  console.log('\n📊 下一步:');
  console.log('1. 运行标定测试验证 v2.0.0: npx tsx scripts/calibration-test-v2.ts');
  console.log('2. 如准确率提升，激活 v2.0.0: npx tsx prisma/seed/activate-v2.ts');
  console.log('3. 观察canary流量表现（10%）');
  console.log('4. 逐步提升流量：10% → 50% → 100%');

  console.log('\n🎉 配置创建成功');
}

main()
  .catch((e) => {
    console.error('❌ 创建失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
