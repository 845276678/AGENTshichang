import type { AIMessage } from "@/lib/ai-persona-system"
import type { LandingCoachGuide } from "@/lib/utils/transformReportToGuide"

export interface ExecutionPlanPhase {
  name: string
  timeline: string
  focus: string
  keyOutcomes: string[]
  metrics: string[]
}

export interface ExecutionPlanSprint {
  name: string
  focus: string
  objectives: string[]
  feedbackHooks: string[]
}

export interface ExecutionPlanFeedback {
  cadence: string[]
  channels: string[]
  decisionGates: string[]
  tooling: string[]
}

export interface ExecutionPlan {
  mission: string
  summary: string
  phases: ExecutionPlanPhase[]
  weeklySprints: ExecutionPlanSprint[]
  feedbackLoop: ExecutionPlanFeedback
  dailyRoutines: string[]
  reviewFramework: {
    weekly: string[]
    monthly: string[]
    dataWatch: string[]
  }
  personalizedRecommendations?: string // 新增：个性化建议的Markdown内容
}

export type BusinessPlanGuide = LandingCoachGuide & { executionPlan?: ExecutionPlan }

export interface BiddingSnapshot {
  ideaId?: string
  ideaTitle: string
  source?: string
  ideaDescription?: string
  highestBid?: number
  averageBid?: number
  finalBids?: Record<string, number>
  winnerId?: string | null
  winnerName?: string | null
  supportedAgents?: string[]
  currentBids?: Record<string, number>
  aiMessages?: AIMessage[]
  viewerCount?: number
  // 新增：用户补充信息
  userContext?: UserProjectContext
}

/**
 * 用户项目上下文信息
 * 用于生成个性化的创意实现建议建议
 */
export interface UserProjectContext {
  // 项目基本信息
  projectName?: string
  targetMarket?: string // 目标市场
  targetUsers?: string  // 目标用户群体

  // 资源情况
  budget?: {
    min?: number
    max?: number
    currency?: string
  }
  timeline?: {
    start?: string  // ISO date string
    duration?: number // 月数
    milestones?: string[]
  }
  team?: {
    size?: number
    roles?: string[]
    experience?: string
  }

  // 竞争优势
  coreAdvantages?: string[]
  uniqueValue?: string

  // 约束和挑战
  constraints?: string[]
  risks?: string[]

  // 补充信息（来自竞价过程中的补充）
  supplements?: {
    category: string
    content: string
    timestamp: string
  }[]
}

export interface BusinessPlanMetadata {
  source?: string
  winningBid?: number
  winner?: string | null
  supportedAgents?: number
  // 🆕 创意成熟度评分相关字段
  version?: string // 例如: '2.0-focus-guidance', '1.0-standard'
  generatedAt?: string // ISO timestamp
  maturityLevel?: string // LOW, GRAY_LOW, MEDIUM, GRAY_HIGH, HIGH
  maturityScore?: number // 1-10分
  confidence?: number // 0-1置信度
  // 🆕 创意基本信息
  ideaTitle?: string // 创意标题
  ideaId?: string // 创意ID
}
