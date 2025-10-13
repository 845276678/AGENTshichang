/**
 * PDF报告生成服务
 *
 * 基于工作坊完成结果生成专业PDF报告
 * 包括评估结果、建议方案、行动计划等内容
 */

import { jsPDF } from 'jspdf'
import { type WorkshopSession } from '@/hooks/useWorkshopSession'
import {
  type DemandValidationForm,
  type MVPBuilderForm,
  type GrowthHackingForm,
  type ProfitModelForm
} from '@/lib/workshop/form-schemas'

// PDF配置
const PDF_CONFIG = {
  format: 'a4' as const,
  orientation: 'portrait' as const,
  margins: { top: 20, right: 20, bottom: 20, left: 20 },
  lineHeight: 6,
  fontSize: {
    title: 18,
    subtitle: 14,
    body: 10,
    caption: 8
  },
  colors: {
    primary: '#2563eb',
    secondary: '#64748b',
    success: '#059669',
    warning: '#d97706'
  }
}

// 报告数据接口
export interface WorkshopReportData {
  session: WorkshopSession
  userProfile?: {
    name: string
    email: string
    company?: string
  }
  assessmentHistory?: Array<{
    id: string
    totalScore: number
    level: string
    createdAt: string
  }>
}

// PDF页面布局工具
class PDFLayout {
  private doc: jsPDF
  private currentY: number
  private pageHeight: number
  private margins: typeof PDF_CONFIG.margins

  constructor(doc: jsPDF) {
    this.doc = doc
    this.currentY = PDF_CONFIG.margins.top
    this.pageHeight = doc.internal.pageSize.height
    this.margins = PDF_CONFIG.margins
  }

  // 检查是否需要新页面
  checkPageBreak(requiredHeight: number): boolean {
    if (this.currentY + requiredHeight > this.pageHeight - this.margins.bottom) {
      this.doc.addPage()
      this.currentY = this.margins.top
      return true
    }
    return false
  }

  // 添加标题
  addTitle(text: string, color: string = PDF_CONFIG.colors.primary): void {
    this.checkPageBreak(25)
    this.doc.setFontSize(PDF_CONFIG.fontSize.title)
    this.doc.setTextColor(color)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(text, this.margins.left, this.currentY)
    this.currentY += 15
  }

  // 添加副标题
  addSubtitle(text: string): void {
    this.checkPageBreak(20)
    this.doc.setFontSize(PDF_CONFIG.fontSize.subtitle)
    this.doc.setTextColor(PDF_CONFIG.colors.secondary)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(text, this.margins.left, this.currentY)
    this.currentY += 12
  }

  // 添加正文
  addBody(text: string, indent: number = 0): void {
    const maxWidth = this.doc.internal.pageSize.width - this.margins.left - this.margins.right - indent
    const lines = this.doc.splitTextToSize(text, maxWidth)

    this.checkPageBreak(lines.length * PDF_CONFIG.lineHeight)

    this.doc.setFontSize(PDF_CONFIG.fontSize.body)
    this.doc.setTextColor('#000000')
    this.doc.setFont('helvetica', 'normal')

    for (const line of lines) {
      this.doc.text(line, this.margins.left + indent, this.currentY)
      this.currentY += PDF_CONFIG.lineHeight
    }
  }

  // 添加列表项
  addListItem(text: string, bullet: string = '•'): void {
    this.doc.setFontSize(PDF_CONFIG.fontSize.body)
    this.doc.setTextColor('#000000')
    this.doc.setFont('helvetica', 'normal')

    const maxWidth = this.doc.internal.pageSize.width - this.margins.left - this.margins.right - 15
    const lines = this.doc.splitTextToSize(text, maxWidth)

    this.checkPageBreak(lines.length * PDF_CONFIG.lineHeight)

    // 添加项目符号
    this.doc.text(bullet, this.margins.left + 5, this.currentY)

    // 添加文本
    for (let i = 0; i < lines.length; i++) {
      this.doc.text(lines[i], this.margins.left + 15, this.currentY)
      this.currentY += PDF_CONFIG.lineHeight
    }
  }

