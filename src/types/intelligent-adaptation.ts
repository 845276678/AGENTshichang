/**
 * 智能化商业计划适配框架 - 核心类型定义
 */

// 创意特征分析结果
export interface IdeaCharacteristics {
  // 基础属性
  category: string              // 行业分类
  techIntensity: number        // 技术密集度 1-10
  targetAudience: string[]     // 目标用户群体
  businessModel: string        // 商业模式类型

  // AI能力需求
  aiCapabilities: {
    nlp: boolean              // 自然语言处理
    cv: boolean               // 计算机视觉
    ml: boolean               // 机器学习
    recommendation: boolean    // 推荐系统
    generation: boolean       // 内容生成
    automation: boolean       // 自动化
  }

  // 市场特征
  marketMaturity: string       // 市场成熟度
  competitionLevel: string     // 竞争激烈程度
  regulationLevel: string      // 监管严格程度

  // 资源需求
  technicalComplexity: string  // 技术复杂度
  fundingRequirement: string   // 资金需求等级
  teamRequirement: string[]    // 团队技能需求
}

// 技术栈推荐
export interface TechStackRecommendation {
  beginner: TechStackLevel
  intermediate: TechStackLevel
  advanced: TechStackLevel
}

export interface TechStackLevel {
  primary: string              // 主推技术栈
  reason: string              // 推荐原因
  cost: string                // 成本预估
  timeline: string            // 学习/实现时间
  examples: string[]          // 应用示例
  setupGuide: string[]        // 搭建指南
}

// 需求发现渠道
export interface ResearchChannels {
  online: string[]            // 线上渠道
  offline: string[]           // 线下渠道
  keywords: string[]          // 关键词监控
  tools: string[]             // 调研工具
}

// 线下活动推荐
export interface OfflineEvents {
  category: string
  nationalEvents: OfflineEvent[]
  localEvents: string[]
  industryEvents: string[]
  customEventSuggestions: CustomEvent[]
  recommendedBudget: string
  timelineSuggestions: string[]
}

export interface OfflineEvent {
  name: string
  time: string
  location: string
  cost: string
  networking: string
  value: string
}

export interface CustomEvent {
  type: string
  description: string
  budget: string
  timeline: string
  expectedOutcome: string
}

// 个性化推荐结果
export interface PersonalizedRecommendations {
  ideaCharacteristics: IdeaCharacteristics
  techStackRecommendations: TechStackRecommendation
  researchChannels: ResearchChannels
  offlineEvents: OfflineEvents
  customizedTimeline: CustomizedTimeline
  budgetPlan: BudgetPlan
  teamRecommendations: TeamRecommendations
  riskAssessment: RiskAssessment
  successMetrics: SuccessMetrics
  nextStepActions: NextStepActions
}

// 定制化时间计划
export interface CustomizedTimeline {
  month1: MonthPlan
  month2: MonthPlan
  month3: MonthPlan
  weeklyMilestones: WeeklyMilestone[]
  dailyTasks: DailyTaskTemplate[]
}

export interface MonthPlan {
  focus: string
  developmentTasks: string[]
  researchTasks: string[]
  businessTasks: string[]
  milestones: string[]
}

export interface WeeklyMilestone {
  week: number
  target: string
  deliverables: string[]
  successCriteria: string[]
}

export interface DailyTaskTemplate {
  type: 'development' | 'research' | 'business'
  description: string
  timeRequired: string
  priority: 'high' | 'medium' | 'low'
}

// 预算计划
export interface BudgetPlan {
  startupCosts: CostBreakdown
  monthlyCosts: CostBreakdown
  costOptimization: string[]
  fundingOptions: FundingOption[]
}

export interface CostBreakdown {
  technology: number
  marketing: number
  operations: number
  legal: number
  total: number
}

export interface FundingOption {
  type: string
  amount: string
  requirements: string[]
  probability: string
}

// 团队推荐
export interface TeamRecommendations {
  coreTeam: string[]
  phaseBasedHiring: PhaseHiring[]
  outsourcingOptions: OutsourcingOption[]
  advisorTypes: string[]
  teamBuildingStrategy: string[]
}

export interface PhaseHiring {
  phase: string
  roles: string[]
  priority: string
  timeline: string
}

export interface OutsourcingOption {
  task: string
  provider: string
  cost: string
  pros: string[]
  cons: string[]
}

// 风险评估
export interface RiskAssessment {
  riskList: Risk[]
  overallRiskLevel: string
  riskMonitoring: RiskMonitoringPlan
  contingencyPlans: ContingencyPlan[]
}

export interface Risk {
  type: string
  level: string
  description: string
  mitigation: string[]
}

export interface RiskMonitoringPlan {
  indicators: string[]
  frequency: string
  responsibleParty: string[]
}

export interface ContingencyPlan {
  scenario: string
  triggers: string[]
  actions: string[]
  resources: string[]
}

// 成功指标
export interface SuccessMetrics {
  userMetrics: string[]
  businessMetrics: string[]
  technicalMetrics: string[]
  timelineMilestones: string[]
  kpiTargets: KPITarget[]
}

