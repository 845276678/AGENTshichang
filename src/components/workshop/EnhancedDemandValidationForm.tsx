/**
 * 增强版需求验证表单组件
 *
 * 集成AI假设澄清功能：
 * 1. 实时检测假设的模糊性
 * 2. 自动触发澄清对话
 * 3. 根据澄清结果完善表单
 * 4. 提供智能建议和验证方法推荐
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
  HelpCircle,
  Users,
  Search,
  TrendingUp
} from 'lucide-react'

// 导入原有组件
import DemandValidationForm from './forms/DemandValidationForm'
import DemandValidationClarificationDialog from './DemandValidationClarificationDialog'

// 导入类型和服务
import {
  type DemandValidationAssumption,
  type AssumptionAnalysis,
  demandValidationClarificationService
} from '@/lib/workshop/demand-validation-clarification'
import { type DemandValidationForm as DemandValidationFormType } from '@/lib/workshop/form-schemas'
import { type AgentId } from '@/lib/workshop/agent-prompts'

// 组件Props
interface EnhancedDemandValidationFormProps {
  sessionId: string
  initialData?: Partial<DemandValidationFormType>
  onStepChange?: (step: number) => void
  onDataChange?: (data: Partial<DemandValidationFormType>) => void
  onComplete?: (data: DemandValidationFormType) => void
  onAgentInteraction?: (agentId: AgentId, fieldName: string, value: any) => void
  className?: string
}

// 智能检测状态
interface SmartAnalysis {
  needsClarification: boolean
  confidence: number
  suggestions: string[]
  clarity: number
  specificity: number
  measurability: number
}

export default function EnhancedDemandValidationForm({
  sessionId,
  initialData = {},
  onStepChange,
  onDataChange,
  onComplete,
  onAgentInteraction,
  className = ''
}: EnhancedDemandValidationFormProps) {
  // 状态管理
  const [showClarificationDialog, setShowClarificationDialog] = useState(false)
  const [currentAssumption, setCurrentAssumption] = useState<DemandValidationAssumption>({})
  const [smartAnalysis, setSmartAnalysis] = useState<SmartAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [clarificationCompleted, setClarificationCompleted] = useState(false)
  const [enhancedFormData, setEnhancedFormData] = useState<Partial<DemandValidationFormType>>(initialData)

  // 监听表单数据变化，智能检测是否需要澄清
  useEffect(() => {
    const { customerDefinition, scenarioDescription, valueValidation } = enhancedFormData

    if (customerDefinition?.targetCustomerProfile ||
        scenarioDescription?.problemScenario ||
        valueValidation?.proposedSolution) {

      checkNeedsClarification({
        targetCustomer: customerDefinition?.targetCustomerProfile,
        customerPainPoint: customerDefinition?.customerPainPoints,
        problemScenario: scenarioDescription?.problemScenario,
        solutionValue: valueValidation?.proposedSolution,
        validationMethod: enhancedFormData.validationPlan?.validationMethods,
        successMetrics: valueValidation?.successMetrics,
        customerInteractionLevel: customerDefinition?.interactionFrequency,
        problemUrgency: scenarioDescription?.problemFrequency
      })
    }
  }, [enhancedFormData])

  // 检测是否需要澄清
  const checkNeedsClarification = useCallback(async (assumption: DemandValidationAssumption) => {
    if (clarificationCompleted) return

    setIsAnalyzing(true)
    try {
      // 使用澄清服务分析假设
      const session = await demandValidationClarificationService.startClarification(assumption)

      const needsClarification = session.confidence < 0.6 ||
                                session.analysis.clarity < 5 ||
                                session.analysis.missing_info.length > 3

      setSmartAnalysis({
        needsClarification,
        confidence: session.confidence,
        suggestions: session.analysis.suggestions,
        clarity: session.analysis.clarity,
        specificity: session.analysis.specificity,
        measurability: session.analysis.measurability
      })

      setCurrentAssumption(assumption)

      // 如果需要澄清且用户输入了足够内容，可以建议启动澄清
      const hasSubstantialContent = [
        assumption.targetCustomer,
        assumption.customerPainPoint,
        assumption.problemScenario,
        assumption.solutionValue
      ].some(field => field && field.length > 30)

      if (needsClarification && hasSubstantialContent) {
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
  const handleClarificationComplete = useCallback((
    refinedAssumption: DemandValidationAssumption,
    analysis: AssumptionAnalysis
  ) => {
    // 将澄清结果应用到表单
    const updatedFormData = demandValidationClarificationService.convertToFormData(
      '', // sessionId会在服务中处理
      enhancedFormData
    )

    // 手动应用澄清结果
    const finalFormData = {
      ...updatedFormData,
      customerDefinition: {
        ...updatedFormData.customerDefinition,
        targetCustomerProfile: refinedAssumption.targetCustomer || updatedFormData.customerDefinition?.targetCustomerProfile || '',
        customerPainPoints: refinedAssumption.customerPainPoint || updatedFormData.customerDefinition?.customerPainPoints || '',
        interactionFrequency: refinedAssumption.customerInteractionLevel || updatedFormData.customerDefinition?.interactionFrequency || 5
      },
      scenarioDescription: {
        ...updatedFormData.scenarioDescription,
        problemScenario: refinedAssumption.problemScenario || updatedFormData.scenarioDescription?.problemScenario || '',
        problemFrequency: refinedAssumption.problemUrgency || updatedFormData.scenarioDescription?.problemFrequency || 5
      },
      valueValidation: {
        ...updatedFormData.valueValidation,
        proposedSolution: refinedAssumption.solutionValue || updatedFormData.valueValidation?.proposedSolution || '',
        successMetrics: refinedAssumption.successMetrics || updatedFormData.valueValidation?.successMetrics || ''
      },
      validationPlan: {
        ...updatedFormData.validationPlan,
        validationMethods: refinedAssumption.validationMethod || updatedFormData.validationPlan?.validationMethods || ''
      }
    }

    setEnhancedFormData(finalFormData)
    setClarificationCompleted(true)
    setShowClarificationDialog(false)

    // 更新智能分析结果
    setSmartAnalysis({
      needsClarification: false,
      confidence: analysis.clarity / 10,
      suggestions: analysis.suggestions,
      clarity: analysis.clarity,
      specificity: analysis.specificity,
      measurability: analysis.measurability
    })

    // 通知父组件
    if (onDataChange) {
      onDataChange(finalFormData)
    }
  }, [enhancedFormData, onDataChange])

  // 处理表单数据变化
  const handleFormDataChange = useCallback((newData: Partial<DemandValidationFormType>) => {
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

    const { needsClarification, confidence, suggestions, clarity, specificity, measurability } = smartAnalysis

    if (needsClarification) {
      return (
        <Alert className="mb-6 border-amber-200 bg-amber-50">
          <Brain className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium mb-2">💡 AI建议优化你的需求验证假设</p>
                <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                  <span>清晰度: {clarity}/10</span>
                  <span>具体性: {specificity}/10</span>
                  <span>可测量性: {measurability}/10</span>
                </div>
                <p className="text-sm">
                  置信度: {Math.round(confidence * 100)}%，建议通过AI对话进一步完善假设描述。
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
            <p className="font-medium">✨ 假设已优化完成</p>
            <p className="text-sm">
              通过AI对话，你的需求验证假设已经更加清晰和具体，可以继续填写表单。
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
          <span>AI正在分析你的需求验证假设...</span>
        </div>
      )
    }

    if (smartAnalysis && !smartAnalysis.needsClarification) {
      return (
        <div className="flex items-center gap-2 text-sm text-green-600 mb-4">
          <CheckCircle className="w-4 h-4" />
          <span>假设质量良好，可以继续填写</span>
          <Badge variant="outline" className="text-xs">
            {Math.round(smartAnalysis.confidence * 100)}%
          </Badge>
        </div>
      )
    }

    return null
  }

  return (
    <div className={`enhanced-demand-validation-form ${className}`}>
      {/* 智能提示区域 */}
      {renderSmartHints()}

      {/* 分析状态 */}
      {renderAnalysisStatus()}

      {/* 澄清对话弹窗 */}
      {showClarificationDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full">
            <DemandValidationClarificationDialog
              initialAssumption={currentAssumption}
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
          <div className="grid md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              onClick={startClarification}
              disabled={!currentAssumption.targetCustomer && !currentAssumption.problemScenario}
              className="flex items-center gap-2 h-auto p-4 flex-col"
            >
              <MessageCircle className="w-5 h-5 text-blue-600" />
              <div className="text-center">
                <div className="font-medium text-sm">假设澄清</div>
                <div className="text-xs text-gray-600">完善需求假设</div>
              </div>
            </Button>

            <Button
              variant="outline"
              disabled
              className="flex items-center gap-2 h-auto p-4 flex-col opacity-50"
            >
              <Users className="w-5 h-5 text-green-600" />
              <div className="text-center">
                <div className="font-medium text-sm">访谈指导</div>
                <div className="text-xs text-gray-600">即将推出</div>
              </div>
            </Button>

            <Button
              variant="outline"
              disabled
              className="flex items-center gap-2 h-auto p-4 flex-col opacity-50"
            >
              <Search className="w-5 h-5 text-purple-600" />
              <div className="text-center">
                <div className="font-medium text-sm">实验设计</div>
                <div className="text-xs text-gray-600">即将推出</div>
              </div>
            </Button>

            <Button
              variant="outline"
              disabled
              className="flex items-center gap-2 h-auto p-4 flex-col opacity-50"
            >
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <div className="text-center">
                <div className="font-medium text-sm">结果分析</div>
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

      {/* 原有的需求验证表单 */}
      <DemandValidationForm
        sessionId={sessionId}
        initialData={enhancedFormData}
        onStepChange={onStepChange}
        onDataChange={handleFormDataChange}
        onComplete={onComplete}
        onAgentInteraction={onAgentInteraction || (() => {})}
      />
    </div>
  )
}