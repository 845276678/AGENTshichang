'use client'

import { AI_PERSONAS, type AIPersona, type AIMessage } from '@/lib/ai-persona-system'
import { BiddingPhase, type AgentState } from '@/components/bidding/AgentDialogPanel'
import { PhasePermissionManager } from '@/hooks/useAgentStates'

// Agent状态管理器配置
interface AgentStateManagerConfig {
  onStateUpdate?: (agentId: string, state: AgentState) => void
  onPhaseTransition?: (fromPhase: BiddingPhase, toPhase: BiddingPhase) => void
  onError?: (error: string, context?: any) => void
}

// 状态转换规则
interface StateTransitionRule {
  from: AgentState['phase'][]
  to: AgentState['phase']
  conditions?: (state: AgentState, context?: any) => boolean
  duration?: number // 自动转换时间（毫秒）
}

// 情绪触发条件
interface EmotionTrigger {
  condition: (state: AgentState, context: any) => boolean
  emotion: AgentState['emotion']
  priority: number // 优先级，数字越大优先级越高
}

// Agent状态管理器
export class AgentStateManager {
  private config: AgentStateManagerConfig
  private stateTimers: Map<string, NodeJS.Timeout> = new Map()
  private emotionQueue: Map<string, EmotionTrigger[]> = new Map()

  // 状态转换规则定义
  private static readonly TRANSITION_RULES: StateTransitionRule[] = [
    {
      from: ['idle'],
      to: 'thinking',
      duration: 1000 // 1秒后开始思考
    },
    {
      from: ['thinking'],
      to: 'speaking',
      duration: 3000, // 思考3秒后发言
      conditions: (state) => state.thinkingDuration ? state.thinkingDuration * 1000 : 3000
    },
    {
      from: ['speaking'],
      to: 'idle',
      duration: 5000 // 说话5秒后回到待机
    },
    {
      from: ['speaking'],
      to: 'bidding',
      conditions: (state, context) => context?.currentPhase === BiddingPhase.AGENT_BIDDING
    },
    {
      from: ['bidding'],
      to: 'waiting',
      duration: 3000 // 竞价3秒后等待
    },
    {
      from: ['waiting'],
      to: 'idle',
      duration: 2000 // 等待2秒后回到待机
    }
  ]

  // 情绪触发规则
  private static readonly EMOTION_TRIGGERS: EmotionTrigger[] = [
    {
      condition: (state, context) => context.bidAmount > 100,
      emotion: 'excited',
      priority: 3
    },
    {
      condition: (state, context) => context.bidAmount === 0,
      emotion: 'worried',
      priority: 2
    },
    {
      condition: (state, context) => state.confidence > 0.8,
      emotion: 'confident',
      priority: 4
    },
    {
      condition: (state, context) => state.confidence < 0.3,
      emotion: 'worried',
      priority: 3
    },
    {
      condition: (state, context) => context.isWinning,
      emotion: 'excited',
      priority: 5
    },
    {
      condition: (state, context) => context.isLosing,
      emotion: 'aggressive',
      priority: 4
    }
  ]

  constructor(config: AgentStateManagerConfig = {}) {
    this.config = config
  }

  // 创建默认状态
  createDefaultState(agentId: string): AgentState {
    const persona = AI_PERSONAS.find(p => p.id === agentId)
    if (!persona) {
      throw new Error(`Agent ${agentId} not found`)
    }

    return {
      id: agentId,
      phase: 'idle',
      emotion: 'neutral',
      confidence: 0,
      lastActivity: new Date(),
      speakingIntensity: this.getDefaultSpeakingIntensity(persona),
      thinkingDuration: this.getDefaultThinkingDuration(persona),
      isSupported: false
    }
  }

  // 获取默认说话强度（基于人格）
  private getDefaultSpeakingIntensity(persona: AIPersona): number {
    const intensityMap: Record<string, number> = {
      'calm': 0.4,
      'excited': 0.9,
      'analytical': 0.6,
      'emotional': 0.8,
      'authoritative': 0.7
    }
    return intensityMap[persona.voiceStyle] || 0.8
  }

  // 获取默认思考时长（基于人格）
  private getDefaultThinkingDuration(persona: AIPersona): number {
    const durationMap: Record<string, number> = {
      'conservative': 5,
      'aggressive': 2,
      'strategic': 4,
      'emotional': 3,
      'analytical': 6
    }
    return durationMap[persona.biddingStyle] || 3
  }

