/**
 * 工作坊会话管理器组件
 *
 * 提供完整的工作坊会话管理功能：
 * - 会话状态管理和持久化
 * - 表单数据同步和验证
 * - Agent对话集成
 * - 进度跟踪和可视化
 * - 自动保存和恢复
 */

'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertCircle,
  CheckCircle,
  Save,
  Loader2,
  RefreshCw,
  Play,
  Pause,
  Archive,
  Settings,
  Bot
} from 'lucide-react'

// 导入相关组件和Hooks
import WorkshopProgress from './WorkshopProgress'
import DemandValidationForm from './forms/DemandValidationForm'
import AgentConversation from './AgentConversation'
import {
  useWorkshopSession,
  type WorkshopId,
  type WorkshopSession
} from '@/hooks/useWorkshopSession'
import { useAgentChat } from '@/hooks/useAgentChat'
import {
  type DemandValidationForm as DemandValidationFormType,
  type WorkshopFormData,
  calculateFormProgress
} from '@/lib/workshop/form-schemas'
import {
  type AgentId,
  getRecommendedAgents
} from '@/lib/workshop/agent-prompts'

// 组件Props接口
export interface WorkshopSessionManagerProps {
  workshopId: WorkshopId
  userId?: string
  initialStep?: number
  onSessionComplete?: (session: WorkshopSession, formData: any) => void
  onSessionAbandoned?: (session: WorkshopSession) => void
  className?: string
}

// 渲染工作坊表单的工厂函数
function renderWorkshopForm(
  workshopId: WorkshopId,
  sessionId: string,
  initialData: any,
  onStepChange: (step: number) => void,
  onDataChange: (data: any) => void,
  onComplete: (data: any) => void,
  onAgentInteraction: (agentId: AgentId, fieldName: string, value: any) => void
) {
  const commonProps = {
    sessionId,
    initialData,
    onStepChange,
    onDataChange,
    onComplete,
    onAgentInteraction
  }

  switch (workshopId) {
    case 'demand-validation':
      return (
        <DemandValidationForm
          {...commonProps}
          initialData={initialData as Partial<DemandValidationFormType>}
        />
      )

    case 'mvp-builder':
      // TODO: 实现MVP构建表单
      return (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">MVP构建工作坊</h3>
          <p className="text-gray-600">即将推出...</p>
        </div>
      )

    case 'growth-hacking':
      // TODO: 实现增长黑客表单
      return (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">增长黑客训练营</h3>
          <p className="text-gray-600">即将推出...</p>
        </div>
      )

    case 'profit-model':
      // TODO: 实现商业模式表单
      return (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">商业模式设计</h3>
          <p className="text-gray-600">即将推出...</p>
        </div>
      )

    default:
      return (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">未知工作坊类型</h3>
          <p className="text-gray-600">无法加载工作坊内容</p>
        </div>
      )
  }
}

