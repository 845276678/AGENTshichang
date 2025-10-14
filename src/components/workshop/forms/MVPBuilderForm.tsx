/**
 * MVP构建工作坊表单组件（重新设计版）
 *
 * 基于优化后的Schema和中国合规要求
 * 包含5个步骤和智能化的合规检查
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Lightbulb,
  Target,
  TestTube,
  Settings,
  Shield,
  Loader2,
  Bot,
  AlertTriangle,
  AlertCircle,
  Info,
  Sparkles
} from 'lucide-react'

// 导入Schema和组件
import {
  MVPBuilderFormSchema,
  type MVPBuilderForm,
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

// 导入合规和模板相关
import {
  generateComplianceChecklist,
  assessComplianceRisk,
  type PlatformType,
  type TargetAudience,
  type DataCollection
} from '@/lib/workshop/china-compliance-guide'
import {
  MVP_TEMPLATES,
  recommendMVPTemplate,
  generateTemplateFormData
} from '@/lib/workshop/mvp-templates'

// 组件Props接口
interface MVPBuilderFormProps {
  sessionId: string
  initialData?: Partial<MVPBuilderForm>
  onStepChange?: (step: number) => void
  onDataChange?: (data: Partial<MVPBuilderForm>) => void
  onComplete?: (data: MVPBuilderForm) => void
  onAgentInteraction?: (agentId: AgentId, fieldName: string, value: any) => void
  className?: string
}

// 选项配置
const DEVELOPMENT_APPROACH_OPTIONS = [
  { value: 'no_code', label: '无代码开发', description: '使用无代码平台快速搭建' },
  { value: 'low_code', label: '低代码开发', description: '少量代码+平台工具' },
  { value: 'custom_development', label: '定制开发', description: '完全自主开发' },
  { value: 'outsourced', label: '外包开发', description: '委托第三方开发团队' }
]

const TESTING_APPROACH_OPTIONS = [
  { value: 'prototype', label: '原型测试', description: '制作可交互原型验证' },
  { value: 'landing_page', label: '着陆页测试', description: '通过Landing Page验证需求' },
  { value: 'wizard_of_oz', label: '绿野仙踪测试', description: '人工模拟自动化功能' },
  { value: 'concierge', label: '礼宾测试', description: '手动为用户提供服务' },
  { value: 'fake_door', label: '假门测试', description: '测试功能点击但未实现' }
]

const BUDGET_RANGE_OPTIONS = [
  { value: 'under_5k', label: '5千以下', description: '适合个人项目' },
  { value: '5k_to_20k', label: '5千-2万', description: '小型创业项目' },
  { value: '20k_to_50k', label: '2万-5万', description: '中等规模项目' },
  { value: 'over_50k', label: '5万以上', description: '大型商业项目' }
]

const PLATFORM_TYPE_OPTIONS = [
  { value: 'website', label: '网站', description: '传统Web网站' },
  { value: 'app', label: '手机APP', description: 'iOS/Android应用' },
  { value: 'mini_program', label: '小程序', description: '微信/支付宝小程序' },
  { value: 'h5', label: 'H5应用', description: '移动端网页应用' },
  { value: 'other', label: '其他', description: '其他平台类型' }
]

const TARGET_AUDIENCE_OPTIONS = [
  { value: 'b2c', label: 'B2C消费者', description: '面向个人消费者' },
  { value: 'b2b', label: 'B2B企业', description: '面向企业客户' },
  { value: 'c2c', label: 'C2C个人', description: '个人对个人服务' },
  { value: 'internal', label: '内部使用', description: '企业内部工具' }
]

const DATA_COLLECTION_OPTIONS = [
  { value: 'none', label: '不收集', description: '不收集任何个人信息' },
  { value: 'basic', label: '基础信息', description: '手机号、邮箱等基础信息' },
  { value: 'sensitive', label: '敏感信息', description: '位置、生物识别等敏感信息' },
  { value: 'personal_id', label: '身份信息', description: '身份证、银行卡等强身份信息' }
]

// 步骤图标配置
const STEP_ICONS = {
  1: Lightbulb,
  2: Target,
  3: TestTube,
  4: Settings,
  5: Shield
}

export default function MVPBuilderForm({
  sessionId,
  initialData = {},
  onStepChange,
  onDataChange,
  onComplete,
  onAgentInteraction,
  className = ''
}: MVPBuilderFormProps) {
  // 表单状态
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid, isDirty },
    trigger
  } = useForm<MVPBuilderForm>({
    resolver: zodResolver(MVPBuilderFormSchema),
    defaultValues: {
      problemStatement: {
        coreProblemSolved: '',
        targetUser: '',
        existingSolutions: [],
        userPainLevel: 5
      },
      coreFeatures: {
        mustHave: [],
        shouldHave: [],
        couldHave: [],
        featurePriorityMatrix: []
      },
      mvpValidation: {
        successMetrics: [],
        testingApproach: undefined,
        validationTimeline: '',
        budgetRange: undefined,
        targetUserCount: 50,
        keyAssumptions: []
      },
      implementationPlan: {
        developmentApproach: undefined,
        techStack: [],
        keyResources: [],
        firstMilestone: '',
        riskFactors: [],
        estimatedDevelopmentTime: undefined
      },
      chinaCompliance: {
        platformType: undefined,
        needsIcpFiling: true,
        needsBusinessLicense: false,
        involvePayment: false,
        targetAudience: undefined,
        dataCollection: undefined,
        complianceNotes: '',
        acknowledgeCompliance: false
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

  // MVP模板推荐状态
  const [recommendedTemplates, setRecommendedTemplates] = useState<any[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  // 合规检查状态
  const [complianceChecklist, setComplianceChecklist] = useState<any[]>([])
  const [complianceRisk, setComplianceRisk] = useState<any>(null)

  // 监听表单数据变化
  const formData = watch()

  useEffect(() => {
    if (onDataChange) {
      onDataChange(formData)
    }
  }, [formData, onDataChange])

  // 监听问题描述变化，推荐模板
  useEffect(() => {
    const { coreProblemSolved, targetUser } = formData.problemStatement || {}
    if (coreProblemSolved && targetUser) {
      const templates = recommendMVPTemplate({
        problemDescription: coreProblemSolved,
        targetUser: targetUser,
        budgetRange: formData.mvpValidation?.budgetRange || '',
        timeframe: formData.implementationPlan?.estimatedDevelopmentTime || ''
      })
      setRecommendedTemplates(templates)
    }
  }, [formData.problemStatement?.coreProblemSolved, formData.problemStatement?.targetUser])

  // 监听合规相关字段变化，更新合规检查
  useEffect(() => {
    const compliance = formData.chinaCompliance
    if (compliance?.platformType && compliance?.targetAudience && compliance?.dataCollection !== undefined) {
      const checklist = generateComplianceChecklist({
        platformType: compliance.platformType as PlatformType,
        targetAudience: compliance.targetAudience as TargetAudience,
        dataCollection: compliance.dataCollection as DataCollection,
        involvePayment: compliance.involvePayment || false,
        hasUserContent: formData.coreFeatures?.mustHave?.some(feature =>
          feature.toLowerCase().includes('内容') ||
          feature.toLowerCase().includes('评论') ||
          feature.toLowerCase().includes('分享')
        ) || false
      })
      setComplianceChecklist(checklist)

      const risk = assessComplianceRisk({
        platformType: compliance.platformType as PlatformType,
        targetAudience: compliance.targetAudience as TargetAudience,
        dataCollection: compliance.dataCollection as DataCollection,
        involvePayment: compliance.involvePayment || false,
        hasUserContent: checklist.some(item => item.category === '内容合规')
      })
      setComplianceRisk(risk)
    }
  }, [
    formData.chinaCompliance?.platformType,
    formData.chinaCompliance?.targetAudience,
    formData.chinaCompliance?.dataCollection,
    formData.chinaCompliance?.involvePayment,
    formData.coreFeatures?.mustHave
  ])

  // 获取工作坊步骤配置
  const workshopSteps = WORKSHOP_STEPS['mvp-builder']

  // 应用MVP模板
  const applyTemplate = (templateId: string) => {
    const templateData = generateTemplateFormData(templateId)
    Object.entries(templateData).forEach(([key, value]) => {
      setValue(key as any, value, { shouldDirty: true, shouldValidate: true })
    })
    setSelectedTemplate(templateId)
  }

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
      const recommendedAgents = getRecommendedAgents('mvp-builder', step)
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
      const primaryAgent = activeAgents[0]
      onAgentInteraction(primaryAgent, fieldName, value)
    }
  }

  // 表单提交
  const onSubmit = async (data: MVPBuilderForm) => {
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      console.log('📝 MVP构建表单提交:', data)

      if (onComplete) {
        await onComplete(data)
      }

      console.log('✅ MVP构建工作坊完成！')

    } catch (error) {
      console.error('❌ 表单提交失败:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={`mvp-builder-form ${className}`}>
      {/* 进度指示器 */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">MVP构建工作坊</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                快速构建最小可行产品，验证核心价值假设，包含中国市场合规指导
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
            <TabsList className="grid w-full grid-cols-5">
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
                    <span className="hidden sm:inline text-xs">{step.title}</span>
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 步骤1：问题与用户定义 */}
        {currentStep === 1 && (
          <WorkshopFormSection
            title="步骤1: 问题与用户定义"
            description="明确要解决的核心问题和目标用户群体"
            isActive={currentStep === 1}
            isCompleted={completedSteps.includes(1)}
            error={errors.problemStatement ? '请完整填写问题定义信息' : undefined}
          >
            {/* MVP模板推荐 */}
            {recommendedTemplates.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <h4 className="font-medium">推荐的MVP模板</h4>
                </div>
                <div className="grid md:grid-cols-3 gap-3">
                  {recommendedTemplates.map((template) => (
                    <Card key={template.id} className="cursor-pointer hover:border-blue-500 transition-colors">
                      <CardContent className="p-4">
                        <h5 className="font-medium text-sm mb-1">{template.title}</h5>
                        <p className="text-xs text-gray-600 mb-2">{template.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">{template.estimatedTime}</span>
                          <Button
                            type="button"
                            size="sm"
                            variant={selectedTemplate === template.id ? "default" : "outline"}
                            onClick={() => applyTemplate(template.id)}
                          >
                            {selectedTemplate === template.id ? '已选择' : '使用模板'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* 核心问题描述 */}
            <Controller
              name="problemStatement.coreProblemSolved"
              control={control}
              render={({ field }) => (
                <WorkshopTextarea
                  label="核心问题描述"
                  name="problemStatement.coreProblemSolved"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.problemStatement?.coreProblemSolved?.message}
                  hint="详细描述您要解决的核心问题，用户遇到这个问题时的具体场景"
                  required
                  maxLength={300}
                  minRows={3}
                  onAgentFeedback={handleAgentFeedback}
                />
              )}
            />

            {/* 目标用户 */}
            <Controller
              name="problemStatement.targetUser"
              control={control}
              render={({ field }) => (
                <WorkshopTextarea
                  label="目标用户群体"
                  name="problemStatement.targetUser"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.problemStatement?.targetUser?.message}
                  hint="描述您的理想用户是谁，包括年龄、职业、行为特征等"
                  required
                  maxLength={200}
                  onAgentFeedback={handleAgentFeedback}
                />
              )}
            />

            {/* 现有解决方案 */}
            <Controller
              name="problemStatement.existingSolutions"
              control={control}
              render={({ field }) => (
                <WorkshopDynamicList
                  label="现有解决方案"
                  name="problemStatement.existingSolutions"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.problemStatement?.existingSolutions?.message}
                  hint="列出用户现在如何解决这个问题，包括竞争产品"
                  maxItems={3}
                  placeholder="输入一个现有解决方案..."
                />
              )}
            />

            {/* 用户痛苦程度 */}
            <Controller
              name="problemStatement.userPainLevel"
              control={control}
              render={({ field }) => (
                <WorkshopSlider
                  label="用户痛苦程度"
                  name="problemStatement.userPainLevel"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.problemStatement?.userPainLevel?.message}
                  hint="评估用户对这个问题的痛苦程度，痛苦越大，付费意愿越强"
                  min={1}
                  max={10}
                  labels={['轻微困扰', '中等痛苦', '极度痛苦']}
                />
              )}
            />
          </WorkshopFormSection>
        )}

        {/* 步骤2：MVP功能规划 */}
        {currentStep === 2 && (
          <WorkshopFormSection
            title="步骤2: MVP功能规划"
            description="使用MoSCoW方法规划MVP的核心功能"
            isActive={currentStep === 2}
            isCompleted={completedSteps.includes(2)}
            error={errors.coreFeatures ? '请完整填写功能规划信息' : undefined}
          >
            <Alert className="mb-6">
              <Info className="h-4 w-4" />
              <AlertDescription>
                MVP的核心原则是"最小"，建议Must Have功能不超过5个，专注解决核心问题。
              </AlertDescription>
            </Alert>

            {/* Must Have 功能 */}
            <Controller
              name="coreFeatures.mustHave"
              control={control}
              render={({ field }) => (
                <WorkshopDynamicList
                  label="Must Have - 必须功能"
                  name="coreFeatures.mustHave"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.coreFeatures?.mustHave?.message}
                  hint="没有这些功能，产品就无法工作，最多5个"
                  required
                  maxItems={5}
                  minItems={1}
                  placeholder="输入一个必须功能..."
                />
              )}
            />

            {/* Should Have 功能 */}
            <Controller
              name="coreFeatures.shouldHave"
              control={control}
              render={({ field }) => (
                <WorkshopDynamicList
                  label="Should Have - 应该功能"
                  name="coreFeatures.shouldHave"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.coreFeatures?.shouldHave?.message}
                  hint="重要但非必须的功能，可以在第二版本加入"
                  maxItems={3}
                  placeholder="输入一个应该功能..."
                />
              )}
            />

            {/* Could Have 功能 */}
            <Controller
              name="coreFeatures.couldHave"
              control={control}
              render={({ field }) => (
                <WorkshopDynamicList
                  label="Could Have - 可以功能"
                  name="coreFeatures.couldHave"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.coreFeatures?.couldHave?.message}
                  hint="锦上添花的功能，MVP阶段通常不实现"
                  maxItems={3}
                  placeholder="输入一个可以功能..."
                />
              )}
            />
          </WorkshopFormSection>
        )}

        {/* 步骤3：MVP验证策略 */}
        {currentStep === 3 && (
          <WorkshopFormSection
            title="步骤3: MVP验证策略"
            description="制定具体的MVP验证计划和成功指标"
            isActive={currentStep === 3}
            isCompleted={completedSteps.includes(3)}
            error={errors.mvpValidation ? '请完整填写验证策略信息' : undefined}
          >
            {/* 成功指标 */}
            <Controller
              name="mvpValidation.successMetrics"
              control={control}
              render={({ field }) => (
                <WorkshopDynamicList
                  label="成功指标"
                  name="mvpValidation.successMetrics"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.mvpValidation?.successMetrics?.message}
                  hint="如何衡量MVP是否成功？例如：日活用户数、转化率等"
                  required
                  maxItems={4}
                  minItems={2}
                  placeholder="输入一个成功指标..."
                />
              )}
            />

            {/* 验证方法 */}
            <Controller
              name="mvpValidation.testingApproach"
              control={control}
              render={({ field }) => (
                <WorkshopSelect
                  label="验证方法"
                  name="mvpValidation.testingApproach"
                  value={field.value || ''}
                  onChange={field.onChange}
                  error={errors.mvpValidation?.testingApproach?.message}
                  hint="选择最适合您项目的验证方法"
                  required
                  options={TESTING_APPROACH_OPTIONS}
                />
              )}
            />

            {/* 预算范围 */}
            <Controller
              name="mvpValidation.budgetRange"
              control={control}
              render={({ field }) => (
                <WorkshopSelect
                  label="验证预算"
                  name="mvpValidation.budgetRange"
                  value={field.value || ''}
                  onChange={field.onChange}
                  error={errors.mvpValidation?.budgetRange?.message}
                  hint="MVP验证阶段的预算范围"
                  required
                  options={BUDGET_RANGE_OPTIONS}
                />
              )}
            />

            {/* 目标验证用户数 */}
            <Controller
              name="mvpValidation.targetUserCount"
              control={control}
              render={({ field }) => (
                <WorkshopNumberInput
                  label="目标验证用户数"
                  name="mvpValidation.targetUserCount"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.mvpValidation?.targetUserCount?.message}
                  hint="计划验证多少个目标用户？"
                  min={10}
                  max={1000}
                  suffix="人"
                />
              )}
            />

            {/* 验证时间计划 */}
            <Controller
              name="mvpValidation.validationTimeline"
              control={control}
              render={({ field }) => (
                <WorkshopInput
                  label="验证时间计划"
                  name="mvpValidation.validationTimeline"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.mvpValidation?.validationTimeline?.message}
                  hint="预计多长时间完成MVP验证？例如：4周内"
                  required
                  maxLength={200}
                  placeholder="例如：6周内完成所有验证"
                />
              )}
            />

            {/* 关键假设 */}
            <Controller
              name="mvpValidation.keyAssumptions"
              control={control}
              render={({ field }) => (
                <WorkshopDynamicList
                  label="关键假设"
                  name="mvpValidation.keyAssumptions"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.mvpValidation?.keyAssumptions?.message}
                  hint="列出需要验证的关键假设，每个MVP都基于一系列假设"
                  required
                  maxItems={5}
                  minItems={1}
                  placeholder="输入一个关键假设..."
                />
              )}
            />
          </WorkshopFormSection>
        )}

        {/* 步骤4：实施计划制定 */}
        {currentStep === 4 && (
          <WorkshopFormSection
            title="步骤4: 实施计划制定"
            description="制定MVP的技术方案和开发计划"
            isActive={currentStep === 4}
            isCompleted={completedSteps.includes(4)}
            error={errors.implementationPlan ? '请完整填写实施计划信息' : undefined}
          >
            {/* 开发方式 */}
            <Controller
              name="implementationPlan.developmentApproach"
              control={control}
              render={({ field }) => (
                <WorkshopSelect
                  label="开发方式"
                  name="implementationPlan.developmentApproach"
                  value={field.value || ''}
                  onChange={field.onChange}
                  error={errors.implementationPlan?.developmentApproach?.message}
                  hint="选择最适合您团队和预算的开发方式"
                  required
                  options={DEVELOPMENT_APPROACH_OPTIONS}
                />
              )}
            />

            {/* 技术栈 */}
            <Controller
              name="implementationPlan.techStack"
              control={control}
              render={({ field }) => (
                <WorkshopDynamicList
                  label="技术栈选择"
                  name="implementationPlan.techStack"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.implementationPlan?.techStack?.message}
                  hint="选择适合的技术栈，建议保持简单和熟悉"
                  maxItems={5}
                  placeholder="例如：React、Node.js、MongoDB..."
                />
              )}
            />

            {/* 关键资源 */}
            <Controller
              name="implementationPlan.keyResources"
              control={control}
              render={({ field }) => (
                <WorkshopDynamicList
                  label="关键资源"
                  name="implementationPlan.keyResources"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.implementationPlan?.keyResources?.message}
                  hint="MVP开发需要哪些关键资源？人员、工具、资金等"
                  maxItems={5}
                  placeholder="例如：前端开发、UI设计师、服务器..."
                />
              )}
            />

            {/* 第一个里程碑 */}
            <Controller
              name="implementationPlan.firstMilestone"
              control={control}
              render={({ field }) => (
                <WorkshopTextarea
                  label="第一个里程碑"
                  name="implementationPlan.firstMilestone"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.implementationPlan?.firstMilestone?.message}
                  hint="定义第一个重要的开发里程碑，通常是核心功能可用"
                  required
                  maxLength={200}
                  minRows={2}
                />
              )}
            />

            {/* 预计开发时间 */}
            <Controller
              name="implementationPlan.estimatedDevelopmentTime"
              control={control}
              render={({ field }) => (
                <WorkshopSelect
                  label="预计开发时间"
                  name="implementationPlan.estimatedDevelopmentTime"
                  value={field.value || ''}
                  onChange={field.onChange}
                  error={errors.implementationPlan?.estimatedDevelopmentTime?.message}
                  hint="从开始开发到MVP可用的时间"
                  required
                  options={[
                    { value: 'under_1_month', label: '1个月内', description: '适合简单功能' },
                    { value: '1_to_3_months', label: '1-3个月', description: '大多数MVP项目' },
                    { value: '3_to_6_months', label: '3-6个月', description: '复杂项目' },
                    { value: 'over_6_months', label: '6个月以上', description: '可能不是MVP了' }
                  ]}
                />
              )}
            />

            {/* 风险因素 */}
            <Controller
              name="implementationPlan.riskFactors"
              control={control}
              render={({ field }) => (
                <WorkshopDynamicList
                  label="风险因素"
                  name="implementationPlan.riskFactors"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.implementationPlan?.riskFactors?.message}
                  hint="识别可能影响MVP开发的风险因素"
                  maxItems={3}
                  placeholder="例如：技术难度、团队经验、时间压力..."
                />
              )}
            />
          </WorkshopFormSection>
        )}

        {/* 步骤5：中国合规检查 */}
        {currentStep === 5 && (
          <WorkshopFormSection
            title="步骤5: 中国合规检查"
            description="确保MVP符合中国市场的法规要求"
            isActive={currentStep === 5}
            isCompleted={completedSteps.includes(5)}
            error={errors.chinaCompliance ? '请完整填写合规检查信息' : undefined}
          >
            <Alert className="mb-6">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                在中国开发和运营互联网产品需要遵守相关法规。提前了解合规要求可以避免后期的法律风险和额外成本。
              </AlertDescription>
            </Alert>

            {/* 平台类型 */}
            <Controller
              name="chinaCompliance.platformType"
              control={control}
              render={({ field }) => (
                <WorkshopSelect
                  label="平台类型"
                  name="chinaCompliance.platformType"
                  value={field.value || ''}
                  onChange={field.onChange}
                  error={errors.chinaCompliance?.platformType?.message}
                  hint="选择您的MVP平台类型，不同类型有不同的合规要求"
                  required
                  options={PLATFORM_TYPE_OPTIONS}
                />
              )}
            />

            {/* 目标受众 */}
            <Controller
              name="chinaCompliance.targetAudience"
              control={control}
              render={({ field }) => (
                <WorkshopSelect
                  label="目标受众类型"
                  name="chinaCompliance.targetAudience"
                  value={field.value || ''}
                  onChange={field.onChange}
                  error={errors.chinaCompliance?.targetAudience?.message}
                  hint="不同受众类型的监管要求不同"
                  required
                  options={TARGET_AUDIENCE_OPTIONS}
                />
              )}
            />

            {/* 数据收集程度 */}
            <Controller
              name="chinaCompliance.dataCollection"
              control={control}
              render={({ field }) => (
                <WorkshopSelect
                  label="数据收集程度"
                  name="chinaCompliance.dataCollection"
                  value={field.value || ''}
                  onChange={field.onChange}
                  error={errors.chinaCompliance?.dataCollection?.message}
                  hint="数据收集程度影响隐私保护和合规要求"
                  required
                  options={DATA_COLLECTION_OPTIONS}
                />
              )}
            />

            {/* 是否涉及支付 */}
            <div className="space-y-3">
              <label className="block text-sm font-medium">
                是否涉及支付功能？
              </label>
              <Controller
                name="chinaCompliance.involvePayment"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center space-x-6">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={field.value === true}
                        onChange={() => field.onChange(true)}
                        className="mr-2"
                      />
                      是，需要收付款功能
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={field.value === false}
                        onChange={() => field.onChange(false)}
                        className="mr-2"
                      />
                      否，不涉及资金流转
                    </label>
                  </div>
                )}
              />
            </div>

            {/* 合规检查清单 */}
            {complianceChecklist.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium text-lg mb-4">📋 合规检查清单</h4>
                <div className="space-y-4">
                  {complianceChecklist.map((item, index) => (
                    <Card key={index} className={`${
                      item.priority === 'high' ? 'border-red-200' :
                      item.priority === 'medium' ? 'border-yellow-200' :
                      'border-gray-200'
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={
                                item.priority === 'high' ? 'destructive' :
                                item.priority === 'medium' ? 'default' :
                                'secondary'
                              }>
                                {item.required ? '必须' : '建议'}
                              </Badge>
                              <span className="font-medium">{item.title}</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                            <div className="text-xs text-gray-500">
                              <span>📅 {item.timeframe}</span>
                              <span className="ml-4">📂 {item.category}</span>
                            </div>
                          </div>
                          {item.priority === 'high' && (
                            <AlertTriangle className="w-5 h-5 text-red-500 ml-2 flex-shrink-0" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* 风险评估 */}
            {complianceRisk && (
              <div className="mt-6">
                <h4 className="font-medium text-lg mb-4">⚠️ 合规风险评估</h4>
                <Card className={`${
                  complianceRisk.overallRisk === 'high' ? 'border-red-200' :
                  complianceRisk.overallRisk === 'medium' ? 'border-yellow-200' :
                  'border-green-200'
                }`}>
                  <CardContent className="p-4">
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">整体风险等级：</span>
                        <Badge variant={
                          complianceRisk.overallRisk === 'high' ? 'destructive' :
                          complianceRisk.overallRisk === 'medium' ? 'default' :
                          'secondary'
                        }>
                          {complianceRisk.overallRisk === 'high' ? '高风险' :
                           complianceRisk.overallRisk === 'medium' ? '中等风险' :
                           '低风险'}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span>💰 预估合规成本：{complianceRisk.estimatedComplianceCost}</span>
                        <span className="ml-4">⏱️ 预估时间：{complianceRisk.estimatedTimeframe}</span>
                      </div>
                    </div>

                    {complianceRisk.riskFactors.length > 0 && (
                      <div className="mb-4">
                        <p className="font-medium text-sm mb-2">风险因素：</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                          {complianceRisk.riskFactors.map((risk: string, index: number) => (
                            <li key={index}>{risk}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {complianceRisk.recommendations.length > 0 && (
                      <div>
                        <p className="font-medium text-sm mb-2">建议措施：</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                          {complianceRisk.recommendations.map((rec: string, index: number) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* 合规备注 */}
            <Controller
              name="chinaCompliance.complianceNotes"
              control={control}
              render={({ field }) => (
                <WorkshopTextarea
                  label="合规备注"
                  name="chinaCompliance.complianceNotes"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.chinaCompliance?.complianceNotes?.message}
                  hint="记录其他合规相关的注意事项或特殊情况"
                  maxLength={500}
                  minRows={2}
                />
              )}
            />

            {/* 确认合规理解 */}
            <div className="flex items-start space-x-3">
              <Controller
                name="chinaCompliance.acknowledgeCompliance"
                control={control}
                render={({ field }) => (
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="mt-1"
                  />
                )}
              />
              <div className="flex-1">
                <label className="text-sm font-medium">
                  确认已了解相关合规要求 <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-600 mt-1">
                  我已经了解并确认将按照中国相关法律法规进行MVP开发和运营，
                  在正式商业化前会完成必要的资质申请和合规流程。
                </p>
              </div>
            </div>
            {errors.chinaCompliance?.acknowledgeCompliance && (
              <p className="text-red-600 text-sm flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                {errors.chinaCompliance.acknowledgeCompliance.message}
              </p>
            )}
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
                  workshopId="mvp-builder"
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