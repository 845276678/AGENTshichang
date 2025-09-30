export interface ScenarioContext {
  industry: string
  targetCustomers: string[]
  regions: string[]
  channels: string[]
  availableResources: string[]
  budgetRange?: {
    min: number
    max: number
  }
  constraints?: string[]
  launchTimeline?: string
}

export interface ScenarioActor {
  name: string
  role: string
  needs: string[]
  successIndicators: string[]
}

export interface ScenarioRisk {
  type: 'regulation' | 'resource' | 'market' | 'technology' | 'execution'
  detail: string
  severity: 'low' | 'medium' | 'high'
  mitigation: string
}

export interface FeasibilityAction {
  label: string
  type: 'clarify' | 'mitigate' | 'leverage'
}

export interface FeasibilityScore {
  overall: number
  resourceFit: number
  techFit: number
  compliance: number
  marketReadiness: number
  actions: FeasibilityAction[]
}

export interface ClarificationQuestion {
  id: string
  field: keyof ScenarioContext | 'business_model' | 'supply_chain' | 'partnerships'
  question: string
  reason: string
  required: boolean
}

export interface ScenarioOutput {
  traceId: string
  summary: string
  primaryUseCases: string[]
  actors: ScenarioActor[]
  assumptions: string[]
  risks: ScenarioRisk[]
  feasibility: FeasibilityScore
  recommendedPilots: Array<{ city: string; channel: string; rationale: string }>
  nextSteps: Array<{ type: 'clarify' | 'research' | 'experiment'; description: string }>
  clarifications: ClarificationQuestion[]
}

export interface BusinessPlanStageConfig {
  id: string
  name: string
  aiProvider: 'DEEPSEEK' | 'ZHIPU' | 'ALI'
  estimatedTime: string
  deliverables: string[]
  dependencies: string[]
  description?: string
}

// 导入智能适配相关类型
export * from './intelligent-adaptation'

// 实战阶段上下文
export interface PracticalStageContext {
  ideaTitle: string
  ideaDescription: string
  userGoals?: {
    shortTerm: string[]
    mediumTerm?: string[]
    longTerm?: string[]
    successMetrics: string[]
  }
  userBackground?: {
    industry?: string
    experience?: string[]
    skills?: string[]
    budget?: string
    timeline?: string
    location?: string
  }
  previousStagesOutput?: {
    [stageId: string]: any
  }
}

// 实战阶段输出
export interface PracticalStageOutput {
  title: string
  summary: string
  sections: Array<{
    title: string
    content: string
    actionItems: string[]
    timeframe: string
  }>
  keyInsights: string[]
  nextSteps: string[]
  confidenceBooster: string
  adaptedRecommendations?: {
    techStack?: any
    researchChannels?: any
    offlineEvents?: any
    timeline?: any
  }
}
