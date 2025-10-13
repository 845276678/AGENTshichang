/**
 * 工作坊 Agent 聊天 Hook
 *
 * 管理与AI Agent的对话交互，包括：
 * - 发送消息和接收回复
 * - 对话历史管理
 * - 上下文感知
 * - 错误处理和重试
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import {
  type AgentMessage,
  type WorkshopId,
  type AgentId,
  generateAgentPrompt,
  FALLBACK_RESPONSES
} from '@/lib/workshop/agent-prompts'

// Hook配置接口
interface UseAgentChatProps {
  workshopId: WorkshopId
  sessionId: string
  currentStep: number
  totalSteps: number
  formData: Record<string, any>
  onMessageReceived?: (message: AgentMessage) => void
  maxHistoryLength?: number
}

// Agent聊天状态
interface AgentChatState {
  conversations: Map<AgentId, AgentMessage[]>
  isLoading: Map<AgentId, boolean>
  errors: Map<AgentId, string | null>
}

// API请求接口
interface AgentChatRequest {
  workshopId: WorkshopId
  agentId: AgentId
  sessionId: string
  userMessage: string
  formContext: Record<string, any>
  conversationHistory: AgentMessage[]
  currentStep: number
  totalSteps: number
  scenario?: 'user' | 'validation' | 'inspiration' | 'knowledge' | 'case_study'
  relatedField?: string
}

interface AgentChatResponse {
  success: boolean
  data?: {
    message: string
    type: 'question' | 'feedback' | 'suggestion' | 'validation' | 'case_study' | 'knowledge'
    suggestions?: string[]
    resources?: Array<{
      title: string
      url: string
      type: 'article' | 'video' | 'tool' | 'template'
    }>
    nextAction?: {
      type: 'fill_field' | 'review_section' | 'proceed'
      target?: string
    }
  }
  error?: string
}

export function useAgentChat({
  workshopId,
  sessionId,
  currentStep,
  totalSteps,
  formData,
  onMessageReceived,
  maxHistoryLength = 10
}: UseAgentChatProps) {
  // 状态管理
  const [state, setState] = useState<AgentChatState>({
    conversations: new Map(),
    isLoading: new Map(),
    errors: new Map()
  })

  // 缓存对话上下文，避免重复计算
  const contextCache = useRef<Map<string, any>>(new Map())

  // 初始化Agent对话历史
  const initializeAgent = useCallback((agentId: AgentId) => {
    setState(prev => {
      const newConversations = new Map(prev.conversations)
      const newIsLoading = new Map(prev.isLoading)
      const newErrors = new Map(prev.errors)

      if (!newConversations.has(agentId)) {
        newConversations.set(agentId, [])
      }
      if (!newIsLoading.has(agentId)) {
        newIsLoading.set(agentId, false)
      }
      if (!newErrors.has(agentId)) {
        newErrors.set(agentId, null)
      }

      return {
        conversations: newConversations,
        isLoading: newIsLoading,
        errors: newErrors
      }
    })
  }, [])

  // 发送消息给Agent
  const sendMessage = useCallback(async ({
    agentId,
    message,
    scenario = 'user',
    relatedField
  }: {
    agentId: AgentId
    message: string
    scenario?: 'user' | 'validation' | 'inspiration' | 'knowledge' | 'case_study'
    relatedField?: string
  }): Promise<AgentMessage | null> => {
    // 初始化Agent状态
    initializeAgent(agentId)

    // 设置加载状态
    setState(prev => ({
      ...prev,
      isLoading: new Map(prev.isLoading).set(agentId, true),
      errors: new Map(prev.errors).set(agentId, null)
    }))

    try {
      // 获取对话历史
      const history = state.conversations.get(agentId) || []

      // 构建请求数据
      const requestData: AgentChatRequest = {
        workshopId,
        agentId,
        sessionId,
        userMessage: message,
        formContext: formData,
        conversationHistory: history.slice(-5), // 只发送最近5条消息
        currentStep,
        totalSteps,
        scenario,
        relatedField
      }

      // 发送API请求
      const response = await fetch('/api/workshop/agent-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })

      const result: AgentChatResponse = await response.json()

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Agent响应失败')
      }

      // 创建Agent消息对象
      const agentMessage: AgentMessage = {
        id: `${Date.now()}-${Math.random()}`,
        agentId,
        content: result.data.message,
        type: result.data.type,
        relatedFormField: relatedField,
        timestamp: new Date(),
        suggestions: result.data.suggestions,
        resources: result.data.resources,
        nextAction: result.data.nextAction
      }

      // 更新对话历史
      setState(prev => {
        const newConversations = new Map(prev.conversations)
        const currentHistory = newConversations.get(agentId) || []

        // 添加新消息，保持历史长度限制
        const updatedHistory = [...currentHistory, agentMessage].slice(-maxHistoryLength)
        newConversations.set(agentId, updatedHistory)

        return {
          ...prev,
          conversations: newConversations,
          isLoading: new Map(prev.isLoading).set(agentId, false)
        }
      })

      // 触发回调
      if (onMessageReceived) {
        onMessageReceived(agentMessage)
      }

      return agentMessage

    } catch (error) {
      console.error(`Agent ${agentId} 对话失败:`, error)

      // 设置错误状态
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      setState(prev => ({
        ...prev,
        isLoading: new Map(prev.isLoading).set(agentId, false),
        errors: new Map(prev.errors).set(agentId, errorMessage)
      }))

      // 返回降级响应
      const fallbackMessage: AgentMessage = {
        id: `fallback-${Date.now()}`,
        agentId,
        content: FALLBACK_RESPONSES.api_error,
        type: 'feedback',
        timestamp: new Date()
      }

      return fallbackMessage
    }
  }, [workshopId, sessionId, currentStep, totalSteps, formData, maxHistoryLength, state.conversations, initializeAgent, onMessageReceived])

  // 表单字段验证
  const validateField = useCallback(async (
    agentId: AgentId,
    fieldName: string,
    fieldValue: string
  ): Promise<AgentMessage | null> => {
    return sendMessage({
      agentId,
      message: `请评价我在"${fieldName}"字段的填写内容：${fieldValue}`,
      scenario: 'validation',
      relatedField: fieldName
    })
  }, [sendMessage])

  // 获取启发建议
  const getInspiration = useCallback(async (
    agentId: AgentId,
    fieldName: string,
    topic?: string
  ): Promise<AgentMessage | null> => {
    const message = topic
      ? `我想了解更多关于"${topic}"的信息，这对"${fieldName}"很重要`
      : `我在填写"${fieldName}"时需要一些启发和建议`

    return sendMessage({
      agentId,
      message,
      scenario: topic ? 'knowledge' : 'inspiration',
      relatedField: fieldName
    })
  }, [sendMessage])

  // 获取案例分享
  const getCaseStudy = useCallback(async (
    agentId: AgentId,
    context: string
  ): Promise<AgentMessage | null> => {
    return sendMessage({
      agentId,
      message: `能否分享一个相关的案例？我的情况是：${context}`,
      scenario: 'case_study'
    })
  }, [sendMessage])

  // 清除Agent错误
  const clearError = useCallback((agentId: AgentId) => {
    setState(prev => ({
      ...prev,
      errors: new Map(prev.errors).set(agentId, null)
    }))
  }, [])

  // 获取Agent对话历史
  const getConversation = useCallback((agentId: AgentId): AgentMessage[] => {
    return state.conversations.get(agentId) || []
  }, [state.conversations])

  // 获取Agent加载状态
  const isAgentLoading = useCallback((agentId: AgentId): boolean => {
    return state.isLoading.get(agentId) || false
  }, [state.isLoading])

  // 获取Agent错误
  const getAgentError = useCallback((agentId: AgentId): string | null => {
    return state.errors.get(agentId) || null
  }, [state.errors])

  // 重试发送消息
  const retryMessage = useCallback(async (
    agentId: AgentId,
    message: string
  ): Promise<AgentMessage | null> => {
    clearError(agentId)
    return sendMessage({ agentId, message })
  }, [sendMessage, clearError])

  // 批量初始化Agent
  const initializeAgents = useCallback((agentIds: AgentId[]) => {
    agentIds.forEach(initializeAgent)
  }, [initializeAgent])

  // 获取所有活跃的Agent
  const getActiveAgents = useCallback((): AgentId[] => {
    return Array.from(state.conversations.keys())
  }, [state.conversations])

  // 获取有错误的Agent
  const getErrorAgents = useCallback((): AgentId[] => {
    const errorAgents: AgentId[] = []
    state.errors.forEach((error, agentId) => {
      if (error) {
        errorAgents.push(agentId)
      }
    })
    return errorAgents
  }, [state.errors])

  // 清除所有对话历史
  const clearAllConversations = useCallback(() => {
    setState(prev => ({
      conversations: new Map(),
      isLoading: new Map(),
      errors: new Map()
    }))
  }, [])

  // 导出Agent消息到JSON
  const exportConversations = useCallback((): Record<AgentId, AgentMessage[]> => {
    const exported: Record<string, AgentMessage[]> = {}
    state.conversations.forEach((messages, agentId) => {
      exported[agentId] = messages
    })
    return exported as Record<AgentId, AgentMessage[]>
  }, [state.conversations])

  // 从JSON导入Agent消息
  const importConversations = useCallback((data: Record<AgentId, AgentMessage[]>) => {
    const conversations = new Map<AgentId, AgentMessage[]>()
    Object.entries(data).forEach(([agentId, messages]) => {
      conversations.set(agentId as AgentId, messages)
    })

    setState(prev => ({
      ...prev,
      conversations
    }))
  }, [])

  return {
    // 核心功能
    sendMessage,
    validateField,
    getInspiration,
    getCaseStudy,

    // 状态查询
    getConversation,
    isAgentLoading,
    getAgentError,
    getActiveAgents,
    getErrorAgents,

    // 错误处理
    clearError,
    retryMessage,

    // 批量操作
    initializeAgents,
    clearAllConversations,

    // 数据导入导出
    exportConversations,
    importConversations,

    // 统计信息
    totalMessages: Array.from(state.conversations.values()).reduce(
      (total, messages) => total + messages.length, 0
    ),
    totalErrors: Array.from(state.errors.values()).filter(Boolean).length,
    isAnyLoading: Array.from(state.isLoading.values()).some(Boolean)
  }
}