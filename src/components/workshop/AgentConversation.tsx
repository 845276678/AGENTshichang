/**
 * 工作坊 Agent 对话组件
 *
 * 显示与AI Agent的对话界面，包括：
 * - Agent头像和信息
 * - 对话历史显示
 * - 消息输入和发送
 * - 加载状态和错误处理
 * - 快捷操作按钮
 */

'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Send,
  Loader2,
  AlertCircle,
  RefreshCw,
  Bot,
  User,
  Lightbulb,
  BookOpen,
  CheckCircle,
  ExternalLink
} from 'lucide-react'
import {
  type AgentId,
  type AgentMessage,
  WORKSHOP_AGENT_CONFIG
} from '@/lib/workshop/agent-prompts'
import { useAgentChat } from '@/hooks/useAgentChat'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

// 组件Props接口
interface AgentConversationProps {
  workshopId: 'demand-validation' | 'mvp-builder' | 'growth-hacking' | 'profit-model'
  agentId: AgentId
  sessionId: string
  currentStep: number
  totalSteps: number
  formData: Record<string, any>
  className?: string
  onMessageSent?: (message: string) => void
  onActionSuggested?: (action: { type: string, target?: string }) => void
  isRecommended?: boolean
  relatedField?: string
}

// Agent头像配置
const AGENT_AVATARS: Record<AgentId, string> = {
  alex: '/avatars/alex.png',
  sophia: '/avatars/sophia.png',
  marcus: '/avatars/marcus.png',
  elena: '/avatars/elena.png',
  david: '/avatars/david.png',
  lisa: '/avatars/lisa.png'
}

// Agent颜色主题
const AGENT_COLORS: Record<AgentId, string> = {
  alex: 'blue',
  sophia: 'purple',
  marcus: 'green',
  elena: 'orange',
  david: 'red',
  lisa: 'pink'
}

// 消息类型图标
const MESSAGE_TYPE_ICONS = {
  question: Lightbulb,
  feedback: CheckCircle,
  suggestion: Lightbulb,
  validation: CheckCircle,
  case_study: BookOpen,
  knowledge: BookOpen
}

