import { useState, useCallback } from 'react'

export interface ConversationMessage {
  role: 'agent' | 'user'
  content: string
  timestamp: Date
  scoreChange?: number
  emotion?: 'neutral' | 'excited' | 'confident' | 'worried' | 'aggressive'
}

export interface AgentConversation {
  agentId: string
  messages: ConversationMessage[]
  currentScore: number
  isReplying: boolean
  resolvedChallenges: string[]
  newChallenges: string[]
  conversationCount: number // 对话轮次
  maxConversations: number // 最大轮次限制
}

export interface UseAgentConversationsReturn {
  conversations: Record<string, AgentConversation>
  sendReply: (agentId: string, userReply: string) => Promise<boolean>
  getConversation: (agentId: string) => AgentConversation | null
  canReply: (agentId: string) => boolean
  getRemainingReplies: (agentId: string) => number
}

interface UseAgentConversationsProps {
  sessionId: string
  biddingId: string
  originalIdea: string
  initialScores: Record<string, number>
  maxRepliesPerAgent?: number
}

/**
 * Agent对话状态管理Hook
 *
 * 功能：
 * - 管理每个Agent的对话历史
 * - 处理用户回复和Agent响应
 * - 跟踪评分变化
 * - 限制对话轮次
 */
export function useAgentConversations({
  sessionId,
  biddingId,
  originalIdea,
  initialScores,
  maxRepliesPerAgent = 3
}: UseAgentConversationsProps): UseAgentConversationsReturn {
  const [conversations, setConversations] = useState<Record<string, AgentConversation>>({})

  /**
   * 初始化Agent对话
   */
  const initializeAgentConversation = useCallback((agentId: string) => {
    if (!conversations[agentId]) {
      setConversations(prev => ({
        ...prev,
        [agentId]: {
          agentId,
          messages: [],
          currentScore: initialScores[agentId] || 70,
          isReplying: false,
          resolvedChallenges: [],
          newChallenges: [],
          conversationCount: 0,
          maxConversations: maxRepliesPerAgent
        }
      }))
    }
  }, [conversations, initialScores, maxRepliesPerAgent])

  /**
   * 发送回复给Agent
   */
  const sendReply = useCallback(async (agentId: string, userReply: string): Promise<boolean> => {
    if (!userReply.trim()) {
      console.warn('⚠️ 回复内容为空')
      return false
    }

    // 初始化对话（如果需要）
    if (!conversations[agentId]) {
      initializeAgentConversation(agentId)
    }

    const conversation = conversations[agentId]

    // 检查是否已达上限
    if (conversation && conversation.conversationCount >= maxRepliesPerAgent) {
      console.warn(`⚠️ Agent ${agentId} 已达到最大对话轮次 (${maxRepliesPerAgent})`)
      return false
    }

    // 1. 乐观更新UI - 添加用户消息
    setConversations(prev => ({
      ...prev,
      [agentId]: {
        ...prev[agentId],
        messages: [
          ...(prev[agentId]?.messages || []),
          {
            role: 'user',
            content: userReply,
            timestamp: new Date()
          }
        ],
        isReplying: true
      }
    }))

    try {
      // 2. 调用API
      const response = await fetch('/api/bidding/agent-reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          biddingId,
          sessionId,
          agentId,
          userReply: userReply.trim(),
          conversationHistory: conversation?.messages.map(msg => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp.toISOString()
          })) || [],
          originalIdea,
          currentScore: conversation?.currentScore || initialScores[agentId] || 70
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || '回复失败')
      }

      // 3. 更新Agent回复
      setConversations(prev => {
        const prevConversation = prev[agentId] || {
          agentId,
          messages: [],
          currentScore: initialScores[agentId] || 70,
          isReplying: false,
          resolvedChallenges: [],
          newChallenges: [],
          conversationCount: 0,
          maxConversations: maxRepliesPerAgent
        }

        return {
          ...prev,
          [agentId]: {
            ...prevConversation,
            messages: [
              ...prevConversation.messages,
              {
                role: 'agent',
                content: result.data.agentResponse,
                timestamp: new Date(),
                scoreChange: result.data.scoreChange,
                emotion: result.data.emotion
              }
            ],
            currentScore: result.data.updatedScore,
            isReplying: false,
            resolvedChallenges: [
              ...prevConversation.resolvedChallenges,
              ...result.data.resolvedChallenges
            ],
            newChallenges: result.data.newChallenges,
            conversationCount: prevConversation.conversationCount + 1
          }
        }
      })

      console.log('✅ Agent回复成功:', {
        agentId,
        scoreChange: result.data.scoreChange,
        newScore: result.data.updatedScore
      })

      return true
    } catch (error) {
      console.error('❌ Agent回复失败:', error)

      // 回滚乐观更新
      setConversations(prev => ({
        ...prev,
        [agentId]: {
          ...prev[agentId],
          messages: prev[agentId].messages.slice(0, -1), // 移除用户消息
          isReplying: false
        }
      }))

      return false
    }
  }, [conversations, sessionId, biddingId, originalIdea, initialScores, maxRepliesPerAgent, initializeAgentConversation])

  /**
   * 获取特定Agent的对话
   */
  const getConversation = useCallback((agentId: string): AgentConversation | null => {
    return conversations[agentId] || null
  }, [conversations])

  /**
   * 检查是否可以回复
   */
  const canReply = useCallback((agentId: string): boolean => {
    const conversation = conversations[agentId]
    if (!conversation) return true // 还没开始对话
    return conversation.conversationCount < maxRepliesPerAgent && !conversation.isReplying
  }, [conversations, maxRepliesPerAgent])

  /**
   * 获取剩余回复次数
   */
  const getRemainingReplies = useCallback((agentId: string): number => {
    const conversation = conversations[agentId]
    if (!conversation) return maxRepliesPerAgent
    return Math.max(0, maxRepliesPerAgent - conversation.conversationCount)
  }, [conversations, maxRepliesPerAgent])

  return {
    conversations,
    sendReply,
    getConversation,
    canReply,
    getRemainingReplies
  }
}

export default useAgentConversations
