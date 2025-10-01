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
}

export interface BusinessPlanMetadata {
  source?: string
  winningBid?: number
  winner?: string | null
  supportedAgents?: number
}
