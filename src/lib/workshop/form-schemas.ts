/**
 * 工作坊表单Schema定义
 *
 * 使用Zod定义各个工作坊的表单结构和验证规则
 * 包含完整的TypeScript类型定义
 */

import { z } from 'zod'

// ============================================
// 需求验证实验室 (Demand Validation)
// ============================================

// 目标客户定义Schema
const TargetCustomerSchema = z.object({
  segment: z.string()
    .min(5, '客户细分描述至少5个字符')
    .max(200, '客户细分描述不超过200个字符'),

  painPoints: z.array(z.string().min(3, '痛点描述至少3个字符'))
    .min(1, '至少填写1个痛点')
    .max(5, '最多填写5个痛点'),

  currentSolution: z.string()
    .min(10, '当前解决方案描述至少10个字符')
    .max(300, '当前解决方案描述不超过300个字符'),

  switchingCost: z.number()
    .min(1, '切换成本至少为1')
    .max(10, '切换成本最高为10')
})

// 需求场景Schema
const DemandScenarioSchema = z.object({
  context: z.string()
    .min(20, '使用场景描述至少20个字符')
    .max(500, '使用场景描述不超过500个字符'),

  frequency: z.enum(['daily', 'weekly', 'monthly', 'occasionally'], {
    errorMap: () => ({ message: '请选择使用频率' })
  }),

  urgency: z.number()
    .min(1, '紧迫性至少为1')
    .max(10, '紧迫性最高为10'),

  willingnessToPay: z.number()
    .min(1, '付费意愿至少为1')
    .max(10, '付费意愿最高为10')
})

// 价值验证Schema
const ValuePropositionSchema = z.object({
  coreValue: z.string()
    .min(20, '核心价值描述至少20个字符')
    .max(300, '核心价值描述不超过300个字符'),

  differentiation: z.string()
    .min(20, '差异化优势描述至少20个字符')
    .max(300, '差异化优势描述不超过300个字符'),

  measurementMetric: z.string()
    .min(10, '衡量指标描述至少10个字符')
    .max(200, '衡量指标描述不超过200个字符')
})

// 验证计划Schema
const ValidationPlanSchema = z.object({
  method: z.array(z.enum(['interview', 'survey', 'mvp', 'landing_page', 'prototype']))
    .min(1, '至少选择1种验证方法')
    .max(3, '最多选择3种验证方法'),

  targetSampleSize: z.number()
    .min(5, '目标样本量至少为5')
    .max(1000, '目标样本量不超过1000'),

  successCriteria: z.string()
    .min(20, '成功标准描述至少20个字符')
    .max(300, '成功标准描述不超过300个字符'),

  timeline: z.string()
    .min(10, '时间计划描述至少10个字符')
    .max(200, '时间计划描述不超过200个字符')
})

// 需求验证完整表单Schema
export const DemandValidationFormSchema = z.object({
  targetCustomer: TargetCustomerSchema,
  demandScenario: DemandScenarioSchema,
  valueProposition: ValuePropositionSchema,
  validationPlan: ValidationPlanSchema
})

export type DemandValidationForm = z.infer<typeof DemandValidationFormSchema>

// ============================================
// MVP构建工作坊 (MVP Builder)
// ============================================

// 核心功能定义Schema
const CoreFeaturesSchema = z.object({
  mustHave: z.array(z.string().min(5, '功能描述至少5个字符'))
    .min(1, '至少填写1个必须功能')
    .max(8, '必须功能最多8个'),

  shouldHave: z.array(z.string().min(5, '功能描述至少5个字符'))
    .max(6, '应该功能最多6个'),

  couldHave: z.array(z.string().min(5, '功能描述至少5个字符'))
    .max(8, '可以功能最多8个'),

  wontHave: z.array(z.string().min(5, '功能描述至少5个字符'))
    .max(5, '不会功能最多5个')
})

// 用户故事Schema
const UserStorySchema = z.object({
  role: z.string()
    .min(3, '用户角色至少3个字符')
    .max(50, '用户角色不超过50个字符'),

  goal: z.string()
    .min(10, '目标描述至少10个字符')
    .max(200, '目标描述不超过200个字符'),

  benefit: z.string()
    .min(10, '收益描述至少10个字符')
    .max(200, '收益描述不超过200个字符'),

  priority: z.enum(['high', 'medium', 'low'], {
    errorMap: () => ({ message: '请选择优先级' })
  }),

  estimatedEffort: z.number()
    .min(1, '工作量估算至少为1')
    .max(10, '工作量估算最高为10')
})

