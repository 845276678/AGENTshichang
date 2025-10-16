/**
 * 增强版工作坊表单组件
 *
 * 集成智能澄清功能：
 * 1. 实时检测用户输入的模糊性
 * 2. 自动触发澄清对话
 * 3. 根据澄清结果完善表单
 * 4. 提供智能建议和模板推荐
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Brain,
  Sparkles,
  MessageCircle,
  Target,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Loader2,
  HelpCircle
} from 'lucide-react'

// 导入原有组件
import MVPBuilderForm from './forms/MVPBuilderForm'
import IdeaClarificationDialog from './IdeaClarificationDialog'

// 导入类型和服务
import {
  type UserIdea,
  type IdeaAnalysis,
  ideaClarificationService
} from '@/lib/workshop/idea-clarification'
import { type MVPBuilderForm as MVPBuilderFormType } from '@/lib/workshop/form-schemas'

// 组件Props
interface EnhancedMVPBuilderFormProps {
  sessionId: string
  initialData?: Partial<MVPBuilderFormType>
  onStepChange?: (step: number) => void
  onDataChange?: (data: Partial<MVPBuilderFormType>) => void
  onComplete?: (data: MVPBuilderFormType) => void
  className?: string
}

// 智能检测状态
interface SmartAnalysis {
  needsClarification: boolean
  confidence: number
  suggestions: string[]
  clarity: number
}

export default function EnhancedMVPBuilderForm({
  sessionId,
  initialData = {},
  onStepChange,
  onDataChange,
  onComplete,
  className = ''
}: EnhancedMVPBuilderFormProps) {
  // 状态管理
  const [showClarificationDialog, setShowClarificationDialog] = useState(false)
  const [currentIdea, setCurrentIdea] = useState<UserIdea>({})
  const [smartAnalysis, setSmartAnalysis] = useState<SmartAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [clarificationCompleted, setClarificationCompleted] = useState(false)
  const [enhancedFormData, setEnhancedFormData] = useState<Partial<MVPBuilderFormType>>(initialData)

  // 监听表单数据变化，智能检测是否需要澄清
  useEffect(() => {
    const { problemStatement } = enhancedFormData
    if (problemStatement?.coreProblemSolved && problemStatement?.targetUser) {
      checkNeedsClarification({
        problemDescription: problemStatement.coreProblemSolved,
        targetUser: problemStatement.targetUser,
        existingSolutions: problemStatement.existingSolutions || [],
        painLevel: problemStatement.userPainLevel
      })
    }
  }, [enhancedFormData.problemStatement])

  // 检测是否需要澄清
  const checkNeedsClarification = useCallback(async (idea: UserIdea) => {
    if (clarificationCompleted) return

    setIsAnalyzing(true)
    try {
      // 使用澄清服务分析想法
      const session = await ideaClarificationService.startClarification(idea)

      const needsClarification = session.confidence < 0.7 ||
                                session.analysis.clarity < 6 ||
                                session.analysis.missing_info.length > 2

      setSmartAnalysis({
        needsClarification,
        confidence: session.confidence,
        suggestions: session.analysis.suggestions,
        clarity: session.analysis.clarity
      })

      setCurrentIdea(idea)

      // 如果需要澄清且用户输入了足够内容，建议启动澄清
      if (needsClarification && idea.problemDescription && idea.problemDescription.length > 50) {
        // 可以选择自动弹出或显示建议
        // setShowClarificationDialog(true)
      }
    } catch (error) {
      console.error('智能检测失败:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }, [clarificationCompleted])

  // 处理澄清完成
  const handleClarificationComplete = useCallback((refinedIdea: UserIdea, analysis: IdeaAnalysis) => {
    // 将澄清结果应用到表单
    const updatedFormData = {
      ...enhancedFormData,
      problemStatement: {
        ...enhancedFormData.problemStatement,
        coreProblemSolved: refinedIdea.problemDescription || enhancedFormData.problemStatement?.coreProblemSolved || '',
        targetUser: refinedIdea.targetUser || enhancedFormData.problemStatement?.targetUser || '',
        existingSolutions: refinedIdea.existingSolutions || enhancedFormData.problemStatement?.existingSolutions || [],
        userPainLevel: refinedIdea.painLevel || enhancedFormData.problemStatement?.userPainLevel || 5
      }
    }

    setEnhancedFormData(updatedFormData)
    setClarificationCompleted(true)
    setShowClarificationDialog(false)

    // 更新智能分析结果
    setSmartAnalysis({
      needsClarification: false,
      confidence: analysis.clarity / 10,
      suggestions: analysis.suggestions,
      clarity: analysis.clarity
    })

    // 通知父组件
    if (onDataChange) {
      onDataChange(updatedFormData)
    }
  }, [enhancedFormData, onDataChange])

  // 处理表单数据变化
  const handleFormDataChange = useCallback((newData: Partial<MVPBuilderFormType>) => {
    setEnhancedFormData(newData)
    if (onDataChange) {
      onDataChange(newData)
    }
  }, [onDataChange])

  // 启动澄清对话
  const startClarification = () => {
    setShowClarificationDialog(true)
  }

  // 获取智能提示组件
  const renderSmartHints = () => {
    if (!smartAnalysis || isAnalyzing) {
      return null
    }

    const { needsClarification, confidence, suggestions, clarity } = smartAnalysis

    if (needsClarification) {
      return (
        <Alert className="mb-6 border-amber-200 bg-amber-50">
          <Brain className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium mb-2">💡 AI建议优化你的想法</p>
                <p className="text-sm">
                  当前想法清晰度: {clarity}/10，建议通过AI对话进一步完善你的创意描述。
                </p>
                {suggestions.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium">优化建议:</p>
                    <ul className="text-xs list-disc list-inside mt-1">
                      {suggestions.slice(0, 2).map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <Button
                size="sm"
                onClick={startClarification}
                className="ml-4 bg-amber-600 hover:bg-amber-700"
              >
                <Sparkles className="w-4 h-4 mr-1" />
                AI优化
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )
    } else if (clarificationCompleted) {
      return (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <p className="font-medium">✨ 想法已优化完成</p>
            <p className="text-sm">
              通过AI对话，你的创意描述已经更加清晰和具体，可以继续填写表单。
            </p>
          </AlertDescription>
        </Alert>
      )
    }

    return null
  }

  // 渲染分析状态
  const renderAnalysisStatus = () => {
    if (isAnalyzing) {
      return (
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>AI正在分析你的想法...</span>
        </div>
      )
    }

    if (smartAnalysis && !smartAnalysis.needsClarification) {
      return (
        <div className="flex items-center gap-2 text-sm text-green-600 mb-4">
          <CheckCircle className="w-4 h-4" />
          <span>想法清晰度良好，可以继续填写</span>
          <Badge variant="outline" className="text-xs">
            {Math.round(smartAnalysis.confidence * 100)}%
          </Badge>
        </div>
      )
    }

    return null
  }

  return (
    <div className={`enhanced-mvp-builder-form ${className}`}>
      {/* 智能提示区域 */}
      {renderSmartHints()}

      {/* 分析状态 */}
      {renderAnalysisStatus()}

      {/* 澄清对话弹窗 */}
      {showClarificationDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full">
            <IdeaClarificationDialog
              initialIdea={currentIdea}
              onComplete={handleClarificationComplete}
              onCancel={() => setShowClarificationDialog(false)}
            />
          </div>
        </div>
      )}

      {/* 增强功能面板 */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-lg">AI智能助手</CardTitle>
            </div>
            <Badge variant="secondary" className="text-xs">
              {clarificationCompleted ? '已优化' : '待优化'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={startClarification}
              disabled={!currentIdea.problemDescription}
              className="flex items-center gap-2 h-auto p-4 flex-col"
            >
              <MessageCircle className="w-5 h-5 text-blue-600" />
              <div className="text-center">
                <div className="font-medium text-sm">智能澄清</div>
                <div className="text-xs text-gray-600">完善创意描述</div>
              </div>
            </Button>

            <Button
              variant="outline"
              disabled
              className="flex items-center gap-2 h-auto p-4 flex-col opacity-50"
            >
              <Target className="w-5 h-5 text-green-600" />
              <div className="text-center">
                <div className="font-medium text-sm">竞品分析</div>
                <div className="text-xs text-gray-600">即将推出</div>
              </div>
            </Button>

            <Button
              variant="outline"
              disabled
              className="flex items-center gap-2 h-auto p-4 flex-col opacity-50"
            >
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              <div className="text-center">
                <div className="font-medium text-sm">创意增强</div>
                <div className="text-xs text-gray-600">即将推出</div>
              </div>
            </Button>
          </div>

          {/* 智能提示 */}
          {smartAnalysis?.suggestions.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-sm text-blue-900">AI建议</span>
              </div>
              <ul className="text-sm text-blue-800 space-y-1">
                {smartAnalysis.suggestions.slice(0, 3).map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 原有的MVP表单 */}
      <MVPBuilderForm
        sessionId={sessionId}
        initialData={enhancedFormData}
        onStepChange={onStepChange}
        onDataChange={handleFormDataChange}
        onComplete={onComplete}
        onAgentInteraction={() => {}} // 暂时禁用Agent交互，由Enhanced组件处理
      />
    </div>
  )
}