  // 添加分隔线
  addSeparator(): void {
    this.checkPageBreak(10)
    const lineY = this.currentY + 5
    this.doc.setDrawColor(PDF_CONFIG.colors.secondary)
    this.doc.line(
      this.margins.left,
      lineY,
      this.doc.internal.pageSize.width - this.margins.right,
      lineY
    )
    this.currentY += 15
  }

  // 添加空行
  addSpace(height: number = 10): void {
    this.currentY += height
  }

  // 获取当前位置
  getCurrentY(): number {
    return this.currentY
  }
}

// 需求验证工作坊报告生成
function generateDemandValidationReport(
  layout: PDFLayout,
  formData: DemandValidationForm
): void {
  layout.addTitle('需求验证实验室 - 完成报告')
  layout.addSpace(5)

  // 1. 目标客户分析
  layout.addSubtitle('1. 目标客户分析')
  layout.addBody(`客户细分: ${formData.targetCustomer.segment}`)
  layout.addSpace(5)

  layout.addBody('主要痛点:')
  formData.targetCustomer.painPoints.forEach(point => {
    layout.addListItem(point)
  })
  layout.addSpace(5)

  layout.addBody(`当前解决方案: ${formData.targetCustomer.currentSolution}`)
  layout.addBody(`切换成本评估: ${formData.targetCustomer.switchingCost}/10`)
  layout.addSpace(10)

  // 2. 需求场景分析
  layout.addSubtitle('2. 需求场景分析')
  layout.addBody(`使用场景: ${formData.demandScenario.context}`)
  layout.addSpace(5)

  const frequencyMap: Record<string, string> = {
    daily: '每天',
    weekly: '每周',
    monthly: '每月',
    occasionally: '偶尔'
  }
  layout.addBody(`使用频率: ${frequencyMap[formData.demandScenario.frequency] || formData.demandScenario.frequency}`)
  layout.addBody(`需求紧迫性: ${formData.demandScenario.urgency}/10`)
  layout.addBody(`付费意愿: ${formData.demandScenario.willingnessToPay}/10`)
  layout.addSpace(10)

  // 3. 价值主张
  layout.addSubtitle('3. 核心价值主张')
  layout.addBody(`核心价值: ${formData.valueProposition.coreValue}`)
  layout.addSpace(5)
  layout.addBody(`差异化优势: ${formData.valueProposition.differentiation}`)
  layout.addSpace(5)
  layout.addBody(`衡量指标: ${formData.valueProposition.measurementMetric}`)
  layout.addSpace(10)

  // 4. 验证计划
  layout.addSubtitle('4. 验证实施计划')

  const methodMap: Record<string, string> = {
    interview: '用户访谈',
    survey: '问卷调研',
    mvp: 'MVP测试',
    landing_page: '着陆页测试',
    prototype: '原型测试'
  }

  layout.addBody('验证方法:')
  formData.validationPlan.method.forEach(method => {
    layout.addListItem(methodMap[method as keyof typeof methodMap] || method)
  })
  layout.addSpace(5)

  layout.addBody(`目标样本量: ${formData.validationPlan.targetSampleSize} 人`)
  layout.addBody(`成功标准: ${formData.validationPlan.successCriteria}`)
  layout.addBody(`时间计划: ${formData.validationPlan.timeline}`)

  layout.addSeparator()
}

