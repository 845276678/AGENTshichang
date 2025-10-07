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
 * 用于生成个性化的商业计划书建议
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
}
