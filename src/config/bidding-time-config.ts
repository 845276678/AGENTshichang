/**
 * 统一的竞价系统时间配置
 *
 * 基于优化方案，统一时间配置为10.5分钟
 * 包含各阶段时长、用户顺延机制和动态调整能力
 */

import { BiddingPhase } from '@/types/entities/bidding'

// 阶段时间配置(秒)
export interface PhaseTimeConfig {
  warmup: number      // 预热阶段
  discussion: number  // 讨论阶段
  bidding: number     // 竞价阶段
  prediction: number  // 预测/用户补充阶段
  result: number      // 结果展示阶段
}

// 用户顺延配置
export interface UserExtensionConfig {
  enabled: boolean
  maxPerPhase: number      // 每阶段最多顺延次数
  extensionTime: number    // 每次顺延时间(秒)
  triggerEvents: string[]  // 触发顺延的事件
}

// 动态时间调整配置
export interface DynamicTimeConfig {
  enabled: boolean
  complexityMultiplier: {
    min: number  // 最小倍数
    max: number  // 最大倍数
  }
  baseComplexity: number  // 基准复杂度
}

// 完整的竞价时间配置
export interface BiddingTimeConfiguration {
  phases: PhaseTimeConfig
  totalTime: number  // 总时长(分钟)
  userExtension: UserExtensionConfig
  dynamicAdjustment: DynamicTimeConfig
}

// 优化后的标准时间配置 - 10.5分钟方案
export const OPTIMIZED_BIDDING_TIME_CONFIG: BiddingTimeConfiguration = {
  phases: {
    warmup: 90,        // 1.5分钟 - AI预热，简短介绍
    discussion: 180,   // 3分钟 - 深度讨论，分析创意
    bidding: 240,      // 4分钟 - 激烈竞价，多轮出价
    prediction: 120,   // 2分钟 - 用户补充，AI重新评估
    result: 60         // 1分钟 - 结果展示
  },
  totalTime: 10.5, // 总计10.5分钟
  userExtension: {
    enabled: true,
    maxPerPhase: 1,
    extensionTime: 60, // 用户发言可顺延1分钟
    triggerEvents: ['USER_MESSAGE', 'USER_SUPPLEMENT']
  },
  dynamicAdjustment: {
    enabled: true,
    complexityMultiplier: {
      min: 0.8,  // 简单创意可缩短20%
      max: 1.5   // 复杂创意可延长50%
    },
    baseComplexity: 50 // 基准复杂度分数
  }
}

// 超快速模式配置 - 2.5分钟方案 (每个环节30秒)
export const ULTRA_FAST_BIDDING_TIME_CONFIG: BiddingTimeConfiguration = {
  phases: {
    warmup: 30,        // 30秒 - 快速AI介绍
    discussion: 30,    // 30秒 - 简短分析
    bidding: 30,       // 30秒 - 快速竞价
    prediction: 30,    // 30秒 - 用户补充
    result: 30         // 30秒 - 结果展示
  },
  totalTime: 2.5,      // 总计2.5分钟
  userExtension: {
    enabled: false,
    maxPerPhase: 0,
    extensionTime: 0,
    triggerEvents: []
  },
  dynamicAdjustment: {
    enabled: false,
    complexityMultiplier: { min: 1, max: 1 },
    baseComplexity: 50
  }
}

// 快速模式配置 - 8分钟方案（保留向后兼容）
export const FAST_BIDDING_TIME_CONFIG: BiddingTimeConfiguration = {
  phases: {
    warmup: 60,        // 1分钟
    discussion: 120,   // 2分钟
    bidding: 180,      // 3分钟
    prediction: 90,    // 1.5分钟
    result: 30         // 0.5分钟
  },
  totalTime: 8,
  userExtension: {
    enabled: false,
    maxPerPhase: 0,
    extensionTime: 0,
    triggerEvents: []
  },
  dynamicAdjustment: {
    enabled: false,
    complexityMultiplier: { min: 1, max: 1 },
    baseComplexity: 50
  }
}

