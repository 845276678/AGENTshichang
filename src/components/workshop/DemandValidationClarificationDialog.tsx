/**
 * 需求验证假设澄清对话组件
 *
 * 基于IdeaClarificationDialog但专门针对需求验证：
 * - 目标客户假设澄清
 * - 痛点场景具体化
 * - 价值主张验证
 * - 验证方案优化
 */

'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import {
  Send,
  Loader2,
  Target,
  Users,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  MessageCircle,
  X,
  BarChart3,
  Search,
  TrendingUp
} from 'lucide-react'

import {
  demandValidationClarificationService,
  type DemandValidationAssumption,
  type DemandClarificationSession,
  type AssumptionAnalysis
} from '@/lib/workshop/demand-validation-clarification'
import { type DemandValidationForm } from '@/lib/workshop/form-schemas'

// 组件Props
interface DemandValidationClarificationDialogProps {
  initialAssumption: DemandValidationAssumption
  onComplete: (refinedAssumption: DemandValidationAssumption, analysis: AssumptionAnalysis) => void
  onCancel: () => void
  className?: string
}

export default function DemandValidationClarificationDialog({
  initialAssumption,
  onComplete,
  onCancel,
  className = ''
}: DemandValidationClarificationDialogProps) {
  // 状态管理
  const [session, setSession] = useState<DemandClarificationSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [currentMessage, setCurrentMessage] = useState('')
  const [error, setError] = useState<string | null>(null)

  // refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 初始化会话
  useEffect(() => {
    const initializeSession = async () => {
      try {
        setIsLoading(true)
        const newSession = await demandValidationClarificationService.startClarification(initialAssumption)
        setSession(newSession)

        // 如果置信度已经很高，可以直接完成
        if (newSession.confidence > 0.8) {
          setTimeout(() => {
            onComplete(newSession.refined_assumption, newSession.analysis)
          }, 1000)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '初始化失败')
      } finally {
        setIsLoading(false)
      }
    }

    initializeSession()
  }, [initialAssumption, onComplete])

  // 滚动到底部
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [session?.conversation, scrollToBottom])

  // 发送消息
  const sendMessage = useCallback(async () => {
    if (!session || !currentMessage.trim() || isSending) return

    const message = currentMessage.trim()
    setCurrentMessage('')
    setIsSending(true)

    try {
      const result = await demandValidationClarificationService.sendClarificationMessage(
        session.id,
        message
      )

      // 更新会话
      const updatedSession = demandValidationClarificationService.getSession(session.id)
      if (updatedSession) {
        setSession(updatedSession)

        // 检查是否完成
        if (updatedSession.status === 'completed') {
          setTimeout(() => {
            onComplete(updatedSession.refined_assumption, updatedSession.analysis)
          }, 1500)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '发送消息失败')
    } finally {
      setIsSending(false)
    }
  }, [session, currentMessage, isSending, onComplete])

  // 处理回车发送
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }, [sendMessage])

  // 获取分析状态显示
  const getAnalysisStatusDisplay = () => {
    if (!session) return null

    const { analysis, confidence } = session
    const confidencePercent = Math.round(confidence * 100)

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <BarChart3 className="w-6 h-6 text-blue-600 mx-auto mb-1" />
          <p className="text-sm font-medium">清晰度</p>
          <p className="text-lg font-bold text-blue-600">{analysis.clarity}/10</p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <Target className="w-6 h-6 text-green-600 mx-auto mb-1" />
          <p className="text-sm font-medium">具体性</p>
          <p className="text-lg font-bold text-green-600">{analysis.specificity}/10</p>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-1" />
          <p className="text-sm font-medium">可测量性</p>
          <p className="text-lg font-bold text-purple-600">{analysis.measurability}/10</p>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <CheckCircle className="w-6 h-6 text-orange-600 mx-auto mb-1" />
          <p className="text-sm font-medium">置信度</p>
          <p className="text-lg font-bold text-orange-600">{confidencePercent}%</p>
        </div>
      </div>
    )
  }

  // 渲染假设澄清建议
  const renderClarificationSuggestions = () => {
    if (!session || session.conversation.length > 0) return null

    const { analysis } = session

    return (
      <div className="space-y-4 mb-6">
        {analysis.missing_info.length > 0 && (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <p className="font-medium mb-2">需要补充的关键信息：</p>
              <ul className="text-sm list-disc list-inside space-y-1">
                {analysis.missing_info.map((info, index) => (
                  <li key={index}>{info}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {analysis.recommended_questions.length > 0 && (
          <Card className="border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-blue-600" />
                AI建议的澄清方向
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {analysis.recommended_questions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-left h-auto p-3 justify-start text-wrap"
                    onClick={() => setCurrentMessage(question)}
                  >
                    <MessageCircle className="w-3 h-3 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-xs">{question}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  // 渲染对话历史
  const renderConversation = () => {
    if (!session) return null

    return (
      <div className="space-y-4 max-h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50">
        {session.conversation.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border text-gray-800'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className={`text-xs mt-1 ${
                message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {isSending && (
          <div className="flex justify-start">
            <div className="bg-white border p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-gray-600">AI正在分析...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    )
  }

  // 渲染完成状态
  const renderCompletionStatus = () => {
    if (!session || session.status !== 'completed') return null

    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <p className="font-medium">🎉 假设澄清完成！</p>
          <p className="text-sm mt-1">
            你的需求验证假设已经达到了高质量标准，可以开始制定验证计划了。
          </p>
        </AlertDescription>
      </Alert>
    )
  }

  // 加载状态
  if (isLoading) {
    return (
      <Card className={`max-w-4xl mx-auto ${className}`}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">分析需求验证假设</h3>
            <p className="text-gray-600">AI正在评估你的假设质量...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // 错误状态
  if (error) {
    return (
      <Card className={`max-w-4xl mx-auto ${className}`}>
        <CardContent className="py-8">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4 flex gap-2">
            <Button onClick={onCancel} variant="outline">
              关闭
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`max-w-4xl mx-auto ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg">🎯 需求验证假设澄清</CardTitle>
            {session && (
              <Badge variant={session.status === 'completed' ? 'default' : 'secondary'}>
                {session.status === 'completed' ? '已完成' : '进行中'}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 分析状态展示 */}
        {getAnalysisStatusDisplay()}

        {/* 进度条 */}
        {session && (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>假设澄清进度</span>
              <span>{Math.round(session.confidence * 100)}%</span>
            </div>
            <Progress value={session.confidence * 100} className="h-2" />
          </div>
        )}

        {/* 完成状态 */}
        {renderCompletionStatus()}

        {/* 澄清建议 */}
        {renderClarificationSuggestions()}

        {/* 对话历史 */}
        {session && session.conversation.length > 0 && (
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              澄清对话
            </h4>
            {renderConversation()}
          </div>
        )}

        {/* 输入区域 */}
        {session && session.status !== 'completed' && (
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="描述你的需求验证假设，或回答AI的问题..."
              disabled={isSending}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={!currentMessage.trim() || isSending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex justify-between pt-4 border-t">
          <div className="text-sm text-gray-600">
            {session && session.conversation.length === 0 && (
              <p>💡 点击上方的建议问题快速开始，或直接描述你的想法</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>
              取消
            </Button>
            {session?.status === 'completed' && (
              <Button
                onClick={() => onComplete(session.refined_assumption, session.analysis)}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                应用澄清结果
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}