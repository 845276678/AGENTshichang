/**
 * 创意成熟度评估系统 - 类型定义
 *
 * 该模块定义了创意成熟度评估所需的所有TypeScript类型
 */

/**
 * 成熟度等级枚举
 */
export enum IdeaMaturityLevel {
  IMMATURE = 'immature',           // 0-39分：不成熟
  BASIC = 'basic',                 // 40-59分：初步成熟
  MODERATE = 'moderate',           // 60-79分：中等成熟 ✅ 解锁门槛
  MATURE = 'mature',               // 80-89分：成熟
  HIGHLY_MATURE = 'highly_mature'  // 90-100分：高度成熟
}

/**
 * 工作坊推荐优先级
 */
export type WorkshopPriority = 'high' | 'medium' | 'low'

/**
 * 工作坊类型
 */
export type WorkshopType =
  | 'demand-validation'    // 需求验证实验室
  | 'mvp-building'         // MVP构建指挥部
  | 'growth-hacking'       // 增长黑客作战室
  | 'profit-model'         // 盈利模式实验室

/**
 * 工作坊推荐
 */
export interface WorkshopRecommendation {
  workshopId: WorkshopType
  title: string
  description: string
  priority: WorkshopPriority
  recommendationLevel: number  // 1-5星
  reason: string
  estimatedDuration: number    // 预计时长（分钟）
}

/**
 * 改进建议
 */
export interface ImprovementSuggestion {
  category: string
  priority: 'high' | 'medium' | 'low'
  suggestion: string
  estimatedScoreGain: number
}

/**
 * 评估历史记录
 */
export interface AssessmentHistoryEntry {
  timestamp: Date
  totalScore: number
  trigger: 'initial' | 'supplement' | 'bidding_complete'
}

/**
 * 创意成熟度评估结果
 */
export interface IdeaMaturityAssessment {
  ideaId: string
  userId: string
  sessionId: string

  // 评分详情
  scores: {
    basicCompleteness: number      // 基础信息（25分）
    biddingFeedback: number         // 竞价反馈（30分）
    supplementQuality: number       // 补充质量（20分）
    commercialViability: number     // 商业可行性（25分）
  }

  // 总分和等级
  totalScore: number                // 0-100
  maturityLevel: IdeaMaturityLevel  // 成熟度等级

  // 解锁状态
  workshopAccess: {
    unlocked: boolean               // 是否解锁工作坊
    unlockedAt?: Date               // 解锁时间
    recommendations: WorkshopRecommendation[]  // 推荐参加的工作坊
  }

  // 改进建议
  improvementSuggestions: ImprovementSuggestion[]

  // 历史记录
  assessmentHistory: AssessmentHistoryEntry[]

  createdAt: Date
  updatedAt: Date
}

/**
 * 评分计算所需的创意数据
 */
export interface IdeaDataForScoring {
  // 基础信息
  ideaContent: string
  targetUser?: string
  coreFunctionality?: string

  // 竞价数据
  currentBids?: Record<string, number>
  aiMessages?: Array<{
    personaId: string
    content: string
    emotion: string
    bidValue?: number
    timestamp: Date | string
  }>
  userReplies?: string[]

  // 用户补充
  supplements?: Array<{
    category: string
    content: string
  }>

  // 商业分析
  marketAnalysis?: string
  competitors?: any[]
}

/**
 * 评分结果
 */
export interface ScoringResult {
  totalScore: number
  maturityLevel: IdeaMaturityLevel
  dimensionScores: {
    basicCompleteness: number
    biddingFeedback: number
    supplementQuality: number
    commercialViability: number
  }
}
