/* eslint-disable */
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { ScenarioContext, ScenarioOutput, ClarificationQuestion } from '@/types/business-plan'

// 类型定义
export interface GenerationStage {
  id: string
  name: string
  description: string
  aiProvider: 'DEEPSEEK' | 'ZHIPU' | 'ALI'
  status: 'pending' | 'in_progress' | 'completed' | 'error'
  progress: number
  estimatedTime: string
  startTime?: Date
  completionTime?: Date
  currentStep?: string
  subSteps: Array<{
    name: string
    status: 'pending' | 'in_progress' | 'completed'
    duration?: number
  }>
  aiInsights: string[]
  deliverables: string[]
  versions: ContentVersion[]
  error?: string
}

export interface ContentVersion {
  id: string
  stageId: string
  version: number
  createdAt: Date
  aiProvider: string
  content: {
    title: string
    summary: string
    fullContent: string
    keyPoints: string[]
    // 新增简化版内容结构
    coreContent: {
      wordCount: number
      text: string
      visualElements: {
        charts?: Array<{
          type: 'line' | 'bar' | 'pie' | 'scatter'
          data: any
          title: string
        }>
        metrics?: Array<{
          label: string
          value: string | number
          icon: string
          color: string
        }>
        icons?: Array<{
          name: string
          position: string
          size: string
        }>
      }
      actionItems: string[]
    }
    expandableContent: {
      sections: Array<{
        title: string
        content: string
        subsections?: Array<{
          title: string
          content: string
        }>
      }>
      estimatedReadTime: number
    }
    attachments?: Array<{
      type: 'chart' | 'table' | 'image'
      data: any
      description: string
    }>
  }
  userFeedback?: {
    rating: number
    comments: string
    improvements: string[]
  }
  status: 'draft' | 'reviewed' | 'approved' | 'rejected'
  qualityScore: number
  metrics: {
    inputTokens: number
    outputTokens: number
    responseTime: number
    cost: number
  }
}

export interface IdeaData {
  id: string
  title: string
  description: string
  category: string
  tags: string[]
  submittedBy: string
  scenarioContext?: ScenarioContext
}

export interface GenerationConfig {
  aiProviders: string[]
  maxVersionsPerStage: number
  autoApproveThreshold: number
  enableRealTimePreview: boolean
  enableVersionComparison: boolean
}

// 商业计划书生成状态接�?interface BusinessPlanGenerationState {
  // 基础数据
  ideaData: IdeaData | null
  config: GenerationConfig

  // 需求收集状�?  requirementsCollection: {
    isActive: boolean
    currentStep: number
    userRequirements: UserRequirements | null
    analysisResult: RequirementAnalysis | null
    isAnalyzing: boolean
  }

  // 生成状�?  isGenerating: boolean
  isPaused: boolean
  currentStageIndex: number
  overallProgress: number
  estimatedTimeRemaining: number
  startTime: Date | null
  stages: GenerationStage[]

  // 版本管理
  selectedVersions: Record<string, string> // stageId -> versionId
  compareVersions: string[]
  previewVersion: string | null

  // 用户交互
  userFeedback: Record<string, any>
  improvementSuggestions: Array<{
    versionId: string
    type: string
    description: string
    priority: 'low' | 'medium' | 'high'
  }>

  // 错误处理
  errors: Array<{
    id: string
    stageId: string
    message: string
    timestamp: Date
    resolved: boolean
  }>

  // 最终结�?  finalPlan: {
    id: string
    createdAt: Date
    sections: Array<{
      stageId: string
      versionId: string
      content: any
    }>
    metadata: {
      totalCost: number
      totalTime: number
      aiProviders: string[]
      userRequirements?: UserRequirements
      requirementAnalysis?: RequirementAnalysis
    }
  } | null

  // 状态管理方�?  setIdeaData: (data: IdeaData) => void
  updateConfig: (config: Partial<GenerationConfig>) => void

  // 需求收集方�?  startRequirementsCollection: () => void
  updateRequirements: (requirements: Partial<UserRequirements>) => void
  setRequirementsStep: (step: number) => void
  analyzeRequirements: () => Promise<RequirementAnalysis>
  applyRequirementsAnalysis: (requirements: UserRequirements, analysis: RequirementAnalysis) => void
  skipRequirementsCollection: () => void

  // 生成控制
  startGeneration: () => Promise<void>
  pauseGeneration: () => void
  resumeGeneration: () => void
  stopGeneration: () => void
  retryStage: (stageId: string) => Promise<void>

  // 阶段管理
  updateStageStatus: (stageId: string, status: GenerationStage['status']) => void
  updateStageProgress: (stageId: string, progress: number, currentStep?: string) => void
  addStageInsight: (stageId: string, insight: string) => void
  addStageVersion: (stageId: string, version: Omit<ContentVersion, 'id' | 'createdAt'>) => void

  // 版本管理
  selectVersion: (stageId: string, versionId: string) => void
  compareVersions: (versionIds: string[]) => void
  previewVersion: (versionId: string | null) => void
  regenerateVersion: (stageId: string, requirements: string[]) => Promise<void>

  // 反馈管理
  submitFeedback: (versionId: string, feedback: any) => void
  addImprovementSuggestion: (suggestion: any) => void
  resolveError: (errorId: string) => void

  // 结果管理
  generateFinalPlan: () => Promise<void>
  exportPlan: (format: 'pdf' | 'docx' | 'html') => Promise<string>
  saveDraft: () => Promise<void>
  loadDraft: (draftId: string) => Promise<void>

  // 重置状�?  reset: () => void
}

