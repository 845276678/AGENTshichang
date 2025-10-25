import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth-helper';
import { z } from 'zod';

// 反馈提交验证schema
const feedbackSchema = z.object({
  ideaId: z.string(),
  type: z.enum(['IMPROVEMENT', 'IMPLEMENTATION', 'MARKET_INSIGHT', 'RISK_ANALYSIS']),
  content: z.string().min(100, '反馈内容至少需要100字')
});

// 反馈质量评估服务
class FeedbackQualityAssessor {
  static assessFeedback(content: string, type: string): number {
    let score = 0;

    // 基础分数：内容长度
    if (content.length >= 100) score += 20;
    if (content.length >= 200) score += 20;
    if (content.length >= 400) score += 20;

    // 检查是否包含具体建议
    const actionWords = ['建议', '推荐', '应该', '可以', '需要', '考虑', '实施', '执行'];
    if (actionWords.some(word => content.includes(word))) score += 15;

    // 检查是否包含实施细节
    const detailWords = ['具体', '详细', '步骤', '方案', '计划', '时间', '成本', '资源'];
    if (detailWords.some(word => content.includes(word))) score += 15;

    // 检查是否包含分析思维
    const analysisWords = ['因为', '由于', '分析', '原因', '影响', '结果', '风险', '机会'];
    if (analysisWords.some(word => content.includes(word))) score += 10;

    return Math.min(score, 100);
  }
}

// 积分计算服务
class PointCalculator {
  static calculatePoints(qualityScore: number, contentLength: number, userLevel: number = 1): number {
    // 基础积分
    let points = 2;

    // 质量奖励
    if (qualityScore >= 80) points += 6;
    else if (qualityScore >= 60) points += 4;
    else if (qualityScore >= 40) points += 2;

    // 长度奖励
    if (contentLength >= 500) points += 2;
    else if (contentLength >= 300) points += 1;

    // 用户等级加成
    const levelMultiplier = 1 + (userLevel - 1) * 0.1;
    points = Math.floor(points * levelMultiplier);

    // 每日上限控制
    return Math.min(points, 15);
  }
}

// 提交反馈
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = feedbackSchema.parse(body);

    // 检查今日是否已提交反馈
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingFeedback = await prisma.dailyIdeaFeedback.findFirst({
      where: {
        userId: user.id,
        dailyIdeaId: validatedData.ideaId,
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    if (existingFeedback) {
      return NextResponse.json({ error: '今日已提交过反馈' }, { status: 400 });
    }

    // 验证创意是否存在
    const dailyIdea = await prisma.dailyIdea.findUnique({
      where: { id: validatedData.ideaId }
    });

    if (!dailyIdea) {
      return NextResponse.json({ error: '创意不存在' }, { status: 404 });
    }

    // 评估反馈质量
    const qualityScore = FeedbackQualityAssessor.assessFeedback(
      validatedData.content,
      validatedData.type
    );

    // 获取用户积分信息
    const userPoints = await prisma.userPoints.findUnique({
      where: { userId: user.id }
    });

    // 计算获得积分
    const pointsAwarded = PointCalculator.calculatePoints(
      qualityScore,
      validatedData.content.length,
      userPoints?.level || 1
    );

    // 开始事务
    const result = await prisma.$transaction(async (tx) => {
      // 创建反馈记录
      const feedback = await tx.dailyIdeaFeedback.create({
        data: {
          dailyIdeaId: validatedData.ideaId,
          userId: user.id,
          type: validatedData.type as any,
          content: validatedData.content,
          qualityScore,
          pointsAwarded
        }
      });

      // 更新或创建用户积分记录
      const updatedPoints = await tx.userPoints.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          totalPoints: pointsAwarded,
          dailyPoints: pointsAwarded,
          weeklyPoints: pointsAwarded,
          streakDays: 1,
          bestStreak: 1
        },
        update: {
          totalPoints: { increment: pointsAwarded },
          dailyPoints: { increment: pointsAwarded },
          weeklyPoints: { increment: pointsAwarded }
        }
      });

      // 创建积分交易记录
      await tx.userPointTransaction.create({
        data: {
          userId: user.id,
          pointsId: updatedPoints.id,
          type: 'QUALITY_FEEDBACK',
          amount: pointsAwarded,
          reason: `提交${validatedData.type}反馈`,
          relatedId: feedback.id,
          balance: updatedPoints.totalPoints + pointsAwarded
        }
      });

      // 更新用户参与记录
      await tx.dailyIdeaEngagement.upsert({
        where: {
          dailyIdeaId_userId: {
            dailyIdeaId: validatedData.ideaId,
            userId: user.id
          }
        },
        create: {
          dailyIdeaId: validatedData.ideaId,
          userId: user.id,
          hasViewed: true,
          hasFeedback: true,
          engagementScore: qualityScore
        },
        update: {
          hasFeedback: true,
          engagementScore: qualityScore
        }
      });

      // 更新创意统计
      await tx.dailyIdea.update({
        where: { id: validatedData.ideaId },
        data: {
          feedbackCount: { increment: 1 }
        }
      });

      return { feedback, pointsAwarded };
    });

    return NextResponse.json({
      success: true,
      points: result.pointsAwarded,
      qualityScore,
      message: '反馈提交成功'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('提交反馈失败:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}