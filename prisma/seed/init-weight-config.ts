// 种子数据初始化脚本 - 权重配置
// Usage: npx tsx prisma/seed/init-weight-config.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 默认权重配置 v1.0.0
 * Spec: CREATIVE_MATURITY_PLAN_ENHANCED.md Lines 753-774
 */
const DEFAULT_WEIGHT_CONFIG = {
  version: '1.0.0',
  isActive: true,
  isCanary: false,
  canaryPercentage: 0,

  // 5维权重（总和=1.0）
  targetCustomer: 0.20,  // 目标客户 20%
  demandScenario: 0.20,  // 需求场景 20%
  coreValue: 0.25,       // 核心价值 25%
  businessModel: 0.20,   // 商业模式 20%
  credibility: 0.15,     // 可信度 15%

  // 阈值配置
  thresholdLowMax: 4.0,   // 低分上限
  thresholdMidMin: 5.0,   // 中分下限
  thresholdMidMax: 7.0,   // 中分上限
  thresholdHighMin: 7.5,  // 高分下限

  description: 'Initial default weight configuration - equal weights baseline for v1.0.0',

  // 标定数据（初始为空）
  calibrationSetSize: null,
  calibrationAccuracy: null
};

async function main() {
  console.log('🌱 Seeding weight configuration...');

  // 检查是否已存在v1.0.0
  const existing = await prisma.scoringWeightConfig.findUnique({
    where: { version: '1.0.0' }
  });

  if (existing) {
    console.log('⚠️  Weight config v1.0.0 already exists, skipping');
    return;
  }

  // 创建默认配置
  const weightConfig = await prisma.scoringWeightConfig.create({
    data: DEFAULT_WEIGHT_CONFIG
  });

  console.log('✅ Created weight config:', {
    version: weightConfig.version,
    isActive: weightConfig.isActive,
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

  console.log('🎉 Seeding completed successfully');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
