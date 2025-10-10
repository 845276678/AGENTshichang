// 权重配置管理器 - 支持版本控制与灰度发布
// Spec: CREATIVE_MATURITY_PLAN_ENHANCED.md v4.1 (Lines 536-733)

import { PrismaClient } from '@prisma/client';
import type {
  ScoringWeights,
  ScoringThresholds,
  WeightConfigVersion
} from '@/types/maturity-score';

const prisma = new PrismaClient();

/**
 * 默认权重配置 v1.0.0
 * Spec: Lines 753-774 (初期均等权重)
 */
const DEFAULT_WEIGHTS: ScoringWeights = {
  targetCustomer: 0.20, // 目标客户 20%
  demandScenario: 0.20, // 需求场景 20%
  coreValue: 0.25,      // 核心价值 25%
  businessModel: 0.20,  // 商业模式 20%
  credibility: 0.15     // 可信度 15%
};

/**
 * 默认阈值配置
 * Spec: Lines 760-764
 */
const DEFAULT_THRESHOLDS: ScoringThresholds = {
  lowMax: 4.0,    // 低分上限
  midMin: 5.0,    // 中分下限
  midMax: 7.0,    // 中分上限
  highMin: 7.5    // 高分下限
};

/**
 * 权重配置管理器
 */
export class WeightConfigManager {
  /**
   * 获取当前激活的权重配置
   * Spec: Lines 671-698 (灰度发布机制)
   */
  async getActiveWeightConfig(userId?: string): Promise<{
    weights: ScoringWeights;
    thresholds: ScoringThresholds;
    version: string;
  }> {
    // 1. 检查是否有灰度发布的版本
    const canaryConfig = await prisma.scoringWeightConfig.findFirst({
      where: { isCanary: true }
    });

    if (canaryConfig && userId) {
      // 2. 根据用户ID哈希决定是否使用灰度版本
      const hash = this.simpleHash(userId);
      const percentage = canaryConfig.canaryPercentage || 0;

      if (hash % 100 < percentage) {
        console.log(`User ${userId} using canary version ${canaryConfig.version}`);
        return this.parseConfig(canaryConfig);
      }
    }

    // 3. 默认使用稳定版本
    const activeConfig = await prisma.scoringWeightConfig.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    if (activeConfig) {
      return this.parseConfig(activeConfig);
    }

    // 4. 降级：返回默认配置
    console.warn('No active weight config found, using defaults');
    return {
      weights: DEFAULT_WEIGHTS,
      thresholds: DEFAULT_THRESHOLDS,
      version: '1.0.0-default'
    };
  }

  /**
   * 创建新版本权重配置
   */
  async createVersion(
    version: string,
    weights: ScoringWeights,
    thresholds: ScoringThresholds,
    options: {
      description?: string;
      calibrationSetSize?: number;
      calibrationAccuracy?: number;
    } = {}
  ): Promise<WeightConfigVersion> {
    // 验证权重总和 = 1.0
    const weightSum =
      weights.targetCustomer +
      weights.demandScenario +
      weights.coreValue +
      weights.businessModel +
      weights.credibility;

    if (Math.abs(weightSum - 1.0) > 0.001) {
      throw new Error(`Weight sum must be 1.0, got ${weightSum}`);
    }

    // 验证阈值合理性
    if (
      thresholds.lowMax >= thresholds.midMin ||
      thresholds.midMin >= thresholds.midMax ||
      thresholds.midMax >= thresholds.highMin
    ) {
      throw new Error('Threshold order must be: lowMax < midMin < midMax < highMin');
    }

    const config = await prisma.scoringWeightConfig.create({
      data: {
        version,
        isActive: false,
        isCanary: false,
        canaryPercentage: 0,
        targetCustomer: weights.targetCustomer,
        demandScenario: weights.demandScenario,
        coreValue: weights.coreValue,
        businessModel: weights.businessModel,
        credibility: weights.credibility,
        thresholdLowMax: thresholds.lowMax,
        thresholdMidMin: thresholds.midMin,
        thresholdMidMax: thresholds.midMax,
        thresholdHighMin: thresholds.highMin,
        description: options.description,
        calibrationSetSize: options.calibrationSetSize,
        calibrationAccuracy: options.calibrationAccuracy
      }
    });

    return this.parseConfig(config);
  }

