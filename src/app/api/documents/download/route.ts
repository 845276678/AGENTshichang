import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { ResearchReportService } from '@/lib/services/research-report.service'
import { BusinessPlanSessionService } from '@/lib/business-plan/session-service'
import { transformReportToGuide, generateGuideMarkdown, type LandingCoachGuide } from '@/lib/utils/transformReportToGuide'
import { generateGuidePDF } from '@/lib/utils/pdfGenerator'
import JSZip from 'jszip'
import type { ResearchReport, User, Idea } from '@/types/entities'

// 强制动态渲染
export const dynamic = 'force-dynamic'

// 扩展报告类型以包含idea关系
interface ReportWithIdea extends Partial<ResearchReport> {
  id: string
  userId: string
  status: string
  progress: number
  createdAt: Date
  idea?: {
    id: string
    title: string
    description: string
    category: string
    tags: string[]
  }
  basicAnalysis?: {
    summary?: string
    marketAnalysis?: {
      size?: string
      competition?: string
      opportunities?: string[] | string
      challenges?: string[] | string
    }
    userAnalysis?: {
      targetUsers?: string
      painPoints?: string[] | string
      solutions?: string[] | string
    }
  }
  researchMethods?: {
    primary?: string
    secondary?: string
    dataCollection?: string
  }
  dataSources?: {
    primary?: string[] | string
    secondary?: string[] | string
    reliability?: string
  }
  mvpGuidance?: {
    productDefinition?: {
      coreFeatures?: string[] | string
      uniqueValue?: string
      scope?: string
    }
    developmentPlan?: {
      phases?: Array<{
        name: string
        duration: string
        deliverables: string[]
      }>
      techStack?: string[] | string
      estimatedCost?: string
    }
    validationStrategy?: {
      hypotheses?: string[] | string
      experiments?: string[] | string
      metrics?: string[] | string
      timeline?: string
    }
  }
  businessModel?: {
    revenueModel?: {
      streams?: string[] | string
    }
    costStructure?: string[] | string
    pricingStrategy?: string
    scalability?: string
    operations?: {
      team?: string[] | string
      processes?: string[] | string
      infrastructure?: string[] | string
    }
  }
  summary: string | null
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reportId = searchParams.get('reportId')
    const sessionId = searchParams.get('sessionId')
    const format = searchParams.get('format') || 'zip' // zip, pdf, docx, markdown, txt
    const type = searchParams.get('type') || 'report' // report, guide

    if (!reportId && !sessionId) {
      return NextResponse.json(
        { error: '缺少reportId或sessionId参数' },
        { status: 400 }
      )
    }

    console.log(`📥 用户请求下载文档: reportId=${reportId}, sessionId=${sessionId}, format=${format}, type=${type}`)

