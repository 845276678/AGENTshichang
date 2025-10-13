/**
 * 需求验证实验室表单组件
 *
 * 实现需求验证工作坊的完整表单功能，包括：
 * - 4个步骤的表单内容
 * - 实时验证和错误处理
 * - Agent集成和智能反馈
 * - 进度追踪和步骤导航
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Users,
  Target,
  Zap,
  ClipboardList,
  Loader2,
  Bot,
  AlertTriangle
} from 'lucide-react'

// 导入Schema和组件
import {
  DemandValidationFormSchema,
  type DemandValidationForm,
  WORKSHOP_STEPS
} from '@/lib/workshop/form-schemas'
import {
  WorkshopInput,
  WorkshopTextarea,
  WorkshopSelect,
  WorkshopSlider,
  WorkshopDynamicList,
  WorkshopNumberInput,
  WorkshopFormSection
} from './WorkshopFormComponents'

// 导入Agent相关
import AgentConversation from '@/components/workshop/AgentConversation'
import {
  type AgentId,
  getRecommendedAgents
} from '@/lib/workshop/agent-prompts'

// 组件Props接口
interface DemandValidationFormProps {
  sessionId: string
  initialData?: Partial<DemandValidationForm>
  onStepChange?: (step: number) => void
  onDataChange?: (data: Partial<DemandValidationForm>) => void
  onComplete?: (data: DemandValidationForm) => void
  onAgentInteraction?: (agentId: AgentId, fieldName: string, value: any) => void
  className?: string
}

// 使用频率选项
const FREQUENCY_OPTIONS = [
  { value: 'daily', label: '每天', description: '几乎每天都会使用' },
  { value: 'weekly', label: '每周', description: '每周使用几次' },
  { value: 'monthly', label: '每月', description: '每月使用几次' },
  { value: 'occasionally', label: '偶尔', description: '偶尔才会使用' }
]

// 验证方法选项
const VALIDATION_METHODS = [
  { value: 'interview', label: '用户访谈', description: '深度一对一访谈' },
  { value: 'survey', label: '问卷调研', description: '大规模问卷收集' },
  { value: 'mvp', label: 'MVP测试', description: '最小可行产品验证' },
  { value: 'landing_page', label: '着陆页测试', description: '着陆页转化率测试' },
  { value: 'prototype', label: '原型测试', description: '交互原型用户测试' }
]

// 步骤图标配置
const STEP_ICONS = {
  1: Users,
  2: Target,
  3: Zap,
  4: ClipboardList
}

export default function DemandValidationForm({
  sessionId,
  initialData = {},
  onStepChange,
  onDataChange,
  onComplete,
  onAgentInteraction,
  className = ''
}: DemandValidationFormProps) {
  // 表单状态
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid, isDirty },
    trigger
  } = useForm<DemandValidationForm>({
    resolver: zodResolver(DemandValidationFormSchema),
    defaultValues: {
      targetCustomer: {
        segment: '',
        painPoints: [],
        currentSolution: '',
        switchingCost: 5
      },
      demandScenario: {
        context: '',
        frequency: undefined,
        urgency: 5,
        willingnessToPay: 5
      },
      valueProposition: {
        coreValue: '',
        differentiation: '',
        measurementMetric: ''
      },
      validationPlan: {
        method: [],
        targetSampleSize: 20,
        successCriteria: '',
        timeline: ''
      },
      ...initialData
    },
    mode: 'onChange'
  })

  // 当前步骤状态
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Agent交互状态
  const [activeAgents, setActiveAgents] = useState<AgentId[]>([])
  const [showAgentPanels, setShowAgentPanels] = useState(false)

  // 监听表单数据变化
  const formData = watch()

  useEffect(() => {
    if (onDataChange) {
      onDataChange(formData)
    }
  }, [formData, onDataChange])

  // 获取工作坊步骤配置
  const workshopSteps = WORKSHOP_STEPS['demand-validation']

  // 验证当前步骤
  const validateCurrentStep = async (): Promise<boolean> => {
    const currentStepConfig = workshopSteps.find(step => step.id === currentStep)
    if (!currentStepConfig) return false

    const fieldsToValidate = currentStepConfig.fields
    const isStepValid = await trigger(fieldsToValidate as any)

    if (isStepValid && !completedSteps.includes(currentStep)) {
      setCompletedSteps(prev => [...prev, currentStep])
    }

    return isStepValid
  }

  // 步骤导航
  const goToStep = async (step: number) => {
    if (step < currentStep || await validateCurrentStep()) {
      setCurrentStep(step)
      if (onStepChange) {
        onStepChange(step)
      }

      // 更新推荐的Agent
      const recommendedAgents = getRecommendedAgents('demand-validation', step)
      setActiveAgents(recommendedAgents)
    }
  }

  const goToNextStep = async () => {
    if (currentStep < workshopSteps.length && await validateCurrentStep()) {
      goToStep(currentStep + 1)
    }
  }

  const goToPrevStep = () => {
    if (currentStep > 1) {
      goToStep(currentStep - 1)
    }
  }

  // 处理Agent反馈请求
  const handleAgentFeedback = (fieldName: string, value: any) => {
    if (onAgentInteraction && activeAgents.length > 0) {
      // 选择最相关的Agent给予反馈
      const primaryAgent = activeAgents[0]
      onAgentInteraction(primaryAgent, fieldName, value)
    }
  }

  // 表单提交
  const onSubmit = async (data: DemandValidationForm) => {
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      console.log('📝 需求验证表单提交:', data)

      if (onComplete) {
        await onComplete(data)
      }

      // 显示成功反馈
      console.log('✅ 需求验证工作坊完成！')

    } catch (error) {
      console.error('❌ 表单提交失败:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={`demand-validation-form ${className}`}>
      {/* 进度指示器 */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">需求验证实验室</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                通过科学的方法验证您的创意是否解决了真实需求
              </p>
            </div>
            <Badge variant="outline" className="text-sm">
              步骤 {currentStep}/{workshopSteps.length}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          {/* 步骤导航 */}
          <Tabs value={currentStep.toString()} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              {workshopSteps.map((step) => {
                const Icon = STEP_ICONS[step.id as keyof typeof STEP_ICONS]
                const isCompleted = completedSteps.includes(step.id)
                const isActive = currentStep === step.id

                return (
                  <TabsTrigger
                    key={step.id}
                    value={step.id.toString()}
                    onClick={() => goToStep(step.id)}
                    className={`flex items-center gap-2 ${
                      isCompleted ? 'text-green-600' :
                      isActive ? 'text-blue-600' : ''
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">{step.title}</span>
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 步骤1：目标客户定义 */}
        {currentStep === 1 && (
          <WorkshopFormSection
            title="步骤1: 目标客户定义"
            description="明确您的目标客户群体，了解他们的痛点和现有解决方案"
            isActive={currentStep === 1}
            isCompleted={completedSteps.includes(1)}
            error={errors.targetCustomer ? '请完整填写目标客户信息' : undefined}
          >
            {/* 客户细分 */}
            <Controller
              name="targetCustomer.segment"
              control={control}
              render={({ field }) => (
                <WorkshopTextarea
                  label="目标客户细分"
                  name="targetCustomer.segment"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.targetCustomer?.segment?.message}
                  hint="描述您的理想客户是谁，包括人口统计特征、职业、行为特点等"
                  required
                  maxLength={200}
                  onAgentFeedback={handleAgentFeedback}
                />
              )}
            />

            {/* 痛点列表 */}
            <Controller
              name="targetCustomer.painPoints"
              control={control}
              render={({ field }) => (
                <WorkshopDynamicList
                  label="客户痛点"
                  name="targetCustomer.painPoints"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.targetCustomer?.painPoints?.message}
                  hint="列出目标客户面临的主要问题和困扰"
                  required
                  maxItems={5}
                  minItems={1}
                  placeholder="输入一个痛点..."
                />
              )}
            />

            {/* 当前解决方案 */}
            <Controller
              name="targetCustomer.currentSolution"
              control={control}
              render={({ field }) => (
                <WorkshopTextarea
                  label="当前解决方案"
                  name="targetCustomer.currentSolution"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.targetCustomer?.currentSolution?.message}
                  hint="描述目标客户目前如何解决这些痛点，包括现有产品、服务或替代方案"
                  required
                  maxLength={300}
                  onAgentFeedback={handleAgentFeedback}
                />
              )}
            />

            {/* 切换成本 */}
            <Controller
              name="targetCustomer.switchingCost"
              control={control}
              render={({ field }) => (
                <WorkshopSlider
                  label="切换成本评估"
                  name="targetCustomer.switchingCost"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.targetCustomer?.switchingCost?.message}
                  hint="评估客户从现有解决方案切换到您的方案的难度"
                  min={1}
                  max={10}
                  labels={['很容易', '一般', '很困难']}
                />
              )}
            />
          </WorkshopFormSection>
        )}

        {/* 步骤2：需求场景描述 */}
        {currentStep === 2 && (
          <WorkshopFormSection
            title="步骤2: 需求场景描述"
            description="详细描述客户使用您产品的具体场景和频率"
            isActive={currentStep === 2}
            isCompleted={completedSteps.includes(2)}
            error={errors.demandScenario ? '请完整填写需求场景信息' : undefined}
          >
            {/* 使用场景 */}
            <Controller
              name="demandScenario.context"
              control={control}
              render={({ field }) => (
                <WorkshopTextarea
                  label="使用场景描述"
                  name="demandScenario.context"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.demandScenario?.context?.message}
                  hint="描述客户在什么情况下、什么时候会需要使用您的产品或服务"
                  required
                  maxLength={500}
                  minRows={4}
                  onAgentFeedback={handleAgentFeedback}
                />
              )}
            />

            {/* 使用频率 */}
            <Controller
              name="demandScenario.frequency"
              control={control}
              render={({ field }) => (
                <WorkshopSelect
                  label="使用频率"
                  name="demandScenario.frequency"
                  value={field.value || ''}
                  onChange={field.onChange}
                  error={errors.demandScenario?.frequency?.message}
                  hint="客户多久会遇到这个需求一次？"
                  required
                  options={FREQUENCY_OPTIONS}
                />
              )}
            />

            {/* 需求紧迫性 */}
            <Controller
              name="demandScenario.urgency"
              control={control}
              render={({ field }) => (
                <WorkshopSlider
                  label="需求紧迫性"
                  name="demandScenario.urgency"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.demandScenario?.urgency?.message}
                  hint="当客户遇到这个问题时，解决的紧迫程度如何？"
                  min={1}
                  max={10}
                  labels={['不紧急', '一般', '非常紧急']}
                />
              )}
            />

            {/* 付费意愿 */}
            <Controller
              name="demandScenario.willingnessToPay"
              control={control}
              render={({ field }) => (
                <WorkshopSlider
                  label="付费意愿"
                  name="demandScenario.willingnessToPay"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.demandScenario?.willingnessToPay?.message}
                  hint="客户为了解决这个问题，愿意付费的程度如何？"
                  min={1}
                  max={10}
                  labels={['不愿付费', '可以接受', '非常愿意']}
                />
              )}
            />
          </WorkshopFormSection>
        )}

        {/* 步骤3：价值验证 */}
        {currentStep === 3 && (
          <WorkshopFormSection
            title="步骤3: 价值验证"
            description="明确您的核心价值主张和差异化优势"
            isActive={currentStep === 3}
            isCompleted={completedSteps.includes(3)}
            error={errors.valueProposition ? '请完整填写价值主张信息' : undefined}
          >
            {/* 核心价值 */}
            <Controller
              name="valueProposition.coreValue"
              control={control}
              render={({ field }) => (
                <WorkshopTextarea
                  label="核心价值主张"
                  name="valueProposition.coreValue"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.valueProposition?.coreValue?.message}
                  hint="用一段话说明您的产品/服务能为客户创造什么独特价值"
                  required
                  maxLength={300}
                  minRows={3}
                  onAgentFeedback={handleAgentFeedback}
                />
              )}
            />

            {/* 差异化优势 */}
            <Controller
              name="valueProposition.differentiation"
              control={control}
              render={({ field }) => (
                <WorkshopTextarea
                  label="差异化优势"
                  name="valueProposition.differentiation"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.valueProposition?.differentiation?.message}
                  hint="相比现有解决方案，您的方案有什么独特优势？"
                  required
                  maxLength={300}
                  minRows={3}
                  onAgentFeedback={handleAgentFeedback}
                />
              )}
            />

            {/* 衡量指标 */}
            <Controller
              name="valueProposition.measurementMetric"
              control={control}
              render={({ field }) => (
                <WorkshopTextarea
                  label="价值衡量指标"
                  name="valueProposition.measurementMetric"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.valueProposition?.measurementMetric?.message}
                  hint="如何量化和证明您创造的价值？用什么指标来衡量？"
                  required
                  maxLength={200}
                  onAgentFeedback={handleAgentFeedback}
                />
              )}
            />
          </WorkshopFormSection>
        )}

        {/* 步骤4：验证计划 */}
        {currentStep === 4 && (
          <WorkshopFormSection
            title="步骤4: 验证计划"
            description="制定具体的需求验证计划和成功标准"
            isActive={currentStep === 4}
            isCompleted={completedSteps.includes(4)}
            error={errors.validationPlan ? '请完整填写验证计划' : undefined}
          >
            {/* 验证方法 */}
            <div>
              <label className="block text-sm font-medium mb-3">
                验证方法 <span className="text-red-500">*</span>
              </label>
              <Controller
                name="validationPlan.method"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {VALIDATION_METHODS.map((method) => (
                      <label
                        key={method.value}
                        className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={field.value.includes(method.value as any)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              field.onChange([...field.value, method.value])
                            } else {
                              field.onChange(field.value.filter((v: string) => v !== method.value))
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{method.label}</div>
                          <div className="text-xs text-gray-500">{method.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              />
              {errors.validationPlan?.method && (
                <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  {errors.validationPlan.method.message}
                </p>
              )}
            </div>

            {/* 目标样本量 */}
            <Controller
              name="validationPlan.targetSampleSize"
              control={control}
              render={({ field }) => (
                <WorkshopNumberInput
                  label="目标样本量"
                  name="validationPlan.targetSampleSize"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.validationPlan?.targetSampleSize?.message}
                  hint="计划验证多少个目标用户？"
                  min={5}
                  max={1000}
                  suffix="人"
                />
              )}
            />

            {/* 成功标准 */}
            <Controller
              name="validationPlan.successCriteria"
              control={control}
              render={({ field }) => (
                <WorkshopTextarea
                  label="成功标准"
                  name="validationPlan.successCriteria"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.validationPlan?.successCriteria?.message}
                  hint="什么样的结果表明需求验证成功？设定具体的数字目标"
                  required
                  maxLength={300}
                  onAgentFeedback={handleAgentFeedback}
                />
              )}
            />

            {/* 时间计划 */}
            <Controller
              name="validationPlan.timeline"
              control={control}
              render={({ field }) => (
                <WorkshopInput
                  label="验证时间计划"
                  name="validationPlan.timeline"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.validationPlan?.timeline?.message}
                  hint="预计何时完成验证？例如：2周内、1个月内"
                  required
                  maxLength={200}
                  placeholder="例如：4周内完成所有验证"
                />
              )}
            />
          </WorkshopFormSection>
        )}

        {/* 导航按钮 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <Button
                type="button"
                variant="outline"
                onClick={goToPrevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                上一步
              </Button>

              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAgentPanels(!showAgentPanels)}
                  className="flex items-center gap-2"
                >
                  <Bot className="w-4 h-4" />
                  AI助手 ({activeAgents.length})
                </Button>

                {currentStep < workshopSteps.length ? (
                  <Button
                    type="button"
                    onClick={goToNextStep}
                    className="flex items-center gap-2"
                  >
                    下一步
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={!isValid || isSubmitting}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    完成工作坊
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Agent助手面板 */}
      {showAgentPanels && activeAgents.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">AI专家助手</h3>
              <Button
                variant="ghost"
                onClick={() => setShowAgentPanels(false)}
              >
                关闭
              </Button>
            </div>

            <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
              {activeAgents.map((agentId) => (
                <AgentConversation
                  key={agentId}
                  workshopId="demand-validation"
                  agentId={agentId}
                  sessionId={sessionId}
                  currentStep={currentStep}
                  totalSteps={workshopSteps.length}
                  formData={formData}
                  isRecommended={true}
                  relatedField={workshopSteps.find(s => s.id === currentStep)?.fields[0]}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}