  /**
   * 激活指定版本（切换稳定版）
   */
  async activateVersion(version: string): Promise<void> {
    // 1. 找到目标版本
    const targetConfig = await prisma.scoringWeightConfig.findUnique({
      where: { version }
    });

    if (!targetConfig) {
      throw new Error(`Version ${version} not found`);
    }

    // 2. 使用事务切换激活状态
    await prisma.$transaction([
      // 禁用所有当前激活版本
      prisma.scoringWeightConfig.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      }),
      // 激活目标版本
      prisma.scoringWeightConfig.update({
        where: { version },
        data: { isActive: true, isCanary: false, canaryPercentage: 0 }
      })
    ]);

    console.log(`✅ Activated weight config version ${version}`);
  }

  /**
   * 启动灰度发布
   * Spec: Lines 668-698
   */
  async startCanaryRelease(version: string, percentage: number): Promise<void> {
    if (percentage < 0 || percentage > 100) {
      throw new Error('Canary percentage must be between 0 and 100');
    }

    // 1. 找到目标版本
    const targetConfig = await prisma.scoringWeightConfig.findUnique({
      where: { version }
    });

    if (!targetConfig) {
      throw new Error(`Version ${version} not found`);
    }

    // 2. 使用事务启动灰度
    await prisma.$transaction([
      // 禁用所有当前灰度版本
      prisma.scoringWeightConfig.updateMany({
        where: { isCanary: true },
        data: { isCanary: false, canaryPercentage: 0 }
      }),
      // 启动目标版本灰度
      prisma.scoringWeightConfig.update({
        where: { version },
        data: { isCanary: true, canaryPercentage: percentage }
      })
    ]);

    console.log(`🚀 Started canary release for version ${version} at ${percentage}%`);
  }

  /**
   * 调整灰度百分比（10% → 50% → 100%）
   */
  async adjustCanaryPercentage(version: string, newPercentage: number): Promise<void> {
    if (newPercentage < 0 || newPercentage > 100) {
      throw new Error('Canary percentage must be between 0 and 100');
    }

    await prisma.scoringWeightConfig.update({
      where: { version },
      data: { canaryPercentage: newPercentage }
    });

    console.log(`📊 Adjusted canary percentage for ${version} to ${newPercentage}%`);
  }

  /**
   * 立即回滚到上一个稳定版本
   * Spec: Lines 700-731
   */
  async rollbackToStableVersion(): Promise<void> {
    // 1. 找到当前灰度版本
    const canaryConfig = await prisma.scoringWeightConfig.findFirst({
      where: { isCanary: true }
    });

    if (canaryConfig) {
      // 2. 禁用灰度版本
      await prisma.scoringWeightConfig.update({
        where: { id: canaryConfig.id },
        data: { isCanary: false, canaryPercentage: 0 }
      });

      console.log(`⏪ Rolled back canary version ${canaryConfig.version}`);
    }

    // 3. 记录回滚事件（可选：新建日志表）
    console.log(`Rollback completed at ${new Date().toISOString()}`);
  }

  /**
   * 获取所有版本历史
   */
  async getVersionHistory(): Promise<WeightConfigVersion[]> {
    const configs = await prisma.scoringWeightConfig.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return configs.map(c => this.parseConfig(c));
  }

  /**
   * 获取指定版本配置
   */
  async getVersion(version: string): Promise<WeightConfigVersion | null> {
    const config = await prisma.scoringWeightConfig.findUnique({
      where: { version }
    });

    return config ? this.parseConfig(config) : null;
  }

  /**
   * 解析数据库配置为标准格式
   */
  private parseConfig(config: any): {
    weights: ScoringWeights;
    thresholds: ScoringThresholds;
    version: string;
  } & WeightConfigVersion {
    return {
      id: config.id,
      version: config.version,
      isActive: config.isActive,
      isCanary: config.isCanary,
      canaryPercentage: config.canaryPercentage,
      weights: {
        targetCustomer: config.targetCustomer,
        demandScenario: config.demandScenario,
        coreValue: config.coreValue,
        businessModel: config.businessModel,
        credibility: config.credibility
      },
      thresholds: {
        lowMax: config.thresholdLowMax,
        midMin: config.thresholdMidMin,
        midMax: config.thresholdMidMax,
        highMin: config.thresholdHighMin
      },
      description: config.description,
      calibrationSetSize: config.calibrationSetSize,
      calibrationAccuracy: config.calibrationAccuracy,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt
    };
  }

  /**
   * 简单哈希函数（用于灰度分流）
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
}

/**
 * 初始化默认权重配置 (种子数据)
 * Spec: Task 7 - 初始化种子数据
 */
export async function initializeDefaultWeightConfig(): Promise<void> {
  const manager = new WeightConfigManager();

  // 检查是否已存在v1.0.0
  const existing = await manager.getVersion('1.0.0');
  if (existing) {
    console.log('Default weight config v1.0.0 already exists');
    return;
  }

  // 创建并激活v1.0.0
  await manager.createVersion('1.0.0', DEFAULT_WEIGHTS, DEFAULT_THRESHOLDS, {
    description: 'Initial default weight configuration - equal weights baseline'
  });

  await manager.activateVersion('1.0.0');

  console.log('✅ Initialized and activated default weight config v1.0.0');
}
