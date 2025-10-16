/**
 * 需求验证假设澄清流程组件
 *
 * 通过AI对话引导用户澄清创意假设，然后生成结构化表单数据
 *
 * 工作流程：
 * 1. 欢迎界面 - 说明澄清的价值和流程
 * 2. AI引导对话 - 通过问答帮助用户明确假设
 * 3. 假设总结 - 展示AI理解的假设供确认
 * 4. 表单填写 - 基于假设填写详细表单
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  MessageCircle,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  Target,
  Users,
  Zap,
  RefreshCw,
  AlertTriangle,
  ThumbsUp,
  Edit
} from 'lucide-react'

import {
  demandValidationClarificationService,
  type DemandValidationAssumption,
  type DemandClarificationSession
} from '@/lib/workshop/demand-validation-clarification'

// 组件Props
interface DemandClarificationFlowProps {
  onClarificationComplete?: (assumption: DemandValidationAssumption) => void
  onSkip?: () => void
  className?: string
}

// 引导性问题配置
const GUIDING_QUESTIONS = [
  {
    id: 'target-customer',
    icon: Users,
    title: '目标客户是谁？',
    prompt: '请描述一下您的理想客户。他们是谁？有什么特征？',
    hints: [
      '例如：25-35岁的职场新人',
      '例如：需要提升工作效率的创业者',
      '例如：关注健康的中产家庭'
    ],
    field: 'targetCustomer'
  },
  {
    id: 'pain-point',
    icon: AlertTriangle,
    title: '他们有什么痛点？',
    prompt: '您的目标客户正在遭遇什么问题或困扰？这个问题有多严重？',
    hints: [
      '描述具体的问题场景',
      '说明问题的严重程度',
      '提到问题发生的频率'
    ],
    field: 'customerPainPoint'
  },
  {
    id: 'problem-scenario',
    icon: Target,
    title: '问题在什么场景下出现？',
    prompt: '客户在什么情况下会遇到这个问题？描述一个典型的场景。',
    hints: [
      '什么时候会遇到这个问题？',
      '在什么地方发生？',
      '问题如何影响他们的工作/生活？'
    ],
    field: 'problemScenario'
  },
  {
    id: 'solution-value',
    icon: Zap,
    title: '您的解决方案价值是什么？',
    prompt: '您的产品/服务如何帮助客户解决这个问题？有什么独特优势？',
    hints: [
      '核心功能或服务是什么？',
      '相比现有方案的优势？',
      '能带来什么具体改变？'
    ],
    field: 'solutionValue'
  }
]

export default function DemandClarificationFlow({
  onClarificationComplete,
  onSkip,
  className = ''
}: DemandClarificationFlowProps) {
  // 流程状态
  const [flowStage, setFlowStage] = useState<'welcome' | 'questioning' | 'analyzing' | 'summary' | 'completed'>('welcome')

  // 对话状态
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({})
  const [currentAnswer, setCurrentAnswer] = useState('')

  // 澄清会话
  const [session, setSession] = useState<DemandClarificationSession | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 开始澄清流程
  const startClarification = () => {
    setFlowStage('questioning')
    setCurrentQuestionIndex(0)
  }

  // 处理用户回答
  const handleAnswerSubmit = async () => {
    if (!currentAnswer.trim()) {
      setError('请输入您的回答')
      return
    }

    const currentQuestion = GUIDING_QUESTIONS[currentQuestionIndex]

    // 保存回答
    const newAnswers = {
      ...userAnswers,
      [currentQuestion.field]: currentAnswer.trim()
    }
    setUserAnswers(newAnswers)

    // 移动到下一个问题或进入分析阶段
    if (currentQuestionIndex < GUIDING_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setCurrentAnswer('')
      setError(null)
    } else {
      // 所有问题回答完毕，进入分析
      await analyzeAssumptions(newAnswers)
    }
  }

  // 分析假设
  const analyzeAssumptions = async (answers: Record<string, string>) => {
    setFlowStage('analyzing')
    setIsLoading(true)
    setError(null)

    try {
      // 构建假设对象
      const assumption: DemandValidationAssumption = {
        targetCustomer: answers.targetCustomer || '',
        customerPainPoint: answers.customerPainPoint || '',
        problemScenario: answers.problemScenario || '',
        solutionValue: answers.solutionValue || ''
      }

      // 调用澄清服务
      const clarificationSession = await demandValidationClarificationService.startClarification(assumption)

      setSession(clarificationSession)
      setFlowStage('summary')
    } catch (err) {
      console.error('❌ 假设分析失败:', err)
      setError('分析假设时出现问题，请重试')
      setFlowStage('questioning')
    } finally {
      setIsLoading(false)
    }
  }

  // 确认假设
  const confirmAssumption = () => {
    if (session && onClarificationComplete) {
      onClarificationComplete(session.refined_assumption)
    }
    setFlowStage('completed')
  }

  // 重新澄清
  const restartClarification = () => {
    setFlowStage('welcome')
    setCurrentQuestionIndex(0)
    setUserAnswers({})
    setCurrentAnswer('')
    setSession(null)
    setError(null)
  }

  // 编辑某个回答
  const editAnswer = (questionIndex: number) => {
    setCurrentQuestionIndex(questionIndex)
    setCurrentAnswer(userAnswers[GUIDING_QUESTIONS[questionIndex].field] || '')
    setFlowStage('questioning')
  }

  const currentQuestion = GUIDING_QUESTIONS[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / GUIDING_QUESTIONS.length) * 100

  return (
    <div className={`demand-clarification-flow ${className}`}>
      {/* 欢迎界面 */}
      {flowStage === 'welcome' && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl mb-2">
              AI假设澄清助手
            </CardTitle>
            <p className="text-gray-600">
              通过4个简单问题，帮助您明确创意的核心假设
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* 价值说明 */}
            <Alert className="border-blue-200 bg-blue-50">
              <Lightbulb className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>为什么需要澄清假设？</strong>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• 明确目标客户，避免盲目开发</li>
                  <li>• 识别真实痛点，确保产品价值</li>
                  <li>• 设计有效验证，降低失败风险</li>
                </ul>
              </AlertDescription>
            </Alert>

            {/* 流程预览 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {GUIDING_QUESTIONS.map((q, index) => {
                const Icon = q.icon
                return (
                  <div key={q.id} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                      <Icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <p className="text-xs font-medium text-gray-700">{q.title}</p>
                  </div>
                )
              })}
            </div>

            {/* 开始按钮 */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={startClarification}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                开始澄清假设
              </Button>
              {onSkip && (
                <Button
                  variant="outline"
                  onClick={onSkip}
                >
                  跳过，直接填表
                </Button>
              )}
            </div>

            <p className="text-xs text-center text-gray-500">
              预计用时：5-10分钟
            </p>
          </CardContent>
        </Card>
      )}

      {/* 问答界面 */}
      {flowStage === 'questioning' && (
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <Badge variant="outline">
                问题 {currentQuestionIndex + 1}/{GUIDING_QUESTIONS.length}
              </Badge>
              <div className="flex-1 mx-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* 问题展示 */}
            <div className="flex items-start gap-4 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                {React.createElement(currentQuestion.icon, { className: "w-6 h-6 text-blue-600" })}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">{currentQuestion.title}</h3>
                <p className="text-gray-700">{currentQuestion.prompt}</p>
              </div>
            </div>

            {/* 提示 */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">💡 思考提示：</p>
              <ul className="space-y-1">
                {currentQuestion.hints.map((hint, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    {hint}
                  </li>
                ))}
              </ul>
            </div>

            {/* 回答输入 */}
            <div>
              <label className="block text-sm font-medium mb-2">您的回答：</label>
              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="请输入您的想法..."
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                autoFocus
              />
              {error && (
                <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  {error}
                </p>
              )}
            </div>

            {/* 已回答问题列表 */}
            {currentQuestionIndex > 0 && (
              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-3 text-gray-700">已回答的问题：</p>
                <div className="space-y-2">
                  {GUIDING_QUESTIONS.slice(0, currentQuestionIndex).map((q, index) => (
                    <div key={q.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 flex-1">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700">{q.title}</p>
                          <p className="text-xs text-gray-500 truncate">{userAnswers[q.field]}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editAnswer(index)}
                        className="flex-shrink-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex justify-between gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  if (currentQuestionIndex > 0) {
                    setCurrentQuestionIndex(currentQuestionIndex - 1)
                    setCurrentAnswer(userAnswers[GUIDING_QUESTIONS[currentQuestionIndex - 1].field] || '')
                    setError(null)
                  } else {
                    setFlowStage('welcome')
                  }
                }}
              >
                {currentQuestionIndex > 0 ? '上一题' : '返回'}
              </Button>

              <Button
                onClick={handleAnswerSubmit}
                disabled={!currentAnswer.trim()}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                {currentQuestionIndex < GUIDING_QUESTIONS.length - 1 ? (
                  <>
                    下一题
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    分析假设
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 分析中界面 */}
      {flowStage === 'analyzing' && (
        <Card className="max-w-2xl mx-auto">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI正在分析您的假设...</h3>
            <p className="text-gray-600">
              评估清晰度、具体性和可测量性
            </p>
          </CardContent>
        </Card>
      )}

      {/* 假设总结界面 */}
      {flowStage === 'summary' && session && (
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-500" />
                假设分析完成
              </CardTitle>
              <Badge
                variant={session.confidence > 0.7 ? 'default' : 'secondary'}
                className={session.confidence > 0.7 ? 'bg-green-500' : 'bg-yellow-500'}
              >
                置信度: {Math.round(session.confidence * 100)}%
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* 假设总结 */}
            <div className="space-y-4">
              <h3 className="font-semibold">📋 您的核心假设：</h3>

              {session.refined_assumption.targetCustomer && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm text-blue-900 mb-1">目标客户</p>
                      <p className="text-sm text-gray-700">{session.refined_assumption.targetCustomer}</p>
                    </div>
                  </div>
                </div>
              )}

              {session.refined_assumption.customerPainPoint && (
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm text-red-900 mb-1">客户痛点</p>
                      <p className="text-sm text-gray-700">{session.refined_assumption.customerPainPoint}</p>
                    </div>
                  </div>
                </div>
              )}

              {session.refined_assumption.problemScenario && (
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm text-purple-900 mb-1">问题场景</p>
                      <p className="text-sm text-gray-700">{session.refined_assumption.problemScenario}</p>
                    </div>
                  </div>
                </div>
              )}

              {session.refined_assumption.solutionValue && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm text-green-900 mb-1">解决方案价值</p>
                      <p className="text-sm text-gray-700">{session.refined_assumption.solutionValue}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 分析结果 */}
            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-3">📊 分析结果：</h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{session.analysis.clarity}/10</p>
                  <p className="text-xs text-gray-600 mt-1">清晰度</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{session.analysis.specificity}/10</p>
                  <p className="text-xs text-gray-600 mt-1">具体性</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{session.analysis.measurability}/10</p>
                  <p className="text-xs text-gray-600 mt-1">可测量性</p>
                </div>
              </div>

              {/* 建议 */}
              {session.analysis.suggestions.length > 0 && (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <Lightbulb className="h-4 w-4 text-yellow-600" />
                  <AlertDescription>
                    <p className="font-medium text-yellow-900 mb-2">💡 改进建议：</p>
                    <ul className="space-y-1 text-sm text-yellow-800">
                      {session.analysis.suggestions.slice(0, 3).map((suggestion, index) => (
                        <li key={index}>• {suggestion}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={restartClarification}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                重新澄清
              </Button>

              <Button
                onClick={confirmAssumption}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                <ThumbsUp className="w-4 h-4 mr-2" />
                确认假设，继续填表
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 完成界面 */}
      {flowStage === 'completed' && (
        <Card className="max-w-2xl mx-auto">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">假设澄清完成！</h3>
            <p className="text-gray-600">
              现在让我们填写详细的验证表单
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