// 技术方案Schema
const TechnicalPlanSchema = z.object({
  architecture: z.string()
    .min(20, '技术架构描述至少20个字符')
    .max(500, '技术架构描述不超过500个字符'),

  techStack: z.array(z.string().min(2, '技术名称至少2个字符'))
    .min(1, '至少选择1个技术')
    .max(10, '最多选择10个技术'),

  infrastructure: z.string()
    .min(10, '基础设施描述至少10个字符')
    .max(300, '基础设施描述不超过300个字符'),

  thirdPartyServices: z.array(z.string().min(2, '服务名称至少2个字符'))
    .max(8, '第三方服务最多8个')
})

// 原型设计Schema
const PrototypeSchema = z.object({
  wireframeUrl: z.string().url('请输入有效的线框图链接').optional().or(z.literal('')),

  designPrinciples: z.array(z.string().min(5, '设计原则描述至少5个字符'))
    .min(1, '至少填写1个设计原则')
    .max(6, '设计原则最多6个'),

  keyInteractions: z.array(z.string().min(5, '交互描述至少5个字符'))
    .min(1, '至少填写1个关键交互')
    .max(8, '关键交互最多8个')
})

// MVP构建完整表单Schema
export const MVPBuilderFormSchema = z.object({
  coreFeatures: CoreFeaturesSchema,
  userStories: z.array(UserStorySchema)
    .min(1, '至少创建1个用户故事')
    .max(10, '用户故事最多10个'),
  technicalPlan: TechnicalPlanSchema,
  prototype: PrototypeSchema
})

export type MVPBuilderForm = z.infer<typeof MVPBuilderFormSchema>

// ============================================
// 增长黑客训练营 (Growth Hacking)
// ============================================

// 增长目标Schema
const GrowthGoalsSchema = z.object({
  northStarMetric: z.string()
    .min(10, '北极星指标描述至少10个字符')
    .max(200, '北极星指标描述不超过200个字符'),

  targetGrowthRate: z.number()
    .min(1, '目标增长率至少为1%')
    .max(1000, '目标增长率不超过1000%'),

  timeframe: z.string()
    .min(5, '时间框架描述至少5个字符')
    .max(100, '时间框架描述不超过100个字符')
})

// AARRR漏斗Schema
const AARRRSchema = z.object({
  acquisition: z.object({
    channels: z.array(z.string().min(3, '渠道名称至少3个字符'))
      .min(1, '至少填写1个获取渠道')
      .max(8, '获取渠道最多8个'),

    conversionRate: z.number()
      .min(0.1, '转化率至少为0.1%')
      .max(100, '转化率不超过100%')
  }),

  activation: z.object({
    activationTrigger: z.string()
      .min(10, '激活触发描述至少10个字符')
      .max(200, '激活触发描述不超过200个字符'),

    timeToValue: z.number()
      .min(1, '价值时间至少为1分钟')
      .max(10080, '价值时间不超过7天')
  }),

  retention: z.object({
    retentionRate: z.number()
      .min(1, '留存率至少为1%')
      .max(100, '留存率不超过100%'),

    churnReasons: z.array(z.string().min(5, '流失原因描述至少5个字符'))
      .min(1, '至少填写1个流失原因')
      .max(6, '流失原因最多6个')
  }),

  revenue: z.object({
    monetizationModel: z.string()
      .min(10, '变现模式描述至少10个字符')
      .max(300, '变现模式描述不超过300个字符'),

    ltv: z.number()
      .min(1, '客户生命周期价值至少为1')
      .max(100000, '客户生命周期价值不超过100000')
  }),

  referral: z.object({
    viralCoefficient: z.number()
      .min(0.1, '病毒系数至少为0.1')
      .max(10, '病毒系数不超过10'),

    incentiveStructure: z.string()
      .min(20, '激励结构描述至少20个字符')
      .max(300, '激励结构描述不超过300个字符')
  })
})

