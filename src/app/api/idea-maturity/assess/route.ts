import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/lib/auth'
import {
  IdeaMaturityScorer,
  WorkshopRecommendationGenerator,
  ImprovementSuggestionGenerator,
  type IdeaMaturityAssessment,
  type IdeaDataForScoring
} from '@/lib/idea-maturity'

interface AssessmentRequest {
  ideaId: string
  userId: string
  sessionId: string
  trigger: 'initial' | 'supplement' | 'bidding_complete'

  // 创意数据
  ideaContent: string
  targetUser?: string
  coreFunctionality?: string

  // 竞价数据
  currentBids?: Record<string, number>
  aiMessages?: Array<{
    personaId: string
    content: string
    emotion: string
    bidValue?: number
    timestamp: Date | string
  }>
  userReplies?: string[]

  // 用户补充
  supplements?: Array<{
    category: string
    content: string
  }>

  // 商业分析
  marketAnalysis?: string
  competitors?: any[]
}

/**
 * 创意成熟度评估API
 *
 * POST /api/idea-maturity/assess
 *
 * 功能：
 * 1. 计算创意成熟度分数（0-100分）
 * 2. 判断是否达到工作坊解锁标准（≥60分）
 * 3. 生成个性化改进建议
 * 4. 推荐合适的工作坊参加顺序
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AssessmentRequest

    // 验证必要参数
    if (!body.ideaId || !body.userId || !body.sessionId) {
      return NextResponse.json({
        success: false,
        error: '缺少必要参数：ideaId, userId, sessionId'
      }, { status: 400 })
    }

    if (!body.ideaContent?.trim()) {
      return NextResponse.json({
        success: false,
        error: '创意内容不能为空'
      }, { status: 400 })
    }

    console.log('🔬 开始创意成熟度评估', {
      ideaId: body.ideaId,
      trigger: body.trigger,
      contentLength: body.ideaContent.length,
      hasBids: !!body.currentBids,
      messageCount: body.aiMessages?.length || 0,
      supplementCount: body.supplements?.length || 0
    })

    // 1. 初始化评分器
    const scorer = new IdeaMaturityScorer()

    // 2. 计算各维度分数
    const basicScore = scorer.calculateBasicCompleteness({
      ideaContent: body.ideaContent,
      targetUser: body.targetUser,
      coreFunctionality: body.coreFunctionality
    })

    const biddingScore = scorer.calculateBiddingFeedback({
      currentBids: body.currentBids || {},
      aiMessages: body.aiMessages || [],
      userReplies: body.userReplies || []
    })

    const supplementScore = scorer.calculateSupplementQuality(
      body.supplements || []
    )

    const commercialScore = scorer.calculateCommercialViability({
      ideaContent: body.ideaContent,
      marketAnalysis: body.marketAnalysis,
      competitors: body.competitors
    })

    // 3. 计算总分和等级
    const scoringResult = scorer.calculateTotalScore(
      basicScore,
      biddingScore,
      supplementScore,
      commercialScore
    )

    console.log('📊 评分结果', {
      basicScore,
      biddingScore,
      supplementScore,
      commercialScore,
      totalScore: scoringResult.totalScore,
      maturityLevel: scoringResult.maturityLevel
    })

    // 4. 判断是否解锁工作坊
    const unlocked = scoringResult.totalScore >= 60

    // 5. 生成工作坊推荐（仅当解锁时）
    const recommendationGenerator = new WorkshopRecommendationGenerator()
    const recommendations = unlocked
      ? recommendationGenerator.generateRecommendations(
          scoringResult.totalScore,
          scoringResult.maturityLevel,
          {
            ideaContent: body.ideaContent,
            targetUser: body.targetUser,
            coreFunctionality: body.coreFunctionality,
            currentBids: body.currentBids,
            aiMessages: body.aiMessages,
            userReplies: body.userReplies,
            supplements: body.supplements,
            marketAnalysis: body.marketAnalysis,
            competitors: body.competitors
          } as IdeaDataForScoring
        )
      : []

    console.log('🎯 工作坊推荐', {
      unlocked,
      recommendationCount: recommendations.length,
      topRecommendation: recommendations[0]?.workshopId
    })

    // 6. 生成改进建议（仅当未解锁或分数较低时）
    const improvementGenerator = new ImprovementSuggestionGenerator()
    const improvementSuggestions =
      scoringResult.totalScore < 80
        ? improvementGenerator.generateSuggestions(
            {
              basicCompleteness: basicScore,
              biddingFeedback: biddingScore,
              supplementQuality: supplementScore,
              commercialViability: commercialScore
            },
            scoringResult.totalScore,
            {
              ideaContent: body.ideaContent,
              targetUser: body.targetUser,
              coreFunctionality: body.coreFunctionality,
              currentBids: body.currentBids,
              aiMessages: body.aiMessages,
              userReplies: body.userReplies,
              supplements: body.supplements,
              marketAnalysis: body.marketAnalysis,
              competitors: body.competitors
            } as IdeaDataForScoring
          )
        : []

    console.log('💡 改进建议', {
      suggestionCount: improvementSuggestions.length,
      topSuggestion: improvementSuggestions[0]?.suggestion.substring(0, 50)
    })

    // 7. 构建评估结果
    const assessment: IdeaMaturityAssessment = {
      ideaId: body.ideaId,
      userId: body.userId,
      sessionId: body.sessionId,
      scores: {
        basicCompleteness: basicScore,
        biddingFeedback: biddingScore,
        supplementQuality: supplementScore,
        commercialViability: commercialScore
      },
      totalScore: scoringResult.totalScore,
      maturityLevel: scoringResult.maturityLevel,
      workshopAccess: {
        unlocked,
        unlockedAt: unlocked ? new Date() : undefined,
        recommendations
      },
      improvementSuggestions,
      assessmentHistory: [
        {
          timestamp: new Date(),
          totalScore: scoringResult.totalScore,
          trigger: body.trigger
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // 8. 返回评估结果
    console.log('✅ 创意成熟度评估完成', {
      totalScore: assessment.totalScore,
      maturityLevel: assessment.maturityLevel,
      unlocked: assessment.workshopAccess.unlocked,
      recommendationCount: recommendations.length,
      suggestionCount: improvementSuggestions.length
    })

    return NextResponse.json({
      success: true,
      data: assessment
    })
  } catch (error) {
    console.error('❌ 创意成熟度评估失败:', error)
    return handleApiError(error)
  }
}

/**
 * GET /api/idea-maturity/assess?ideaId=xxx
 *
 * 获取已有的评估结果（从数据库查询）
 * TODO: 实现数据库查询逻辑
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ideaId = searchParams.get('ideaId')

    if (!ideaId) {
      return NextResponse.json({
        success: false,
        error: '缺少参数：ideaId'
      }, { status: 400 })
    }

    // TODO: 从数据库查询评估结果
    // const assessment = await db.ideaMaturityAssessment.findUnique({
    //   where: { ideaId }
    // })

    return NextResponse.json({
      success: true,
      data: null, // TODO: 返回实际数据
      message: 'GET endpoint not fully implemented yet'
    })
  } catch (error) {
    console.error('❌ 获取评估结果失败:', error)
    return handleApiError(error)
  }
}
