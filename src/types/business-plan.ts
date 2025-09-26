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
}