    // 验证用户身份（可选）
    const authHeader = request.headers.get('Authorization')
    let userId = null

    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '')
        const decoded = await verifyToken(token)
        userId = decoded.userId
      } catch (error) {
        console.warn('Invalid token in download request:', error)
      }
    }

    // 获取调研报告数据 - 支持reportId或sessionId
    let report: ReportWithIdea | null = null
    let guide: LandingCoachGuide | null = null

    if (reportId) {
      report = await ResearchReportService.findById(reportId, true) as ReportWithIdea | null
    } else if (sessionId) {
      // 通过sessionId查找关联的报告
      const session = await BusinessPlanSessionService.getSessionWithReport(sessionId)
      const sessionReport = session?.reports?.[0]
      if (sessionReport?.guide) {
        // 如果session已经有guide，直接使用
        guide = sessionReport.guide as LandingCoachGuide
      } else if (sessionReport) {
        // 否则尝试从report数据转换
        report = sessionReport as any
      }
    }

    if (!report && !guide) {
      return NextResponse.json(
        { error: '调研报告或商业计划不存在' },
        { status: 404 }
      )
    }

    // 如果有report但还需要状态检查
    if (report && report.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: '报告尚未完成生成' },
        { status: 400 }
      )
    }

    // 权限检查（可选，仅在有userId且有report时检查）
    if (userId && report && report.userId !== userId) {
      console.warn(`User ${userId} downloading report ${reportId || sessionId} owned by ${report.userId}`)
    }

    let content = ''
    let filename = ''

    if (type === 'guide') {
      // 生成落地指南
      try {
        const guideToUse = guide || transformReportToGuide(report!)
        content = generateGuideMarkdown(guideToUse)
        filename = `${guideToUse.metadata.ideaTitle || 'CreativeIdea'}-落地指南`
      } catch (error) {
        console.error('Failed to generate guide:', error)
        return NextResponse.json(
          { error: '生成落地指南失败' },
          { status: 500 }
        )
      }
    } else if (report) {
      // 生成调研报告
      content = await generateReportMarkdown(report)
      filename = `${report.idea?.title || 'CreativeIdea'}-调研报告`
    } else {
      return NextResponse.json(
        { error: '无法生成报告，缺少必要数据' },
        { status: 400 }
      )
    }

    if (format === 'markdown') {
      // 直接返回Markdown文件
      return new NextResponse(content, {
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}.md"`
        }
      })
    }

    if (format === 'zip') {
      // 创建ZIP文件
      const zip = new JSZip()

      // 添加主文档
      zip.file(`${filename}.md`, content)

      // 如果是落地指南，添加额外的文件
      if (type === 'guide') {
        const guideToUse = guide || transformReportToGuide(report!)

        // 添加行动清单
        const actionItems = generateActionItemsList(guideToUse)
        zip.file('行动清单.md', actionItems)

        // 添加项目时间线
        const timeline = generateProjectTimeline(guideToUse)
        zip.file('项目时间线.md', timeline)
      }

      // 生成ZIP文件
      const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })

      return new NextResponse(zipBuffer as BodyInit, {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="${filename}.zip"`
        }
      })
    }

    if (format === 'pdf' || format === 'docx') {
      // 生成PDF文件
      if (format === 'pdf') {
        try {
          const guideToUse = guide || (type === 'guide' && report ? transformReportToGuide(report) : null)

          if (!guideToUse) {
            return NextResponse.json(
              { error: 'PDF生成需要商业计划指南数据' },
              { status: 400 }
            )
          }

          const pdfBuffer = await generateGuidePDF(guideToUse)

          return new NextResponse(pdfBuffer, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="${filename}.pdf"`
            }
          })
        } catch (error) {
          console.error('PDF generation failed:', error)
          return NextResponse.json(
            { error: 'PDF生成失败，请稍后重试或选择其他格式' },
            { status: 500 }
          )
        }
      }

      // DOCX格式暂不支持
      return NextResponse.json(
        { error: 'DOCX格式暂不支持，请选择PDF、TXT或Markdown格式' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      error: '不支持的文件格式'
    }, { status: 400 })

  } catch (error) {
    console.error('❌ 文档下载失败:', error)
    return NextResponse.json(
      { error: '下载失败，请稍后重试' },
      { status: 500 }
    )
  }
}

/**
 * 生成调研报告的Markdown内容
 */
async function generateReportMarkdown(report: ReportWithIdea): Promise<string> {
  const idea = report.idea
  const markdown = `# ${idea?.title || '创意项目'} - 调研报告

> 生成时间：${new Date(report.createdAt).toLocaleDateString()}
> 报告状态：${report.status}
> 完成进度：${report.progress}%

## 📋 项目概述

**项目名称：** ${idea?.title || 'N/A'}

**项目分类：** ${idea?.category || 'N/A'}

**项目描述：**
${idea?.description || 'N/A'}

**项目标签：**
${idea?.tags ? idea.tags.join('、') : 'N/A'}

---

## 📊 基础分析

${report.basicAnalysis ? formatAnalysisSection(report.basicAnalysis) : '基础分析数据不完整'}

---

## 🔬 研究方法

${report.researchMethods ? formatResearchMethodsSection(report.researchMethods) : '研究方法数据不完整'}

---

## 📈 数据来源

${report.dataSources ? formatDataSourcesSection(report.dataSources) : '数据来源信息不完整'}

---

## 🚀 MVP指导

${report.mvpGuidance ? formatMVPGuidanceSection(report.mvpGuidance) : 'MVP指导数据不完整'}

---

## 💼 商业模式

${report.businessModel ? formatBusinessModelSection(report.businessModel) : '商业模式数据不完整'}

---

## 📑 总结

${report.summary || '本调研报告基于AI分析生成，为创意项目的商业化提供了全面的参考依据。'}

---

*本报告由AI创意调研系统生成 - ${new Date().toLocaleDateString()}*
`

  return markdown
}

