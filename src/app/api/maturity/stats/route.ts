import { NextRequest, NextResponse } from 'next/server';
import { getAssessmentStats } from '@/lib/database/maturity-assessment';

export const dynamic = 'force-dynamic'

/**
 * 获取评估统计数据API
 * GET /api/maturity/stats
 *
 * 返回整体评估统计信息
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📊 获取评估统计数据');

    const stats = await getAssessmentStats();

    console.log('✅ 获取统计数据成功', {
      total: stats.total,
      unlocked: stats.unlocked,
      unlockRate: stats.unlockRate.toFixed(2) + '%'
    });

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ 获取统计数据失败', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