export default function AgentConversation({
  workshopId,
  agentId,
  sessionId,
  currentStep,
  totalSteps,
  formData,
  className = '',
  onMessageSent,
  onActionSuggested,
  isRecommended = false,
  relatedField
}: AgentConversationProps) {
  // Agent配置
  const agentConfig = WORKSHOP_AGENT_CONFIG[workshopId].agents[agentId]
  const agentColor = AGENT_COLORS[agentId]

  // 聊天Hook
  const {
    sendMessage,
    validateField,
    getInspiration,
    getCaseStudy,
    getConversation,
    isAgentLoading,
    getAgentError,
    clearError,
    retryMessage
  } = useAgentChat({
    workshopId,
    sessionId,
    currentStep,
    totalSteps,
    formData,
    onMessageReceived: (message) => {
      // 处理Agent的行动建议
      if (message.nextAction && onActionSuggested) {
        onActionSuggested(message.nextAction)
      }
    }
  })

  // 本地状态
  const [userMessage, setUserMessage] = useState('')
  const [showQuickActions, setShowQuickActions] = useState(true)

  // 引用
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 获取对话历史和状态
  const conversation = getConversation(agentId)
  const isLoading = isAgentLoading(agentId)
  const error = getAgentError(agentId)

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [conversation])

  // 发送用户消息
  const handleSendMessage = async () => {
    if (!userMessage.trim() || isLoading) return

    const message = userMessage.trim()
    setUserMessage('')

    try {
      await sendMessage({
        agentId,
        message,
        relatedField
      })

      if (onMessageSent) {
        onMessageSent(message)
      }

      // 隐藏快捷操作（用户开始对话后）
      setShowQuickActions(false)

    } catch (error) {
      console.error('发送消息失败:', error)
    }
  }

  // 快捷操作：字段验证
  const handleValidateField = async () => {
    if (!relatedField || !formData[relatedField]) {
      await getInspiration(agentId, relatedField || '当前字段')
      return
    }

    await validateField(agentId, relatedField, formData[relatedField])
    setShowQuickActions(false)
  }

  // 快捷操作：获取启发
  const handleGetInspiration = async () => {
    await getInspiration(agentId, relatedField || '当前步骤')
    setShowQuickActions(false)
  }

  // 快捷操作：获取案例
  const handleGetCaseStudy = async () => {
    const context = relatedField && formData[relatedField]
      ? `我在${relatedField}方面的情况是：${formData[relatedField]}`
      : '我正在完成这个工作坊的相关内容'

    await getCaseStudy(agentId, context)
    setShowQuickActions(false)
  }

  // 重试消息
  const handleRetry = async () => {
    const lastUserMessage = conversation
      .filter(msg => msg.agentId === 'user' as any)
      .pop()

    if (lastUserMessage) {
      await retryMessage(agentId, lastUserMessage.content)
    }
  }

  // 键盘事件处理
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <Card className={`agent-conversation ${className}`}>
      {/* Agent信息头部 */}
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          {/* Agent头像 */}
          <Avatar className="w-10 h-10">
            <AvatarImage
              src={AGENT_AVATARS[agentId]}
              alt={agentConfig.role}
            />
            <AvatarFallback className={`bg-${agentColor}-100 text-${agentColor}-700`}>
              {agentConfig.role.slice(0, 2)}
            </AvatarFallback>
          </Avatar>

          {/* Agent信息 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm truncate">
                {agentConfig.role}
              </h3>
              {isRecommended && (
                <Badge variant="secondary" className="text-xs">
                  推荐
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-600 truncate">
              {agentConfig.focus}
            </p>
          </div>

          {/* 状态指示 */}
          <div className="flex items-center gap-1">
            {isLoading && (
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
            )}
            {error && (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
            {!isLoading && !error && conversation.length > 0 && (
              <div className={`w-2 h-2 rounded-full bg-${agentColor}-500`} />
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 对话历史 */}
        <div className="h-48 overflow-y-auto space-y-3 border rounded-lg p-3 bg-gray-50">
          {conversation.length === 0 ? (
            <div className="text-center text-gray-500 text-sm py-8">
              <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>还没有对话记录</p>
              <p className="text-xs mt-1">
                使用下方按钮开始与{agentConfig.role}对话
              </p>
            </div>
          ) : (
            <>
              {conversation.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 ${
                    message.agentId === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  {/* 消息头像 */}
                  <div className="flex-shrink-0">
                    {message.agentId === 'user' ? (
                      <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                        <User className="w-3 h-3" />
                      </div>
                    ) : (
                      <div className={`w-6 h-6 rounded-full bg-${agentColor}-100 flex items-center justify-center`}>
                        <Bot className={`w-3 h-3 text-${agentColor}-600`} />
                      </div>
                    )}
                  </div>

                  {/* 消息内容 */}
                  <div
                    className={`flex-1 max-w-[80%] ${
                      message.agentId === 'user' ? 'text-right' : 'text-left'
                    }`}
                  >
                    <div
                      className={`inline-block p-2 rounded-lg text-sm ${
                        message.agentId === 'user'
                          ? 'bg-blue-500 text-white'
                          : `bg-white border border-${agentColor}-200`
                      }`}
                    >
                      {/* 消息类型图标 */}
                      {message.agentId !== 'user' && message.type && (
                        <div className="flex items-center gap-1 mb-1">
                          {React.createElement(
                            MESSAGE_TYPE_ICONS[message.type] || Bot,
                            { className: `w-3 h-3 text-${agentColor}-500` }
                          )}
                          <span className={`text-xs text-${agentColor}-600 font-medium`}>
                            {message.type === 'validation' ? '验证反馈' :
                             message.type === 'suggestion' ? '建议' :
                             message.type === 'case_study' ? '案例分享' :
                             message.type === 'knowledge' ? '知识补充' :
                             '专业反馈'}
                          </span>
                        </div>
                      )}

                      <div className="whitespace-pre-wrap">
                        {message.content}
                      </div>

                      {/* 建议列表 */}
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <ul className="text-xs space-y-1">
                            {message.suggestions.map((suggestion, index) => (
                              <li key={index} className="flex items-start gap-1">
                                <span className={`text-${agentColor}-500 font-medium`}>
                                  {index + 1}.
                                </span>
                                <span>{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* 资源链接 */}
                      {message.resources && message.resources.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <div className="text-xs space-y-1">
                            {message.resources.map((resource, index) => (
                              <a
                                key={index}
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-1 text-${agentColor}-600 hover:underline`}
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>{resource.title}</span>
                                <Badge variant="outline" className="text-xs">
                                  {resource.type}
                                </Badge>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* 错误显示 */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <div className="flex-1">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRetry}
              className="text-red-600 border-red-200"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              重试
            </Button>
          </div>
        )}

        {/* 快捷操作按钮 */}
        {showQuickActions && conversation.length === 0 && !isLoading && (
          <div className="grid grid-cols-1 gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleValidateField}
              className={`text-${agentColor}-600 border-${agentColor}-200 hover:bg-${agentColor}-50`}
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              评价我的填写内容
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleGetInspiration}
              className={`text-${agentColor}-600 border-${agentColor}-200 hover:bg-${agentColor}-50`}
            >
              <Lightbulb className="w-3 h-3 mr-1" />
              获取启发和建议
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleGetCaseStudy}
              className={`text-${agentColor}-600 border-${agentColor}-200 hover:bg-${agentColor}-50`}
            >
              <BookOpen className="w-3 h-3 mr-1" />
              分享相关案例
            </Button>
          </div>
        )}

        {/* 消息输入区域 */}
        <div className="space-y-2">
          <Textarea
            ref={textareaRef}
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`向${agentConfig.role}提问或分享你的想法...`}
            className="min-h-[60px] resize-none"
            disabled={isLoading}
          />
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">
              按 Enter 发送，Shift+Enter 换行
            </p>
            <Button
              size="sm"
              onClick={handleSendMessage}
              disabled={!userMessage.trim() || isLoading}
              className={`bg-${agentColor}-500 hover:bg-${agentColor}-600`}
            >
              {isLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Send className="w-3 h-3" />
              )}
            </Button>
          </div>
        </div>

        {/* Agent专长提示 */}
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <strong>{agentConfig.role}</strong> 擅长：
          {agentConfig.expertise.join('、')}
        </div>
      </CardContent>
    </Card>
  )
}