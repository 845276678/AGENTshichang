/**
 * 增强版需求验证工作坊表单
 *
 * 架构设计：
 * 1. AI假设澄清阶段 - 通过对话帮助用户明确核心假设
 * 2. 双轨表单阶段 - 左侧AI助手持续指导，右侧结构化表单填写
 * 3. 自动预填充 - 基于澄清结果智能填充表单字段
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  CheckCircle,
  ArrowRight,
  Sparkles,
  Bot,
  FileText,
  Lightbulb
} from 'lucide-react'

// 导入组件
import DemandClarificationFlow from '../DemandClarificationFlow'
import DemandValidationForm from './DemandValidationForm'

// 导入类型和服务
import {
  type DemandValidationForm as DemandValidationFormType
} from '@/lib/workshop/form-schemas'
import {
  demandValidationClarificationService,
  type DemandValidationAssumption
} from '@/lib/workshop/demand-validation-clarification'
import { type AgentId } from '@/lib/workshop/agent-prompts'

// 组件Props接口
export interface EnhancedDemandValidationFormProps {
  sessionId: string
  initialData?: Partial<DemandValidationFormType>
  onStepChange?: (step: number) => void
  onDataChange?: (data: Partial<DemandValidationFormType>) => void
  onComplete?: (data: DemandValidationFormType) => void
  onAgentInteraction?: (agentId: AgentId, fieldName: string, value: any) => void
  className?: string
}

// 工作流阶段
type WorkflowStage = 'clarification' | 'form' | 'completed'

export default function EnhancedDemandValidationForm({
  sessionId,
  initialData = {},
  onStepChange,
  onDataChange,
  onComplete,
  onAgentInteraction,
  className = ''
}: EnhancedDemandValidationFormProps) {
  // 工作流状态
  const [workflowStage, setWorkflowStage] = useState<WorkflowStage>('clarification')
  const [clarificationSessionId, setClarificationSessionId] = useState<string | null>(null)
  const [clarifiedAssumption, setClarifiedAssumption] = useState<DemandValidationAssumption | null>(null)
  const [prefilledFormData, setPrefilledFormData] = useState<Partial<DemandValidationFormType>>(initialData)

  // 检查是否已有表单数据（用户返回继续填写）
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      // 如果已有表单数据，直接进入表单阶段
      const hasTargetCustomer = initialData.targetCustomer && Object.keys(initialData.targetCustomer).length > 0
      const hasDemandScenario = initialData.demandScenario && Object.keys(initialData.demandScenario).length > 0

      if (hasTargetCustomer || hasDemandScenario) {
        setWorkflowStage('form')
      }
    }
  }, [initialData])

  // 处理澄清完成
  const handleClarificationComplete = (assumption: DemandValidationAssumption) => {
    console.log('🎯 假设澄清完成:', assumption)
    setClarifiedAssumption(assumption)

    // 如果有会话ID，转换为表单数据
    if (clarificationSessionId) {
      const convertedFormData = demandValidationClarificationService.convertToFormData(
        clarificationSessionId,
        initialData
      )

      setPrefilledFormData(convertedFormData)
      console.log('📝 表单数据预填充:', convertedFormData)
    }

    // 进入表单阶段
    setWorkflowStage('form')
  }

  // 跳过澄清，直接填表
  const handleSkipClarification = () => {
    console.log('⏭️ 跳过假设澄清，直接填表')
    setWorkflowStage('form')
  }

  // 处理表单数据变化
  const handleFormDataChange = (newData: Partial<DemandValidationFormType>) => {
    setPrefilledFormData(newData)
    onDataChange?.(newData)
  }

  // 处理表单完成
  const handleFormComplete = (formData: DemandValidationFormType) => {
    console.log('✅ 需求验证表单完成:', formData)
    setWorkflowStage('completed')
    onComplete?.(formData)
  }

  return (
    <div className={`enhanced-demand-validation-form ${className}`}>
      {/* 进度指示器 */}
      <div className="mb-6">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {/* 阶段1: 假设澄清 */}
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              workflowStage === 'clarification'
                ? 'bg-blue-500 text-white'
                : 'bg-green-500 text-white'
            }`}>
              {workflowStage === 'clarification' ? (
                <Sparkles className="w-5 h-5" />
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium">假设澄清</p>
              <p className="text-xs text-gray-500">AI引导对话</p>
            </div>
          </div>

          {/* 连接线 */}
          <div className={`flex-1 h-1 mx-4 rounded ${
            workflowStage !== 'clarification' ? 'bg-green-500' : 'bg-gray-200'
          }`} />

          {/* 阶段2: 表单填写 */}
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              workflowStage === 'form'
                ? 'bg-blue-500 text-white'
                : workflowStage === 'completed'
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-400'
            }`}>
              {workflowStage === 'completed' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <FileText className="w-5 h-5" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium">详细表单</p>
              <p className="text-xs text-gray-500">结构化填写</p>
            </div>
          </div>
        </div>
      </div>

      {/* 假设澄清阶段 */}
      {workflowStage === 'clarification' && (
        <DemandClarificationFlow
          onClarificationComplete={handleClarificationComplete}
          onSkip={handleSkipClarification}
        />
      )}

      {/* 表单填写阶段 */}
      {workflowStage === 'form' && (
        <div className="space-y-4">
          {/* 澄清结果提示 */}
          {clarifiedAssumption && (
            <Alert className="border-blue-200 bg-blue-50">
              <Lightbulb className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <div className="flex items-start justify-between">
                  <div>
                    <strong>✨ AI已根据您的假设预填充部分表单</strong>
                    <p className="text-sm mt-1">您可以继续完善和调整各项内容</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setWorkflowStage('clarification')}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    重新澄清
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* 需求验证表单 */}
          <DemandValidationForm
            sessionId={sessionId}
            initialData={prefilledFormData}
            onStepChange={onStepChange}
            onDataChange={handleFormDataChange}
            onComplete={handleFormComplete}
            onAgentInteraction={onAgentInteraction}
          />
        </div>
      )}

      {/* 完成阶段 */}
      {workflowStage === 'completed' && (
        <Card className="max-w-2xl mx-auto">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">需求验证完成！</h3>
            <p className="text-gray-600 mb-6">
              您的需求验证方案已经准备就绪
            </p>
            <Button
              onClick={() => setWorkflowStage('form')}
              variant="outline"
            >
              返回查看表单
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