/**
 * 格式化分析部分
 */
function formatAnalysisSection(analysis: ReportWithIdea['basicAnalysis']): string {
  if (!analysis) return '基础分析数据不完整'
  if (typeof analysis === 'string') return analysis

  let content = ''

  if (analysis.summary) {
    content += `### 核心洞察\n${analysis.summary}\n\n`
  }

  if (analysis.marketAnalysis) {
    content += `### 市场分析\n`
    if (analysis.marketAnalysis.size) content += `- **市场规模：** ${analysis.marketAnalysis.size}\n`
    if (analysis.marketAnalysis.competition) content += `- **竞争情况：** ${analysis.marketAnalysis.competition}\n`
    if (analysis.marketAnalysis.opportunities) {
      content += `- **市场机会：**\n`
      const opportunities = Array.isArray(analysis.marketAnalysis.opportunities)
        ? analysis.marketAnalysis.opportunities
        : [analysis.marketAnalysis.opportunities]
      opportunities.forEach((opp) => content += `  - ${opp}\n`)
    }
    content += '\n'
  }

  if (analysis.userAnalysis) {
    content += `### 用户分析\n`
    if (analysis.userAnalysis.targetUsers) content += `- **目标用户：** ${analysis.userAnalysis.targetUsers}\n`
    if (analysis.userAnalysis.painPoints) {
      content += `- **用户痛点：**\n`
      const painPoints = Array.isArray(analysis.userAnalysis.painPoints)
        ? analysis.userAnalysis.painPoints
        : [analysis.userAnalysis.painPoints]
      painPoints.forEach((pain) => content += `  - ${pain}\n`)
    }
    content += '\n'
  }

  return content || '分析数据格式不完整'
}

/**
 * 格式化研究方法部分
 */
function formatResearchMethodsSection(methods: ReportWithIdea['researchMethods']): string {
  if (!methods) return '研究方法数据不完整'
  if (typeof methods === 'string') return methods

  let content = '### 研究方法论\n\n'

  if (methods.primary) {
    content += `**主要研究方法：** ${methods.primary}\n\n`
  }

  if (methods.secondary) {
    content += `**辅助研究方法：** ${methods.secondary}\n\n`
  }

  if (methods.dataCollection) {
    content += `**数据收集方式：** ${methods.dataCollection}\n\n`
  }

  return content
}

/**
 * 格式化数据来源部分
 */
function formatDataSourcesSection(sources: ReportWithIdea['dataSources'] | string[] | undefined): string {
  if (!sources) return '数据来源信息不完整'
  if (typeof sources === 'string') return sources

  let content = '### 数据来源清单\n\n'

  if (Array.isArray(sources)) {
    sources.forEach((source: string, index: number) => {
      content += `${index + 1}. ${source}\n`
    })
  } else if (sources.primary || sources.secondary) {
    if (sources.primary) content += `**主要数据源：** ${sources.primary}\n\n`
    if (sources.secondary) content += `**次要数据源：** ${sources.secondary}\n\n`
  }

  return content
}

/**
 * 格式化MVP指导部分
 */
