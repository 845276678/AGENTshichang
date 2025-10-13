/**
 * 创意成熟度评估 - 数据库操作层
 * v2.0 (10分制评分体系)
 */

import { prisma } from '@/lib/prisma';
import type { MaturityScoreResult } from '@/types/maturity-score';

/**
 * 保存评估结果到数据库
 */
export async function saveMaturityAssessment(data: {
  ideaId: string;
  userId: string;
  sessionId: string;
  assessment: MaturityScoreResult;
}) {
  const { ideaId, userId, sessionId, assessment } = data;

  try {
    const result = await prisma.maturityAssessment.create({
      data: {
        ideaId,
        userId,
        sessionId,
        totalScore: assessment.totalScore,
        level: assessment.level,
        confidence: assessment.confidence,
        dimensions: assessment.dimensions as any,
        validSignals: assessment.validSignals as any,
        invalidSignals: assessment.invalidSignals as any,
        expertConsensus: assessment.expertConsensus as any,
        scoringReasons: assessment.scoringReasons as any,
        weakDimensions: assessment.weakDimensions,
        workshopUnlocked: assessment.totalScore >= 5.0,
        scoringVersion: assessment.scoringVersion
      }
    });

    console.log('✅ 评估结果已保存到数据库', {
      id: result.id,
      ideaId,
      totalScore: result.totalScore
    });

    return result;
  } catch (error) {
    console.error('❌ 保存评估结果失败', error);
    throw new Error('Failed to save maturity assessment');
  }
}

/**
 * 获取最新的评估结果
 */
export async function getLatestAssessment(ideaId: string, sessionId: string) {
  try {
    const result = await prisma.maturityAssessment.findFirst({
      where: {
        ideaId,
        sessionId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return result;
  } catch (error) {
    console.error('❌ 获取最新评估失败', error);
    return null;
  }
}

/**
 * 获取创意的所有评估历史
 */
export async function getAssessmentHistory(ideaId: string, limit = 10) {
  try {
    const results = await prisma.maturityAssessment.findMany({
      where: {
        ideaId
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    return results;
  } catch (error) {
    console.error('❌ 获取评估历史失败', error);
    return [];
  }
}

/**
 * 获取用户的所有评估记录
 */
export async function getUserAssessments(userId: string, limit = 20) {
  try {
    const results = await prisma.maturityAssessment.findMany({
      where: {
        userId
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    return results;
  } catch (error) {
    console.error('❌ 获取用户评估记录失败', error);
    return [];
  }
}

/**
 * 按分数范围查询评估记录
 */
export async function getAssessmentsByScoreRange(
  minScore: number,
  maxScore: number,
  limit = 50
) {
  try {
    const results = await prisma.maturityAssessment.findMany({
      where: {
        totalScore: {
          gte: minScore,
          lte: maxScore
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    return results;
  } catch (error) {
    console.error('❌ 按分数范围查询失败', error);
    return [];
  }
}

/**
 * 按成熟度等级查询评估记录
 */
export async function getAssessmentsByLevel(level: string, limit = 50) {
  try {
    const results = await prisma.maturityAssessment.findMany({
      where: {
        level
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    return results;
  } catch (error) {
    console.error('❌ 按等级查询失败', error);
    return [];
  }
}

/**
 * 获取已解锁工作坊的评估记录
 */
export async function getUnlockedAssessments(limit = 50) {
  try {
    const results = await prisma.maturityAssessment.findMany({
      where: {
        workshopUnlocked: true
      },
      orderBy: {
        totalScore: 'desc'
      },
      take: limit
    });

    return results;
  } catch (error) {
    console.error('❌ 获取已解锁记录失败', error);
    return [];
  }
}

/**
 * 统计评估数据
 */
export async function getAssessmentStats() {
  try {
    const [
      total,
      unlocked,
      avgScore,
      levelDistribution
    ] = await Promise.all([
      // 总评估数
      prisma.maturityAssessment.count(),

      // 已解锁数
      prisma.maturityAssessment.count({
        where: { workshopUnlocked: true }
      }),

      // 平均分
      prisma.maturityAssessment.aggregate({
        _avg: { totalScore: true }
      }),

      // 等级分布
      prisma.maturityAssessment.groupBy({
        by: ['level'],
        _count: true
      })
    ]);

    return {
      total,
      unlocked,
      unlockRate: total > 0 ? (unlocked / total) * 100 : 0,
      avgScore: avgScore._avg.totalScore || 0,
      levelDistribution: levelDistribution.map(item => ({
        level: item.level,
        count: item._count
      }))
    };
  } catch (error) {
    console.error('❌ 获取统计数据失败', error);
    return {
      total: 0,
      unlocked: 0,
      unlockRate: 0,
      avgScore: 0,
      levelDistribution: []
    };
  }
}

/**
 * 删除过期的评估记录（超过30天）
 */
export async function cleanupOldAssessments(daysOld = 30) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await prisma.maturityAssessment.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      }
    });

    console.log(`🧹 清理了 ${result.count} 条过期评估记录`);
    return result.count;
  } catch (error) {
    console.error('❌ 清理过期记录失败', error);
    return 0;
  }
}
