'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { AI_PERSONAS } from '@/lib/ai-persona-system'
import { BiddingPhase, type AgentState } from '@/components/bidding/AgentDialogPanel'
import { type AgentStateMessage } from '@/hooks/useAgentStates'

// 简化的 toast 函数（生产环境应使用实际的toast库）
const toast = {
  success: (message: string) => console.log('✅ Success:', message),
  error: (message: string) => console.error('❌ Error:', message),
  info: (message: string) => console.log('ℹ️ Info:', message),
  warning: (message: string) => console.warn('⚠️ Warning:', message)
}

// 扩展的WebSocket消息类型
interface ExtendedWSMessage {
  type: string
  payload?: any
  message?: any
  phase?: string
  personaId?: string
  agentStateData?: {
    phase?: AgentState['phase']
    emotion?: AgentState['emotion']
    message?: string
    confidence?: number
    speakingIntensity?: number
    thinkingDuration?: number
    bidAmount?: number
  }
  [key: string]: any
}

// WebSocket性能指标
interface WSPerformanceMetrics {
  messagesReceived: number
  messagesPerSecond: number
  averageLatency: number
  connectionUptime: number
  reconnectAttempts: number
  lastLatency: number
}

// 增强版Hook配置
interface EnhancedBiddingWebSocketConfig {
  ideaId: string
  autoConnect?: boolean
  enablePerformanceMetrics?: boolean
  maxMessageBuffer?: number
  heartbeatInterval?: number
  reconnectDelay?: number
  onAgentStateUpdate?: (message: AgentStateMessage) => void
}

// Hook返回接口
interface EnhancedBiddingWebSocketReturn {
  // 基础WebSocket状态
  isConnected: boolean
  connectionStatus: string
  currentPhase: string
  timeRemaining: number
  viewerCount: number
  aiMessages: any[]
  activeSpeaker: string | null
  currentBids: Record<string, number>
  highestBid: number
  supportedPersona: string | null

  // 性能指标
  performanceMetrics: WSPerformanceMetrics

  // Agent状态相关
  agentStatesBuffer: Map<string, Partial<AgentState>>

  // 操作方法
  sendReaction: (messageId: string, reactionType: string) => void
  supportPersona: (personaId: string) => void
  submitPrediction: (prediction: number) => void
  startBidding: (ideaContent: string) => Promise<boolean>
  reconnect: () => void

  // 增强功能
  flushAgentStates: () => void
  getLatency: () => number
  clearMessageBuffer: () => void
}

// 消息去重缓存
const messageCache = new Map<string, number>()
const CACHE_TTL = 5000 // 5秒TTL

