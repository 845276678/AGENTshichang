import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/lib/auth'
import { SimplifiedBusinessPlanGenerator } from '@/lib/business-plan/simplified-generator'
import type { BiddingSnapshot } from '@/lib/business-plan/types'
import type { SimplifiedBusinessPlan } from '@/lib/business-plan/simplified-guide-structure'
import type { LandingCoachGuide } from '@/lib/utils/transformReportToGuide'

interface DirectGenerateRequestBody {
  ideaTitle: string
  ideaDescription: string
  source?: string
  useSimplifiedFormat?: boolean
  userContext?: {
    location?: string
    background?: string
  }
}

/**
 * 将简化版商业计划转换为LandingCoachGuide格式
 * 以便使用现有的显示组件
 */
function convertToLandingCoachGuide(plan: SimplifiedBusinessPlan): LandingCoachGuide {
  return {
    // 版块1：用户需求与市场定位
    currentSituation: {
      title: '用户需求与市场定位',
      summary: `基于创意《${plan.metadata.ideaTitle}》的用户需求洞察与市场定位分析`,
      keyInsights: [
        `目标市场：${plan.userAndMarket.marketAnalysis.size}`,
        `核心用户：${plan.userAndMarket.targetUsers.primary}`,
        `主要应用场景：${plan.userAndMarket.applicationScenarios.primary}`
      ],
      marketReality: {
        marketSize: plan.userAndMarket.marketAnalysis.size,
        competition: plan.userAndMarket.marketAnalysis.competitors.join('、'),
        opportunities: plan.userAndMarket.marketAnalysis.opportunities,
        challenges: plan.userAndMarket.marketAnalysis.trends.map(trend => `市场趋势变化：${trend}`)
      },
      userNeeds: {
        targetUsers: plan.userAndMarket.targetUsers.primary,
        painPoints: plan.userAndMarket.targetUsers.painPoints,
        solutions: plan.userAndMarket.applicationScenarios.useCases
      },
      actionItems: [
        '深入用户访谈验证需求假设',
        '制作用户画像和需求地图',
        '建立持续的市场反馈机制'
      ]
    },
    // 版块2：产品方案与技术实现
    mvpDefinition: {
      title: '产品方案与技术实现',
      productConcept: {
        coreFeatures: plan.productAndTech.keyFeatures,
        uniqueValue: plan.productAndTech.coreValue,
        minimumScope: `专注核心价值的MVP方案：${plan.productAndTech.differentiators.join('，')}`
      },
      developmentPlan: {
        phases: plan.productAndTech.developmentPlan.milestones.map(milestone => ({
          name: milestone.phase,
          duration: milestone.duration,
          deliverables: milestone.deliverables,
          resources: ['技术开发团队', 'UI/UX设计师', '产品经理']
        })),
        techStack: plan.productAndTech.techStack.recommended,
        estimatedCost: `技术选择理由：${plan.productAndTech.techStack.reasoning}`
      },
      validationStrategy: {
        hypotheses: ['产品核心功能满足用户需求', '技术方案可行且成本合理', 'MVP能够验证商业假设'],
        experiments: ['用户原型测试', '技术概念验证', 'A/B功能测试'],
        successMetrics: ['用户满意度≥80%', '技术性能达标', '核心功能使用率≥60%'],
        timeline: plan.productAndTech.developmentPlan.timeline
      },
      actionItems: [
        '完成详细技术架构设计',
        '制作可测试的MVP原型',
        '搭建开发和测试环境'
      ]
    },
    // 版块3：验证策略与迭代路径
    validationAndIteration: {
      title: '验证策略与迭代路径',
      summary: `针对创意《${plan.metadata.ideaTitle}》的系统化验证与快速迭代策略`,
      hypotheses: plan.validationAndIteration.hypotheses,
      validationMethods: plan.validationAndIteration.validationMethods,
      iterationPlan: {
        cycles: plan.validationAndIteration.iterationPlan.cycles,
        feedbackChannels: plan.validationAndIteration.iterationPlan.feedbackChannels,
        decisionFramework: plan.validationAndIteration.iterationPlan.decisionFramework
      },
      riskManagement: plan.validationAndIteration.riskMitigation,
      actionItems: [
        '建立数据驱动的验证体系',
        '设计快速迭代反馈循环',
        '制定关键节点决策机制'
      ]
    },
    // 版块4：商业模式与资源规划
    businessExecution: {
      title: '商业模式与资源规划',
      businessModel: {
        revenueStreams: plan.businessAndResources.businessModel.revenueStreams,
        costStructure: plan.businessAndResources.businessModel.costStructure,
        pricingStrategy: plan.businessAndResources.businessModel.pricingStrategy,
        scalability: `基于${plan.metadata.contentDepth}深度分析的可扩展性评估`
      },
      launchStrategy: {
        phases: plan.businessAndResources.launchStrategy.phases.map(phase => ({
          name: phase.name,
          timeline: phase.timeline,
          goals: phase.goals,
          tactics: phase.tactics
        })),
        marketingChannels: plan.businessAndResources.launchStrategy.channels,
        budgetAllocation: [
          `开发预算：${plan.businessAndResources.teamAndResources.budget.development}`,
          `营销预算：${plan.businessAndResources.teamAndResources.budget.marketing}`,
          `运营预算：${plan.businessAndResources.teamAndResources.budget.operations}`
        ]
      },
      operationalPlan: {
        teamStructure: plan.businessAndResources.teamAndResources.coreTeam.map(member =>
          `${member.role}（${member.skills.join('、')}）`
        ),
        processes: ['建立敏捷团队协作流程', '制定产品开发里程碑', '设立用户反馈闭环机制'],
        infrastructure: ['云原生开发环境', '自动化部署流水线', '实时监控和分析平台'],
        riskManagement: plan.validationAndIteration.riskMitigation.map(risk =>
          `${risk.risk}（${risk.impact}影响）: ${risk.mitigation}`
        )
      },
      actionItems: [
        '组建核心创始团队',
        '建立规范的开发和运营流程',
        '制定详细的预算和里程碑计划'
      ]
    },
    metadata: {
      ideaTitle: plan.metadata.ideaTitle,
      generatedAt: plan.metadata.generatedAt,
      estimatedReadTime: plan.metadata.contentDepth === 'basic' ? 10 :
                        plan.metadata.contentDepth === 'detailed' ? 18 : 28,
      implementationTimeframe: '90天',
      confidenceLevel: Math.round(plan.metadata.confidence * 100),
      source: 'direct-generation-4modules'
    }
  }
}