// 实验设计Schema
const ExperimentSchema = z.object({
  hypothesis: z.string()
    .min(20, '假设描述至少20个字符')
    .max(300, '假设描述不超过300个字符'),

  testMethod: z.string()
    .min(10, '测试方法描述至少10个字符')
    .max(200, '测试方法描述不超过200个字符'),

  successMetric: z.string()
    .min(10, '成功指标描述至少10个字符')
    .max(200, '成功指标描述不超过200个字符'),

  duration: z.number()
    .min(1, '实验时长至少为1天')
    .max(90, '实验时长不超过90天')
})

// 增长黑客完整表单Schema
export const GrowthHackingFormSchema = z.object({
  growthGoals: GrowthGoalsSchema,
  aarrr: AARRRSchema,
  experiments: z.array(ExperimentSchema)
    .min(1, '至少设计1个实验')
    .max(5, '实验最多5个')
})

export type GrowthHackingForm = z.infer<typeof GrowthHackingFormSchema>

// ============================================
// 商业模式设计 (Profit Model)
// ============================================

// 商业模式画布Schema
const BusinessModelCanvasSchema = z.object({
  customerSegments: z.array(z.string().min(5, '客户细分描述至少5个字符'))
    .min(1, '至少填写1个客户细分')
    .max(5, '客户细分最多5个'),

  valuePropositions: z.array(z.string().min(10, '价值主张描述至少10个字符'))
    .min(1, '至少填写1个价值主张')
    .max(3, '价值主张最多3个'),

  channels: z.array(z.string().min(3, '渠道名称至少3个字符'))
    .min(1, '至少填写1个渠道')
    .max(6, '渠道最多6个'),

  customerRelationships: z.array(z.string().min(5, '客户关系描述至少5个字符'))
    .min(1, '至少填写1种客户关系')
    .max(4, '客户关系最多4种'),

  revenueStreams: z.array(z.string().min(5, '收入来源描述至少5个字符'))
    .min(1, '至少填写1个收入来源')
    .max(4, '收入来源最多4个'),

  keyResources: z.array(z.string().min(3, '核心资源描述至少3个字符'))
    .min(1, '至少填写1个核心资源')
    .max(6, '核心资源最多6个'),

  keyActivities: z.array(z.string().min(5, '关键业务描述至少5个字符'))
    .min(1, '至少填写1个关键业务')
    .max(5, '关键业务最多5个'),

  keyPartnerships: z.array(z.string().min(5, '重要合作描述至少5个字符'))
    .max(5, '重要合作最多5个'),

  costStructure: z.array(z.string().min(5, '成本结构描述至少5个字符'))
    .min(1, '至少填写1个成本项')
    .max(6, '成本项最多6个')
})

// 财务模型Schema
const FinancialModelSchema = z.object({
  pricingStrategy: z.string()
    .min(20, '定价策略描述至少20个字符')
    .max(400, '定价策略描述不超过400个字符'),

  unitEconomics: z.object({
    cac: z.number()
      .min(1, '客户获取成本至少为1')
      .max(10000, '客户获取成本不超过10000'),

    ltv: z.number()
      .min(1, '客户生命周期价值至少为1')
      .max(100000, '客户生命周期价值不超过100000'),

    ltvCacRatio: z.number()
      .min(1, 'LTV/CAC比率至少为1')
      .max(50, 'LTV/CAC比率不超过50')
  }),

  revenueProjection: z.object({
    year1: z.number()
      .min(0, '第一年收入不能为负')
      .max(100000000, '第一年收入不超过1亿'),

    year2: z.number()
      .min(0, '第二年收入不能为负')
      .max(1000000000, '第二年收入不超过10亿'),

    year3: z.number()
      .min(0, '第三年收入不能为负')
      .max(10000000000, '第三年收入不超过100亿')
  })
})

// 盈利路径Schema
const ProfitabilitySchema = z.object({
  breakEvenPoint: z.number()
    .min(1, '盈亏平衡点至少为1个月')
    .max(120, '盈亏平衡点不超过10年'),

  scalingPlan: z.string()
    .min(50, '规模化计划描述至少50个字符')
    .max(500, '规模化计划描述不超过500个字符'),

  riskFactors: z.array(z.string().min(10, '风险因素描述至少10个字符'))
    .min(1, '至少识别1个风险因素')
    .max(8, '风险因素最多8个')
})

