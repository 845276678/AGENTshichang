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
    const message = error instanceof Error ? error.message : "生成商业计划书失败"
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

    // 依次处理每个阶段
    for (let i = 0; i < state.stages.length; i++) {
      const stage = state.stages[i]

      if (stage.status === 'pending') {
        // 更新为进行中
        stage.status = 'in_progress'
        stage.progress = 0
        stage.startTime = new Date().toISOString()
        await saveGenerationState(state)

        // 模拟生成过程（实际项目中这里调用AI服务）
        await simulateStageGeneration(stage, state.scenario)

        // 更新为完成
        stage.status = 'completed'
        stage.progress = 100
        stage.endTime = new Date().toISOString()
        await saveGenerationState(state)

        // 为了演示效果，每个阶段间隔一些时间
        await new Promise(resolve => setTimeout(resolve, 2000))
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

// 模拟阶段生成（实际项目中替换为真实AI生成）
async function simulateStageGeneration(stage: any, scenario: any) {
  // 模拟渐进式进度更新
  for (let progress = 10; progress <= 90; progress += 20) {
    stage.progress = progress
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  // 根据阶段类型生成不同的输出内容
  switch (stage.type) {
    case 'market_analysis':
      stage.outputs = {
        marketSize: "目标市场规模约100亿元",
        competitors: ["竞品A", "竞品B", "竞品C"],
        opportunities: "市场空白点分析显示存在显著机会",
        threats: "主要挑战来自技术门槛和用户接受度"
      }
      break

    case 'business_model':
      stage.outputs = {
        revenueStreams: ["订阅收费", "交易佣金", "增值服务"],
        costStructure: "主要成本包括技术开发、运营维护、市场推广",
        valueProposition: "为用户提供高效便捷的AI驱动解决方案",
        channels: ["官方网站", "应用商店", "合作伙伴"]
      }
      break

    case 'technical_plan':
      stage.outputs = {
        architecture: "采用微服务架构，支持高并发和弹性扩展",
        technology: ["React/Next.js", "Node.js", "MongoDB", "Redis"],
        timeline: "预计6个月完成核心功能开发",
        risks: "技术风险主要集中在AI算法优化和数据处理效率"
      }
      break

    case 'financial_projection':
      stage.outputs = {
        revenue: "预计第一年营收500万元，第三年突破5000万元",
        costs: "初期投入300万元，运营成本占营收的60%",
        profit: "预计第二年实现盈亏平衡，第三年净利润率达到15%",
        funding: "建议A轮融资1000万元用于产品开发和市场拓展"
      }
      break

    default:
      stage.outputs = {
        summary: `${stage.name}阶段分析完成`,
        details: "详细分析结果已生成，包含关键洞察和建议",
        nextSteps: "建议继续关注后续实施要点"
      }
  }

  stage.insights = [
    `${stage.name}的关键成功因素已识别`,
    "建议重点关注用户反馈和市场验证",
    "风险控制措施已制定完善"
  ]
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
      creditsCost: 0 // 通过商业计划生成的报告免费
    })

    // 更新报告内容
    await ResearchReportService.update(report.id, {
      reportData: reportData,
      basicAnalysis: reportData.basicAnalysis,
      researchMethods: reportData.researchMethods,
      dataSources: reportData.dataSources,
      mvpGuidance: reportData.mvpGuidance,
      businessModel: reportData.businessModel,
      summary: `基于AI商业计划生成器创建的《${state.scenario?.ideaTitle || '创意项目'}》深度分析报告`,
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
