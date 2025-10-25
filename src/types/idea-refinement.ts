/**
 * 创意完善工作坊 - TypeScript类型定义
 *
 * 用途：定义创意完善工作坊的数据结构，确保前后端类型一致
 * 关联文档：docs/创意完善工作坊-frontendDesign维度补充.md
 * 数据库模型：IdeaRefinementDocument (prisma/schema.prisma)
 */

// ============================================
// 前端UI设计需求 (Frontend Design)
// ============================================

/**
 * 前端UI设计需求
 * 用于收集产品的界面设计需求，传递给MVP可视化工作坊
 */
export interface FrontendDesign {
  /** 页面结构：主要页面和基本布局描述 */
  pageStructure: string

  /** 核心交互：用户需要执行的关键操作列表 */
  coreInteractions: string[]

  /** 视觉风格：配色、字体、布局偏好 */
  visualStyle: {
    /** 配色方案（如：蓝色科技风、绿色清新风） */
    colorScheme: string

    /** 字体风格（如：现代简约、商务正式） */
    typography: string

    /** 布局方式（如：单栏、双栏、卡片式） */
    layout: string
  }

  /** 目标设备：桌面端、移动端等 */
  targetDevices: string[]

  /** 参考案例：用户喜欢的网站或应用设计 */
  referenceExamples: string
}

// ============================================
// 创意完善文档各维度结构
// ============================================

/**
 * 目标用户画像（维度1）
 */
export interface TargetUser {
  /** 用户群体描述 */
  userGroup: string

  /** 典型用户画像 */
  typicalPersona: {
    age?: string
    occupation?: string
    income?: string
    lifestyle?: string
  }

  /** 核心痛点 */
  corePainPoints: string[]

  /** 使用场景 */
  usageScenarios: string[]
}

/**
 * 商业模式（维度2）
 */
export interface BusinessModel {
  /** 收入模式 */
  revenueModel: string

  /** 定价策略 */
  pricingStrategy: string

  /** 成本结构 */
  costStructure: string

  /** 盈利预测 */
  profitProjection?: string
}

/**
 * 市场分析（维度3）
 */
export interface MarketAnalysis {
  /** 市场规模 */
  marketSize: string

  /** 目标市场 */
  targetMarket: string

  /** 市场趋势 */
  marketTrends: string[]

  /** 市场机会 */
  opportunities: string[]
}

/**
 * 竞争优势（维度4）
 */
export interface CompetitiveAdvantage {
  /** 主要竞争对手 */
  competitors: string[]

  /** 核心竞争力 */
  coreCompetencies: string[]

  /** 差异化优势 */
  differentiation: string

  /** 进入壁垒 */
  entryBarriers?: string[]
}

/**
 * 产品/服务详情（维度5）
 */
export interface ProductDetails {
  /** 产品/服务总体描述 */
  summary: string

  /** 核心功能列表 */
  coreFeatures: string[]

  /** 技术路线 */
  technicalApproach: string

  /** 开发时间表 */
  timeline?: string

  /** 所需资源 */
  resources?: string

  /** 前端UI设计需求（🆕 第6轮对话收集） */
  frontendDesign: FrontendDesign
}

/**
 * 实施路径（维度6）
 */
export interface Implementation {
  /** 里程碑规划 */
  milestones: Array<{
    title: string
    description: string
    deadline?: string
  }>

  /** 风险评估 */
  risks: Array<{
    risk: string
    mitigation: string
  }>

  /** 资源需求 */
  resources: {
    human?: string
    financial?: string
    partnerships?: string
  }
}

/**
 * 创意完善文档完整结构
 * 对应数据库中的 refinedDocument 字段（Json类型）
 */
export interface RefinedDocument {
  /** 基本信息 */
  basicInfo: {
    ideaTitle: string
    ideaContent: string
    createdAt: string
  }

  /** 维度1：目标用户画像 */
  targetUser: TargetUser

  /** 维度2：商业模式 */
  businessModel: BusinessModel

  /** 维度3：市场分析 */
  marketAnalysis: MarketAnalysis

  /** 维度4：竞争优势 */
  competitiveAdvantage: CompetitiveAdvantage

  /** 维度5：产品/服务详情 */
  productDetails: ProductDetails

  /** 维度6：实施路径 */
  implementation: Implementation
}

// ============================================
// 对话历史和进度追踪
// ============================================

/**
 * AI对话消息
 */
export interface ConversationMessage {
  /** 消息角色 */
  role: 'user' | 'assistant' | 'system'

  /** 消息内容 */
  content: string

  /** 消息时间戳 */
  timestamp: string

  /** 所属维度ID */
  dimensionId?: string

  /** 对话轮次 */
  round?: number
}

/**
 * 维度完善进度
 */
export interface DimensionProgress {
  /** 维度ID */
  dimensionId: string

  /** 维度名称 */
  dimensionName: string

  /** 当前轮次 */
  currentRound: number

  /** 总轮次 */
  totalRounds: number

  /** 是否完成 */
  isCompleted: boolean

  /** 完成时间 */
  completedAt?: string
}

/**
 * 创意完善工作坊会话状态
 */
export type RefinementStatus = 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