// 标准模式配置 - 12分钟方案（保留向后兼容）
export const STANDARD_BIDDING_TIME_CONFIG: BiddingTimeConfiguration = {
  phases: {
    warmup: 120,       // 2分钟
    discussion: 240,   // 4分钟
    bidding: 300,      // 5分钟
    prediction: 120,   // 2分钟
    result: 60         // 1分钟
  },
  totalTime: 12,
  userExtension: {
    enabled: true,
    maxPerPhase: 2,
    extensionTime: 60,
    triggerEvents: ['USER_MESSAGE', 'USER_SUPPLEMENT']
  },
  dynamicAdjustment: {
    enabled: true,
    complexityMultiplier: { min: 0.8, max: 1.5 },
    baseComplexity: 50
  }
}

// 根据创意复杂度计算动态时间
export const calculateDynamicPhaseTime = (
  basePhase: PhaseTimeConfig,
  ideaComplexity: number,
  config: DynamicTimeConfig = ULTRA_FAST_BIDDING_TIME_CONFIG.dynamicAdjustment
): PhaseTimeConfig => {
  if (!config.enabled) {
    return basePhase
  }

  // 计算复杂度倍数 (0.8 - 1.5)
  const complexityMultiplier = Math.max(
    config.complexityMultiplier.min,
    Math.min(
      config.complexityMultiplier.max,
      ideaComplexity / config.baseComplexity
    )
  )

  return {
    warmup: Math.round(basePhase.warmup * complexityMultiplier),
    discussion: Math.round(basePhase.discussion * complexityMultiplier),
    bidding: Math.round(basePhase.bidding * complexityMultiplier),
    prediction: Math.round(basePhase.prediction * complexityMultiplier),
    result: basePhase.result // 结果展示时间固定
  }
}

// 获取阶段显示名称
export const getPhaseDisplayName = (phase: BiddingPhase | string): string => {
  const phaseNames: Record<string, string> = {
    [BiddingPhase.WARMUP]: '预热阶段',
    [BiddingPhase.DISCUSSION]: '讨论阶段',
    [BiddingPhase.BIDDING]: '竞价阶段',
    PREDICTION: '预测阶段',
    RESULT: '结果阶段',
    [BiddingPhase.COMPLETED]: '已完成'
  }

  return phaseNames[phase] || phase
}

// 格式化时间显示
export const formatTimeRemaining = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

// 计算阶段总时长
export const calculateTotalPhaseTime = (phases: PhaseTimeConfig): number => {
  return Object.values(phases).reduce((total, time) => total + time, 0)
}

// 获取阶段时长(秒)
export const getPhaseTime = (
  phase: BiddingPhase | string,
  config: PhaseTimeConfig = ULTRA_FAST_BIDDING_TIME_CONFIG.phases
): number => {
  const phaseMap: Record<string, keyof PhaseTimeConfig> = {
    [BiddingPhase.WARMUP]: 'warmup',
    [BiddingPhase.DISCUSSION]: 'discussion',
    [BiddingPhase.BIDDING]: 'bidding',
    PREDICTION: 'prediction',
    RESULT: 'result'
  }

  const phaseKey = phaseMap[phase]
  return phaseKey ? config[phaseKey] : 0
}

// 默认导出超快速配置
export default ULTRA_FAST_BIDDING_TIME_CONFIG

// 导出配置选择器
export const getBiddingTimeConfig = (
  mode: 'ultra-fast' | 'fast' | 'optimized' | 'standard' = 'optimized'
): BiddingTimeConfiguration => {
  switch (mode) {
    case 'ultra-fast':
      return ULTRA_FAST_BIDDING_TIME_CONFIG
    case 'fast':
      return FAST_BIDDING_TIME_CONFIG
    case 'standard':
      return STANDARD_BIDDING_TIME_CONFIG
    case 'optimized':
    default:
      return ULTRA_FAST_BIDDING_TIME_CONFIG
  }
}