export function useEnhancedBiddingWebSocket(
  config: EnhancedBiddingWebSocketConfig
): EnhancedBiddingWebSocketReturn {
  const {
    ideaId,
    autoConnect = true,
    enablePerformanceMetrics = true,
    maxMessageBuffer = 100,
    heartbeatInterval = 30000,
    reconnectDelay = 3000,
    onAgentStateUpdate
  } = config

  // 基础状态
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('connecting')
  const [currentPhase, setCurrentPhase] = useState('warmup')
  const [timeRemaining, setTimeRemaining] = useState(180)
  const [viewerCount, setViewerCount] = useState(0)
  const [supportedPersona, setSupportedPersona] = useState<string | null>(null)
  const [aiMessages, setAiMessages] = useState<any[]>([])
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null)
  const [currentBids, setCurrentBids] = useState<Record<string, number>>({})

  // 增强状态
  const [performanceMetrics, setPerformanceMetrics] = useState<WSPerformanceMetrics>({
    messagesReceived: 0,
    messagesPerSecond: 0,
    averageLatency: 0,
    connectionUptime: 0,
    reconnectAttempts: 0,
    lastLatency: 0
  })
  const [agentStatesBuffer, setAgentStatesBuffer] = useState<Map<string, Partial<AgentState>>>(new Map())

  // Refs
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null)
  const performanceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const connectionStartTime = useRef<number>(Date.now())
  const messageTimestamps = useRef<number[]>([])
  const latencyBuffer = useRef<number[]>([])

  // WebSocket连接
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    try {
      setConnectionStatus('connecting')

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const host = process.env.NODE_ENV === 'production'
        ? window.location.host
        : 'localhost:8080'
      const wsUrl = `${protocol}//${host}/api/bidding/${ideaId}`

      console.log('🔌 Enhanced WebSocket connecting:', wsUrl)

      const ws = new WebSocket(wsUrl)
      wsRef.current = ws
      connectionStartTime.current = Date.now()

      ws.onopen = () => {
        console.log('✅ Enhanced WebSocket connected')
        setIsConnected(true)
        setConnectionStatus('connected')

        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current)
          reconnectTimeoutRef.current = null
        }

        // 启动心跳和性能监控
        startHeartbeat()
        if (enablePerformanceMetrics) {
          startPerformanceMonitoring()
        }
      }

      ws.onmessage = (event) => {
        const receiveTime = Date.now()

        try {
          const data: ExtendedWSMessage = JSON.parse(event.data)

          // 计算延迟（如果消息包含时间戳）
          if (data.timestamp) {
            const latency = receiveTime - data.timestamp
            latencyBuffer.current.push(latency)
            if (latencyBuffer.current.length > 10) {
              latencyBuffer.current = latencyBuffer.current.slice(-10)
            }

            const avgLatency = latencyBuffer.current.reduce((a, b) => a + b, 0) / latencyBuffer.current.length
            setPerformanceMetrics(prev => ({
              ...prev,
              lastLatency: latency,
              averageLatency: avgLatency
            }))
          }

          // 消息去重
          const messageId = data.messageId || `${data.type}_${receiveTime}`
          if (messageCache.has(messageId)) {
            console.log('🔄 Duplicate message filtered:', messageId)
            return
          }
          messageCache.set(messageId, receiveTime)

          // 更新性能指标
          if (enablePerformanceMetrics) {
            messageTimestamps.current.push(receiveTime)
            const oneSecondAgo = receiveTime - 1000
            messageTimestamps.current = messageTimestamps.current.filter(t => t > oneSecondAgo)

            setPerformanceMetrics(prev => ({
              ...prev,
              messagesReceived: prev.messagesReceived + 1,
              messagesPerSecond: messageTimestamps.current.length
            }))
          }

          handleEnhancedMessage(data)
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error)
        }
      }

      ws.onclose = (event) => {
        console.log('🔌 WebSocket closed:', event.code, event.reason)
        setIsConnected(false)
        setConnectionStatus('disconnected')
        wsRef.current = null

        stopHeartbeat()
        stopPerformanceMonitoring()

        if (event.code !== 1000 && autoConnect) {
          scheduleReconnect()
        }
      }

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error)
        setConnectionStatus('error')
      }

    } catch (error) {
      console.error('❌ Failed to create WebSocket:', error)
      setConnectionStatus('error')
      scheduleReconnect()
    }
  }, [ideaId, autoConnect, enablePerformanceMetrics])

  // 增强的消息处理
  const handleEnhancedMessage = useCallback((data: ExtendedWSMessage) => {
    console.log('📨 Enhanced message:', data.type, data)

    switch (data.type) {
      // 原有消息类型保持兼容
      case 'session.init':
        setViewerCount(data.payload?.viewerCount || 1)
        setCurrentPhase(data.payload?.currentPhase || 'warmup')
        setTimeRemaining(data.payload?.timeRemaining || 180)
        break

      case 'ai_message':
        const newMessage = data.message
        setAiMessages(prev => [newMessage, ...prev.slice(0, maxMessageBuffer - 1)])
        setActiveSpeaker(newMessage.personaId)

        // 自动更新Agent状态
        if (onAgentStateUpdate) {
          onAgentStateUpdate({
            type: 'agent_speaking',
            personaId: newMessage.personaId,
            payload: {
              message: newMessage.content,
              emotion: newMessage.emotion,
              confidence: calculateMessageConfidence(newMessage)
            }
          })
        }

        setTimeout(() => setActiveSpeaker(null), 3000)
        break

      case 'ai_bid':
        const bidMessage = data.message
        setAiMessages(prev => [bidMessage, ...prev.slice(0, maxMessageBuffer - 1)])
        setCurrentBids(data.currentBids || {})
        setActiveSpeaker(bidMessage.personaId)

        // 发送竞价状态更新
        if (onAgentStateUpdate) {
          onAgentStateUpdate({
            type: 'agent_bidding',
            personaId: bidMessage.personaId,
            payload: {
              bidAmount: bidMessage.bidValue,
              confidence: calculateBidConfidence(bidMessage.bidValue),
              emotion: 'confident'
            }
          })
        }

        setTimeout(() => setActiveSpeaker(null), 4000)
        break

      case 'phase_change':
        setCurrentPhase(data.phase)
        setTimeRemaining(getPhaseTimeRemaining(data.phase))
        toast.info(`进入${data.message}`)
        break

      // 新增的Agent状态消息类型
      case 'agent_thinking':
        if (onAgentStateUpdate) {
          onAgentStateUpdate({
            type: 'agent_thinking',
            personaId: data.personaId,
            payload: data.agentStateData || {}
          })
        }
        break

      case 'agent_emotion_change':
        if (onAgentStateUpdate) {
          onAgentStateUpdate({
            type: 'agent_emotion_change',
            personaId: data.personaId,
            payload: { emotion: data.agentStateData?.emotion }
          })
        }
        break

      case 'agent_bid_update':
        if (onAgentStateUpdate) {
          onAgentStateUpdate({
            type: 'agent_bid_update',
            personaId: data.personaId,
            payload: {
              bidAmount: data.agentStateData?.bidAmount,
              confidence: data.agentStateData?.confidence
            }
          })
        }
        break

      case 'bulk_agent_update':
        // 批量Agent状态更新（性能优化）
        if (data.agentUpdates && onAgentStateUpdate) {
          data.agentUpdates.forEach((update: any) => {
            onAgentStateUpdate({
              type: 'agent_emotion_change',
              personaId: update.personaId,
              payload: update.stateData
            })
          })
        }
        break

      case 'viewer_count_update':
        setViewerCount(data.payload?.viewerCount || 0)
        break

      case 'persona_supported':
        toast.success(`您支持了 ${getPersonaName(data.payload?.personaId)}`)
        break

      case 'prediction_received':
        toast.success(data.payload?.message || '预测已提交')
        break

      case 'session_complete':
        setCurrentPhase('result')
        setTimeRemaining(0)
        toast.success(`竞价完成！最高出价：¥${data.results?.highestBid || 0}`)
        break

      case 'error':
        toast.error(data.payload?.message || '发生错误')
        break

      case 'pong':
        // 心跳响应，更新延迟
        if (data.timestamp) {
          const latency = Date.now() - data.timestamp
          setPerformanceMetrics(prev => ({ ...prev, lastLatency: latency }))
        }
        break

      default:
        console.log('❓ Unknown message type:', data.type)
    }
  }, [maxMessageBuffer, onAgentStateUpdate])

  // 性能监控
  const startPerformanceMonitoring = useCallback(() => {
    performanceTimerRef.current = setInterval(() => {
      setPerformanceMetrics(prev => ({
        ...prev,
        connectionUptime: Date.now() - connectionStartTime.current
      }))

      // 清理过期的消息缓存
      const now = Date.now()
      for (const [messageId, timestamp] of messageCache.entries()) {
        if (now - timestamp > CACHE_TTL) {
          messageCache.delete(messageId)
        }
      }
    }, 1000)
  }, [])

  const stopPerformanceMonitoring = useCallback(() => {
    if (performanceTimerRef.current) {
      clearInterval(performanceTimerRef.current)
      performanceTimerRef.current = null
    }
  }, [])

  // 心跳机制
  const startHeartbeat = useCallback(() => {
    heartbeatRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'ping',
          timestamp: Date.now()
        }))
      }
    }, heartbeatInterval)
  }, [heartbeatInterval])

  const stopHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current)
      heartbeatRef.current = null
    }
  }, [])

  // 重连逻辑
  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) return

    setPerformanceMetrics(prev => ({
      ...prev,
      reconnectAttempts: prev.reconnectAttempts + 1
    }))

    reconnectTimeoutRef.current = setTimeout(() => {
      console.log('🔄 Attempting WebSocket reconnect...')
      connectWebSocket()
    }, reconnectDelay)
  }, [connectWebSocket, reconnectDelay])

  // 发送消息（带性能优化）
  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        const messageWithTimestamp = {
          ...message,
          timestamp: Date.now(),
          messageId: `${message.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }
        wsRef.current.send(JSON.stringify(messageWithTimestamp))
        return true
      } catch (error) {
        console.error('❌ Error sending message:', error)
        return false
      }
    }
    console.warn('⚠️ WebSocket not connected')
    return false
  }, [])

  // API方法
  const sendReaction = useCallback((messageId: string, reactionType: string) => {
    sendMessage({
      type: 'send_reaction',
      payload: { messageId, reactionType }
    })
  }, [sendMessage])

  const supportPersona = useCallback((personaId: string) => {
    setSupportedPersona(personaId)
    sendMessage({
      type: 'support_persona',
      payload: { personaId }
    })
  }, [sendMessage])

  const submitPrediction = useCallback((prediction: number) => {
    sendMessage({
      type: 'submit_prediction',
      payload: { prediction, confidence: 0.8 }
    })
  }, [sendMessage])

  const startBidding = useCallback(async (ideaContent: string) => {
    if (!ideaContent.trim()) {
      toast.error('请输入创意内容')
      return false
    }

    const sessionId = `session_${Date.now()}_${ideaId}`
    const success = sendMessage({
      type: 'start_bidding',
      payload: {
        ideaContent: ideaContent.trim(),
        sessionId
      }
    })

    if (success) {
      toast.info('正在启动AI竞价...')
      return true
    } else {
      toast.error('启动失败，请检查网络连接')
      return false
    }
  }, [ideaId, sendMessage])

  // 增强功能
  const flushAgentStates = useCallback(() => {
    setAgentStatesBuffer(new Map())
  }, [])

  const getLatency = useCallback(() => {
    return performanceMetrics.lastLatency
  }, [performanceMetrics.lastLatency])

  const clearMessageBuffer = useCallback(() => {
    setAiMessages([])
  }, [])

  // 生命周期
  useEffect(() => {
    if (autoConnect && ideaId) {
      connectWebSocket()
    }

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current)
      stopHeartbeat()
      stopPerformanceMonitoring()
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounting')
      }
    }
  }, [autoConnect, ideaId, connectWebSocket, stopHeartbeat, stopPerformanceMonitoring])

  // 时间倒计时
  useEffect(() => {
    if (timeRemaining > 0 && currentPhase !== 'result') {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => Math.max(0, prev - 1))
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [timeRemaining, currentPhase])

  const highestBid = Math.max(...Object.values(currentBids), 0)

  return {
    // 基础状态
    isConnected,
    connectionStatus,
    currentPhase,
    timeRemaining,
    viewerCount,
    aiMessages,
    activeSpeaker,
    currentBids,
    highestBid,
    supportedPersona,

    // 增强状态
    performanceMetrics,
    agentStatesBuffer,

    // 操作方法
    sendReaction,
    supportPersona,
    submitPrediction,
    startBidding,
    reconnect: connectWebSocket,

    // 增强功能
    flushAgentStates,
    getLatency,
    clearMessageBuffer
  }
}

// 工具函数
function getPhaseTimeRemaining(phase: string): number {
  const times: Record<string, number> = {
    'warmup': 180,
    'discussion': 720,
    'bidding': 1200,
    'prediction': 240,
    'result': 0
  }
  return times[phase] || 60
}

function getPersonaName(personaId: string): string {
  const persona = AI_PERSONAS.find(p => p.id === personaId)
  return persona?.name || personaId
}

function calculateMessageConfidence(message: any): number {
  let confidence = 0.5

  const emotionBonus: Record<string, number> = {
    'confident': 0.3, 'excited': 0.2, 'happy': 0.1,
    'neutral': 0, 'worried': -0.2, 'angry': -0.1
  }
  confidence += emotionBonus[message.emotion] || 0

  if (message.bidValue) {
    if (message.bidValue > 50) confidence += 0.2
    if (message.bidValue > 100) confidence += 0.1
    if (message.bidValue === 0) confidence -= 0.3
  }

  return Math.max(0, Math.min(1, confidence))
}

function calculateBidConfidence(bidValue: number): number {
  if (bidValue === 0) return 0.1
  if (bidValue < 50) return 0.4
  if (bidValue < 100) return 0.7
  return 0.9
}

export type { EnhancedBiddingWebSocketReturn, EnhancedBiddingWebSocketConfig, WSPerformanceMetrics }