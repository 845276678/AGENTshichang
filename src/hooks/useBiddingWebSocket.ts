'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { AI_PERSONAS, type AIMessage } from '@/lib/ai-persona-system'

// 简化的 toast 函数
const toast = {
  success: (message: string) => console.log('Success:', message),
  error: (message: string) => console.error('Error:', message),
  info: (message: string) => console.log('Info:', message),
  warning: (message: string) => console.warn('Warning:', message)
}

// WebSocket消息类型
interface WSMessage {
  type: string
  [key: string]: any
}

// 竞价数据类型
interface BidData {
  id: string
  agentName: string
  agentType: string
  amount: number
  comment?: string
  confidence?: number
  timestamp: number
}

interface AIInteraction {
  id: string
  agentName: string
  interactionType: string
  content: string
  emotion: string
  animation: string
  timestamp: number
}

interface SessionData {
  status: 'PENDING' | 'ACTIVE' | 'ENDED' | 'CANCELLED'
  phase: 'DISCUSSION' | 'BIDDING' | 'RESULTS'
  currentPrice: number
  timeRemaining: number
  viewers: number
  idea: {
    id: string
    title: string
    description: string
    category: string
  }
}

// WebSocket状态
interface WSState {
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  sessionData: SessionData | null
  currentBids: BidData[]
  aiInteractions: AIInteraction[]
  viewerCount: number
  hasSubmittedGuess: boolean
}

// Hook返回类型
interface UseBiddingWebSocketReturn extends WSState {
  joinSession: (sessionId: string) => Promise<void>
  leaveSession: (sessionId: string) => Promise<void>
  submitGuess: (guessedPrice: number, confidence: number) => Promise<void>
  supportAgent: (agentName: string) => Promise<void>
  reactToDialogue: (reaction: string, agentName?: string) => Promise<void>
  reconnect: () => void
}

// 主要的数据从useBiddingWebSocket hook中获取
interface UseBiddingWebSocketConfig {
  ideaId: string
  autoConnect?: boolean
}

interface BiddingWebSocketReturn {
  isConnected: boolean
  connectionStatus: string
  currentPhase: string
  timeRemaining: number
  viewerCount: number
  aiMessages: AIMessage[]
  activeSpeaker: string | null
  currentBids: Record<string, number>
  highestBid: number
  supportedPersona: string | null
  sendReaction: (messageId: string, reactionType: string) => void
  supportPersona: (personaId: string) => void
  submitPrediction: (prediction: number) => void
}