// 初始阶段配置
const INITIAL_STAGES: Omit<GenerationStage, 'versions'>[] = [
  {
    id: 'concept_analysis',
    name: '创意概念解析',
    description: 'DeepSeek深度分析创意核心价值和商业潜力',
    aiProvider: 'DEEPSEEK',
    status: 'pending',
    progress: 0,
    estimatedTime: '3-5分钟',
    subSteps: [
      { name: '创意理解与分�?, status: 'pending' },
      { name: '核心价值提�?, status: 'pending' },
      { name: '问题陈述生成', status: 'pending' },
      { name: '概念报告整理', status: 'pending' }
    ],
    aiInsights: [],
    deliverables: ['概念提取报告', '核心价值分�?, '问题陈述']
  },
  {
    id: 'market_research',
    name: '市场调研分析',
    description: '通义千问进行全面市场分析和竞争环境研�?,
    aiProvider: 'ALI',
    status: 'pending',
    progress: 0,
    estimatedTime: '8-12分钟',
    subSteps: [
      { name: '市场规模分析', status: 'pending' },
      { name: '竞品调研', status: 'pending' },
      { name: '目标用户画像', status: 'pending' },
      { name: '市场机会评估', status: 'pending' }
    ],
    aiInsights: [],
    deliverables: ['市场规模报告', '竞品分析', '目标用户画像']
  },
  {
    id: 'tech_architecture',
    name: '技术架构设�?,
    description: '智谱GLM设计可扩展的技术实现方�?,
    aiProvider: 'ZHIPU',
    status: 'pending',
    progress: 0,
    estimatedTime: '10-15分钟',
    subSteps: [
      { name: '系统架构设计', status: 'pending' },
      { name: 'API接口规划', status: 'pending' },
      { name: '技术栈选择', status: 'pending' },
      { name: '开发计划制�?, status: 'pending' }
    ],
    aiInsights: [],
    deliverables: ['系统架构�?, 'API设计规范', '技术栈推荐']
  },
  {
    id: 'business_model',
    name: '商业模式构建',
    description: 'DeepSeek构建可持续的商业模式和盈利策�?,
    aiProvider: 'DEEPSEEK',
    status: 'pending',
    progress: 0,
    estimatedTime: '6-10分钟',
    subSteps: [
      { name: '商业模式画布', status: 'pending' },
      { name: '收入流设�?, status: 'pending' },
      { name: '成本结构分析', status: 'pending' },
      { name: '定价策略制定', status: 'pending' }
    ],
    aiInsights: [],
    deliverables: ['商业模式画布', '收入流设�?, '成本结构分析']
  },
  {
    id: 'financial_model',
    name: '财务建模预测',
    description: '通义千问建立详细的财务预测和投资分析模型',
    aiProvider: 'ALI',
    status: 'pending',
    progress: 0,
    estimatedTime: '12-18分钟',
    subSteps: [
      { name: '财务预测建模', status: 'pending' },
      { name: '投资回报分析', status: 'pending' },
      { name: '估值计�?, status: 'pending' },
      { name: '资金需求规�?, status: 'pending' }
    ],
    aiInsights: [],
    deliverables: ['3年财务预�?, '投资回报分析', '估值建�?]
  },
  {
    id: 'legal_compliance',
    name: '合规风险评估',
    description: '智谱GLM进行法律合规分析和风险评�?,
    aiProvider: 'ZHIPU',
    status: 'pending',
    progress: 0,
    estimatedTime: '8-12分钟',
    subSteps: [
      { name: '法律合规检�?, status: 'pending' },
      { name: '知识产权策略', status: 'pending' },
      { name: '风险识别评估', status: 'pending' },
      { name: '合规建议制定', status: 'pending' }
    ],
    aiInsights: [],
    deliverables: ['合规检查清�?, '法律风险评估', '知识产权策略']
  },
  {
    id: 'implementation_plan',
    name: '实施路线规划',
    description: '智谱GLM制定详细的项目执行计划和时间�?,
    aiProvider: 'ZHIPU',
    status: 'pending',
    progress: 0,
    estimatedTime: '6-10分钟',
    subSteps: [
      { name: '项目时间表制�?, status: 'pending' },
      { name: '团队配置规划', status: 'pending' },
      { name: '关键里程碑设�?, status: 'pending' },
      { name: '资源需求分�?, status: 'pending' }
    ],
    aiInsights: [],
    deliverables: ['项目时间�?, '团队配置方案', '关键里程�?]
  },
  {
    id: 'investor_pitch',
    name: '投资推介材料',
    description: 'DeepSeek创建专业的投资者演示和融资材料',
    aiProvider: 'DEEPSEEK',
    status: 'pending',
    progress: 0,
    estimatedTime: '5-8分钟',
    subSteps: [
      { name: 'BP演示文稿制作', status: 'pending' },
      { name: '投资亮点提炼', status: 'pending' },
      { name: '融资策略制定', status: 'pending' },
      { name: '问答准备', status: 'pending' }
    ],
    aiInsights: [],
    deliverables: ['BP演示文稿', '投资亮点总结', '融资策略建议']
  }
]

// 默认配置
const DEFAULT_CONFIG: GenerationConfig = {
  aiProviders: ['DEEPSEEK', 'ZHIPU', 'ALI'],
  maxVersionsPerStage: 3,
  autoApproveThreshold: 80,
  enableRealTimePreview: true,
  enableVersionComparison: true
}

// 创建store
export const useBusinessPlanGeneration = create<BusinessPlanGenerationState>()(
  subscribeWithSelector((set, get) => ({
    // 初始状�?    ideaData: null,
    config: DEFAULT_CONFIG,
    scenario: null,
    scenarioStatus: 'idle',
    scenarioClarifications: [],

    // 需求收集状�?    requirementsCollection: {
      isActive: false,
      currentStep: 0,
      userRequirements: null,
      analysisResult: null,
      isAnalyzing: false
    },

    isGenerating: false,
    isPaused: false,
    currentStageIndex: -1,
    overallProgress: 0,
    estimatedTimeRemaining: 0,
    startTime: null,
    stages: INITIAL_STAGES.map(stage => ({ ...stage, versions: [] })),
    selectedVersions: {},
    compareVersions: [],
    previewVersion: null,
    userFeedback: {},
    improvementSuggestions: [],
    errors: [],
    finalPlan: null,

    // 基础设置
    setIdeaData: (data: IdeaData) => {
      set({ ideaData: data, scenario: null, scenarioStatus: 'idle', scenarioClarifications: [] })
    },

    updateConfig: (configUpdate: Partial<GenerationConfig>) => {
      set(state => ({
        config: { ...state.config, ...configUpdate }
      }))
    },

    // 需求收集方�?    startRequirementsCollection: () => {
      set(state => ({
        requirementsCollection: {
          ...state.requirementsCollection,
          isActive: true,
          currentStep: 0,
          userRequirements: {
            selectedOptions: {},
            customRequirements: {},
            priorityWeights: {},
            additionalContext: '',
            expectedOutcomes: [],
            timeConstraints: { urgency: 'medium' }
          }
        }
      }))
    },

    updateRequirements: (requirementsUpdate: Partial<UserRequirements>) => {
      set(state => ({
        requirementsCollection: {
          ...state.requirementsCollection,
          userRequirements: state.requirementsCollection.userRequirements
            ? { ...state.requirementsCollection.userRequirements, ...requirementsUpdate }
            : null
        }
      }))
    },

    setRequirementsStep: (step: number) => {
      set(state => ({
        requirementsCollection: {
          ...state.requirementsCollection,
          currentStep: step
        }
      }))
    },

    analyzeRequirements: async (): Promise<RequirementAnalysis> => {
      const { ideaData, requirementsCollection } = get()

      if (!ideaData || !requirementsCollection.userRequirements) {
        throw new Error('缺少必要数据')
      }

      set(state => ({
        requirementsCollection: {
          ...state.requirementsCollection,
          isAnalyzing: true
        }
      }))

      try {
        // 模拟AI分析过程
        await new Promise(resolve => setTimeout(resolve, 3000))

        // 生成分析结果（实际环境中应调用AI服务�?        const analysis: RequirementAnalysis = await get().performRequirementsAnalysis(
          ideaData,
          requirementsCollection.userRequirements
        )

        set(state => ({
          requirementsCollection: {
            ...state.requirementsCollection,
            isAnalyzing: false,
            analysisResult: analysis
          }
        }))

        return analysis

      } catch (error) {
        set(state => ({
          requirementsCollection: {
            ...state.requirementsCollection,
            isAnalyzing: false
          },
          errors: [...state.errors, {
            id: Date.now().toString(),
            stageId: 'requirements_analysis',
            message: '需求分析失�? ' + (error instanceof Error ? error.message : '未知错误'),
            timestamp: new Date(),
            resolved: false
          }]
        }))
        throw error
      }
    },

    applyRequirementsAnalysis: (requirements: UserRequirements, analysis: RequirementAnalysis) => {
      // 应用分析结果到生成策�?      const adjustedStages = get().stages.map(stage => {
        const adjustment = analysis.generationStrategy.stageAdjustments.find(
          adj => adj.stageId === stage.id
        )

        if (adjustment) {
          return {
            ...stage,
            description: stage.description + ` (${adjustment.depthLevel}深度)`,
            estimatedTime: stage.estimatedTime, // 根据weightMultiplier调整
            customInstructions: adjustment.aiInstructions
          }
        }

        return stage
      })

      set(state => ({
        requirementsCollection: {
          ...state.requirementsCollection,
          isActive: false
        },
        stages: adjustedStages,
        estimatedTimeRemaining: analysis.estimatedTimeAdjustment
      }))
    },

    skipRequirementsCollection: () => {
      set(state => ({
        requirementsCollection: {
          ...state.requirementsCollection,
          isActive: false
        }
      }))
    },

    // 生成控制
    startGeneration: async () => {
      const { ideaData } = get()
      if (!ideaData) {
        throw new Error('请先设置创意数据')
      }

      set({
        isGenerating: true,
        isPaused: false,
        currentStageIndex: 0,
        startTime: new Date(),
        overallProgress: 0,
        errors: []
      })

      // 开始生成过�?      try {
        await get().executeGeneration()
      } catch (error) {
        set(state => ({
          errors: [...state.errors, {
            id: Date.now().toString(),
            stageId: 'system',
            message: error instanceof Error ? error.message : '生成过程中发生未知错�?,
            timestamp: new Date(),
            resolved: false
          }],
          isGenerating: false
        }))
      }
    },

    pauseGeneration: () => {
      set({ isPaused: true })
    },

    resumeGeneration: () => {
      set({ isPaused: false })
      get().executeGeneration()
    },

    stopGeneration: () => {
      set({
        isGenerating: false,
        isPaused: false,
        currentStageIndex: -1
      })
    },

    retryStage: async (stageId: string) => {
      const { stages } = get()
      const stageIndex = stages.findIndex(s => s.id === stageId)

      if (stageIndex === -1) return

      // 重置阶段状�?      set(state => ({
        stages: state.stages.map((stage, index) =>
          index === stageIndex
            ? { ...stage, status: 'pending', progress: 0, error: undefined }
            : stage
        ),
        currentStageIndex: stageIndex
      }))

      // 重新执行该阶�?      await get().executeStage(stageId)
    },

    // 阶段管理
    updateStageStatus: (stageId: string, status: GenerationStage['status']) => {
      set(state => ({
        stages: state.stages.map(stage =>
          stage.id === stageId ? { ...stage, status } : stage
        )
      }))
    },

    updateStageProgress: (stageId: string, progress: number, currentStep?: string) => {
      set(state => ({
        stages: state.stages.map(stage =>
          stage.id === stageId
            ? { ...stage, progress, currentStep }
            : stage
        )
      }))

      // 更新整体进度
      const { stages } = get()
      const totalProgress = stages.reduce((sum, stage) => sum + stage.progress, 0) / stages.length
      set({ overallProgress: totalProgress })
    },

    addStageInsight: (stageId: string, insight: string) => {
      set(state => ({
        stages: state.stages.map(stage =>
          stage.id === stageId
            ? { ...stage, aiInsights: [...stage.aiInsights, insight] }
            : stage
        )
      }))
    },

    addStageVersion: (stageId: string, versionData: Omit<ContentVersion, 'id' | 'createdAt'>) => {
      const version: ContentVersion = {
        ...versionData,
        id: Date.now().toString() + Math.random().toString(36),
        createdAt: new Date()
      }

      set(state => ({
        stages: state.stages.map(stage =>
          stage.id === stageId
            ? { ...stage, versions: [...stage.versions, version] }
            : stage
        )
      }))

      // 自动选择第一个版�?      const { selectedVersions } = get()
      if (!selectedVersions[stageId]) {
        get().selectVersion(stageId, version.id)
      }
    },

    // 版本管理
    selectVersion: (stageId: string, versionId: string) => {
      set(state => ({
        selectedVersions: { ...state.selectedVersions, [stageId]: versionId }
      }))
    },

    compareVersions: (versionIds: string[]) => {
      set({ compareVersions: versionIds })
    },

    previewVersion: (versionId: string | null) => {
      set({ previewVersion: versionId })
    },

    regenerateVersion: async (stageId: string, requirements: string[]) => {
      // 调用API重新生成版本
      try {
        const response = await fetch('/api/business-plan/regenerate-version', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stageId, requirements })
        })

        if (!response.ok) throw new Error('重新生成失败')

        const newVersion = await response.json()
        get().addStageVersion(stageId, newVersion)
      } catch (error) {
        console.error('Regenerate version error:', error)
      }
    },

    // 反馈管理
    submitFeedback: (versionId: string, feedback: any) => {
      set(state => ({
        userFeedback: { ...state.userFeedback, [versionId]: feedback },
        stages: state.stages.map(stage => ({
          ...stage,
          versions: stage.versions.map(version =>
            version.id === versionId
              ? { ...version, userFeedback: feedback }
              : version
          )
        }))
      }))
    },

    addImprovementSuggestion: (suggestion: any) => {
      set(state => ({
        improvementSuggestions: [...state.improvementSuggestions, suggestion]
      }))
    },

    resolveError: (errorId: string) => {
      set(state => ({
        errors: state.errors.map(error =>
          error.id === errorId ? { ...error, resolved: true } : error
        )
      }))
    },

    // 结果管理
    generateFinalPlan: async () => {
      const { stages, selectedVersions, ideaData } = get()

      if (!ideaData) throw new Error('缺少创意数据')

      const sections = stages.map(stage => {
        const versionId = selectedVersions[stage.id]
        const version = stage.versions.find(v => v.id === versionId)

        if (!version) throw new Error(`阶段 ${stage.name} 缺少选中的版本`)

        return {
          stageId: stage.id,
          versionId: version.id,
          content: version.content
        }
      })

      const totalCost = stages.reduce((sum, stage) =>
        sum + stage.versions.reduce((vSum, v) => vSum + v.metrics.cost, 0), 0
      )

      const totalTime = get().startTime ?
        Date.now() - get().startTime!.getTime() : 0

      const finalPlan = {
        id: Date.now().toString(),
        createdAt: new Date(),
        sections,
        metadata: {
          totalCost,
          totalTime,
          aiProviders: [...new Set(stages.map(s => s.aiProvider))]
        }
      }

      set({ finalPlan })
      return finalPlan
    },

    exportPlan: async (format: 'pdf' | 'docx' | 'html') => {
      const { finalPlan } = get()
      if (!finalPlan) {
        throw new Error('请先生成最终方�?)
      }

      const response = await fetch('/api/business-plan/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: finalPlan, format })
      })

      if (!response.ok) throw new Error('导出失败')

      const blob = await response.blob()
      return URL.createObjectURL(blob)
    },

    saveDraft: async () => {
      const state = get()

      await fetch('/api/business-plan/save-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaData: state.ideaData,
          stages: state.stages,
          selectedVersions: state.selectedVersions,
          userFeedback: state.userFeedback
        })
      })
    },

    loadDraft: async (draftId: string) => {
      const response = await fetch(`/api/business-plan/load-draft/${draftId}`)
      const draft = await response.json()

      set({
        ideaData: draft.ideaData,
        stages: draft.stages,
        selectedVersions: draft.selectedVersions,
        userFeedback: draft.userFeedback
      })
    },

    // 重置状�?    reset: () => {
      set({
        ideaData: null,
        isGenerating: false,
        isPaused: false,
        currentStageIndex: -1,
        overallProgress: 0,
        estimatedTimeRemaining: 0,
        startTime: null,
        stages: INITIAL_STAGES.map(stage => ({ ...stage, versions: [] })),
        selectedVersions: {},
        compareVersions: [],
        previewVersion: null,\r\n        scenario: null,\r\n        scenarioStatus: 'idle',\r\n        scenarioClarifications: [],\r\n        userFeedback: {},
        improvementSuggestions: [],
        errors: [],
        finalPlan: null
      })
    },

    // 内部方法
    performRequirementsAnalysis: async (
      ideaData: IdeaData,
      requirements: UserRequirements
    ): Promise<RequirementAnalysis> => {
      // 实际环境中应调用AI服务，这里使用模拟实�?      const selectedOptionsCount = Object.values(requirements.selectedOptions)
        .reduce((total, options) => total + options.length, 0)

      const hasCustomRequirements = Object.values(requirements.customRequirements)
        .some(text => text.trim().length > 0)

      // 根据选择计算匹配分数
      const matchScore = Math.min(0.95, 0.6 + (selectedOptionsCount * 0.05) + (hasCustomRequirements ? 0.1 : 0))

      // 分析用户画像
      const userProfile = get().analyzeUserProfile(requirements)
      const experienceLevel = selectedOptionsCount > 8 ? '高级' : selectedOptionsCount > 4 ? '中级' : '初级'

      // 生成定制化大�?      const customizedOutline = get().generateCustomizedOutline(ideaData, requirements)

      const analysis: RequirementAnalysis = {
        understanding: {
          coreInterests: get().extractCoreInterests(requirements),
          userProfile,
          experienceLevel,
          mainConcerns: get().identifyMainConcerns(requirements)
        },
        ideaFit: {
          matchScore,
          strengths: [
            '创意与需求高度匹�?,
            '用户需求明确具�?,
            '目标受众定位清晰'
          ],
          challenges: [
            '部分细节需要进一步完�?,
            '实施复杂度需要合理评�?
          ],
          recommendations: [
            '重点突出核心优势',
            '详细展示可行�?,
            '提供风险应对方案'
          ]
        },
        customizedOutline,
        suggestions: get().generateOptimizationSuggestions(requirements),
        estimatedTimeAdjustment: customizedOutline.estimatedTime,
        generationStrategy: get().createGenerationStrategy(requirements)
      }

      return analysis
    },

    analyzeUserProfile: (requirements: UserRequirements): string => {
      const businessFocusOptions = requirements.selectedOptions['business_focus'] || []
      const targetAudience = requirements.selectedOptions['target_audience'] || []
      const constraints = requirements.selectedOptions['resource_constraints'] || []

      if (businessFocusOptions.includes('technology_innovation') && targetAudience.includes('investors_vc')) {
        return '技术型创业者，专注创新与投�?
      } else if (businessFocusOptions.includes('market_opportunity') && constraints.includes('funding_limited')) {
        return '市场导向型创业者，注重成本效率'
      } else if (targetAudience.includes('strategic_partners')) {
        return '资源整合型创业者，重视合作共赢'
      }

      return '综合型创业者，平衡多方面发�?
    },

    extractCoreInterests: (requirements: UserRequirements): string[] => {
      const interests: string[] = []
      const allOptions = Object.values(requirements.selectedOptions).flat()

      if (allOptions.includes('market_opportunity')) {
        interests.push('市场机会识别和规模化潜力')
      }
      if (allOptions.includes('technology_innovation')) {
        interests.push('技术创新的商业化路�?)
      }
      if (allOptions.includes('revenue_model')) {
        interests.push('可持续的盈利模式设计')
      }
      if (allOptions.includes('investors_vc')) {
        interests.push('投资回报和融资策�?)
      }
      if (allOptions.includes('competitive_advantage')) {
        interests.push('差异化竞争优势构�?)
      }

      return interests.slice(0, 4) // 最多返�?个核心关注点
    },

    identifyMainConcerns: (requirements: UserRequirements): string[] => {
      const concerns: string[] = []
      const constraints = requirements.selectedOptions['resource_constraints'] || []

      if (constraints.includes('funding_limited')) {
        concerns.push('资金效率和使用计�?)
      }
      if (constraints.includes('team_building')) {
        concerns.push('团队建设和人才获�?)
      }
      if (constraints.includes('technology_gap')) {
        concerns.push('技术实现和能力建设')
      }
      if (constraints.includes('market_access')) {
        concerns.push('市场进入和渠道拓�?)
      }

      return concerns
    },

    generateCustomizedOutline: (ideaData: IdeaData, requirements: UserRequirements) => {
      const businessFocus = requirements.selectedOptions['business_focus'] || []
      const targetAudience = requirements.selectedOptions['target_audience']?.[0] || ''
      const timeline = requirements.selectedOptions['timeline_priority']?.[0] || ''

      // 基础章节配置
      const baseSections = [
        { stageId: 'concept_analysis', basePages: 6, basePriority: 'medium' },
        { stageId: 'market_research', basePages: 10, basePriority: 'medium' },
        { stageId: 'tech_architecture', basePages: 8, basePriority: 'medium' },
        { stageId: 'business_model', basePages: 8, basePriority: 'high' },
        { stageId: 'financial_model', basePages: 10, basePriority: 'high' },
        { stageId: 'legal_compliance', basePages: 6, basePriority: 'medium' },
        { stageId: 'implementation_plan', basePages: 8, basePriority: 'high' },
        { stageId: 'investor_pitch', basePages: 6, basePriority: 'medium' }
      ]

      const sections = baseSections.map(base => {
        let priority: 'high' | 'medium' | 'low' = base.basePriority as any
        let pages = base.basePages
        let focusPoints: string[] = []

        // 根据用户关注点调整优先级和页�?        switch (base.stageId) {
          case 'market_research':
            if (businessFocus.includes('market_opportunity')) {
              priority = 'high'
              pages += 4
              focusPoints = ['市场规模分析', '增长趋势', '竞争格局', '机会识别']
            }
            break
          case 'tech_architecture':
            if (businessFocus.includes('technology_innovation')) {
              priority = 'high'
              pages += 3
              focusPoints = ['技术创新点', '实现路径', '技术壁�?]
            }
            break
          case 'business_model':
            if (businessFocus.includes('revenue_model')) {
              priority = 'high'
              pages += 2
              focusPoints = ['盈利模式', '收入�?, '成本结构']
            }
            break
          case 'investor_pitch':
            if (targetAudience === 'investors_vc') {
              priority = 'high'
              pages += 3
              focusPoints = ['投资亮点', '回报预期', '退出策�?]
            }
            break
        }

        return {
          stageId: base.stageId,
          title: get().getStageTitle(base.stageId),
          description: get().getStageDescription(base.stageId, businessFocus, targetAudience),
          priority,
          estimatedPages: pages,
          focusPoints: focusPoints.length > 0 ? focusPoints : get().getDefaultFocusPoints(base.stageId)
        }
      })

      const totalPages = sections.reduce((sum, section) => sum + section.estimatedPages, 0)
      const estimatedTime = Math.round(totalPages * 1.2) // 每页�?.2分钟

      return {
        sections,
        totalPages,
        estimatedTime
      }
    },

    getStageTitle: (stageId: string): string => {
      const titles: Record<string, string> = {
        'concept_analysis': '创意概念与价值分�?,
        'market_research': '市场调研与机会分�?,
        'tech_architecture': '技术架构与实现方案',
        'business_model': '商业模式与盈利设�?,
        'financial_model': '财务建模与投资分�?,
        'legal_compliance': '法律合规与风险评�?,
        'implementation_plan': '实施计划与执行路�?,
        'investor_pitch': '投资推介与融资策�?
      }
      return titles[stageId] || stageId
    },

    getStageDescription: (stageId: string, businessFocus: string[], targetAudience: string): string => {
      const baseDescriptions: Record<string, string> = {
        'concept_analysis': '深度解析创意核心价值与商业潜力',
        'market_research': '全面分析目标市场与竞争环�?,
        'tech_architecture': '设计可扩展的技术实现方�?,
        'business_model': '构建可持续的商业模式',
        'financial_model': '建立详细的财务预测模�?,
        'legal_compliance': '确保法律合规与风险控�?,
        'implementation_plan': '制定详细的执行计�?,
        'investor_pitch': '打造专业的投资推介方案'
      }

      let description = baseDescriptions[stageId] || ''

      // 根据目标受众调整描述
      if (targetAudience === 'investors_vc' && stageId === 'financial_model') {
        description += '，重点关注投资回报与风险评估'
      } else if (targetAudience === 'strategic_partners' && stageId === 'business_model') {
        description += '，突出合作价值与互补优势'
      }

      return description
    },

    getDefaultFocusPoints: (stageId: string): string[] => {
      const focusPoints: Record<string, string[]> = {
        'concept_analysis': ['核心价�?, '问题解决', '创新�?],
        'market_research': ['市场规模', '用户需�?, '竞争分析'],
        'tech_architecture': ['系统设计', '技术选型', 'API规划'],
        'business_model': ['盈利模式', '成本分析', '价值主�?],
        'financial_model': ['收入预测', '成本控制', '投资回报'],
        'legal_compliance': ['合规检�?, '知识产权', '风险评估'],
        'implementation_plan': ['执行时间�?, '资源配置', '里程�?],
        'investor_pitch': ['投资亮点', '市场机会', '团队优势']
      }
      return focusPoints[stageId] || []
    },

    generateOptimizationSuggestions: (requirements: UserRequirements) => {
      const suggestions: Array<{
        type: 'enhancement' | 'adjustment' | 'warning'
        description: string
        priority: number
      }> = []

      const businessFocus = requirements.selectedOptions['business_focus'] || []
      const constraints = requirements.selectedOptions['resource_constraints'] || []

      if (businessFocus.includes('technology_innovation')) {
        suggestions.push({
          type: 'enhancement',
          description: '建议增加技术实现的详细路线图，展示技术可行�?,
          priority: 1
        })
      }

      if (constraints.includes('funding_limited')) {
        suggestions.push({
          type: 'adjustment',
          description: '财务模型应重点关注资金使用效率和阶段性融资策�?,
          priority: 1
        })
      }

      if (businessFocus.includes('competitive_advantage')) {
        suggestions.push({
          type: 'enhancement',
          description: '深入分析差异化优势，建立清晰的竞争护城河',
          priority: 2
        })
      }

      return suggestions
    },

    createGenerationStrategy: (requirements: UserRequirements) => {
      const businessFocus = requirements.selectedOptions['business_focus'] || []
      const targetAudience = requirements.selectedOptions['target_audience']?.[0] || ''
      const timeline = requirements.selectedOptions['timeline_priority']?.[0] || ''

      return {
        stageAdjustments: [
          {
            stageId: 'market_research',
            weightMultiplier: businessFocus.includes('market_opportunity') ? 1.5 : 1.0,
            focusAreas: businessFocus.includes('market_opportunity')
              ? ['市场规模', '增长机会', '竞争分析']
              : ['基础市场分析'],
            depthLevel: businessFocus.includes('market_opportunity') ? 'comprehensive' : 'detailed',
            aiInstructions: '重点分析市场机会和商业化潜力'
          },
          {
            stageId: 'financial_model',
            weightMultiplier: targetAudience === 'investors_vc' ? 1.4 : 1.0,
            focusAreas: targetAudience === 'investors_vc'
              ? ['投资回报', '财务预测', '风险评估']
              : ['基础财务模型'],
            depthLevel: targetAudience === 'investors_vc' ? 'comprehensive' : 'detailed',
            aiInstructions: '采用投资人视角，强调回报率和可扩展�?
          }
        ],
        contentPrioritization: {
          highPriority: businessFocus.slice(0, 3),
          mediumPriority: ['implementation_plan', 'tech_architecture'],
          lowPriority: ['legal_compliance']
        },
        audienceAdaptation: {
          targetAudience,
          languageStyle: targetAudience === 'investors_vc' ? 'formal' : 'conversational',
          detailLevel: targetAudience === 'investors_vc' ? 'comprehensive' : 'detailed',
          emphasizePoints: get().getAudienceEmphasisPoints(targetAudience)
        }
      }
    },

    getAudienceEmphasisPoints: (audience: string): string[] => {
      const emphasisMap: Record<string, string[]> = {
        'investors_vc': ['投资回报', '市场规模', '可扩展�?, '退出策�?],
        'angel_investors': ['创新�?, '早期验证', '团队能力', '产品愿景'],
        'strategic_partners': ['合作价�?, '资源互补', '协同效应', '共同发展'],
        'internal_team': ['执行计划', '资源配置', '操作指南', '风险控制'],
        'government_agencies': ['社会价�?, '合规�?, '政策符合�?, '就业贡献']
      }
      return emphasisMap[audience] || ['综合分析']
    },

    executeGeneration: async () => {
      const { stages, isPaused } = get()

      for (let i = 0; i < stages.length; i++) {
        if (isPaused || !get().isGenerating) break

        set({ currentStageIndex: i })
        await get().executeStage(stages[i].id)

        // 短暂延迟，允许UI更新
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      if (get().isGenerating && !isPaused) {
        set({ isGenerating: false, currentStageIndex: -1 })
        await get().generateFinalPlan()
      }
    },

    executeStage: async (stageId: string) => {
      const stage = get().stages.find(s => s.id === stageId)
      if (!stage) return

      try {
        // 更新阶段状�?        get().updateStageStatus(stageId, 'in_progress')

        // 模拟子步骤执�?        for (let i = 0; i < stage.subSteps.length; i++) {
          if (!get().isGenerating || get().isPaused) break

          const step = stage.subSteps[i]
          get().updateStageProgress(stageId, (i / stage.subSteps.length) * 100, step.name)

          // 模拟处理时间
          await new Promise(resolve => setTimeout(resolve, Math.random() * 3000 + 1000))

          // 更新子步骤状�?          set(state => ({
            stages: state.stages.map(s =>
              s.id === stageId
                ? {
                    ...s,
                    subSteps: s.subSteps.map((substep, index) =>
                      index === i ? { ...substep, status: 'completed' as const } : substep
                    )
                  }
                : s
            )
          }))

          // 添加AI洞察
          if (i === Math.floor(stage.subSteps.length / 2)) {
            get().addStageInsight(stageId, `${stage.aiProvider} 已完�?{step.name}，发现关键商业机会`)
          }
        }

        // 完成阶段
        get().updateStageProgress(stageId, 100)
        get().updateStageStatus(stageId, 'completed')

        // 生成版本内容
        await get().generateStageVersions(stageId)

      } catch (error) {
        get().updateStageStatus(stageId, 'error')
        set(state => ({
          stages: state.stages.map(s =>
            s.id === stageId
              ? { ...s, error: error instanceof Error ? error.message : '未知错误' }
              : s
          )
        }))
      }
    },

    generateStageVersions: async (stageId: string) => {
      const { ideaData, config } = get()
      if (!ideaData) return

      // 模拟生成多个版本
      for (let i = 0; i < config.maxVersionsPerStage; i++) {
        const version: Omit<ContentVersion, 'id' | 'createdAt'> = {
          stageId,
          version: i + 1,
          aiProvider: get().stages.find(s => s.id === stageId)?.aiProvider || 'DEEPSEEK',
          content: {
            title: `${get().stages.find(s => s.id === stageId)?.name}`,
            summary: get().generateChapterSummary(stageId),
            fullContent: `# ${get().stages.find(s => s.id === stageId)?.name}\n\n这是由AI生成的详细内�?..`,
            keyPoints: get().generateKeyPoints(stageId),
            // 新增简化版内容结构
            coreContent: {
              wordCount: get().getTargetWordCount(stageId),
              text: get().generateConciseText(stageId, i + 1),
              visualElements: get().generateVisualElements(stageId),
              actionItems: get().generateActionItems(stageId)
            },
            expandableContent: {
              sections: get().generateExpandableSections(stageId),
              estimatedReadTime: 5 + Math.floor(Math.random() * 5)
            }
          },
          status: 'draft',
          qualityScore: Math.random() * 40 + 60, // 60-100�?          metrics: {
            inputTokens: Math.floor(Math.random() * 1000 + 500),
            outputTokens: Math.floor(Math.random() * 2000 + 1000),
            responseTime: Math.floor(Math.random() * 5000 + 2000),
            cost: Math.random() * 0.1 + 0.05
          }
        }

        get().addStageVersion(stageId, version)

        // 短暂延迟模拟生成时间
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
  })),
  {
    // 新增：简化版内容生成方法
    generateChapterSummary: (stageId: string) => {
      const { ideaData } = get()
      if (!ideaData) return '正在生成章节摘要...'

      const summaries: Record<string, string> = {
        'concept_analysis': `${ideaData.title}通过创新�?{ideaData.category}解决方案，解决用户核心痛点，具备明确的价值主张和差异化优势。`,
        'market_research': `目标市场具有良好的增长潜力，竞争格局清晰，目标用户需求明确且具备支付能力。`,
        'tech_architecture': `技术方案成熟可行，架构设计支持业务扩展，开发风险可控，预计按期交付。`,
        'business_model': `商业模式清晰，收入流多样化，成本结构合理，具备良好的规模效应和盈利潜力。`,
        'financial_model': `财务预测合理，资金需求明确，投资回报预期良好，现金流规划完善。`,
        'legal_compliance': `法律合规要求明确，知识产权保护策略完善，主要风险已识别并有应对措施。`,
        'implementation_plan': `执行计划详细可行，团队配置合理，关键里程碑清晰，风险控制措施得当。`,
        'investor_pitch': `投资亮点突出，融资用途明确，投资回报预期合理，具备良好的投资价值。`
      }

      return summaries[stageId] || `${ideaData.title}�?{stageId}方面的核心分析。`
    },

    generateKeyPoints: (stageId: string) => {
      const keyPoints: Record<string, string[]> = {
        'concept_analysis': [
          '解决核心用户痛点，提供差异化价�?,
          '具备清晰的商业化路径和市场潜�?,
          '创新点明确，技术和模式具备竞争优势'
        ],
        'market_research': [
          '目标市场规模可观，增长趋势良�?,
          '竞争格局分析清晰，差异化定位明确',
          '目标用户画像精准，需求验证充�?
        ],
        'tech_architecture': [
          '技术架构设计合理，支持业务扩展',
          '开发计划可行，技术风险可�?,
          '核心技术选型适当，团队能力匹�?
        ],
        'business_model': [
          '商业模式清晰，价值创造和获取机制明确',
          '收入流设计合理，成本结构优化',
          '具备规模效应，长期盈利能力强'
        ],
        'financial_model': [
          '财务预测基于合理假设，增长预期可实现',
          '资金需求和使用规划详细，效率高',
          '投资回报预期合理，财务风险可�?
        ],
        'legal_compliance': [
          '法律合规要求全面识别，应对措施完�?,
          '知识产权保护策略清晰，申请计划详�?,
          '主要风险评估充分，应急预案完�?
        ],
        'implementation_plan': [
          '执行计划详细可行，时间节点明�?,
          '团队配置合理，核心岗位需求清�?,
          '关键里程碑设定科学，成功指标明确'
        ],
        'investor_pitch': [
          '投资亮点突出，市场机会和竞争优势明确',
          '融资用途详细，资金使用效率�?,
          '投资回报预期合理，退出策略清�?
        ]
      }

      return keyPoints[stageId] || ['核心要点1', '核心要点2', '核心要点3']
    },

    getTargetWordCount: (stageId: string) => {
      const wordCounts: Record<string, number> = {
        'concept_analysis': 450,
        'market_research': 550,
        'tech_architecture': 500,
        'business_model': 520,
        'financial_model': 600,
        'legal_compliance': 420,
        'implementation_plan': 480,
        'investor_pitch': 450
      }

      return wordCounts[stageId] || 500
    },

    generateConciseText: (stageId: string, version: number) => {
      const { ideaData } = get()
      if (!ideaData) return '正在生成内容...'

      // 这里应该调用AI服务生成实际内容，当前使用模�?      const templates: Record<string, string> = {
        'concept_analysis': `## 核心创意价�?${ideaData.title}�?{ideaData.category}领域的创新解决方案，主要解决[核心问题]�?
**价值主�?*�?- 提升用户体验：[具体改进]
- 降低使用成本：[成本优势]
- 创新技术应用：[技术亮点]

**差异化优�?*�?1. 技术创新：[技术描述]
2. 模式创新：[商业模式]
3. 用户体验：[体验优势]

**商业化潜�?*：预期在[时间]内实现规模化，目标用户群体约[数量]万人。`,

        'market_research': `## 市场机会分析
**市场规模**�?- TAM（总市场）：约[X]亿元
- SAM（可获得市场）：约[Y]亿元
- SOM（可服务市场）：约[Z]亿元

**增长趋势**：年增长率[%]，主要驱动因素包括[因素1、因�?]�?
**竞争格局**�?- 主要竞品：[竞品A]、[竞品B]、[竞品C]
- 我方优势：[优势描述]
- 市场定位：[定位策略]

**目标客户**�?- 主要群体：[用户画像]
- 需求特征：[核心需求]
- 支付能力：[价格接受度]`,

        'tech_architecture': `## 技术实现方�?**整体架构**�?- 前端技术：[技术栈]
- 后端架构：[架构设计]
- 数据存储：[数据库方案]
- 第三方集成：[API接口]

**核心模块**�?1. [模块1]：[功能描述]
2. [模块2]：[功能描述]
3. [模块3]：[功能描述]

**开发计�?*�?- 开发周期：[X]个月
- 团队需求：[岗位需求]
- 技术风险：[风险控制]

**扩展�?*：支持[并发量]用户，架构可水平扩展。`,

        'business_model': `## 商业模式设计
**价值主�?*：为[目标用户]提供[核心价值]，解决[关键问题]�?
**收入模式**�?1. [收入�?]：[描述及定价]
2. [收入�?]：[描述及定价]
3. [收入�?]：[描述及定价]

**成本结构**�?- 主要成本：[成本项目]
- 变动成本：[变动部分]
- 固定成本：[固定部分]

**关键指标**�?- CAC（客户获取成本）：[金额]
- LTV（客户生命周期价值）：[金额]
- 毛利率：[百分比]

**规模化路�?*：通过[策略]实现用户增长和收入提升。`,

        'financial_model': `## 财务预测模型
**收入预测**（万元）�?- �?年：[收入]
- �?年：[收入]
- �?年：[收入]

**成本控制**�?- 人力成本：[比例]
- 技术成本：[比例]
- 运营成本：[比例]
- 营销成本：[比例]

**资金需�?*�?- 启动资金：[金额]万元
- 主要用途：产品开发[%]、市场推广[%]、团队建设[%]
- 融资计划：[轮次]融资[金额]万元

**盈利预期**�?- 盈亏平衡：第[N]个月
- 净利润率：第三年达到[%]
- ROI：投资回报率约[%]`,

        'legal_compliance': `## 合规风险管控
**适用法规**�?- [法规1]：[合规要点]
- [法规2]：[合规要点]
- [法规3]：[合规要点]

**知识产权**�?- 专利申请：[申请计划]
- 商标保护：[保护策略]
- 版权管理：[管理制度]

**主要风险**�?1. [风险1]：概率[�?�?高]，应对[措施]
2. [风险2]：概率[�?�?高]，应对[措施]
3. [风险3]：概率[�?�?高]，应对[措施]

**合规成本**：预计年度合规支出约[金额]万元。`,

        'implementation_plan': `## 执行实施计划
**总体规划**�?- 执行周期：[总时长]
- 分阶段实施：[阶段1][阶段2][阶段3]
- 关键里程碑：[里程碑列表]

**团队配置**�?- 核心岗位：[岗位列表]
- 招聘计划：[时间安排]
- 薪酬预算：[预算范围]

**资源需�?*�?- 办公场地：[需求描述]
- 设备采购：[设备清单]
- 外部服务：[服务需求]

**风险控制**�?- 进度风险：[应对措施]
- 质量风险：[质量保证]
- 人员风险：[人才保留]

**成功指标**：[关键KPI]在[时间]内达到[目标值]。`,

        'investor_pitch': `## 投资价值展�?**投资亮点**�?1. 市场机会：[市场描述]
2. 技术优势：[技术亮点]
3. 团队实力：[团队背景]
4. 商业模式：[模式优势]

**融资需�?*�?- 本轮融资：[金额]万元
- 资金用途：
  - 产品开发：[%]
  - 市场推广：[%]
  - 团队扩张：[%]
  - 运营资金：[%]

**投资回报**�?- 预期IRR：[百分比]
- 投资周期：[年限]
- 退出方式：[IPO/并购/其他]
- 估值预期：[估值区间]

**风险提示**：[主要风险]及应对策略。`
      }

      return templates[stageId] || `# ${ideaData.title} - ${stageId}\n\n正在生成详细内容...`
    },

    generateVisualElements: (stageId: string) => {
      const visualElements: Record<string, any> = {
        'concept_analysis': {
          charts: [],
          icons: ['💡', '🎯', '�?],
          metrics: [
            { label: '问题解决�?, value: '85%', trend: 'up' },
            { label: '创新指数', value: '8.5', trend: 'up' },
            { label: '市场契合�?, value: '78%', trend: 'stable' }
          ]
        },
        'market_research': {
          charts: [{ type: 'market_size', data: [] }],
          icons: ['📊', '🏆', '👥'],
          metrics: [
            { label: '市场规模', value: '120�?, trend: 'up' },
            { label: '年增长率', value: '15%', trend: 'up' },
            { label: '竞争指数', value: '6.2', trend: 'stable' }
          ]
        },
        'financial_model': {
          charts: [{ type: 'revenue_projection', data: [] }],
          icons: ['💰', '📈', '🎯'],
          metrics: [
            { label: '3年营�?, value: '800�?, trend: 'up' },
            { label: '毛利�?, value: '65%', trend: 'up' },
            { label: 'IRR', value: '35%', trend: 'up' }
          ]
        }
      }

      return visualElements[stageId] || { charts: [], icons: ['📋'], metrics: [] }
    },

    generateActionItems: (stageId: string) => {
      const actionItems: Record<string, string[]> = {
        'concept_analysis': [
          '完善核心价值主张表�?,
          '验证目标用户需求匹配度',
          '确定最小可行产�?MVP)功能'
        ],
        'market_research': [
          '深入调研目标客户群体',
          '分析主要竞品策略',
          '制定市场进入策略'
        ],
        'tech_architecture': [
          '确定核心技术栈',
          '设计系统架构�?,
          '评估开发资源需�?
        ],
        'business_model': [
          '验证收入模式可行�?,
          '测试定价策略',
          '优化成本结构'
        ],
        'financial_model': [
          '完善财务预测模型',
          '确定融资需�?,
          '制定资金使用计划'
        ],
        'legal_compliance': [
          '咨询法律专业人士',
          '启动知识产权申请',
          '建立合规管理制度'
        ],
        'implementation_plan': [
          '制定详细项目计划',
          '启动核心团队招聘',
          '建立项目管理流程'
        ],
        'investor_pitch': [
          '准备路演材料',
          '联系目标投资�?,
          '完善商业计划�?
        ]
      }

      return actionItems[stageId] || ['完善相关内容', '推进具体实施', '跟踪关键指标']
    },

    generateExpandableSections: (stageId: string) => {
      const expandableSections: Record<string, Array<{ title: string, content: string }>> = {
        'concept_analysis': [
          {
            title: '详细市场调研数据',
            content: '包含完整的用户访谈记录、问卷调研结果、竞品详细分析等支撑数据�?
          },
          {
            title: '技术实现深度分�?,
            content: '技术选型的详细对比分析、架构设计细节、开发难点及解决方案�?
          },
          {
            title: '商业化路径规�?,
            content: '从MVP到规模化的详细路径规划，包含各阶段的关键指标和成功标准�?
          }
        ],
        'market_research': [
          {
            title: '市场调研方法�?,
            content: '详细的调研方法、数据收集过程、分析模型和验证方式�?
          },
          {
            title: '竞品深度分析',
            content: '主要竞品的商业模式、产品功能、定价策略、用户反馈的详细对比�?
          },
          {
            title: '用户需求验�?,
            content: '用户访谈记录、需求优先级排序、痛点量化分析�?
          }
        ]
      }

      return expandableSections[stageId] || [
        { title: '详细分析报告', content: '包含更深入的数据分析和建议�? },
        { title: '实施指导', content: '具体的操作步骤和最佳实践�? },
        { title: '风险评估', content: '潜在风险及应对策略的详细说明�? }
      ]
    }
  }
)