// MVP构建工作坊报告生成
function generateMVPBuilderReport(
  layout: PDFLayout,
  formData: MVPBuilderForm
): void {
  layout.addTitle('MVP构建工作坊 - 完成报告')
  layout.addSpace(5)

  // 1. 核心功能规划
  layout.addSubtitle('1. 核心功能规划 (MoSCoW)')

  layout.addBody('必须功能 (Must Have):')
  formData.coreFeatures.mustHave.forEach(feature => {
    layout.addListItem(feature)
  })
  layout.addSpace(5)

  if (formData.coreFeatures.shouldHave.length > 0) {
    layout.addBody('应该功能 (Should Have):')
    formData.coreFeatures.shouldHave.forEach(feature => {
      layout.addListItem(feature)
    })
    layout.addSpace(5)
  }

  if (formData.coreFeatures.couldHave.length > 0) {
    layout.addBody('可以功能 (Could Have):')
    formData.coreFeatures.couldHave.forEach(feature => {
      layout.addListItem(feature)
    })
    layout.addSpace(5)
  }

  if (formData.coreFeatures.wontHave.length > 0) {
    layout.addBody('不会功能 (Won\'t Have):')
    formData.coreFeatures.wontHave.forEach(feature => {
      layout.addListItem(feature)
    })
    layout.addSpace(10)
  }

  // 2. 用户故事
  layout.addSubtitle('2. 用户故事设计')
  formData.userStories.forEach((story, index) => {
    layout.addBody(`故事 ${index + 1}: 作为 ${story.role}，我希望 ${story.goal}，以便 ${story.benefit}`)
    layout.addBody(`优先级: ${story.priority === 'high' ? '高' : story.priority === 'medium' ? '中' : '低'}`)
    layout.addBody(`工作量: ${story.estimatedEffort}/10`)
    layout.addSpace(5)
  })

  // 3. 技术方案
  layout.addSubtitle('3. 技术实施方案')
  layout.addBody(`技术架构: ${formData.technicalPlan.architecture}`)
  layout.addSpace(5)

  layout.addBody('技术栈:')
  formData.technicalPlan.techStack.forEach(tech => {
    layout.addListItem(tech)
  })
  layout.addSpace(5)

  layout.addBody(`基础设施: ${formData.technicalPlan.infrastructure}`)
  layout.addSpace(5)

  if (formData.technicalPlan.thirdPartyServices.length > 0) {
    layout.addBody('第三方服务:')
    formData.technicalPlan.thirdPartyServices.forEach(service => {
      layout.addListItem(service)
    })
    layout.addSpace(10)
  }

  // 4. 原型设计
  layout.addSubtitle('4. 原型设计规范')
  if (formData.prototype.wireframeUrl) {
    layout.addBody(`线框图链接: ${formData.prototype.wireframeUrl}`)
    layout.addSpace(5)
  }

  layout.addBody('设计原则:')
  formData.prototype.designPrinciples.forEach(principle => {
    layout.addListItem(principle)
  })
  layout.addSpace(5)

  layout.addBody('关键交互:')
  formData.prototype.keyInteractions.forEach(interaction => {
    layout.addListItem(interaction)
  })

  layout.addSeparator()
}

// 增长黑客工作坊报告生成
function generateGrowthHackingReport(
  layout: PDFLayout,
  formData: GrowthHackingForm
): void {
  layout.addTitle('增长黑客训练营 - 完成报告')
  layout.addSpace(5)

  // 1. 增长目标
  layout.addSubtitle('1. 增长目标设定')
  layout.addBody(`北极星指标: ${formData.growthGoals.northStarMetric}`)
  layout.addBody(`目标增长率: ${formData.growthGoals.targetGrowthRate}%`)
  layout.addBody(`时间框架: ${formData.growthGoals.timeframe}`)
  layout.addSpace(10)

  // 2. AARRR漏斗分析
  layout.addSubtitle('2. AARRR漏斗分析')

  layout.addBody('获取 (Acquisition):')
  layout.addBody('获取渠道:')
  formData.aarrr.acquisition.channels.forEach(channel => {
    layout.addListItem(channel)
  })
  layout.addBody(`转化率: ${formData.aarrr.acquisition.conversionRate}%`)
  layout.addSpace(5)

  layout.addBody('激活 (Activation):')
  layout.addBody(`激活触发: ${formData.aarrr.activation.activationTrigger}`)
  layout.addBody(`价值时间: ${formData.aarrr.activation.timeToValue} 分钟`)
  layout.addSpace(5)

  layout.addBody('留存 (Retention):')
  layout.addBody(`留存率: ${formData.aarrr.retention.retentionRate}%`)
  layout.addBody('流失原因:')
  formData.aarrr.retention.churnReasons.forEach(reason => {
    layout.addListItem(reason)
  })
  layout.addSpace(5)

  layout.addBody('营收 (Revenue):')
  layout.addBody(`变现模式: ${formData.aarrr.revenue.monetizationModel}`)
  layout.addBody(`客户生命周期价值: ${formData.aarrr.revenue.ltv}`)
  layout.addSpace(5)

  layout.addBody('推荐 (Referral):')
  layout.addBody(`病毒系数: ${formData.aarrr.referral.viralCoefficient}`)
  layout.addBody(`激励结构: ${formData.aarrr.referral.incentiveStructure}`)
  layout.addSpace(10)

  // 3. 实验设计
  layout.addSubtitle('3. 增长实验设计')
  formData.experiments.forEach((experiment, index) => {
    layout.addBody(`实验 ${index + 1}:`)
    layout.addBody(`假设: ${experiment.hypothesis}`)
    layout.addBody(`测试方法: ${experiment.testMethod}`)
    layout.addBody(`成功指标: ${experiment.successMetric}`)
    layout.addBody(`实验时长: ${experiment.duration} 天`)
    layout.addSpace(5)
  })

  layout.addSeparator()
}