/**
 * 创意完善文档完整数据（包含元数据）
 * 对应数据库 IdeaRefinementDocument 模型
 */
export interface IdeaRefinementDocumentData {
  /** 文档ID */
  id: string

  /** 用户ID */
  userId: string

  /** 创意标题 */
  ideaTitle: string

  /** 创意内容 */
  ideaContent: string

  /** 关联的竞价会话ID */
  biddingSessionId?: string

  /** 评估得分（来自AI竞价） */
  evaluationScore?: {
    totalScore: number
    dimensionScores: Record<string, number>
    level: string
  }

  /** 完善后的文档内容 */
  refinedDocument: RefinedDocument

  /** 对话历史 */
  conversationHistory: ConversationMessage[]

  /** 当前正在完善的维度 (0-5) */
  currentDimension: number

  /** 当前维度的对话轮次 (1-6) */
  currentRound: number

  /** 已完成的维度列表 */
  completedDimensions: string[]

  /** 整体完成进度 (0-100) */
  progress: number

  /** 状态 */
  status: RefinementStatus

  /** 创建时间 */
  createdAt: string

  /** 更新时间 */
  updatedAt: string

  /** 完成时间 */
  completedAt?: string
}

// ============================================
// API请求/响应类型
// ============================================

/**
 * 开始创意完善工作坊的请求
 */
export interface StartRefinementRequest {
  /** 用户ID */
  userId: string

  /** 创意标题 */
  ideaTitle: string

  /** 创意内容 */
  ideaContent: string

  /** 关联的竞价会话ID（可选） */
  biddingSessionId?: string

  /** 评估得分（来自竞价，可选） */
  evaluationScore?: {
    totalScore: number
    dimensionScores: Record<string, number>
    level: string
  }
}

/**
 * 开始创意完善工作坊的响应
 */
export interface StartRefinementResponse {
  /** 成功标志 */
  success: boolean

  /** 文档ID */
  documentId: string

  /** 第一条AI消息（引导开始） */
  initialMessage: ConversationMessage

  /** 当前维度信息 */
  currentDimension: {
    id: string
    name: string
    icon: string
    totalRounds: number
  }
}

/**
 * 提交用户回复的请求
 */
export interface SubmitUserReplyRequest {
  /** 文档ID */
  documentId: string

  /** 用户回复内容 */
  userMessage: string
}

/**
 * 提交用户回复的响应
 */
export interface SubmitUserReplyResponse {
  /** 成功标志 */
  success: boolean

  /** AI回复消息 */
  aiMessage: ConversationMessage

  /** 是否需要继续对话 */
  needsMoreInput: boolean

  /** 当前进度 */
  progress: {
    currentDimension: number
    currentRound: number
    overallProgress: number
  }

  /** 如果维度完成，返回下一维度信息 */
  nextDimension?: {
    id: string
    name: string
    icon: string
    totalRounds: number
  }

  /** 如果全部完成，返回完整文档 */
  completedDocument?: RefinedDocument
}

/**
 * 获取工作坊会话的请求
 */
export interface GetRefinementSessionRequest {
  /** 文档ID */
  documentId: string
}

/**
 * 获取工作坊会话的响应
 */
export interface GetRefinementSessionResponse {
  /** 成功标志 */
  success: boolean

  /** 文档数据 */
  document: IdeaRefinementDocumentData

  /** 当前维度详细信息 */
  currentDimensionInfo: {
    id: string
    name: string
    icon: string
    currentRound: number
    totalRounds: number
  }

  /** 已完成维度的详细信息 */
  completedDimensionsInfo: Array<{
    id: string
    name: string
    icon: string
  }>

  /** 统计信息 */
  statistics: {
    totalDimensions: number
    completedDimensionsCount: number
    totalRounds: number
    completedRounds: number
    totalMessages: number
  }
}

/**
 * 保存工作坊进度的请求
 */
export interface SaveRefinementProgressRequest {
  /** 文档ID */
  documentId: string

  /** 临时输入内容（用户输入但未提交） */
  temporaryInput?: string

  /** 用户备注 */
  userNotes?: string
}

/**
 * 保存工作坊进度的响应
 */
export interface SaveRefinementProgressResponse {
  /** 成功标志 */
  success: boolean

  /** 保存时间 */
  savedAt: string

  /** 提示消息 */
  message: string
}

/**
 * 完成工作坊的请求
 */
export interface CompleteRefinementRequest {
  /** 文档ID */
  documentId: string
}

/**
 * 完成工作坊的响应
 */
export interface CompleteRefinementResponse {
  /** 成功标志 */
  success: boolean

  /** 完善后的完整文档 */
  refinedDocument: RefinedDocument

  /** 统计信息 */
  statistics: {
    totalDimensions: number
    completedDimensions: number
    allDimensionsCompleted: boolean
    totalMessages: number
    userMessages: number
    aiMessages: number
    progress: number
    timeSpent: number // 分钟
    hasFrontendDesign: boolean
  }

  /** 验证结果 */
  validation: {
    isComplete: boolean
    missingFields: string[]
    completedFields: string[]
  }

  /** 是否可以开始MVP工作坊 */
  canStartMVPWorkshop: boolean

  /** 完成消息 */
  message: string
}
