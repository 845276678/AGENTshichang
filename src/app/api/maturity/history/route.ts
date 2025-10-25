import { NextRequest, NextResponse } from 'next/server';
import {
  getAssessmentHistory,
  getUserAssessments,
  getLatestAssessment
} from '@/lib/database/maturity-assessment';

export const dynamic = 'force-dynamic'

/**
 * 获取评估历史记录API
 * GET /api/maturity/history
 *
 * Query Parameters:
 * - ideaId: 创意ID（获取特定创意的历史）
 * - userId: 用户ID（获取用户的所有评估）
 * - sessionId: 会话ID（获取最新的评估）
 * - limit: 返回记录数限制（默认10）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ideaId = searchParams.get('ideaId');
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');
    const limit = parseInt(searchParams.get('limit') || '10');

    console.log('📜 获取评估历史', {
      ideaId,
      userId,
      sessionId,
      limit
    });

    let results: any[] = [];
    let queryType = 'unknown';

    // 优先级：sessionId > ideaId > userId
    if (sessionId && ideaId) {
      // 获取特定会话的最新评估
      const latest = await getLatestAssessment(ideaId, sessionId);
      results = latest ? [latest] : [];
      queryType = 'latest';
    } else if (ideaId) {
      // 获取创意的评估历史
      results = await getAssessmentHistory(ideaId, limit);
      queryType = 'ideaHistory';
    } else if (userId) {
      // 获取用户的所有评估
      results = await getUserAssessments(userId, limit);
      queryType = 'userHistory';
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameter: ideaId, userId, or sessionId'
        },
        { status: 400 }
      );
    }

    console.log('✅ 获取评估历史成功', {
      queryType,
      count: results.length
    });

    return NextResponse.json({
      success: true,
      data: {
        queryType,
        count: results.length,
        assessments: results.map(formatAssessment)
      }
    });

  } catch (error) {
    console.error('❌ 获取评估历史失败', error);

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
 * 格式化评估结果
 */
function formatAssessment(assessment: any) {
  return {
    id: assessment.id,
    ideaId: assessment.ideaId,
    userId: assessment.userId,
    sessionId: assessment.sessionId,
    totalScore: assessment.totalScore,
    level: assessment.level,
    confidence: assessment.confidence,
    dimensions: assessment.dimensions,
    validSignals: assessment.validSignals,
    invalidSignals: assessment.invalidSignals,
    expertConsensus: assessment.expertConsensus,
    scoringReasons: assessment.scoringReasons,
    weakDimensions: assessment.weakDimensions,
    workshopUnlocked: assessment.workshopUnlocked,
    scoringVersion: assessment.scoringVersion,
    createdAt: assessment.createdAt,
    updatedAt: assessment.updatedAt
  };
}