// 真实的AI竞价WebSocket hook - 连接实际AI服务
export function useBiddingWebSocket(config: UseBiddingWebSocketConfig): BiddingWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('connecting')
  const [currentPhase, setCurrentPhase] = useState('warmup')
  const [timeRemaining, setTimeRemaining] = useState(180)
  const [viewerCount, setViewerCount] = useState(0)
  const [supportedPersona, setSupportedPersona] = useState<string | null>(null)
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([])
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null)
  const [currentBids, setCurrentBids] = useState<Record<string, number>>({})
  const [sessionData, setSessionData] = useState<any>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { ideaId, autoConnect = true } = config

  // WebSocket连接逻辑
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return // 已连接
    }

    try {
      setConnectionStatus('connecting')

      // 构建WebSocket URL
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const host = process.env.NODE_ENV === 'production'
        ? window.location.host
        : 'localhost:8080'
      const wsUrl = `${protocol}//${host}/api/bidding/${ideaId}`

      console.log(`🔌 Connecting to WebSocket: ${wsUrl}`)

      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('✅ WebSocket connected successfully')
        setIsConnected(true)
        setConnectionStatus('connected')

        // 清除重连定时器
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current)
          reconnectTimeoutRef.current = null
        }
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          handleWebSocketMessage(data)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      ws.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason)
        setIsConnected(false)
        setConnectionStatus('disconnected')
        wsRef.current = null

        // 自动重连（如果不是正常关闭）
        if (event.code !== 1000 && autoConnect) {
          scheduleReconnect()
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setConnectionStatus('error')
      }

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      setConnectionStatus('error')
      scheduleReconnect()
    }
  }, [ideaId, autoConnect])

  // 处理WebSocket消息
  const handleWebSocketMessage = useCallback((data: any) => {
    console.log('📨 Received WebSocket message:', data.type)

    switch (data.type) {
      case 'session.init':
        setSessionData(data.payload)
        setViewerCount(data.payload.viewerCount || 1)
        setCurrentPhase(data.payload.currentPhase || 'warmup')
        setTimeRemaining(data.payload.timeRemaining || 180)
        break

      case 'ai_message':
        const newMessage = data.message
        setAiMessages(prev => [newMessage, ...prev.slice(0, 19)]) // 保留最新20条
        setActiveSpeaker(newMessage.personaId)

        // 设置说话状态，3秒后清除
        setTimeout(() => {
          setActiveSpeaker(null)
        }, 3000)
        break

      case 'ai_bid':
        const bidMessage = data.message
        setAiMessages(prev => [bidMessage, ...prev.slice(0, 19)])
        setCurrentBids(data.currentBids || {})
        setActiveSpeaker(bidMessage.personaId)

        setTimeout(() => {
          setActiveSpeaker(null)
        }, 4000)
        break

      case 'phase_change':
        setCurrentPhase(data.phase)
        setTimeRemaining(getPhaseTimeRemaining(data.phase))
        toast.info(`进入${data.message}`)
        break

      case 'viewer_count_update':
        setViewerCount(data.payload.viewerCount)
        break

      case 'prediction_start':
        toast.info(data.message)
        break

      case 'session_complete':
        setCurrentPhase('result')
        setTimeRemaining(0)
        toast.success(`竞价完成！最高出价：${data.results.highestBid}元`)
        break

      case 'bidding_started':
        toast.success(data.payload.message)
        break

      case 'session_update':
        toast.info(data.payload.message)
        break

      case 'persona_supported':
        toast.success(`您支持了 ${getPersonaName(data.payload.personaId)}`)
        break

      case 'prediction_received':
        toast.success(data.payload.message)
        break

      case 'error':
        toast.error(data.payload.message)
        break

      case 'pong':
        // 心跳响应，忽略
        break

      default:
        console.log('Unknown message type:', data.type)
    }
  }, [])

  // 自动重连
  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) return

    reconnectTimeoutRef.current = setTimeout(() => {
      console.log('🔄 Attempting to reconnect WebSocket...')
      connectWebSocket()
    }, 3000) // 3秒后重连
  }, [connectWebSocket])

  // 发送WebSocket消息
  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(message))
        return true
      } catch (error) {
        console.error('Error sending WebSocket message:', error)
        return false
      }
    }
    console.warn('WebSocket not connected, cannot send message')
    return false
  }, [])

  // 启动AI竞价
  const startBidding = useCallback(async (ideaContent: string) => {
    if (!ideaContent.trim()) {
      toast.error('请输入创意内容')
      return false
    }

    try {
      // 首先调用API启动真实AI竞价会话
      const response = await fetch('/api/bidding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ideaId,
          ideaContent: ideaContent.trim()
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('🎭 Real AI bidding session started:', data.sessionId)
        toast.success('AI专家团队已就位，开始分析您的创意...')

        // 发送WebSocket消息激活会话
        const sessionId = data.sessionId
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
      } else {
        const error = await response.json()
        toast.error(error.error || '启动AI竞价失败')
        return false
      }
    } catch (error) {
      console.error('Error starting real AI bidding:', error)
      toast.error('网络错误，请重试')
      return false
    }
  }, [ideaId, sendMessage])

  // Hook函数实现
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
      payload: {
        prediction,
        confidence: 0.8 // 默认信心度
      }
    })
  }, [sendMessage])

  // 初始化连接
  useEffect(() => {
    if (autoConnect && ideaId) {
      connectWebSocket()
    }

    // 心跳检测
    const heartbeatInterval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        sendMessage({ type: 'ping' })
      }
    }, 30000) // 30秒心跳

    return () => {
      clearInterval(heartbeatInterval)
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounting')
      }
    }
  }, [autoConnect, ideaId, connectWebSocket, sendMessage])

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
    sendReaction,
    supportPersona,
    submitPrediction,
    // 额外的方法
    startBidding,
    reconnect: connectWebSocket
  }
}

// 辅助函数
function getPhaseTimeRemaining(phase: string): number {
  const times: Record<string, number> = {
    'warmup': 180,      // 3分钟
    'discussion': 300,  // 5分钟
    'bidding': 180,     // 3分钟
    'prediction': 120,  // 2分钟
    'result': 0
  }
  return times[phase] || 60
}

