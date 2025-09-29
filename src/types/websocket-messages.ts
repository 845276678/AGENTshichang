/**
 * WebSocket消息类型定义 - AI Agent竞价系统
 * 定义所有前后端WebSocket通信的消息格式
 */

import { AgentState } from '@/components/bidding/AgentDialogPanel'

// 基础WebSocket消息接口
export interface BaseWSMessage {
  type: string
  timestamp: number
  messageId: string
}

// 会话初始化消息
export interface SessionInitMessage extends BaseWSMessage {
  type: 'session.init'
  payload: {
    sessionId: string
    currentPhase: string
    timeRemaining: number
    viewerCount: number
    participants: string[]
  }
}

// AI消息
export interface AIMessage extends BaseWSMessage {
  type: 'ai_message'
  message: {
    id: string
    personaId: string
    content: string
    emotion: string
    type: 'speech' | 'reaction' | 'thinking'
    timestamp: Date
    confidence?: number
  }
}

// AI竞价消息
export interface AIBidMessage extends BaseWSMessage {
  type: 'ai_bid'
  message: {
    id: string
    personaId: string
    content: string
    bidValue: number
    confidence: number
    timestamp: Date
  }
  currentBids: Record<string, number>
}

// 阶段变更消息
export interface PhaseChangeMessage extends BaseWSMessage {
  type: 'phase_change'
  phase: string
  message: string
  timeRemaining: number
}

// Agent状态更新消息
export interface AgentStateMessage extends BaseWSMessage {
  type: 'agent_thinking' | 'agent_speaking' | 'agent_bidding' | 'agent_emotion_change' | 'agent_idle'
  personaId: string
  stateData: {
    phase?: AgentState['phase']
    emotion?: AgentState['emotion']
    message?: string
    confidence?: number
    speakingIntensity?: number
    thinkingDuration?: number
  }
}

// 批量Agent更新消息
export interface BulkAgentUpdateMessage extends BaseWSMessage {
  type: 'bulk_agent_update'
  agentUpdates: Array<{
    personaId: string
    stateData: Partial<AgentState>
  }>
}

// 竞价更新消息
export interface BidUpdateMessage extends BaseWSMessage {
  type: 'bid_update'
  personaId: string
  bidAmount: number
  previousBid: number
  confidence: number
  isZeroBid: boolean
}

// 观众数量更新
export interface ViewerCountMessage extends BaseWSMessage {
  type: 'viewer_count_update'
  payload: {
    viewerCount: number
    activeViewers: number
  }
}

// 用户支持消息
export interface PersonaSupportedMessage extends BaseWSMessage {
  type: 'persona_supported'
  payload: {
    personaId: string
    userId: string
    supportCount: number
  }
}

// 预测相关消息
export interface PredictionMessage extends BaseWSMessage {
  type: 'prediction_start' | 'prediction_received' | 'prediction_result'
  payload: {
    message: string
    prediction?: number
    confidence?: number
    results?: {
      averagePrediction: number
      actualResult: number
      accuracy: number
    }
  }
}

// 会话完成消息
export interface SessionCompleteMessage extends BaseWSMessage {
  type: 'session_complete'
  results: {
    highestBid: number
    winningPersona: string
    totalBids: number
    duration: number
    participantCount: number
  }
}

// 错误消息
export interface ErrorMessage extends BaseWSMessage {
  type: 'error'
  code: string
  payload: {
    message: string
    details?: any
  }
}

// 心跳消息
export interface HeartbeatMessage extends BaseWSMessage {
  type: 'ping' | 'pong'
}

// 用户操作消息
export interface UserActionMessage extends BaseWSMessage {
  type: 'start_bidding' | 'support_persona' | 'submit_prediction' | 'send_reaction'
  payload: {
    ideaContent?: string
    sessionId?: string
    personaId?: string
    prediction?: number
    confidence?: number
    messageId?: string
    reactionType?: string
  }
}

// 性能监控消息
export interface PerformanceMessage extends BaseWSMessage {
  type: 'performance_metrics'
  metrics: {
    serverLoad: number
    activeConnections: number
    messageQueueSize: number
    aiServiceLatency: number
  }
}

// 联合消息类型
export type WSMessage =
  | SessionInitMessage
  | AIMessage
  | AIBidMessage
  | PhaseChangeMessage
  | AgentStateMessage
  | BulkAgentUpdateMessage
  | BidUpdateMessage
  | ViewerCountMessage
  | PersonaSupportedMessage
  | PredictionMessage
  | SessionCompleteMessage
  | ErrorMessage
  | HeartbeatMessage
  | UserActionMessage
  | PerformanceMessage