  // 更新Agent状态
  updateState(agentId: string, updates: Partial<AgentState>, context?: any): AgentState {
    const persona = AI_PERSONAS.find(p => p.id === agentId)
    if (!persona) {
      this.config.onError?.(`Agent ${agentId} not found`, { agentId, updates })
      throw new Error(`Agent ${agentId} not found`)
    }

    // 验证并应用更新
    const validatedUpdates = this.validateStateUpdates(updates)

    // 构建新状态
    const newState: AgentState = {
      id: agentId,
      phase: validatedUpdates.phase || 'idle',
      emotion: validatedUpdates.emotion || 'neutral',
      currentMessage: validatedUpdates.currentMessage,
      confidence: validatedUpdates.confidence || 0,
      lastActivity: new Date(),
      speakingIntensity: validatedUpdates.speakingIntensity || this.getDefaultSpeakingIntensity(persona),
      thinkingDuration: validatedUpdates.thinkingDuration || this.getDefaultThinkingDuration(persona),
      isSupported: validatedUpdates.isSupported || false
    }

    // 应用情绪规则
    const triggeredEmotion = this.evaluateEmotionTriggers(newState, context)
    if (triggeredEmotion && triggeredEmotion !== newState.emotion) {
      newState.emotion = triggeredEmotion
    }

    // 设置状态转换定时器
    this.scheduleStateTransition(agentId, newState, context)

    // 触发回调
    this.config.onStateUpdate?.(agentId, newState)

    return newState
  }

  // 验证状态更新
  private validateStateUpdates(updates: Partial<AgentState>): Partial<AgentState> {
    const validated: Partial<AgentState> = {}

    // 验证阶段
    if (updates.phase && ['idle', 'thinking', 'speaking', 'bidding', 'waiting'].includes(updates.phase)) {
      validated.phase = updates.phase
    }

    // 验证情绪
    if (updates.emotion && ['neutral', 'excited', 'confident', 'worried', 'aggressive'].includes(updates.emotion)) {
      validated.emotion = updates.emotion
    }

    // 验证信心度
    if (typeof updates.confidence === 'number') {
      validated.confidence = Math.max(0, Math.min(1, updates.confidence))
    }

    // 验证说话强度
    if (typeof updates.speakingIntensity === 'number') {
      validated.speakingIntensity = Math.max(0, Math.min(1, updates.speakingIntensity))
    }

    // 验证思考时长
    if (typeof updates.thinkingDuration === 'number' && updates.thinkingDuration > 0) {
      validated.thinkingDuration = Math.min(10, updates.thinkingDuration) // 最长10秒
    }

    // 验证消息
    if (typeof updates.currentMessage === 'string') {
      validated.currentMessage = updates.currentMessage.slice(0, 500) // 限制长度
    }

    // 验证支持状态
    if (typeof updates.isSupported === 'boolean') {
      validated.isSupported = updates.isSupported
    }

    return validated
  }

  // 评估情绪触发条件
  private evaluateEmotionTriggers(state: AgentState, context: any = {}): AgentState['emotion'] | null {
    const triggeredEmotions = AgentStateManager.EMOTION_TRIGGERS
      .filter(trigger => trigger.condition(state, context))
      .sort((a, b) => b.priority - a.priority)

    return triggeredEmotions.length > 0 ? triggeredEmotions[0].emotion : null
  }

  // 调度状态转换
  private scheduleStateTransition(agentId: string, currentState: AgentState, context?: any) {
    // 清除现有定时器
    const existingTimer = this.stateTimers.get(agentId)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    // 查找匹配的转换规则
    const rule = AgentStateManager.TRANSITION_RULES.find(r =>
      r.from.includes(currentState.phase)
    )

    if (!rule) return

    // 检查转换条件
    if (rule.conditions && !rule.conditions(currentState, context)) {
      return
    }

    // 计算延迟时间
    let delay = rule.duration || 3000
    if (rule.to === 'speaking' && currentState.thinkingDuration) {
      delay = currentState.thinkingDuration * 1000
    }

    // 设置转换定时器
    const timer = setTimeout(() => {
      const nextState = this.updateState(agentId, {
        phase: rule.to
      }, context)

      this.stateTimers.delete(agentId)
    }, delay)

    this.stateTimers.set(agentId, timer)
  }