// 商业模式工作坊报告生成
function generateProfitModelReport(
  layout: PDFLayout,
  formData: ProfitModelForm
): void {
  layout.addTitle('商业模式设计 - 完成报告')
  layout.addSpace(5)

  // 1. 商业模式画布
  layout.addSubtitle('1. 商业模式画布')

  layout.addBody('客户细分:')
  formData.businessModelCanvas.customerSegments.forEach(segment => {
    layout.addListItem(segment)
  })
  layout.addSpace(5)

  layout.addBody('价值主张:')
  formData.businessModelCanvas.valuePropositions.forEach(proposition => {
    layout.addListItem(proposition)
  })
  layout.addSpace(5)

  layout.addBody('渠道通路:')
  formData.businessModelCanvas.channels.forEach(channel => {
    layout.addListItem(channel)
  })
  layout.addSpace(5)

  layout.addBody('客户关系:')
  formData.businessModelCanvas.customerRelationships.forEach(relationship => {
    layout.addListItem(relationship)
  })
  layout.addSpace(5)

  layout.addBody('收入来源:')
  formData.businessModelCanvas.revenueStreams.forEach(stream => {
    layout.addListItem(stream)
  })
  layout.addSpace(5)

  layout.addBody('核心资源:')
  formData.businessModelCanvas.keyResources.forEach(resource => {
    layout.addListItem(resource)
  })
  layout.addSpace(5)

  layout.addBody('关键业务:')
  formData.businessModelCanvas.keyActivities.forEach(activity => {
    layout.addListItem(activity)
  })
  layout.addSpace(5)

  if (formData.businessModelCanvas.keyPartnerships.length > 0) {
    layout.addBody('重要合作:')
    formData.businessModelCanvas.keyPartnerships.forEach(partnership => {
      layout.addListItem(partnership)
    })
    layout.addSpace(5)
  }

  layout.addBody('成本结构:')
  formData.businessModelCanvas.costStructure.forEach(cost => {
    layout.addListItem(cost)
  })
  layout.addSpace(10)

  // 2. 财务模型
  layout.addSubtitle('2. 财务模型构建')
  layout.addBody(`定价策略: ${formData.financialModel.pricingStrategy}`)
  layout.addSpace(5)

  layout.addBody('单位经济学:')
  layout.addBody(`客户获取成本 (CAC): ${formData.financialModel.unitEconomics.cac}`)
  layout.addBody(`客户生命周期价值 (LTV): ${formData.financialModel.unitEconomics.ltv}`)
  layout.addBody(`LTV/CAC比率: ${formData.financialModel.unitEconomics.ltvCacRatio}`)
  layout.addSpace(5)

  layout.addBody('收入预测:')
  layout.addBody(`第一年: ${formData.financialModel.revenueProjection.year1.toLocaleString()}`)
  layout.addBody(`第二年: ${formData.financialModel.revenueProjection.year2.toLocaleString()}`)
  layout.addBody(`第三年: ${formData.financialModel.revenueProjection.year3.toLocaleString()}`)
  layout.addSpace(10)

  // 3. 盈利路径
  layout.addSubtitle('3. 盈利路径规划')
  layout.addBody(`盈亏平衡点: ${formData.profitability.breakEvenPoint} 个月`)
  layout.addSpace(5)

  layout.addBody(`规模化计划: ${formData.profitability.scalingPlan}`)
  layout.addSpace(5)

  layout.addBody('风险因素:')
  formData.profitability.riskFactors.forEach(risk => {
    layout.addListItem(risk)
  })

  layout.addSeparator()
}

