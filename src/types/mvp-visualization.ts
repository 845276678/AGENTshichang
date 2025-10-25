/**
 * MVP前端可视化工作坊 - TypeScript类型定义
 *
 * 用途：定义MVP工作坊的数据结构，确保前后端类型一致
 * 关联文档：docs/MVP工作坊-当前稳定版本记录.md
 * 数据库模型：MVPVisualizationSession (prisma/schema.prisma)
 */

import type { FrontendDesign } from './idea-refinement'

// ============================================
// 前端设计需求 (Frontend Requirements)
// ============================================

/**
 * 前端设计需求
 * 可以从创意完善工作坊传递，也可以手动输入
 */
export interface FrontendRequirements extends FrontendDesign {
  /** 数据来源标识 */
  source?: 'refinement-workshop' | 'manual-input'

  /** 关联的创意完善文档ID */
  refinementDocumentId?: string
}

// ============================================
// 代码生成和调整
// ============================================

/**
 * 生成的代码内容
 */
export interface GeneratedCode {
  /** HTML代码 */
  html: string

  /** CSS代码 */
  css: string

  /** 生成时间 */
  generatedAt: string

  /** 使用的AI模型 */
  model?: string

  /** 生成耗时(ms) */
  generationTime?: number
}

/**
 * 代码调整记录
 */
export interface CodeAdjustment {
  /** 调整ID */
  id: string

  /** 调整轮次 */
  round: number

  /** 用户调整请求 */
  userRequest: string

  /** AI调整说明 */
  aiExplanation: string

  /** 调整前的代码 */
  beforeCode: GeneratedCode

  /** 调整后的代码 */
  afterCode: GeneratedCode

  /** 调整时间 */
  adjustedAt: string
}

// ============================================
// 对话历史
// ============================================

/**
 * MVP工作坊对话消息
 */
export interface MVPConversationMessage {
  /** 消息角色 */
  role: 'user' | 'assistant' | 'system'

  /** 消息内容 */
  content: string

  /** 消息时间戳 */
  timestamp: string

  /** 对话轮次 (1-5) */
  round: number

  /** 消息类型 */
  type?: 'initial' | 'adjustment' | 'confirmation' | 'final'

  /** 附加的代码（如果AI返回了新代码） */
  code?: GeneratedCode
}

// ============================================
// 会话状态
// ============================================

/**
 * MVP工作坊会话状态
 */
export type MVPSessionStatus = 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

/**
 * MVP可视化会话数据
 * 对应数据库 MVPVisualizationSession 模型
 */
export interface MVPVisualizationSessionData {
  /** 会话ID */
  id: string

  /** 用户ID */
  userId: string

  /** 关联的创意完善文档ID（可选） */
  refinementDocumentId?: string

  /** 前端设计需求 */
  frontendRequirements: FrontendRequirements

  /** 生成的HTML代码 */
  generatedHTML: string

  /** 生成的CSS代码 */
  generatedCSS: string

  /** 对话历史 (5轮) */
  conversationHistory: MVPConversationMessage[]

  /** 当前对话轮次 */
  currentRound: number

  /** 调整历史记录 */
  adjustmentHistory: CodeAdjustment[]

  /** 消耗的积分 */
  creditsDeducted: number

  /** 是否来自竞价（免费） */
  isFromBidding: boolean

  /** 最终HTML文件内容 */
  finalHTMLFile?: string

  /** 更新后的创意计划书 */
  updatedPlanDocument?: string

  /** 状态 */
  status: MVPSessionStatus

  /** 创建时间 */
  createdAt: string

  /** 更新时间 */
  updatedAt: string

  /** 完成时间 */
  completedAt?: string
}

// ============================================
// 设备预览模式
// ============================================

/**
 * 设备预览模式
 */
export type DeviceMode = 'desktop' | 'tablet' | 'mobile'

/**
 * 设备预览配置
 */
export interface DevicePreview {
  /** 设备类型 */
  mode: DeviceMode

  /** 视口宽度 */
  width: number

  /** 视口高度 */
  height: number

  /** 显示名称 */
  label: string
}

/**
 * 预设设备配置
 */
export const DEVICE_PRESETS: Record<DeviceMode, DevicePreview> = {
  desktop: {
    mode: 'desktop',
    width: 1920,
    height: 1080,
    label: '桌面端 (1920x1080)'
  },
  tablet: {
    mode: 'tablet',
    width: 768,
    height: 1024,
    label: '平板 (768x1024)'
  },
  mobile: {
    mode: 'mobile',
    width: 375,
    height: 812,
    label: '移动端 (375x812)'
  }
}

// ============================================
// API请求/响应类型
// ============================================

/**
 * 开始MVP工作坊的请求
 */
export interface StartMVPWorkshopRequest {
  /** 用户ID */
  userId: string

  /** 关联的创意完善文档ID（可选） */
  refinementDocumentId?: string

  /** 手动输入的前端需求（如果没有refinementDocumentId） */
  manualRequirements?: FrontendRequirements

