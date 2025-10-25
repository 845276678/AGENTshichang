/**
 * 🔧 修复版 WebSocket Hook
 * 解决生产环境AI对话框显示问题
 */
'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ULTRA_FAST_BIDDING_TIME_CONFIG, getPhaseTime, type BiddingTimeConfiguration } from '@/config/bidding-time-config'

// 修复后的WebSocket配置
const getWebSocketURL = (ideaId: string): string => {
  // 修复1: 使用正确的WebSocket端口和路径
  if (typeof window === 'undefined') return ''

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const host = window.location.host // 使用当前页面的host，不强制指定端口

  // 生产环境使用标准路径
  return `${protocol}//${host}/api/bidding/websocket?ideaId=${ideaId}`
}

export function useFixedBiddingWebSocket(ideaId: string, timeConfig: BiddingTimeConfiguration = ULTRA_FAST_BIDDING_TIME_CONFIG) {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')
  const [aiMessages, setAiMessages] = useState<any[]>([])
  const [currentPhase, setCurrentPhase] = useState('warmup')
  const [timeRemaining, setTimeRemaining] = useState(() => getPhaseTime('warmup', timeConfig.phases)) // 使用配置的时间
  const [currentBids, setCurrentBids] = useState<Record<string, number>>({})

  // 用户发言顺延机制
  const [hasUserSpoken, setHasUserSpoken] = useState(false)
  const [phaseExtended, setPhaseExtended] = useState(false)
  const [extensionCount, setExtensionCount] = useState(0) // 跟踪顺延次数

  // 修复2: 添加强制显示模式，确保匿名用户也能看到对话
  const [forceShowDialogs, setForceShowDialogs] = useState(false)

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const messageCountRef = useRef(0)
  const handleMessageRef = useRef<((data: any) => void) | null>(null)

  // 修复3: 增强的连接函数，包含重试和错误处理
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected')
      return
    }

    const wsUrl = getWebSocketURL(ideaId)
    if (!wsUrl) {
      console.error('Cannot create WebSocket URL - not in browser environment')
      return
    }

    try {
      setConnectionStatus('connecting')
      console.log('🔌 Connecting to WebSocket:', wsUrl)

      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('✅ WebSocket Connected Successfully')
        setIsConnected(true)
        setConnectionStatus('connected')

        // 修复4: 连接成功后立即请求现有消息
        ws.send(JSON.stringify({
          type: 'get_messages',
          timestamp: Date.now()
        }))

        // 修复5: 设置强制显示模式
        setForceShowDialogs(true)

        // 清除重连定时器
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current)
          reconnectTimeoutRef.current = null
        }
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          handleMessageRef.current?.(data)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
          console.log('Raw message:', event.data)
        }
      }

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason)
        setIsConnected(false)
        setConnectionStatus('disconnected')
        wsRef.current = null

        // 只有在非正常关闭时才重连 - 内联重连逻辑避免循环依赖
        if (event.code !== 1000 && !reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('🔄 Attempting WebSocket reconnect...')
            connectWebSocket()
          }, 3000)
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setConnectionStatus('error')
      }

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      setConnectionStatus('error')
      // 内联重连逻辑
      if (!reconnectTimeoutRef.current) {
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('🔄 Attempting WebSocket reconnect...')
          connectWebSocket()
        }, 3000)
      }
    }
  }, [ideaId]) // 只依赖ideaId，移除handleWebSocketMessage依赖

  // 修复6: 增强的消息处理函数
  const handleWebSocketMessage = useCallback((data: any) => {
    console.log('📨 WebSocket message received:', data.type, data)

    messageCountRef.current += 1

    switch (data.type) {
      case 'session.init':
      case 'bidding.init':
        setCurrentPhase(data.payload?.phase || data.phase || 'warmup')
        setTimeRemaining(data.payload?.timeRemaining || data.timeRemaining || 300)

        // 如果有历史消息，立即显示
        if (data.payload?.messages) {
          setAiMessages(data.payload.messages)
        }
        break

      case 'ai_message':
      case 'agent_message':
      case 'bidding_message':
        // 修复7: 统一处理所有AI消息类型
        const message = data.message || data.payload || data
        const newMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          personaId: message.personaId || message.agentId || 'unknown',
          agentName: message.agentName || message.personaName || 'AI Agent',
          content: message.content || message.text || message.message || '',
          timestamp: new Date(message.timestamp || Date.now()),
          emotion: message.emotion || 'neutral',
          bidValue: message.bidValue || message.amount || 0
        }

        // 确保消息内容不为空
        if (newMessage.content && newMessage.content.trim()) {
          setAiMessages(prev => {
            // 防重复
            const exists = prev.some(msg =>
              msg.content === newMessage.content &&
              msg.personaId === newMessage.personaId &&
              Math.abs(new Date(msg.timestamp).getTime() - newMessage.timestamp.getTime()) < 1000
            )

            if (!exists) {
              console.log('💬 New AI message added:', newMessage.agentName, newMessage.content.substring(0, 50))
              return [newMessage, ...prev]
            }
            return prev
          })
        }
        break

      case 'ai_bid':
      case 'bid_update':
        const bidData = data.message || data.payload || data
        if (data.currentBids) {
          setCurrentBids(data.currentBids)
        }

        // 也作为消息显示竞价
        if (bidData.content || bidData.bidValue) {
          const bidMessage = {
            id: `bid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            personaId: bidData.personaId || bidData.agentId || 'unknown',
            agentName: bidData.agentName || bidData.personaName || 'AI Agent',
            content: bidData.content || `出价：¥${bidData.bidValue || 0}`,
            timestamp: new Date(),
            emotion: bidData.emotion || 'confident',
            bidValue: bidData.bidValue || 0,
            type: 'bid'
          }

          setAiMessages(prev => [bidMessage, ...prev])
        }
        break

      case 'phase_change':
      case 'phase_update':
        const newPhase = data.phase || data.payload?.phase || currentPhase
        setCurrentPhase(newPhase)

        // 使用配置的阶段时间，如果服务器没有提供
        const serverTimeRemaining = data.timeRemaining || data.payload?.timeRemaining
        const configuredTime = getPhaseTime(newPhase, timeConfig.phases)
        const newTimeRemaining = serverTimeRemaining || configuredTime
        setTimeRemaining(newTimeRemaining)

        // 重置阶段状态
        setHasUserSpoken(false)
        setPhaseExtended(false)
        setExtensionCount(0)

        console.log(`🔄 Phase changed to: ${newPhase}, time: ${newTimeRemaining}s`)
        break

      case 'user_message':
      case 'user_supplement':
        // 检测到用户发言，触发顺延机制
        if (timeConfig.userExtension.enabled &&
            extensionCount < timeConfig.userExtension.maxPerPhase &&
            timeRemaining > 0) {

          setHasUserSpoken(true)
          setExtensionCount(prev => prev + 1)

          console.log(`👤 User spoke - extending phase by ${timeConfig.userExtension.extensionTime} seconds (${extensionCount + 1}/${timeConfig.userExtension.maxPerPhase})`)

          // 发送时间顺延请求给服务器
          sendMessage({
            type: 'extend_phase',
            payload: {
              extensionSeconds: timeConfig.userExtension.extensionTime,
              reason: 'user_interaction',
              extensionCount: extensionCount + 1,
              maxExtensions: timeConfig.userExtension.maxPerPhase
            }
          })

          setPhaseExtended(true)
        }
        break

      case 'time_extended':
        // 服务器确认时间已顺延
        const extendedTime = data.newTimeRemaining || data.payload?.newTimeRemaining
        if (extendedTime) {
          setTimeRemaining(extendedTime)
          console.log(`⏰ Phase extended to ${extendedTime} seconds`)
        }
        break

      case 'session_complete':
        console.log('🏁 Bidding session completed:', data.results || data.payload || data)
        setCurrentPhase('result')
        setTimeRemaining(0)
        break

      case 'session.ended':
      case 'session_ended':
      case 'bidding_ended':
        // 会话正常结束 - 切换到COMPLETED阶段
        console.log('🏁 Bidding session ended:', data.payload || data)
        setCurrentPhase('result') // 确保停在result阶段
        setTimeRemaining(0)

        // 通知用户会话已结束
        console.log('✅ AI竞价会话已完成，可以查看结果并生成商业计划')
        break

      case 'error':
        console.error('WebSocket error message:', data.payload?.message || data.message)
        break

      default:
        console.log('❓ Unknown message type:', data.type, data)
    }
  }, [timeConfig, extensionCount]) // 添加必要的依赖项，但避免造成循环

  // 更新消息处理函数的ref
  useEffect(() => {
    handleMessageRef.current = handleWebSocketMessage
  }, [handleWebSocketMessage])

  // 发送消息功能
  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        const messageWithId = {
          ...message,
          messageId: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now()
        }
        wsRef.current.send(JSON.stringify(messageWithId))
        console.log('📤 Message sent:', messageWithId)
        return true
      } catch (error) {
        console.error('Failed to send message:', error)
        return false
      }
    } else {
      console.warn('WebSocket not connected, cannot send message')
      return false
    }
  }, [])

  // 启动竞价
  const startBidding = useCallback((ideaContent: string) => {
    console.log('🚀 Starting bidding session...')
    return sendMessage({
      type: 'start_bidding',
      payload: {
        ideaContent: ideaContent,
        sessionId: `session_${Date.now()}_${ideaId}`,
        forceStart: true // 修复8: 强制启动，即使是匿名用户
      }
    })
  }, [sendMessage, ideaId])

  // 修复9: 自动连接和清理
  useEffect(() => {
    if (ideaId) {
      const timer = setTimeout(() => {
        connectWebSocket()
      }, 1000) // 延迟1秒连接，确保页面加载完成

      return () => {
        clearTimeout(timer)
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current)
        }
        if (wsRef.current) {
          wsRef.current.close(1000, 'Component unmounting')
        }
      }
    }
  }, [ideaId, connectWebSocket])

  // 修复10: 添加调试信息和状态监控
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const debugEnabled =
      process.env.NODE_ENV !== 'production' ||
      window.localStorage.getItem('AI_BIDDING_DEBUG') === '1'

    if (!debugEnabled) {
      return
    }

    const interval = setInterval(() => {
      console.log(`🔍 Debug Info:`, {
        connected: isConnected,
        status: connectionStatus,
        messagesCount: aiMessages.length,
        phase: currentPhase,
        forceShow: forceShowDialogs,
        wsReady: wsRef.current?.readyState === WebSocket.OPEN
      })
    }, 10000) // 每10秒打印一次状态

    return () => clearInterval(interval)
  }, [isConnected, connectionStatus, aiMessages.length, currentPhase, forceShowDialogs])

  return {
    // 连接状态
    isConnected,
    connectionStatus,

    // 数据状态
    aiMessages,
    currentPhase,
    timeRemaining,
    currentBids,
    highestBid: Math.max(...Object.values(currentBids), 0),

    // 时间配置和顺延状态
    timeConfig,
    hasUserSpoken,
    phaseExtended,
    extensionCount,
    canExtend: timeConfig.userExtension.enabled && extensionCount < timeConfig.userExtension.maxPerPhase,

    // 修复状态
    forceShowDialogs,
    messageCount: messageCountRef.current,

    // 操作方法
    sendMessage,
    startBidding,
    reconnect: connectWebSocket,

    // 用户交互方法
    sendUserSupplement: (content: string, category?: string) => {
      return sendMessage({
        type: 'user_supplement',
        payload: {
          content,
          category,
          triggersExtension: timeConfig.userExtension.triggerEvents.includes('USER_SUPPLEMENT')
        }
      })
    },

    // 调试方法
    debugInfo: {
      wsUrl: getWebSocketURL(ideaId),
      wsState: wsRef.current?.readyState,
      messageCount: messageCountRef.current,
      timeConfig: timeConfig
    }
  }
}