// 主要PDF生成函数
export function generateWorkshopReport(reportData: WorkshopReportData): jsPDF {
  const doc = new jsPDF(PDF_CONFIG.orientation, 'mm', PDF_CONFIG.format)
  const layout = new PDFLayout(doc)

  // 添加文档头部
  layout.addTitle('创意加速器 - 工作坊完成报告', PDF_CONFIG.colors.primary)
  layout.addSpace(5)

  // 用户信息
  if (reportData.userProfile) {
    layout.addBody(`参与者: ${reportData.userProfile.name}`)
    if (reportData.userProfile.company) {
      layout.addBody(`公司: ${reportData.userProfile.company}`)
    }
    layout.addSpace(5)
  }

  layout.addBody(`工作坊类型: ${getWorkshopDisplayName(reportData.session.workshopId)}`)
  layout.addBody(`完成时间: ${new Date(reportData.session.updatedAt).toLocaleString()}`)
  layout.addBody(`总体进度: ${reportData.session.progress}%`)
  layout.addSpace(10)

  layout.addSeparator()

  // 根据工作坊类型生成相应报告
  const formData = reportData.session.formData

  switch (reportData.session.workshopId) {
    case 'demand-validation':
      generateDemandValidationReport(layout, formData as DemandValidationForm)
      break
    case 'mvp-builder':
      generateMVPBuilderReport(layout, formData as MVPBuilderForm)
      break
    case 'growth-hacking':
      generateGrowthHackingReport(layout, formData as GrowthHackingForm)
      break
    case 'profit-model':
      generateProfitModelReport(layout, formData as ProfitModelForm)
      break
    default:
      layout.addBody('未知的工作坊类型，无法生成报告内容。')
  }

  // 添加报告尾部
  layout.addSpace(20)
  layout.addSubtitle('总结与建议')
  layout.addBody('恭喜您完成了工作坊！根据您的填写内容，建议您：')
  layout.addListItem('继续验证和优化核心假设')
  layout.addListItem('定期回顾和更新业务策略')
  layout.addListItem('与潜在用户保持密切沟通')
  layout.addListItem('持续监控关键指标和进展')
  layout.addSpace(10)

  layout.addBody('如需更多支持，请访问创意加速器平台获取更多资源和工具。')
  layout.addSpace(5)

  // 添加页脚
  const totalPages = doc.internal.pages.length - 1
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(PDF_CONFIG.fontSize.caption)
    doc.setTextColor(PDF_CONFIG.colors.secondary)
    doc.text(
      `第 ${i} 页，共 ${totalPages} 页`,
      doc.internal.pageSize.width - PDF_CONFIG.margins.right,
      doc.internal.pageSize.height - PDF_CONFIG.margins.bottom + 5,
      { align: 'right' }
    )
    doc.text(
      `生成时间: ${new Date().toLocaleString()}`,
      PDF_CONFIG.margins.left,
      doc.internal.pageSize.height - PDF_CONFIG.margins.bottom + 5
    )
  }

  return doc
}

// 工具函数：获取工作坊显示名称
function getWorkshopDisplayName(workshopId: string): string {
  const displayNames: Record<string, string> = {
    'demand-validation': '需求验证实验室',
    'mvp-builder': 'MVP构建工作坊',
    'growth-hacking': '增长黑客训练营',
    'profit-model': '商业模式设计'
  }
  return displayNames[workshopId] || workshopId
}

// 导出报告为Blob（用于下载）
export function exportWorkshopReportAsBlob(reportData: WorkshopReportData): Blob {
  const doc = generateWorkshopReport(reportData)
  const pdfBlob = doc.output('blob')
  return pdfBlob
}

// 导出报告为DataURL（用于预览）
export function exportWorkshopReportAsDataURL(reportData: WorkshopReportData): string {
  const doc = generateWorkshopReport(reportData)
  return doc.output('datauristring')
}