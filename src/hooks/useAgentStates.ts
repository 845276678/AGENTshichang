'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { AI_PERSONAS, type AIPersona, type AIMessage } from '@/lib/ai-persona-system'
import { BiddingPhase, type AgentState } from '@/components/bidding/AgentDialogPanel'

// 阶段权限接口
interface PhasePermissions {
  canUserInput: boolean
  canUserWatch: boolean
  showAgentDialog: boolean
  showBiddingStatus: boolean
  userSupplementAllowed: boolean
  maxSupplementCount: number
}

// 阶段权限配置
export const PHASE_PERMISSIONS: Record<BiddingPhase, PhasePermissions> = {
  [BiddingPhase.IDEA_INPUT]: {
    canUserInput: true,
    canUserWatch: true,
    showAgentDialog: true,
    showBiddingStatus: false,
    userSupplementAllowed: false,
    maxSupplementCount: 0
  },
  [BiddingPhase.AGENT_WARMUP]: {
    canUserInput: false,
    canUserWatch: true,
    showAgentDialog: true,
    showBiddingStatus: false,
    userSupplementAllowed: false,
    maxSupplementCount: 0
  },
  [BiddingPhase.AGENT_DISCUSSION]: {
    canUserInput: false,
    canUserWatch: true,
    showAgentDialog: true,
    showBiddingStatus: true,
    userSupplementAllowed: true,  // 允许与Agent对话
    maxSupplementCount: 1        // 限制为1次探索性对话
  },
  [BiddingPhase.AGENT_BIDDING]: {
    canUserInput: false,
    canUserWatch: true,
    showAgentDialog: true,
    showBiddingStatus: true,
    userSupplementAllowed: true,  // 允许与Agent对话
    maxSupplementCount: 2        // 允许2次对话
  },
  [BiddingPhase.USER_SUPPLEMENT]: {
    canUserInput: true,
    canUserWatch: true,
    showAgentDialog: true,
    showBiddingStatus: true,
    userSupplementAllowed: true,
    maxSupplementCount: 3
  },
  [BiddingPhase.RESULT_DISPLAY]: {
    canUserInput: false,
    canUserWatch: true,
    showAgentDialog: true,
    showBiddingStatus: true,
    userSupplementAllowed: false,
    maxSupplementCount: 0
  }
}

// WebSocket 消息类型扩展
interface AgentStateMessage {
  type: 'agent_thinking' | 'agent_speaking' | 'agent_bidding' | 'agent_emotion_change' | 'agent_bid_update' | 'user_permission_update'
  personaId: string
  payload: {
    phase?: AgentState['phase']
    emotion?: AgentState['emotion']
    message?: string
    confidence?: number
    speakingIntensity?: number
    thinkingDuration?: number
    bidAmount?: number
    timestamp?: number
  }
}

// Agent状态管理配置
interface UseAgentStatesConfig {
  currentPhase: BiddingPhase
  onStateChange?: (agentId: string, newState: AgentState) => void
  onPermissionUpdate?: (permissions: PhasePermissions) => void
}

// Hook返回类型
interface UseAgentStatesReturn {
  agentStates: Record<string, AgentState>
  currentPermissions: PhasePermissions
  supportedAgents: Set<string>
  supplementCount: number
  updateAgentState: (agentId: string, updates: Partial<AgentState>) => void
  handleWebSocketMessage: (message: AgentStateMessage) => void
  supportAgent: (agentId: string) => void
  canSupport: (agentId: string) => boolean
  resetStates: () => void
  getActiveAgents: () => string[]
  getAgentsByPhase: (phase: AgentState['phase']) => string[]
}

// 默认Agent状态生成函数（增强版）
const createDefaultAgentState = (agentId: string): AgentState => ({
  id: agentId,
  phase: 'idle',
  emotion: 'neutral',
  confidence: 0,
  lastActivity: new Date(),
  speakingIntensity: 0.8,
  thinkingDuration: 3,
  isSupported: false
})

// 状态验证函数
const validateAgentState = (state: Partial<AgentState>): Partial<AgentState> => {
  const validatedState: Partial<AgentState> = {}

  if (state.phase && ['idle', 'thinking', 'speaking', 'bidding', 'waiting'].includes(state.phase)) {
    validatedState.phase = state.phase
  }

  if (state.emotion && ['neutral', 'excited', 'confident', 'worried', 'aggressive'].includes(state.emotion)) {
    validatedState.emotion = state.emotion
  }

  if (typeof state.confidence === 'number' && state.confidence >= 0 && state.confidence <= 1) {
    validatedState.confidence = state.confidence
  }

  if (typeof state.speakingIntensity === 'number' && state.speakingIntensity >= 0 && state.speakingIntensity <= 1) {
    validatedState.speakingIntensity = state.speakingIntensity
  }

  if (typeof state.thinkingDuration === 'number' && state.thinkingDuration > 0) {
    validatedState.thinkingDuration = state.thinkingDuration
  }

  if (typeof state.currentMessage === 'string') {
    validatedState.currentMessage = state.currentMessage.slice(0, 500) // 限制消息长度
  }

  if (typeof state.isSupported === 'boolean') {
    validatedState.isSupported = state.isSupported
  }

  return validatedState
}