/**
 * 直接生成创意实现建议API
 * 跳过AI竞价环节，使用简化版4模块结构快速生成
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as DirectGenerateRequestBody

    // 验证必要参数
    if (!body.ideaTitle?.trim() || !body.ideaDescription?.trim()) {
      return NextResponse.json({
        success: false,
        error: "缺少创意标题或描述"
      }, { status: 400 })
    }

    console.log('🚀 开始直接生成创意实现建议', {
      title: body.ideaTitle,
      description: body.ideaDescription.slice(0, 100) + '...',
      source: body.source,
      useSimplifiedFormat: body.useSimplifiedFormat
    })

    // 1. 首先评估创意成熟度
    let maturityScore
    try {
      console.log('📊 正在评估创意成熟度...')

      // 调用现有的评分API
      const scoringResult = await fetch(`${new URL(request.url).origin}/api/score-creative`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ideaId: `direct_${Date.now()}`,
          ideaContent: body.ideaDescription,
          aiMessages: [],  // 直接生成模式没有AI讨论消息
          bids: {},       // 直接生成模式没有竞价
          userId: null    // 匿名用户
        })
      })

      if (scoringResult.ok) {
        const scoringData = await scoringResult.json()
        if (scoringData.success) {
          maturityScore = {
            totalScore: scoringData.result.totalScore,
            level: scoringData.result.level,
            confidence: scoringData.result.confidence,
            strengths: scoringData.result.validSignals || [],
            weaknesses: scoringData.result.weakDimensions || []
          }
          console.log(`✅ 成熟度评估完成: ${maturityScore.totalScore}/10 (${maturityScore.level})`)
        }
      }
    } catch (error) {
      console.warn('⚠️ 成熟度评估失败，使用默认值:', error)
    }

    // 如果评分失败，使用默认值
    if (!maturityScore) {
      maturityScore = {
        totalScore: 6,
        level: 'MEDIUM',
        confidence: 0.7,
        strengths: ['基本想法清晰'],
        weaknesses: ['需要进一步细化']
      }
    }

    // 2. 构建快照数据
    const snapshot: BiddingSnapshot = {
      ideaId: `direct_${Date.now()}`,
      ideaTitle: body.ideaTitle,
      ideaDescription: body.ideaDescription,
      source: body.source || 'direct-generation',
      targetUsers: '待分析',
      industry: '通用',
      expertDiscussion: [],
      finalBids: {},
      userContext: body.userContext ? {
        location: body.userContext.location || '北京',
        background: body.userContext.background || ''
      } : undefined
    }

    // 3. 使用简化版生成器
    console.log('🤖 启动AI专家团队协作生成...')
    const generator = new SimplifiedBusinessPlanGenerator()
    const plan: SimplifiedBusinessPlan = await generator.generateSimplifiedPlan(
      snapshot,
      maturityScore
    )

    // 4. 转换为兼容的显示格式并返回结果
    const landingCoachGuide = convertToLandingCoachGuide(plan)

    console.log('✅ 创意实现建议生成完成', {
      ideaTitle: plan.metadata.ideaTitle,
      maturityScore: plan.metadata.maturityScore,
      contentDepth: plan.metadata.contentDepth,
      aiContributors: plan.metadata.aiContributors.length
    })

    // 4. 返回兼容的LandingCoachGuide格式
    return NextResponse.json({
      success: true,
      guide: landingCoachGuide,
      metadata: {
        source: body.source || 'direct-generation',
        generatedAt: new Date().toISOString(),
        version: '2.1-simplified-direct',
        originalPlan: plan,  // 保留原始简化版数据用于调试
        ...plan.metadata
      }
    })

  } catch (error) {
    console.error('❌ 直接生成创意实现建议失败:', error)
    return handleApiError(error)
  }
}

/**
 * 获取直接生成的状态信息
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ideaId = searchParams.get('ideaId')

    if (!ideaId) {
      return NextResponse.json({
        success: false,
        error: '缺少 ideaId 参数'
      }, { status: 400 })
    }

    // 这里可以实现缓存查询逻辑
    // 目前直接生成是同步的，所以暂时返回简单状态
    return NextResponse.json({
      success: true,
      status: 'completed',
      message: '直接生成模式无需状态查询'
    })

  } catch (error) {
    return handleApiError(error)
  }
}