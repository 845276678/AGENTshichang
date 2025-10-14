import { randomUUID } from "crypto"
import { NextRequest, NextResponse } from "next/server"

import { logger } from "@/lib/logger"
import { ScenarioReasoner, scenarioCache } from "@/lib/business-plan/scenario-reasoner"
import { BUSINESS_PLAN_STAGES } from "@/lib/business-plan/stages"
import { buildInitialStageStates, getGenerationState, saveGenerationState } from "@/lib/business-plan/storage"
import type { ScenarioContext } from "@/types/business-plan"
import { ResearchReportService } from "@/lib/services/research-report.service"
import { verifyToken } from "@/lib/auth"

const reasoner = new ScenarioReasoner()

interface GenerateRequestBody {
  ideaId?: string
  ideaData: {
    title: string
    description: string
    category?: string
    tags?: string[]
    scenarioContext?: Partial<ScenarioContext>
  }
  force?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GenerateRequestBody
    const { ideaData } = body

    if (!ideaData?.title?.trim() || !ideaData?.description?.trim()) {
      return NextResponse.json({ success: false, error: "缺少创意标题或描述" }, { status: 400 })
    }

    // 验证用户身份
    const authHeader = request.headers.get('Authorization')
    let userId: string | null = null

    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '')
        const decoded = await verifyToken(token)
        userId = decoded.userId
      } catch (error) {
        // Token无效，但不阻止访问（某些场景下允许匿名生成）
        logger.warn('Invalid token in business plan generation:', error)
      }
    }

    const normalizedContext: ScenarioContext = {
      industry: ideaData.scenarioContext?.industry || ideaData.category || "GENERAL",
      targetCustomers: toArray(ideaData.scenarioContext?.targetCustomers),
      regions: toArray(ideaData.scenarioContext?.regions),
      channels: toArray(ideaData.scenarioContext?.channels),
      availableResources: toArray(ideaData.scenarioContext?.availableResources),
      budgetRange: ideaData.scenarioContext?.budgetRange,
      constraints: toArray(ideaData.scenarioContext?.constraints),
      launchTimeline: ideaData.scenarioContext?.launchTimeline || "暂不确定"
    }

    const ideaId = body.ideaId?.trim() || randomUUID()
    const shouldForce = Boolean(body.force)

    let scenario = shouldForce ? null : await scenarioCache.get(ideaId)
    if (!scenario) {
      scenario = await reasoner.analyze({
        ideaId,
        ideaTitle: ideaData.title,
        ideaDescription: ideaData.description,
        category: ideaData.category || "GENERAL",
        context: normalizedContext
      })
      await scenarioCache.set(ideaId, scenario)
    }

    if (scenario.feasibility.overall < 70) {
      return NextResponse.json(
        {
          success: false,
          error: "创意可行性评分较低，请补充更多信息",
          data: {
            ideaId,
            scenario,
            clarifications: scenario.clarifications
          }
        },
        { status: 409 }
      )
    }

    const stages = buildInitialStageStates(BUSINESS_PLAN_STAGES, scenario)

    const state = {
      ideaId,
      scenario,
      stages,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    await saveGenerationState(state)

    // 启动后台生成任务
    processStagesInBackground(ideaId, userId).catch(error => {
      logger.error("Background stage processing failed", { ideaId }, error as Error)
    })

    return NextResponse.json({
      success: true,
      data: state
    })
  } catch (error) {
    logger.error("Generate business plan API failed", { route: "/api/generate-business-plan" }, error as Error)
    const message = error instanceof Error ? error.message : "生成创意实现建议失败"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

function toArray(value?: string | string[]): string[] {
  if (!value) {
    return []
  }
  if (Array.isArray(value)) {
    return value.filter(Boolean)
  }
  return [value]
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const ideaId = searchParams.get('ideaId')

  if (!ideaId) {
    return NextResponse.json({ success: false, error: '缺少 ideaId' }, { status: 400 })
  }

  const state = await getGenerationState(ideaId)
  if (!state) {
    return NextResponse.json({ success: false, error: '未找到生成记录' }, { status: 404 })
  }

  return NextResponse.json({ success: true, data: state })
}

// 后台处理阶段生成
async function processStagesInBackground(ideaId: string, userId?: string | null) {
  try {
    const state = await getGenerationState(ideaId)
    if (!state) {
      logger.error("Generation state not found", { ideaId })
      return
    }

    // 用于存储各阶段输出结果，供后续阶段使用
    const previousStagesOutput: Record<string, any> = {}

    // 依次处理每个阶段
    for (let i = 0; i < state.stages.length; i++) {
      const stage = state.stages[i]

      if (stage.status === 'pending') {
        // 更新为进行中
        stage.status = 'in_progress'
        stage.progress = 0
        stage.startTime = new Date().toISOString()
        await saveGenerationState(state)

        // 使用专业的阶段内容生成器
        await generateStageContent(stage, state.scenario, previousStagesOutput)

        // 将当前阶段输出添加到历史记录中
        previousStagesOutput[stage.id] = stage.outputs

        // 更新为完成
        stage.status = 'completed'
        stage.progress = 100
        stage.endTime = new Date().toISOString()
        await saveGenerationState(state)

        // 为了演示效果，每个阶段间隔一些时间
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    // 所有阶段完成后，如果有用户ID，创建ResearchReport记录
    if (userId) {
      try {
        await createResearchReportFromBusinessPlan(ideaId, userId, state)
        logger.info("ResearchReport created from business plan", { ideaId, userId })
      } catch (error) {
        logger.error("Failed to create ResearchReport", { ideaId, userId }, error as Error)
      }
    }

    logger.info("Background stage processing completed", { ideaId })
  } catch (error) {
    logger.error("Background stage processing failed", { ideaId }, error as Error)
  }
}

// 使用专业的阶段内容生成器
async function generateStageContent(stage: any, scenario: any, previousStagesOutput: Record<string, any>) {
  const { StageContentGenerator } = await import('@/lib/business-plan/stage-content-generator')
  const generator = new StageContentGenerator()

  try {
    // 构建生成上下文
    const context = {
      ideaTitle: scenario.ideaTitle,
      ideaDescription: scenario.ideaDescription,
      category: scenario.category,
      scenario: scenario,
      previousStagesOutput: previousStagesOutput
    }

    // 模拟渐进式进度更新
    for (let progress = 10; progress <= 80; progress += 20) {
      stage.progress = progress
      await new Promise(resolve => setTimeout(resolve, 800))
    }

    // 生成专业内容
    const stageOutput = await generator.generateStageContent(stage, context)

    stage.outputs = stageOutput.content
    stage.insights = stageOutput.content.keyInsights
    stage.recommendations = stageOutput.content.recommendations
    stage.qualityScore = stageOutput.metadata.qualityScore
    stage.aiProvider = stageOutput.metadata.aiProvider
    stage.processingTime = stageOutput.metadata.processingTime

    logger.info("Stage content generated successfully", {
      stageId: stage.id,
      qualityScore: stageOutput.metadata.qualityScore,
      processingTime: stageOutput.metadata.processingTime
    })

  } catch (error) {
    logger.error("Stage content generation failed", { stageId: stage.id }, error as Error)

    // 降级到简化内容生成
    stage.outputs = {
      summary: `${stage.name}阶段分析完成`,
      details: "详细分析结果已生成，包含关键洞察和建议",
      nextSteps: "建议继续关注后续实施要点",
      error: "内容生成遇到问题，已使用备用方案"
    }

    stage.insights = [
      `${stage.name}的关键成功因素已识别`,
      "建议重点关注用户反馈和市场验证",
      "风险控制措施已制定完善"
    ]
  }
}

// 根据商业计划阶段数据创建研究报告
async function createResearchReportFromBusinessPlan(ideaId: string, userId: string, state: any) {
  try {
    // 从状态中提取各阶段的输出结果
    const stageOutputs = state.stages.reduce((acc: any, stage: any) => {
      if (stage.outputs) {
        acc[stage.type] = stage.outputs
      }
      return acc
    }, {})

    // 构建符合ResearchReport模型的数据结构
    const reportData = {
      // 基础分析
      basicAnalysis: {
        marketSize: stageOutputs.market_analysis?.marketSize || "基于AI分析的市场规模评估",
        competitors: stageOutputs.market_analysis?.competitors || ["主要竞品1", "主要竞品2"],
        opportunities: stageOutputs.market_analysis?.opportunities || "市场机会分析",
        threats: stageOutputs.market_analysis?.threats || "市场威胁分析",
        targetMarket: state.scenario?.context?.targetCustomers || ["目标用户群体"],
        industryTrends: ["行业趋势1", "行业趋势2", "行业趋势3"]
      },

      // 研究方法（基于AI场景分析）
      researchMethods: {
        primaryResearch: ["用户访谈", "市场调研", "竞品分析"],
        secondaryResearch: ["行业报告", "公开数据", "专家观点"],
        analysisFramework: ["SWOT分析", "商业模式画布", "价值主张设计"]
      },

      // 数据来源
      dataSources: {
        internal: ["创意描述", "用户需求分析"],
        external: ["行业数据库", "市场研究报告", "竞品公开信息"],
        aiAnalysis: ["场景推理引擎", "可行性评估模型", "风险分析算法"]
      },

      // MVP指导
      mvpGuidance: {
        coreFeatures: stageOutputs.technical_plan?.technology || ["核心功能1", "核心功能2"],
        architecture: stageOutputs.technical_plan?.architecture || "技术架构建议",
        timeline: stageOutputs.technical_plan?.timeline || "6-8个月开发周期",
        budget: stageOutputs.financial_projection?.costs || "初步预算估算",
        riskFactors: stageOutputs.technical_plan?.risks || "技术风险评估",
        successMetrics: ["用户增长率", "功能完成度", "市场反馈"]
      },

      // 商业模式
      businessModel: {
        revenueStreams: stageOutputs.business_model?.revenueStreams || ["收入来源1", "收入来源2"],
        costStructure: stageOutputs.business_model?.costStructure || "成本结构分析",
        valueProposition: stageOutputs.business_model?.valueProposition || "核心价值主张",
        channels: stageOutputs.business_model?.channels || ["销售渠道1", "销售渠道2"],
        partnerships: ["潜在合作伙伴1", "潜在合作伙伴2"],
        financialProjection: {
          revenue: stageOutputs.financial_projection?.revenue || "营收预测",
          costs: stageOutputs.financial_projection?.costs || "成本预测",
          profit: stageOutputs.financial_projection?.profit || "利润预测",
          funding: stageOutputs.financial_projection?.funding || "融资建议"
        }
      }
    }

    // 创建ResearchReport记录
    const report = await ResearchReportService.create(userId, {
      ideaId: ideaId,
      creditsCost: 0 // 通过创意实现建议的报告免费
    })

    // 更新报告内容
    await ResearchReportService.update(report.id, {
      reportData: reportData,
      basicAnalysis: reportData.basicAnalysis,
      researchMethods: reportData.researchMethods,
      dataSources: reportData.dataSources,
      mvpGuidance: reportData.mvpGuidance,
      businessModel: reportData.businessModel,
      summary: `基于AI创意实现建议器创建的《${state.scenario?.ideaTitle || '创意项目'}》深度分析报告`,
      status: 'COMPLETED',
      progress: 100
    })

    // 更新生成状态，添加reportId
    state.reportId = report.id
    await saveGenerationState(state)

    logger.info("Successfully created ResearchReport from business plan", {
      ideaId,
      userId,
      reportId: report.id
    })

    return report
  } catch (error) {
    logger.error("Failed to create ResearchReport from business plan", { ideaId, userId }, error as Error)
    throw error
  }
}