  /** 数据来源 */
  source: 'from-bidding' | 'from-refinement' | 'standalone'
}

/**
 * 开始MVP工作坊的响应
 */
export interface StartMVPWorkshopResponse {
  /** 成功标志 */
  success: boolean

  /** 会话ID */
  sessionId: string

  /** 前端需求（成功读取或需要手动输入） */
  frontendRequirements?: FrontendRequirements

  /** 是否需要手动输入 */
  needsManualInput: boolean

  /** 初始AI消息 */
  initialMessage?: MVPConversationMessage

  /** 初始生成的代码（如果有） */
  initialCode?: GeneratedCode
}

/**
 * 生成初始代码的请求
 */
export interface GenerateInitialCodeRequest {
  /** 会话ID */
  sessionId: string

  /** 前端需求（手动输入时需要） */
  frontendRequirements?: FrontendRequirements
}

/**
 * 生成初始代码的响应
 */
export interface GenerateInitialCodeResponse {
  /** 成功标志 */
  success: boolean

  /** 生成的代码 */
  code: GeneratedCode

  /** AI说明消息 */
  aiMessage: MVPConversationMessage

  /** 当前轮次 */
  currentRound: number
}

/**
 * 提交调整请求
 */
export interface SubmitAdjustmentRequest {
  /** 会话ID */
  sessionId: string

  /** 用户调整需求 */
  adjustmentRequest: string
}

/**
 * 提交调整响应
 */
export interface SubmitAdjustmentResponse {
  /** 成功标志 */
  success: boolean

  /** 调整后的代码 */
  code: GeneratedCode

  /** AI回复消息 */
  aiMessage: MVPConversationMessage

  /** 新的对话轮次 */
  currentRound: number

  /** 最大轮次 */
  maxRounds: number

  /** 是否还可以继续调整 */
  canAdjustMore: boolean

  /** 本次调整记录 */
  adjustmentRecord: AdjustmentRecord
}

/**
 * 导出MVP代码的请求
 */
export interface ExportMVPCodeRequest {
  /** 会话ID */
  sessionId: string

  /** 项目标题（可选，用于文件名） */
  projectTitle?: string
}

/**
 * 导出MVP代码的响应
 */
export interface ExportMVPCodeResponse {
  /** 成功标志 */
  success: boolean

  /** 导出的文件 */
  files: {
    /** HTML文件 */
    htmlFile: {
      filename: string
      content: string
      size: number
      mimeType: string
    }
    /** 产品计划书文件 */
    planDocument: {
      filename: string
      content: string
      size: number
      mimeType: string
    }
  }

  /** 工作坊摘要 */
  summary: {
    totalRounds: number
    adjustmentsCount: number
    finalHTMLSize: number
    finalCSSSize: number
    creditsUsed: number
    isFromBidding: boolean
  }
}

/**
 * 获取会话详情的请求
 */
export interface GetMVPSessionRequest {
  /** 会话ID */
  sessionId: string
}

/**
 * 获取会话详情的响应
 */
export interface GetMVPSessionResponse {
  /** 成功标志 */
  success: boolean

  /** 会话数据 */
  session: MVPVisualizationSessionData
}

// ============================================
// 前端UI组件Props
// ============================================

/**
 * 代码预览组件Props
 */
export interface CodePreviewProps {
  /** HTML代码 */
  html: string

  /** CSS代码 */
  css: string

  /** 当前设备模式 */
  deviceMode: DeviceMode

  /** 切换设备模式回调 */
  onDeviceModeChange: (mode: DeviceMode) => void

  /** 是否显示代码编辑器 */
  showCodeEditor?: boolean
}

/**
 * 对话面板组件Props
 */
export interface ConversationPanelProps {
  /** 对话历史 */
  conversationHistory: MVPConversationMessage[]

  /** 当前轮次 */
  currentRound: number

  /** 发送消息回调 */
  onSendMessage: (message: string) => Promise<void>

  /** 是否正在加载 */
  isLoading: boolean

  /** 是否已完成 */
  isCompleted: boolean
}

/**
 * 进度指示器组件Props
 */
export interface ProgressIndicatorProps {
  /** 当前轮次 (1-5) */
  currentRound: number

  /** 总轮次 */
  totalRounds: number

  /** 各轮次描述 */
  roundDescriptions: string[]
}

// ============================================
// 工具函数类型
// ============================================

/**
 * 从创意完善文档读取frontendDesign的工具函数
 */
export type ExtractFrontendDesignFn = (
  refinementDocumentId: string
) => Promise<FrontendRequirements | null>

/**
 * 推断frontendDesign的工具函数（向后兼容）
 */
export type InferFrontendDesignFn = (
  productDetails: any
) => FrontendRequirements

/**
 * 合并HTML和CSS生成单文件的工具函数
 */
export type MergeCodeToHTMLFn = (html: string, css: string) => string

/**
 * 从会话生成创意计划书更新的工具函数
 */
export type GeneratePlanDocumentFn = (
  session: MVPVisualizationSessionData
) => string