// 商业模式设计完整表单Schema
export const ProfitModelFormSchema = z.object({
  businessModelCanvas: BusinessModelCanvasSchema,
  financialModel: FinancialModelSchema,
  profitability: ProfitabilitySchema
})

export type ProfitModelForm = z.infer<typeof ProfitModelFormSchema>

// ============================================
// 工作坊配置和工具函数
// ============================================

// 工作坊表单Schema映射
export const WORKSHOP_FORM_SCHEMAS = {
  'demand-validation': DemandValidationFormSchema,
  'mvp-builder': MVPBuilderFormSchema,
  'growth-hacking': GrowthHackingFormSchema,
  'profit-model': ProfitModelFormSchema
} as const

// 工作坊表单类型映射
export type WorkshopFormData = {
  'demand-validation': DemandValidationForm
  'mvp-builder': MVPBuilderForm
  'growth-hacking': GrowthHackingForm
  'profit-model': ProfitModelForm
}

// 获取工作坊表单Schema
export function getWorkshopFormSchema(workshopId: keyof typeof WORKSHOP_FORM_SCHEMAS) {
  return WORKSHOP_FORM_SCHEMAS[workshopId]
}

// 验证表单数据
export function validateWorkshopForm<T extends keyof WorkshopFormData>(
  workshopId: T,
  data: unknown
): { success: true; data: WorkshopFormData[T] } | { success: false; errors: string[] } {
  try {
    const schema = getWorkshopFormSchema(workshopId)
    const result = schema.parse(data)
    return { success: true, data: result as WorkshopFormData[T] }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      return { success: false, errors }
    }
    return { success: false, errors: ['未知验证错误'] }
  }
}

// 工作坊步骤配置
export const WORKSHOP_STEPS = {
  'demand-validation': [
    { id: 1, title: '目标客户定义', fields: ['targetCustomer'] },
    { id: 2, title: '需求场景描述', fields: ['demandScenario'] },
    { id: 3, title: '价值验证', fields: ['valueProposition'] },
    { id: 4, title: '验证计划', fields: ['validationPlan'] }
  ],
  'mvp-builder': [
    { id: 1, title: '核心功能定义', fields: ['coreFeatures'] },
    { id: 2, title: '用户故事创建', fields: ['userStories'] },
    { id: 3, title: '技术方案设计', fields: ['technicalPlan'] },
    { id: 4, title: '原型设计', fields: ['prototype'] }
  ],
  'growth-hacking': [
    { id: 1, title: '增长目标设定', fields: ['growthGoals'] },
    { id: 2, title: 'AARRR漏斗分析', fields: ['aarrr'] },
    { id: 3, title: '实验设计', fields: ['experiments'] }
  ],
  'profit-model': [
    { id: 1, title: '商业模式画布', fields: ['businessModelCanvas'] },
    { id: 2, title: '财务模型构建', fields: ['financialModel'] },
    { id: 3, title: '盈利路径规划', fields: ['profitability'] }
  ]
} as const

// 获取工作坊步骤配置
export function getWorkshopSteps(workshopId: keyof typeof WORKSHOP_STEPS) {
  return WORKSHOP_STEPS[workshopId]
}

// 计算表单完成度
export function calculateFormProgress(
  workshopId: keyof WorkshopFormData,
  formData: Partial<WorkshopFormData[typeof workshopId]>
): number {
  const steps = getWorkshopSteps(workshopId)
  const totalSteps = steps.length

  let completedSteps = 0
  for (const step of steps) {
    const isStepCompleted = step.fields.every(field => {
      const value = (formData as any)?.[field]
      return value !== undefined && value !== null && value !== ''
    })

    if (isStepCompleted) {
      completedSteps++
    }
  }

  return Math.round((completedSteps / totalSteps) * 100)
}

// 获取下一个需要完成的字段
export function getNextRequiredField(
  workshopId: keyof WorkshopFormData,
  formData: Partial<WorkshopFormData[typeof workshopId]>
): string | null {
  const steps = getWorkshopSteps(workshopId)

  for (const step of steps) {
    for (const field of step.fields) {
      const value = (formData as any)?.[field]
      if (value === undefined || value === null || value === '') {
        return field
      }
    }
  }

  return null // 所有字段都已完成
}