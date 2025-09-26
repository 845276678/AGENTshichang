'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'

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

export function useBiddingWebSocket(sessionId: string | null): UseBiddingWebSocketReturn {
  const { user, token } = useAuth()
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
      : 'localhost:3000'
    return `${protocol}//${host}/ws/bidding`
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
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.ping?.()
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