// 消息验证器
export class WSMessageValidator {
  static isValidMessage(data: any): data is WSMessage {
    return (
      typeof data === 'object' &&
      data !== null &&
      typeof data.type === 'string' &&
      typeof data.timestamp === 'number' &&
      typeof data.messageId === 'string'
    )
  }

  static validateSessionInit(data: any): data is SessionInitMessage {
    return (
      this.isValidMessage(data) &&
      data.type === 'session.init' &&
      typeof data.payload === 'object' &&
      typeof data.payload.sessionId === 'string' &&
      typeof data.payload.currentPhase === 'string'
    )
  }

  static validateAIMessage(data: any): data is AIMessage {
    return (
      this.isValidMessage(data) &&
      data.type === 'ai_message' &&
      typeof data.message === 'object' &&
      typeof data.message.personaId === 'string' &&
      typeof data.message.content === 'string'
    )
  }

  static validateAgentState(data: any): data is AgentStateMessage {
    return (
      this.isValidMessage(data) &&
      ['agent_thinking', 'agent_speaking', 'agent_bidding', 'agent_emotion_change', 'agent_idle'].includes(data.type) &&
      typeof data.personaId === 'string' &&
      typeof data.stateData === 'object'
    )
  }

  static validateBidUpdate(data: any): data is BidUpdateMessage {
    return (
      this.isValidMessage(data) &&
      data.type === 'bid_update' &&
      typeof data.personaId === 'string' &&
      typeof data.bidAmount === 'number' &&
      typeof data.isZeroBid === 'boolean'
    )
  }
}

// 消息构建器工具类
export class WSMessageBuilder {
  private static generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private static createBase(type: string): BaseWSMessage {
    return {
      type,
      timestamp: Date.now(),
      messageId: this.generateId()
    }
  }

  static createSessionInit(payload: SessionInitMessage['payload']): SessionInitMessage {
    return {
      ...this.createBase('session.init'),
      payload
    }
  }

  static createAIMessage(message: AIMessage['message']): AIMessage {
    return {
      ...this.createBase('ai_message'),
      message
    }
  }

  static createAgentState(personaId: string, stateData: AgentStateMessage['stateData'], type: AgentStateMessage['type']): AgentStateMessage {
    return {
      ...this.createBase(type),
      personaId,
      stateData
    }
  }

  static createBidUpdate(personaId: string, bidAmount: number, previousBid: number, confidence: number): BidUpdateMessage {
    return {
      ...this.createBase('bid_update'),
      personaId,
      bidAmount,
      previousBid,
      confidence,
      isZeroBid: bidAmount === 0
    }
  }

  static createBulkUpdate(agentUpdates: BulkAgentUpdateMessage['agentUpdates']): BulkAgentUpdateMessage {
    return {
      ...this.createBase('bulk_agent_update'),
      agentUpdates
    }
  }

  static createError(code: string, message: string, details?: any): ErrorMessage {
    return {
      ...this.createBase('error'),
      code,
      payload: { message, details }
    }
  }

  static createHeartbeat(type: 'ping' | 'pong'): HeartbeatMessage {
    return this.createBase(type) as HeartbeatMessage
  }

  static createUserAction(type: UserActionMessage['type'], payload: UserActionMessage['payload']): UserActionMessage {
    return {
      ...this.createBase(type),
      payload
    }
  }
}

// WebSocket错误代码常量
export const WS_ERROR_CODES = {
  // 连接错误
  CONNECTION_FAILED: 'CONNECTION_FAILED',
  CONNECTION_TIMEOUT: 'CONNECTION_TIMEOUT',
  UNAUTHORIZED: 'UNAUTHORIZED',

  // 会话错误
  SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  SESSION_FULL: 'SESSION_FULL',

  // 用户错误
  INVALID_MESSAGE: 'INVALID_MESSAGE',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INSUFFICIENT_CREDITS: 'INSUFFICIENT_CREDITS',

  // 系统错误
  AI_SERVICE_ERROR: 'AI_SERVICE_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  MAINTENANCE_MODE: 'MAINTENANCE_MODE'
} as const

export type WSErrorCode = keyof typeof WS_ERROR_CODES

// 导出所有类型
export default {
  WSMessageValidator,
  WSMessageBuilder,
  WS_ERROR_CODES
}