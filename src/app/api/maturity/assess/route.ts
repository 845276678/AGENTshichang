import { NextRequest, NextResponse } from 'next/server';
import { MaturityScorer } from '@/lib/business-plan/maturity-scorer';
import type { AIMessage } from '@/types/maturity-score';

/**
 * 创意成熟度评估API
 * POST /api/maturity/assess
 *
 * 基于10分制评分体系，5个维度综合评估
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ideaId, userId, sessionId, aiMessages, bids } = body;

    // 参数验证
    if (!ideaId || !userId || !sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: ideaId, userId, sessionId'
        },
        { status: 400 }
      );
    }

    if (!aiMessages || !Array.isArray(aiMessages)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid aiMessages: must be an array'
        },
        { status: 400 }
      );
    }

    if (!bids || typeof bids !== 'object') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid bids: must be an object'
        },
        { status: 400 }
      );
    }

    console.log('🔬 开始创意成熟度评估', {
      ideaId,
      userId,
      sessionId,
      messageCount: aiMessages.length,
      expertCount: Object.keys(bids).length
    });

    // 初始化评分器（使用默认权重和阈值）
    const scorer = new MaturityScorer(
      {
        targetCustomer: 0.20,
        demandScenario: 0.20,
        coreValue: 0.25,
        businessModel: 0.20,
        credibility: 0.15
      },
      {
        lowMax: 4.0,
        midMin: 5.0,
        midMax: 7.0,
        highMin: 7.5
      }
    );

    // 执行评估
    const assessment = scorer.analyze(aiMessages, bids);

    console.log('📊 评分结果', {
      totalScore: assessment.totalScore,
      level: assessment.level,
      confidence: assessment.confidence,
      weakDimensions: assessment.weakDimensions
    });

    // 判断是否解锁工作坊（5分以上）
    const unlocked = assessment.totalScore >= 5.0;

    // 生成工作坊推荐
    const recommendations = unlocked
      ? generateWorkshopRecommendations(assessment)
      : [];

    console.log('🎯 工作坊推荐', {
      unlocked,
      recommendationCount: recommendations.length,
      topPriority: recommendations[0]?.workshopId
    });

    // 构建响应
    const response = {
      ideaId,
      userId,
      sessionId,
      totalScore: assessment.totalScore,
      level: assessment.level,
      dimensions: assessment.dimensions,
      expertConsensus: assessment.expertConsensus,
      confidence: assessment.confidence,
      scoringReasons: assessment.scoringReasons,
      validSignals: assessment.validSignals,
      invalidSignals: assessment.invalidSignals,
      weakDimensions: assessment.weakDimensions,
      workshopAccess: {
        unlocked,
        unlockedAt: unlocked ? new Date().toISOString() : null,
        recommendations
      },
      assessedAt: new Date().toISOString(),
      scoringVersion: assessment.scoringVersion
    };

    console.log('✅ 创意成熟度评估完成', {
      totalScore: assessment.totalScore,
      level: assessment.level,
      unlocked
    });

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('❌ 创意成熟度评估失败', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * 生成工作坊推荐
 */
function generateWorkshopRecommendations(assessment: any) {
  const { weakDimensions, level, totalScore } = assessment;
  const recommendations = [];

  // 推荐1：需求验证工作坊
  if (
    weakDimensions.includes('targetCustomer') ||
    weakDimensions.includes('demandScenario') ||
    weakDimensions.includes('credibility')
  ) {
    recommendations.push({
      workshopId: 'demand-validation',
      title: '🧪 需求验证实验室',
      description: '通过模拟用户访谈，验证真实需求',
      priority: 'high',
      recommendationLevel: 5,
      reason: '目标客户或需求场景需要深化验证',
      estimatedDuration: 15,
      weakDimensions: weakDimensions.filter((d: string) =>
        ['targetCustomer', 'demandScenario', 'credibility'].includes(d)
      )
    });
  }

  // 推荐2：盈利模式工作坊
  if (weakDimensions.includes('businessModel')) {
    recommendations.push({
      workshopId: 'profit-model',
      title: '💰 盈利模式实验室',
      description: '优化商业模式和定价策略',
      priority: 'high',
      recommendationLevel: 5,
      reason: '商业模式需要验证和优化',
      estimatedDuration: 10,
      weakDimensions: ['businessModel']
    });
  }

  // 推荐3：MVP构建工作坊（高分创意）
  if (level === 'HIGH' || level === 'GRAY_HIGH') {
    recommendations.push({
      workshopId: 'mvp-building',
      title: '🛠️ MVP构建指挥部',
      description: '制定最小可行产品开发方案',
      priority: 'medium',
      recommendationLevel: 4,
      reason: '创意成熟度高，可进入开发阶段',
      estimatedDuration: 20,
      weakDimensions: []
    });
  }

  // 推荐4：增长黑客工作坊（高分创意）
  if (totalScore >= 7.0) {
    recommendations.push({
      workshopId: 'growth-hacking',
      title: '📢 增长黑客作战室',
      description: '制定用户增长和推广策略',
      priority: 'medium',
      recommendationLevel: 3,
      reason: '创意验证充分，可制定增长策略',
      estimatedDuration: 15,
      weakDimensions: []
    });
  }

  // 按推荐等级排序
  recommendations.sort((a, b) => b.recommendationLevel - a.recommendationLevel);

  return recommendations;
}