export default function WorkshopSessionManager({
  workshopId,
  userId = 'anonymous',
  initialStep = 1,
  onSessionComplete,
  onSessionAbandoned,
  className = ''
}: WorkshopSessionManagerProps) {
  // 会话管理Hook
  const {
    session,
    isLoading: isSessionLoading,
    isSaving,
    error: sessionError,
    hasUnsavedChanges,
    lastSaveAt,
    saveSession,
    updateFormData,
    updateCurrentStep,
    completeStep,
    addConversationMessage,
    completeWorkshop,
    refreshSession
  } = useWorkshopSession({
    workshopId,
    userId,
    autoSave: true,
    saveInterval: 8000, // 8秒自动保存
    onSessionLoaded: (loadedSession) => {
      console.log(`🎯 工作坊会话已加载:`, loadedSession.id)
      setActiveTab('form') // 默认显示表单
    },
    onProgressChange: (progress) => {
      console.log(`📈 进度更新: ${progress}%`)
    },
    onStepComplete: (step) => {
      console.log(`✅ 步骤 ${step} 完成`)
    },
    onSessionComplete: (completedSession) => {
      console.log(`🎉 工作坊完成:`, completedSession.id)
      onSessionComplete?.(completedSession, completedSession.formData)
    }
  })

  // Agent对话Hook
  const {
    sendMessage: sendAgentMessage,
    validateField,
    getInspiration,
    getCaseStudy,
    getConversation,
    isAgentLoading,
    getAgentError
  } = useAgentChat({
    workshopId,
    sessionId: session?.id || '',
    currentStep: session?.currentStep || 1,
    totalSteps: 4, // 根据工作坊类型调整
    formData: session?.formData || {},
    onMessageReceived: (message) => {
      // 将Agent消息保存到会话历史
      addConversationMessage(message)
    }
  })

  // 本地状态
  const [activeTab, setActiveTab] = useState<'form' | 'progress' | 'agents'>('form')
  const [recommendedAgents, setRecommendedAgents] = useState<AgentId[]>([])
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)

  // 更新推荐Agent
  useEffect(() => {
    if (session) {
      const agents = getRecommendedAgents(workshopId, session.currentStep)
      setRecommendedAgents(agents)
    }
  }, [workshopId, session?.currentStep])

  // 处理表单步骤变化
  const handleStepChange = useCallback((step: number) => {
    updateCurrentStep(step)
    console.log(`📍 切换到步骤: ${step}`)
  }, [updateCurrentStep])

  // 处理表单数据变化
  const handleFormDataChange = useCallback((newData: any) => {
    updateFormData(newData)

    // 检查步骤完成情况
    const progress = calculateFormProgress(workshopId, newData)
    if (progress >= 25 * session?.currentStep!) {
      completeStep(session?.currentStep || 1)
    }
  }, [updateFormData, workshopId, session?.currentStep, completeStep])

  // 处理表单完成
  const handleFormComplete = useCallback(async (formData: any) => {
    try {
      console.log(`🎯 工作坊表单提交:`, formData)

      const success = await completeWorkshop()
      if (success) {
        setShowSaveConfirm(true)
        setTimeout(() => setShowSaveConfirm(false), 3000)
      }
    } catch (error) {
      console.error('❌ 完成工作坊失败:', error)
    }
  }, [completeWorkshop])

  // 处理Agent交互
  const handleAgentInteraction = useCallback(async (
    agentId: AgentId,
    fieldName: string,
    value: any
  ) => {
    try {
      await validateField(agentId, fieldName, value)
    } catch (error) {
      console.error('❌ Agent交互失败:', error)
    }
  }, [validateField])

  // 处理进度点击
  const handleProgressStepClick = useCallback((step: number) => {
    handleStepChange(step)
    setActiveTab('form')
  }, [handleStepChange])

  // 手动保存
  const handleManualSave = useCallback(async () => {
    const success = await saveSession()
    if (success) {
      setShowSaveConfirm(true)
      setTimeout(() => setShowSaveConfirm(false), 2000)
    }
  }, [saveSession])

  // 重置工作坊
  const handleResetWorkshop = useCallback(async () => {
    if (window.confirm('确定要重置工作坊进度吗？所有数据将被清除！')) {
      await refreshSession()
    }
  }, [refreshSession])

  // 暂停工作坊
  const handlePauseWorkshop = useCallback(async () => {
    if (session) {
      await saveSession({ status: 'ABANDONED' })
      onSessionAbandoned?.(session)
    }
  }, [session, saveSession, onSessionAbandoned])

  // 加载状态
  if (isSessionLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">加载工作坊会话...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // 错误状态
  if (sessionError) {
    return (
      <Card className={className}>
        <CardContent className="py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {sessionError}
            </AlertDescription>
          </Alert>
          <div className="mt-4 flex gap-2">
            <Button onClick={refreshSession} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              重试
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // 无会话状态
  if (!session) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">无法加载工作坊会话</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`workshop-session-manager space-y-6 ${className}`}>
      {/* 成功保存提示 */}
      {showSaveConfirm && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            工作坊进度已成功保存！
          </AlertDescription>
        </Alert>
      )}

      {/* 主要标签页 */}
      <Tabs value={activeTab} onValueChange={setActiveTab as any}>
        <div className="flex justify-between items-center">
          <TabsList className="grid w-auto grid-cols-3">
            <TabsTrigger value="form">工作坊表单</TabsTrigger>
            <TabsTrigger value="progress">进度跟踪</TabsTrigger>
            <TabsTrigger value="agents" className="relative">
              AI助手
              {recommendedAgents.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
              )}
            </TabsTrigger>
          </TabsList>

          {/* 操作按钮 */}
          <div className="flex gap-2">
            {hasUnsavedChanges && (
              <Button
                size="sm"
                onClick={handleManualSave}
                disabled={isSaving}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {isSaving ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                ) : (
                  <Save className="w-3 h-3 mr-1" />
                )}
                保存
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={handlePauseWorkshop}
              disabled={isSaving}
            >
              <Pause className="w-3 h-3 mr-1" />
              暂停
            </Button>
          </div>
        </div>

        {/* 表单内容 */}
        <TabsContent value="form" className="mt-6">
          {renderWorkshopForm(
            workshopId,
            session.id,
            session.formData,
            handleStepChange,
            handleFormDataChange,
            handleFormComplete,
            handleAgentInteraction
          )}
        </TabsContent>

        {/* 进度跟踪 */}
        <TabsContent value="progress" className="mt-6">
          <WorkshopProgress
            session={session}
            isLoading={isSaving}
            isSaving={isSaving}
            hasUnsavedChanges={hasUnsavedChanges}
            lastSaveAt={lastSaveAt}
            onStepClick={handleProgressStepClick}
            onSaveSession={handleManualSave}
            onResetProgress={handleResetWorkshop}
          />
        </TabsContent>

        {/* AI助手面板 */}
        <TabsContent value="agents" className="mt-6">
          <div className="grid gap-6">
            {recommendedAgents.length > 0 ? (
              recommendedAgents.map((agentId) => (
                <AgentConversation
                  key={agentId}
                  workshopId={workshopId}
                  agentId={agentId}
                  sessionId={session.id}
                  currentStep={session.currentStep}
                  totalSteps={4}
                  formData={session.formData}
                  isRecommended={true}
                />
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">AI助手待命中</h3>
                  <p className="text-gray-600">
                    继续填写表单，AI助手会根据当前步骤为您提供专业建议
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}