  // 处理AI消息
  handleAIMessage(message: AIMessage, currentPhase: BiddingPhase) {
    const updates: Partial<AgentState> = {
      currentMessage: message.content,
      lastActivity: message.timestamp,
      confidence: this.calculateConfidenceFromMessage(message)
    }

    // 根据消息类型更新状态
    switch (message.type) {
      case 'speech':
        updates.phase = 'speaking'
        updates.emotion = message.emotion as AgentState['emotion']
        break
      case 'reaction':
        updates.emotion = message.emotion as AgentState['emotion']
        break
      case 'bid':
        updates.phase = 'bidding'
        updates.emotion = 'confident'
        break
      case 'thinking':
        updates.phase = 'thinking'
        updates.emotion = 'neutral'
        break
      case 'celebration':
        updates.emotion = 'excited'
        break
    }

    const context = {
      currentPhase,
      bidAmount: message.bidValue || 0,
      messageType: message.type,
      isWinning: false, // 需要外部提供
      isLosing: false   // 需要外部提供
    }

    return this.updateState(message.personaId, updates, context)
  }

  // 从消息计算信心度
  private calculateConfidenceFromMessage(message: AIMessage): number {
    let confidence = 0.5 // 基础信心度

    // 根据情绪调整
    const emotionBonus: Record<string, number> = {
      'confident': 0.3,
      'excited': 0.2,
      'happy': 0.1,
      'neutral': 0,
      'worried': -0.2,
      'angry': -0.1
    }

    confidence += emotionBonus[message.emotion] || 0

    // 根据出价调整
    if (message.bidValue) {
      if (message.bidValue > 50) confidence += 0.2
      if (message.bidValue > 100) confidence += 0.1
      if (message.bidValue === 0) confidence -= 0.3
    }

    // 根据消息内容调整（简单关键词检测）
    const positiveKeywords = ['很好', '优秀', '完美', '成功', '确信']
    const negativeKeywords = ['困难', '问题', '风险', '担心', '不确定']

    const content = message.content.toLowerCase()
    positiveKeywords.forEach(keyword => {
      if (content.includes(keyword)) confidence += 0.1
    })
    negativeKeywords.forEach(keyword => {
      if (content.includes(keyword)) confidence -= 0.1
    })

    return Math.max(0, Math.min(1, confidence))
  }

  // 处理阶段转换
  handlePhaseTransition(fromPhase: BiddingPhase, toPhase: BiddingPhase, agentIds: string[]) {
    this.config.onPhaseTransition?.(fromPhase, toPhase)

    // 清除所有定时器
    this.stateTimers.forEach(timer => clearTimeout(timer))
    this.stateTimers.clear()

    // 根据新阶段更新所有Agent状态
    agentIds.forEach(agentId => {
      const phaseState = this.getPhaseInitialState(toPhase)
      this.updateState(agentId, phaseState, { currentPhase: toPhase })
    })
  }

  // 获取阶段初始状态
  private getPhaseInitialState(phase: BiddingPhase): Partial<AgentState> {
    switch (phase) {
      case BiddingPhase.IDEA_INPUT:
        return { phase: 'idle', emotion: 'neutral', currentMessage: undefined }

      case BiddingPhase.AGENT_WARMUP:
        return { phase: 'thinking', emotion: 'neutral' }

      case BiddingPhase.AGENT_DISCUSSION:
        return { phase: 'thinking', emotion: 'neutral' }

      case BiddingPhase.AGENT_BIDDING:
        return { phase: 'thinking', emotion: 'confident' }

      case BiddingPhase.USER_SUPPLEMENT:
        return { phase: 'waiting', emotion: 'neutral' }

      case BiddingPhase.RESULT_DISPLAY:
        return { phase: 'idle', emotion: 'neutral' }

      default:
        return { phase: 'idle', emotion: 'neutral' }
    }
  }

  // 批量更新状态
  batchUpdateStates(updates: Array<{ agentId: string; updates: Partial<AgentState>; context?: any }>) {
    return updates.map(({ agentId, updates: stateUpdates, context }) =>
      this.updateState(agentId, stateUpdates, context)
    )
  }

  // 获取活跃Agent统计
  getActiveStats(states: Record<string, AgentState>) {
    const stats = {
      total: Object.keys(states).length,
      speaking: 0,
      thinking: 0,
      bidding: 0,
      waiting: 0,
      idle: 0,
      emotions: {} as Record<string, number>
    }

    Object.values(states).forEach(state => {
      stats[state.phase]++
      stats.emotions[state.emotion] = (stats.emotions[state.emotion] || 0) + 1
    })

    return stats
  }

  // 清理资源
  dispose() {
    this.stateTimers.forEach(timer => clearTimeout(timer))
    this.stateTimers.clear()
    this.emotionQueue.clear()
  }
}

// 导出单例实例
export const agentStateManager = new AgentStateManager()

export default AgentStateManager