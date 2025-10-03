import { BaseEntity, Status, DocumentType } from './base'
import { User, Idea } from './user'
import { BiddingSession } from './bidding'

// Business Plan structure
export interface BusinessPlan extends BaseEntity {
  ideaId: string
  userId: string
  sessionId?: string
  title: string
  status: Status
  version: string

  // Core sections
  executiveSummary: {
    vision: string
    mission: string
    objectives: string[]
    keySuccessFactors: string[]
  }

  marketAnalysis: {
    targetMarket: string
    marketSize: number
    growthRate: number
    competitors: CompetitorAnalysis[]
    opportunities: string[]
    threats: string[]
  }

  productStrategy: {
    productDescription: string
    features: ProductFeature[]
    uniqueValue: string
    roadmap: RoadmapPhase[]
  }

  businessModel: {
    revenueStreams: RevenueStream[]
    costStructure: CostItem[]
    pricingStrategy: string
    unitEconomics: UnitEconomics
  }

  operationalPlan: {
    teamStructure: TeamMember[]
    processes: string[]
    infrastructure: string[]
    milestones: Milestone[]
  }

  financialProjection: {
    revenue: FinancialMetric[]
    costs: FinancialMetric[]
    profitability: FinancialMetric[]
    fundingNeeds: number
    breakEvenPoint: string
  }

  riskAssessment: {
    risks: Risk[]
    mitigation: string[]
    contingencyPlans: string[]
  }

  // Metadata
  generatedBy?: string // AI persona or system
  quality?: number // Quality score 0-100
  metadata?: Record<string, any>

  // Relations
  idea?: Idea
  user?: User
  session?: BiddingSession
}

// Supporting types for Business Plan
export interface CompetitorAnalysis {
  name: string
  strengths: string[]
  weaknesses: string[]
  marketShare?: number
}

export interface ProductFeature {
  name: string
  description: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  timeline?: string
}

export interface RoadmapPhase {
  phase: string
  timeline: string
  deliverables: string[]
  resources: string[]
}

export interface RevenueStream {
  source: string
  model: string // subscription, one-time, usage-based
  projection: number
  percentage: number
}

export interface CostItem {
  category: string
  description: string
  amount: number
  recurring: boolean
}

export interface UnitEconomics {
  cac: number // Customer Acquisition Cost
  ltv: number // Lifetime Value
  paybackPeriod: number // months
  grossMargin: number // percentage
}

export interface TeamMember {
  role: string
  responsibilities: string[]
  requiredSkills: string[]
  status: 'HIRED' | 'RECRUITING' | 'PLANNED'
}

export interface Milestone {
  title: string
  date: Date
  description: string
  kpis: string[]
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
}

export interface FinancialMetric {
  period: string // e.g., "Q1 2024"
  value: number
  growth?: number // percentage
}

export interface Risk {
  type: string
  description: string
  probability: 'HIGH' | 'MEDIUM' | 'LOW'
  impact: 'HIGH' | 'MEDIUM' | 'LOW'
  mitigation: string
}

// Research Report
export interface ResearchReport extends BaseEntity {
  ideaId: string
  userId?: string
  title: string
  status: Status
  type: DocumentType

  basicAnalysis?: {
    summary: string
    keyInsights: string[]
    marketAnalysis: {
      size: string
      competition: string
      opportunities: string[]
      challenges: string[]
    }
    userAnalysis: {
      targetUsers: string
      painPoints: string[]
      solutions: string[]
    }
  }

  mvpGuidance?: {
    productDefinition: {
      coreFeatures: string[]
      uniqueValue: string
      scope: string
    }
    developmentPlan: {
      phases: Array<{
        name: string
        duration: string
        deliverables: string[]
        resources: string[]
      }>
      techStack: string[]
      estimatedCost: string
    }
    validationStrategy: {
      hypotheses: string[]
      experiments: string[]
      metrics: string[]
      timeline: string
    }
  }

  businessModel?: {
    revenueModel: {
      streams: string[]
    }
    costStructure: string[]
    pricingStrategy: string
    scalability: string
    launchPlan?: {
      phases: Array<{
        name: string
        timeline: string
        goals: string[]
        tactics: string[]
      }>
      channels: string[]
      budget: string[]
    }
  }

  executionPlan?: {
    mission: string
    summary: string
    phases: Array<{
      name: string
      timeline: string
      focus: string
      keyOutcomes: string[]
      metrics: string[]
    }>
    duration?: number
  }

  aiInsights?: {
    overallAssessment: {
      score: number
      level: string
      summary: string
      keyStrengths: string[]
      criticalChallenges: string[]
    }
  }

  // Relations
  idea?: Idea
  user?: User
}

// Discussion
export interface Discussion extends BaseEntity {
  ideaId: string
  userId: string
  title: string
  content: string
  parentId?: string | null
  likes: number
  replies: number
  isEdited: boolean
  editedAt?: Date | null

  // Relations
  idea?: Idea
  user?: User
  parent?: Discussion
  children?: Discussion[]
}

// Helper types
export type CreateBusinessPlanInput = Omit<BusinessPlan, 'id' | 'createdAt' | 'updatedAt' | 'idea' | 'user' | 'session'>
export type UpdateBusinessPlanInput = Partial<Omit<BusinessPlan, 'id' | 'createdAt' | 'updatedAt' | 'idea' | 'user' | 'session'>>

export type CreateResearchReportInput = Omit<ResearchReport, 'id' | 'createdAt' | 'updatedAt' | 'idea' | 'user'>
export type UpdateResearchReportInput = Partial<Omit<ResearchReport, 'id' | 'createdAt' | 'updatedAt' | 'idea' | 'user'>>

export type CreateDiscussionInput = Omit<Discussion, 'id' | 'createdAt' | 'updatedAt' | 'idea' | 'user' | 'parent' | 'children' | 'likes' | 'replies' | 'isEdited'>
export type UpdateDiscussionInput = Partial<Omit<Discussion, 'id' | 'createdAt' | 'updatedAt' | 'idea' | 'user' | 'parent' | 'children'>>