export interface KPITarget {
  metric: string
  target: string
  timeline: string
  measurement: string
}

// 下一步行动
export interface NextStepActions {
  immediate: string[]
  week1: string[]
  week2: string[]
  month1: string[]
  actionPriority: ActionPriority[]
  resourceRequirements: ResourceRequirement[]
}

export interface ActionPriority {
  action: string
  priority: number
  reason: string
  dependencies: string[]
}

export interface ResourceRequirement {
  action: string
  timeRequired: string
  skillsNeeded: string[]
  budgetNeeded: string
  tools: string[]
}

// 智能适配引擎接口
export interface IntelligentAdaptationEngine {
  ideaAnalyzer: IdeaAnalysisEngine
  personalizedRecommender: PersonalizedRecommendationSystem
  contentGenerator: RealTimeContentGenerator
  resourceMatcher: DynamicResourceMatcher
}

export interface IdeaAnalysisEngine {
  analyzeIdea(title: string, description: string): IdeaCharacteristics
  recommendTechStack(characteristics: IdeaCharacteristics): TechStackRecommendation
  recommendResearchChannels(characteristics: IdeaCharacteristics): ResearchChannels
}

export interface PersonalizedRecommendationSystem {
  generatePersonalizedRecommendations(
    ideaTitle: string,
    ideaDescription: string,
    userLocation?: string,
    userBackground?: string
  ): PersonalizedRecommendations
}

export interface RealTimeContentGenerator {
  generate90DayPlan(characteristics: IdeaCharacteristics): CustomizedTimeline
  generateDailyTasks(characteristics: IdeaCharacteristics): DailyTaskTemplate[]
  defineSuccessMetrics(characteristics: IdeaCharacteristics): SuccessMetrics
}

export interface DynamicResourceMatcher {
  matchTechnicalResources(characteristics: IdeaCharacteristics): TechnicalResourceMatch
  matchResearchResources(characteristics: IdeaCharacteristics): ResearchResourceMatch
  matchLearningResources(characteristics: IdeaCharacteristics): LearningResourceMatch
  planBudget(characteristics: IdeaCharacteristics): BudgetPlan
}

// 资源匹配结果
export interface TechnicalResourceMatch {
  apis: APIRecommendation[]
  frameworks: FrameworkRecommendation[]
  tools: ToolRecommendation[]
}

export interface APIRecommendation {
  name: string
  provider: string
  useCase: string
  pricing: string
  integrationComplexity: string
  documentation: string
}

export interface FrameworkRecommendation {
  name: string
  language: string
  useCase: string
  learningCurve: string
  community: string
  examples: string[]
}

export interface ToolRecommendation {
  name: string
  category: string
  useCase: string
  pricing: string
  alternatives: string[]
}

export interface ResearchResourceMatch {
  onlineChannels: OnlineChannel[]
  offlineEvents: OfflineEvent[]
  expertContacts: ExpertContact[]
}

export interface OnlineChannel {
  platform: string
  searchTerms: string[]
  monitoringFrequency: string
  expectedInsights: string[]
}

export interface ExpertContact {
  type: string
  expertise: string[]
  contactMethod: string
  engagementLevel: string
}

export interface LearningResourceMatch {
  tutorials: Tutorial[]
  courses: Course[]
  documentation: Documentation[]
}

export interface Tutorial {
  title: string
  provider: string
  duration: string
  difficulty: string
  relevance: string
  link: string
}

export interface Course {
  title: string
  provider: string
  duration: string
  cost: string
  certification: boolean
  relevance: string
}

export interface Documentation {
  title: string
  type: string
  source: string
  depth: string
  usefulness: string
}

// 实时适配配置
export interface AdaptationRules {
  techStackRules: TechStackRule[]
  researchChannelRules: ResearchChannelRule[]
  timelineRules: TimelineRule[]
  budgetRules: BudgetRule[]
}

export interface TechStackRule {
  condition: string
  recommendation: string
  reason: string
}

export interface ResearchChannelRule {
  targetAudience: string
  channels: string[]
  methods: string[]
}

export interface TimelineRule {
  complexity: string
  allocation: {
    development: number
    research: number
    business: number
  }
  reasoning: string
}

export interface BudgetRule {
  category: string
  baseMultiplier: number
  factors: string[]
  optimization: string[]
}

// 用户上下文
export interface UserContext {
  goals: UserGoals
  background: UserBackground
  constraints: UserConstraints
  preferences: UserPreferences
}

export interface UserGoals {
  shortTerm: string[]
  mediumTerm: string[]
  longTerm: string[]
  successMetrics: string[]
}

export interface UserBackground {
  industry: string
  experience: string[]
  skills: string[]
  network: string[]
  resources: string[]
}

export interface UserConstraints {
  budget: string
  timeline: string
  teamSize: number
  location: string
}

export interface UserPreferences {
  riskTolerance: string
  techPreference: string
  workStyle: string
  learningStyle: string
}