// Agent状态管理Hook
export function useAgentStates(config: UseAgentStatesConfig): UseAgentStatesReturn {
  const { currentPhase, onStateChange, onPermissionUpdate } = config

  // 初始化所有Agent状态
  const [agentStates, setAgentStates] = useState<Record<string, AgentState>>(() => {
    const initialStates: Record<string, AgentState> = {}
    AI_PERSONAS.forEach(persona => {
      initialStates[persona.id] = createDefaultAgentState(persona.id)
    })
    return initialStates
  })

  // 支持的Agent集合
  const [supportedAgents, setSupportedAgents] = useState<Set<string>>(new Set())

  // 用户补充次数计数
  const [supplementCount, setSupplementCount] = useState(0)

  // 当前权限
  const [currentPermissions, setCurrentPermissions] = useState<PhasePermissions>(
    PHASE_PERMISSIONS[currentPhase]
  )

  // 状态更新队列（防抖处理）
  const updateQueueRef = useRef<Map<string, Partial<AgentState>>>(new Map())
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 权限更新
  useEffect(() => {
    const newPermissions = PHASE_PERMISSIONS[currentPhase]
    setCurrentPermissions(newPermissions)
    onPermissionUpdate?.(newPermissions)

    // 阶段切换时重置补充计数（每个阶段独立计算）
    if (currentPhase === BiddingPhase.AGENT_DISCUSSION ||
        currentPhase === BiddingPhase.AGENT_BIDDING ||
        currentPhase === BiddingPhase.USER_SUPPLEMENT) {
      setSupplementCount(0) // 重置补充计数，每个阶段重新开始
    } else if (currentPhase === BiddingPhase.IDEA_INPUT) {
      // 重置所有Agent为idle状态
      setAgentStates(prevStates => {
        const newStates = { ...prevStates }
        Object.keys(newStates).forEach(agentId => {
          newStates[agentId] = {
            ...newStates[agentId],
            phase: 'idle',
            emotion: 'neutral',
            currentMessage: undefined,
            confidence: 0
          }
        })
        return newStates
      })
      setSupportedAgents(new Set())
      setSupplementCount(0)
    }
  }, [currentPhase, onPermissionUpdate])

  // 批量状态更新（防抖）
  const flushUpdates = useCallback(() => {
    if (updateQueueRef.current.size === 0) return

    setAgentStates(prevStates => {
      const newStates = { ...prevStates }

      updateQueueRef.current.forEach((updates, agentId) => {
        if (newStates[agentId]) {
          const validatedUpdates = validateAgentState(updates)
          const updatedState = {
            ...newStates[agentId],
            ...validatedUpdates,
            lastActivity: new Date()
          }

          newStates[agentId] = updatedState
          onStateChange?.(agentId, updatedState)
        }
      })

      updateQueueRef.current.clear()
      return newStates
    })
  }, [onStateChange])

  // 更新Agent状态
  const updateAgentState = useCallback((agentId: string, updates: Partial<AgentState>) => {
    // 检查Agent是否存在
    if (!AI_PERSONAS.find(p => p.id === agentId)) {
      console.warn(`Agent ${agentId} not found`)
      return
    }

    // 添加到更新队列
    const currentUpdates = updateQueueRef.current.get(agentId) || {}
    updateQueueRef.current.set(agentId, { ...currentUpdates, ...updates })

    // 防抖处理：50ms内的更新合并处理
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current)
    }

    updateTimeoutRef.current = setTimeout(() => {
      flushUpdates()
      updateTimeoutRef.current = null
    }, 50)
  }, [flushUpdates])

  // 处理WebSocket消息
  const handleWebSocketMessage = useCallback((message: AgentStateMessage) => {
    const { type, personaId, payload } = message

    switch (type) {
      case 'agent_thinking':
        updateAgentState(personaId, {
          phase: 'thinking',
          thinkingDuration: payload.thinkingDuration || 3,
          emotion: payload.emotion || 'neutral'
        })
        break

      case 'agent_speaking':
        updateAgentState(personaId, {
          phase: 'speaking',
          currentMessage: payload.message,
          speakingIntensity: payload.speakingIntensity || 0.8,
          emotion: payload.emotion || 'neutral',
          confidence: payload.confidence || 0
        })
        break

      case 'agent_bidding':
        updateAgentState(personaId, {
          phase: 'bidding',
          currentMessage: payload.message,
          confidence: payload.confidence || 0,
          emotion: payload.emotion || 'confident'
        })
        break

      case 'agent_emotion_change':
        updateAgentState(personaId, {
          emotion: payload.emotion || 'neutral'
        })
        break

      case 'agent_bid_update':
        // 出价更新不直接影响Agent状态，由外部组件处理
        // 但可以更新信心度
        if (payload.confidence !== undefined) {
          updateAgentState(personaId, {
            confidence: payload.confidence
          })
        }
        break

      case 'user_permission_update':
        // 权限更新由阶段变更处理，这里可以做额外处理
        break

      default:
        console.warn('Unknown agent state message type:', type)
    }
  }, [updateAgentState])

  // 支持Agent
  const supportAgent = useCallback((agentId: string) => {
    if (!currentPermissions.userSupplementAllowed) {
      console.warn('User supplement not allowed in current phase')
      return
    }

    if (supplementCount >= currentPermissions.maxSupplementCount) {
      console.warn('Maximum supplement count reached')
      return
    }

    setSupportedAgents(prev => new Set(prev).add(agentId))
    setSupplementCount(prev => prev + 1)

    updateAgentState(agentId, {
      isSupported: true
    })
  }, [currentPermissions, supplementCount, updateAgentState])

  // 检查是否可以支持某个Agent
  const canSupport = useCallback((agentId: string) => {
    return currentPermissions.userSupplementAllowed &&
           supplementCount < currentPermissions.maxSupplementCount &&
           !supportedAgents.has(agentId)
  }, [currentPermissions, supplementCount, supportedAgents])

  // 重置所有状态
  const resetStates = useCallback(() => {
    const resetStates: Record<string, AgentState> = {}
    AI_PERSONAS.forEach(persona => {
      resetStates[persona.id] = createDefaultAgentState(persona.id)
    })
    setAgentStates(resetStates)
    setSupportedAgents(new Set())
    setSupplementCount(0)
  }, [])

  // 获取活跃Agent列表
  const getActiveAgents = useCallback(() => {
    return Object.entries(agentStates)
      .filter(([, state]) => state.phase !== 'idle')
      .map(([agentId]) => agentId)
  }, [agentStates])

  // 根据阶段获取Agent列表
  const getAgentsByPhase = useCallback((phase: AgentState['phase']) => {
    return Object.entries(agentStates)
      .filter(([, state]) => state.phase === phase)
      .map(([agentId]) => agentId)
  }, [agentStates])

  // 清理定时器
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }
    }
  }, [])

  return {
    agentStates,
    currentPermissions,
    supportedAgents,
    supplementCount,
    updateAgentState,
    handleWebSocketMessage,
    supportAgent,
    canSupport,
    resetStates,
    getActiveAgents,
    getAgentsByPhase
  }
}

