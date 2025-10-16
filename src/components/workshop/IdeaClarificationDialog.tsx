/**
 * 智能想法澄清对话组件
 *
 * 功能：
 * 1. 实时分析用户输入的抽象想法
 * 2. 通过智能问答引导用户完善想法
 * 3. 提供动态的改进建议
 * 4. 验证系统对想法的理解程度
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import {
  MessageCircle,
  Brain,
  Lightbulb,
  Target,
  CheckCircle,
  AlertCircle,
  Loader2,
  Send,
  Sparkles,
  TrendingUp,
  Users,
  BarChart3
} from 'lucide-react'

import {
  ideaClarificationService,
  type UserIdea,
  type ClarificationSession,
  type ClarificationQuestion,
  type IdeaAnalysis
} from '@/lib/workshop/idea-clarification'

// 组件Props
interface IdeaClarificationDialogProps {
  initialIdea?: Partial<UserIdea>
  onComplete?: (refinedIdea: UserIdea, analysis: IdeaAnalysis) => void
  onCancel?: () => void
  className?: string
}

// 消息类型
interface ChatMessage {
  id: string
  type: 'system' | 'user' | 'assistant'
  content: string
  timestamp: Date
  question?: ClarificationQuestion
}

export default function IdeaClarificationDialog({
  initialIdea = {},
  onComplete,
  onCancel,
  className = ''
}: IdeaClarificationDialogProps) {
  // 状态管理
  const [session, setSession] = useState<ClarificationSession | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  // 初始化澄清会话
  useEffect(() => {
    if (Object.keys(initialIdea).length > 0) {
      initializeClarification()
    }
  }, [initialIdea])

  const initializeClarification = async () => {
    setIsLoading(true)
    try {
      const newSession = await ideaClarificationService.startClarification(initialIdea as UserIdea)
      setSession(newSession)

      // 添加欢迎消息
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        type: 'assistant',
        content: '你好！我是AI创意助手。我会通过几个问题来帮助你完善和澄清你的想法，让你的创意更加清晰可行。',
        timestamp: new Date()
      }

      // 添加第一个问题
      const firstQuestion = newSession.questions[0]
      const questionMessage: ChatMessage = {
        id: `question_${firstQuestion.id}`,
        type: 'assistant',
        content: firstQuestion.question,
        timestamp: new Date(),
        question: firstQuestion
      }

      setChatMessages([welcomeMessage, questionMessage])
    } catch (error) {
      console.error('初始化澄清会话失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 处理用户回答
  const handleSubmitAnswer = async () => {
    if (!session || !currentAnswer.trim()) return

    const currentQuestion = session.questions[currentQuestionIndex]
    if (!currentQuestion) return

    setIsLoading(true)

    try {
      // 添加用户消息
      const userMessage: ChatMessage = {
        id: `user_${Date.now()}`,
        type: 'user',
        content: currentAnswer,
        timestamp: new Date()
      }

      setChatMessages(prev => [...prev, userMessage])

      // 处理回答并更新会话
      const updatedSession = await ideaClarificationService.processAnswer(
        session,
        currentQuestion.id,
        currentAnswer
      )

      setSession(updatedSession)

      // 检查是否有下一个问题
      const nextQuestionIndex = currentQuestionIndex + 1
      if (nextQuestionIndex < updatedSession.questions.length && !updatedSession.isComplete) {
        // 添加下一个问题
        const nextQuestion = updatedSession.questions[nextQuestionIndex]
        const questionMessage: ChatMessage = {
          id: `question_${nextQuestion.id}`,
          type: 'assistant',
          content: nextQuestion.question,
          timestamp: new Date(),
          question: nextQuestion
        }

        setChatMessages(prev => [...prev, questionMessage])
        setCurrentQuestionIndex(nextQuestionIndex)
      } else {
        // 澄清完成，显示总结
        await showClarificationSummary(updatedSession)
      }

      setCurrentAnswer('')
    } catch (error) {
      console.error('处理回答失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 显示澄清总结
  const showClarificationSummary = async (completedSession: ClarificationSession) => {
    const summaryMessage: ChatMessage = {
      id: 'summary',
      type: 'assistant',
      content: `太好了！通过我们的对话，我现在对你的想法有了更清晰的理解。让我为你总结一下：`,
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, summaryMessage])

    // 生成改进建议
    try {
      const suggestions = await ideaClarificationService.generateImprovementSuggestions(completedSession)

      const suggestionsMessage: ChatMessage = {
        id: 'suggestions',
        type: 'assistant',
        content: `基于我们的讨论，我为你的想法提供以下改进建议：\n\n${suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}`,
        timestamp: new Date()
      }

      setChatMessages(prev => [...prev, suggestionsMessage])
    } catch (error) {
      console.error('生成建议失败:', error)
    }

    setShowAnalysis(true)
  }

  // 选择预设回答
  const handleSelectOption = (option: string) => {
    setCurrentAnswer(option)
  }

  // 完成澄清
  const handleComplete = () => {
    if (session && onComplete) {
      onComplete(session.currentIdea, session.analysis)
    }
  }

  // 获取问题类型图标
  const getQuestionIcon = (type: string) => {
    switch (type) {
      case 'problem':
        return <Target className="w-4 h-4 text-red-500" />
      case 'user':
        return <Users className="w-4 h-4 text-blue-500" />
      case 'solution':
        return <Lightbulb className="w-4 h-4 text-yellow-500" />
      case 'market':
        return <BarChart3 className="w-4 h-4 text-green-500" />
      default:
        return <MessageCircle className="w-4 h-4 text-gray-500" />
    }
  }

  // 获取分析等级颜色
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50'
    if (score >= 6) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  if (!session) {
    return (
      <div className={`idea-clarification-dialog ${className}`}>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">正在分析你的想法...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`idea-clarification-dialog ${className}`}>
      <Card className="h-[600px] flex flex-col">
        {/* 头部 */}
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Brain className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">AI想法澄清助手</CardTitle>
                <p className="text-sm text-gray-600">
                  通过智能对话完善你的创意想法
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                理解度: {Math.round(session.confidence * 100)}%
              </Badge>
              <Badge variant="secondary">
                进度: {currentQuestionIndex + 1}/{session.questions.length}
              </Badge>
            </div>
          </div>

          {/* 进度条 */}
          <Progress
            value={(currentQuestionIndex + 1) / session.questions.length * 100}
            className="mt-3"
          />
        </CardHeader>

        {/* 对话区域 */}
        <CardContent className="flex-1 overflow-hidden flex flex-col p-4">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.type !== 'user' && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Brain className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                )}

                <div className={`max-w-[70%] ${message.type === 'user' ? 'order-2' : ''}`}>
                  <div
                    className={`rounded-lg p-3 ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {message.question && (
                      <div className="flex items-center gap-2 mb-2">
                        {getQuestionIcon(message.question.category)}
                        <Badge variant="outline" className="text-xs">
                          {message.question.priority === 'high' ? '重要' : '一般'}
                        </Badge>
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                  </div>

                  {/* 问题选项 */}
                  {message.question?.type === 'choice' && message.id === `question_${session.questions[currentQuestionIndex]?.id}` && (
                    <div className="mt-2 space-y-2">
                      {message.question.options?.map((option) => (
                        <Button
                          key={option}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSelectOption(option)}
                          className="w-full text-left justify-start"
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  )}

                  <div className="text-xs text-gray-400 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>

                {message.type === 'user' && (
                  <div className="flex-shrink-0 order-1">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <div className="bg-gray-100 rounded-lg p-3 max-w-[70%]">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-gray-600">AI正在思考中...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 输入区域或分析结果 */}
          {!showAnalysis ? (
            <div className="border-t pt-4">
              <div className="flex gap-2">
                <Textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder={session.questions[currentQuestionIndex]?.placeholder || '请输入你的回答...'}
                  className="flex-1 min-h-16 resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmitAnswer()
                    }
                  }}
                />
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={!currentAnswer.trim() || isLoading}
                  className="self-end"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              {session.questions[currentQuestionIndex]?.reasoning && (
                <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
                  <Lightbulb className="w-3 h-3" />
                  <span>{session.questions[currentQuestionIndex].reasoning}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="border-t pt-4 space-y-4">
              {/* 想法分析结果 */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className={`inline-flex items-center px-2 py-1 rounded text-sm ${getScoreColor(session.analysis.clarity)}`}>
                    清晰度: {session.analysis.clarity}/10
                  </div>
                </div>
                <div className="text-center">
                  <div className={`inline-flex items-center px-2 py-1 rounded text-sm ${getScoreColor(session.analysis.feasibility)}`}>
                    可行性: {session.analysis.feasibility}/10
                  </div>
                </div>
                <div className="text-center">
                  <div className={`inline-flex items-center px-2 py-1 rounded text-sm ${getScoreColor(session.analysis.market_potential)}`}>
                    市场潜力: {session.analysis.market_potential}/10
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-2">
                <Button
                  onClick={handleComplete}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  使用完善后的想法
                </Button>
                {onCancel && (
                  <Button variant="outline" onClick={onCancel}>
                    取消
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}