function formatMVPGuidanceSection(mvp: ReportWithIdea['mvpGuidance']): string {
  if (!mvp) return 'MVP指导数据不完整'
  if (typeof mvp === 'string') return mvp

  let content = ''

  if (mvp.productDefinition) {
    content += `### 产品定义\n`
    if (mvp.productDefinition.coreFeatures) {
      content += `**核心功能：**\n`
      const features = Array.isArray(mvp.productDefinition.coreFeatures)
        ? mvp.productDefinition.coreFeatures
        : [mvp.productDefinition.coreFeatures]
      features.forEach((feature: string) => content += `- ${feature}\n`)
    }
    if (mvp.productDefinition.uniqueValue) {
      content += `\n**独特价值：** ${mvp.productDefinition.uniqueValue}\n`
    }
    content += '\n'
  }

  if (mvp.developmentPlan) {
    content += `### 开发计划\n`
    if (mvp.developmentPlan.phases) {
      content += `**开发阶段：**\n`
      mvp.developmentPlan.phases.forEach((phase: { name?: string; duration?: string }, index: number) => {
        content += `${index + 1}. ${phase.name || `阶段${index + 1}`} (${phase.duration || 'N/A'})\n`
      })
    }
    if (mvp.developmentPlan.estimatedCost) {
      content += `\n**预算估算：** ${mvp.developmentPlan.estimatedCost}\n`
    }
    content += '\n'
  }

  return content
}

/**
 * 格式化商业模式部分
 */
function formatBusinessModelSection(business: ReportWithIdea['businessModel']): string {
  if (!business) return '商业模式数据不完整'
  if (typeof business === 'string') return business

  let content = ''

  if (business.revenueModel) {
    content += `### 收入模式\n`
    if (business.revenueModel.streams) {
      const streams = Array.isArray(business.revenueModel.streams)
        ? business.revenueModel.streams
        : [business.revenueModel.streams]
      streams.forEach((stream: string) => content += `- ${stream}\n`)
    }
    content += '\n'
  }

  if (business.costStructure) {
    content += `### 成本结构\n`
    const costs = Array.isArray(business.costStructure)
      ? business.costStructure
      : [business.costStructure]
    costs.forEach((cost: string) => content += `- ${cost}\n`)
    content += '\n'
  }

  if (business.pricingStrategy) {
    content += `### 定价策略\n${business.pricingStrategy}\n\n`
  }

  return content
}

/**
 * 生成行动清单文档
 */
function generateActionItemsList(guide: LandingCoachGuide): string {
  return `# 创意落地行动清单

## 📊 第一阶段：现状认知与方向确认

${guide.currentSituation.actionItems.map((item: string, index: number) => `${index + 1}. ${item}`).join('\n')}

## 🚀 第二阶段：M
VP产品定义与验证

${guide.mvpDefinition.actionItems.map((item: string, index: number) => `${index + 1}. ${item}`).join('\n')}

## 💼 第三阶段：商业化落地与运营

${guide.businessExecution.actionItems.map((item: string, index: number) => `${index + 1}. ${item}`).join('\n')}

---

*建议按照阶段顺序执行，每个阶段完成后再进入下一阶段*
`
}

/**
 * 生成项目时间线文档
 */
function generateProjectTimeline(guide: LandingCoachGuide): string {
  return `# ${guide.metadata.ideaTitle} - 项目实施时间线

## 总体时间框架
- **实施周期：** ${guide.metadata.implementationTimeframe}
- **可行性评估：** ${guide.metadata.confidenceLevel}%

## 阶段一：现状认知与方向确认 (第1-2个月)

### 关键里程碑
- 完成市场调研
- 验证用户需求
- 确定产品方向

### 主要活动
${guide.currentSituation.actionItems.map((item: string) => `- ${item}`).join('\n')}

## 阶段二：MVP产品定义与验证 (第3-4个月)

### 关键里程碑
- 完成MVP开发
- 获得早期用户反馈
- 验证核心假设

### 主要活动
${guide.mvpDefinition.actionItems.map((item: string) => `- ${item}`).join('\n')}

## 阶段三：商业化落地与运营 (第5-6个月)

### 关键里程碑
- 正式产品发布
- 建立运营体系
- 实现收入增长

### 主要活动
${guide.businessExecution.actionItems.map((item: string) => `- ${item}`).join('\n')}

---

*时间线可根据实际情况调整，关键是确保每个阶段的目标达成*
`
}