// 权限管理器工具类
export class PhasePermissionManager {
  static getPermissions(phase: BiddingPhase): PhasePermissions {
    return PHASE_PERMISSIONS[phase] || PHASE_PERMISSIONS[BiddingPhase.IDEA_INPUT]
  }

  static canUserInput(phase: BiddingPhase): boolean {
    return this.getPermissions(phase).canUserInput
  }

  static canShowBidding(phase: BiddingPhase): boolean {
    return this.getPermissions(phase).showBiddingStatus
  }

  static getMaxSupplementCount(phase: BiddingPhase): number {
    return this.getPermissions(phase).maxSupplementCount
  }

  static isSupplementPhase(phase: BiddingPhase): boolean {
    return phase === BiddingPhase.USER_SUPPLEMENT
  }

  static getPhaseDescription(phase: BiddingPhase): string {
    const descriptions: Record<BiddingPhase, string> = {
      [BiddingPhase.IDEA_INPUT]: '创意输入阶段 - 请输入您的创意想法',
      [BiddingPhase.AGENT_WARMUP]: '预热阶段 - AI专家正在了解您的创意',
      [BiddingPhase.AGENT_DISCUSSION]: '深度讨论阶段 - AI专家正在深入分析',
      [BiddingPhase.AGENT_BIDDING]: '竞价阶段 - AI专家正在激烈竞价',
      [BiddingPhase.USER_SUPPLEMENT]: '补充阶段 - 您可以支持喜欢的专家',
      [BiddingPhase.RESULT_DISPLAY]: '结果展示阶段 - 查看最终竞价结果'
    }
    return descriptions[phase] || '未知阶段'
  }
}

// 导出类型
export type {
  PhasePermissions,
  AgentStateMessage,
  UseAgentStatesConfig,
  UseAgentStatesReturn
}