function getPersonaName(personaId: string): string {
  const persona = AI_PERSONAS.find(p => p.id === personaId)
  return persona?.name || personaId
}

// 原来的WebSocket hook实现作为备用
export function useBiddingWebSocketOriginal(config: { ideaId: string; autoConnect?: boolean }): UseBiddingWebSocketReturn {
  const { user, token } = useAuth()
  const sessionId = config?.ideaId || null
  const [state, setState] = useState<WSState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    sessionData: null,
    currentBids: [],
    aiInteractions: [],
    viewerCount: 0,
    hasSubmittedGuess: false
  })

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5
  const reconnectDelay = useRef(1000) // 开始1秒，指数退避

  // WebSocket URL
  const getWebSocketUrl = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = process.env.NODE_ENV === 'production'
      ? window.location.host
      : 'localhost:4000'
    return `${protocol}//${host}/api/bidding`
  }, [])

  // 发送消息
  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(message))
        return true
      } catch (error) {
        console.error('Error sending WebSocket message:', error)
        return false
      }
    }
    return false
  }, [])

  // 处理连接
  const connect = useCallback(async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }))

    try {
      const wsUrl = getWebSocketUrl()
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('WebSocket connected')
        setState(prev => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          error: null
        }))

        // 重置重连计数
        reconnectAttempts.current = 0
        reconnectDelay.current = 1000

        // 自动加入会话（如果有sessionId）
        if (sessionId) {
          sendMessage({
            type: 'join_session',
            sessionId,
            token
          })
        }

        // 启动心跳
        startHeartbeat()
      }

      ws.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data)
          handleMessage(message)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason)
        setState(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false
        }))

        stopHeartbeat()

        // 自动重连（除非是正常关闭）
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          scheduleReconnect()
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setState(prev => ({
          ...prev,
          error: 'Connection error',
          isConnecting: false
        }))
      }

    } catch (error) {
      console.error('Error creating WebSocket:', error)
      setState(prev => ({
        ...prev,
        error: 'Failed to connect',
        isConnecting: false
      }))
    }
  }, [sessionId, token, getWebSocketUrl, sendMessage])

  // 处理消息
  const handleMessage = useCallback((message: WSMessage) => {
    console.log('Received WebSocket message:', message.type)

    switch (message.type) {
      case 'connected':
        // 连接成功，无需额外处理
        break

      case 'session_joined':
        setState(prev => ({
          ...prev,
          sessionData: message.sessionData
        }))
        toast.success('已加入竞价会话')
        break

      case 'session_left':
        setState(prev => ({
          ...prev,
          sessionData: null,
          currentBids: [],
          aiInteractions: []
        }))
        break

      case 'new_bid':
        setState(prev => ({
          ...prev,
          currentBids: [message.bid, ...prev.currentBids.slice(0, 9)], // 保持最新10条
          sessionData: prev.sessionData ? {
            ...prev.sessionData,
            currentPrice: message.bid.amount
          } : null
        }))
        break

      case 'ai_interaction':
        setState(prev => ({
          ...prev,
          aiInteractions: [message.interaction, ...prev.aiInteractions.slice(0, 19)] // 保持最新20条
        }))
        break

      case 'bidding_ended':
        setState(prev => ({
          ...prev,
          sessionData: prev.sessionData ? {
            ...prev.sessionData,
            status: 'ENDED',
            phase: 'RESULTS'
          } : null
        }))
        toast.info('竞价已结束！')
        break

      case 'viewer_joined':
      case 'viewer_left':
        setState(prev => ({
          ...prev,
          viewerCount: message.viewers,
          sessionData: prev.sessionData ? {
            ...prev.sessionData,
            viewers: message.viewers
          } : null
        }))
        break

      case 'guess_submitted':
        setState(prev => ({ ...prev, hasSubmittedGuess: true }))
        toast.success(`价格竞猜已提交！预测价格: ${message.guess.guessedPrice}`)
        break

      case 'new_guess_submitted':
        // 有新的竞猜提交，可以更新统计信息
        break

      case 'agent_supported':
        toast.success(`已支持 ${message.agentName}！`)
        break

      case 'agent_support_recorded':
        // 支持记录已保存
        break

      case 'dialogue_reaction':
        // 对话反应事件
        break

      case 'server_shutdown':
        toast.warning('服务器即将维护，请稍后重新连接')
        break

      case 'error':
        console.error('WebSocket error:', message)
        const errorMessages: Record<string, string> = {
          'RATE_LIMIT': '操作太频繁，请稍后再试',
          'SESSION_NOT_FOUND': '会话不存在',
          'SESSION_FULL': '会话人数已满',
          'AUTH_REQUIRED': '需要登录才能参与',
          'SESSION_INACTIVE': '会话已结束',
          'ALREADY_GUESSED': '您已经提交过竞猜',
          'INSUFFICIENT_CREDITS': '积分不足',
          'INVALID_MESSAGE': '消息格式错误'
        }
        toast.error(errorMessages[message.code] || '发生错误')
        setState(prev => ({ ...prev, error: message.message }))
        break

      default:
        console.log('Unknown message type:', message.type)
    }
  }, [])

  // 心跳机制
  const startHeartbeat = useCallback(() => {
    heartbeatRef.current = setInterval(() => {
// WebSocket ping方法修复
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          // 发送ping消息而不是调用不存在的ping方法
          wsRef.current.send(JSON.stringify({ type: 'ping' }))
        }
    }, 30000) // 30秒心跳
  }, [])

  const stopHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current)
      heartbeatRef.current = null
    }
  }, [])

  // 重连机制
  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }

    reconnectAttempts.current++

    reconnectTimeoutRef.current = setTimeout(() => {
      console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})`)
      connect()

      // 指数退避
      reconnectDelay.current = Math.min(reconnectDelay.current * 2, 30000)
    }, reconnectDelay.current)
  }, [connect])

  // 手动重连
  const reconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
    }
    reconnectAttempts.current = 0
    reconnectDelay.current = 1000
    connect()
  }, [connect])

  // API方法
  const joinSession = useCallback(async (sessionId: string) => {
    const success = sendMessage({
      type: 'join_session',
      sessionId,
      token
    })

    if (!success) {
      throw new Error('Failed to send join message')
    }
  }, [sendMessage, token])

  const leaveSession = useCallback(async (sessionId: string) => {
    const success = sendMessage({
      type: 'leave_session',
      sessionId
    })

    if (!success) {
      throw new Error('Failed to send leave message')
    }
  }, [sendMessage])

  const submitGuess = useCallback(async (guessedPrice: number, confidence: number) => {
    if (!sessionId) {
      throw new Error('No active session')
    }

    const success = sendMessage({
      type: 'submit_guess',
      sessionId,
      guessedPrice,
      confidence
    })

    if (!success) {
      throw new Error('Failed to send guess')
    }
  }, [sendMessage, sessionId])

  const supportAgent = useCallback(async (agentName: string) => {
    if (!sessionId) {
      throw new Error('No active session')
    }

    const success = sendMessage({
      type: 'support_agent',
      sessionId,
      agentName
    })

    if (!success) {
      throw new Error('Failed to send support')
    }
  }, [sendMessage, sessionId])

  const reactToDialogue = useCallback(async (reaction: string, agentName?: string) => {
    if (!sessionId) {
      throw new Error('No active session')
    }

    const success = sendMessage({
      type: 'react_to_dialogue',
      sessionId,
      reaction,
      agentName
    })

    if (!success) {
      throw new Error('Failed to send reaction')
    }
  }, [sendMessage, sessionId])

  // 生命周期管理
  useEffect(() => {
    if (sessionId) {
      connect()
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      stopHeartbeat()
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounted')
      }
    }
  }, [sessionId, connect, stopHeartbeat])

  // 页面可见性处理
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // 页面隐藏时保持连接但减少活动
        stopHeartbeat()
      } else {
        // 页面显示时恢复心跳
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          startHeartbeat()
        } else if (sessionId) {
          // 如果连接断开，重新连接
          connect()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [sessionId, connect, startHeartbeat, stopHeartbeat])

  return {
    ...state,
    joinSession,
    leaveSession,
    submitGuess,
    supportAgent,
    reactToDialogue,
    reconnect
  }
}

// 导出类型
export type { BidData, AIInteraction, SessionData, UseBiddingWebSocketReturn }