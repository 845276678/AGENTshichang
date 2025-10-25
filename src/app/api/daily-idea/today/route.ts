import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth-helper';

export const dynamic = 'force-dynamic'

// 获取今日创意
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    // 获取今天的日期 (北京时间8点作为新一天的开始)
    const now = new Date();
    const beijingTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
    const today = new Date(beijingTime.getFullYear(), beijingTime.getMonth(), beijingTime.getDate(), 8, 0, 0);

    // 如果当前时间小于8点，则获取前一天的创意
    if (beijingTime.getHours() < 8) {
      today.setDate(today.getDate() - 1);
    }

    // 获取今日创意
    const dailyIdea = await prisma.dailyIdea.findUnique({
      where: {
        publishDate: today
      },
      include: {
        feedbacks: {
          where: user ? { userId: user.id } : {},
          take: 1
        },
        userEngagements: {
          where: user ? { userId: user.id } : {},
          take: 1
        }
      }
    });

    if (!dailyIdea) {
      return NextResponse.json({ error: '今日暂无创意' }, { status: 404 });
    }

    // 计算到明天8点的剩余时间
    const tomorrow8AM = new Date(today);
    tomorrow8AM.setDate(tomorrow8AM.getDate() + 1);
    const timeToNext = Math.max(0, Math.floor((tomorrow8AM.getTime() - now.getTime()) / 1000));

    // 检查用户是否已提交反馈
    const hasSubmittedToday = user ? dailyIdea.feedbacks.length > 0 : false;

    // 记录用户查看行为（如果已登录）
    if (user) {
      await prisma.dailyIdeaEngagement.upsert({
        where: {
          dailyIdeaId_userId: {
            dailyIdeaId: dailyIdea.id,
            userId: user.id
          }
        },
        create: {
          dailyIdeaId: dailyIdea.id,
          userId: user.id,
          hasViewed: true
        },
        update: {
          hasViewed: true
        }
      });

      // 更新查看次数
      await prisma.dailyIdea.update({
        where: { id: dailyIdea.id },
        data: { viewCount: { increment: 1 } }
      });
    }

    return NextResponse.json({
      idea: {
        id: dailyIdea.id,
        title: dailyIdea.title,
        description: dailyIdea.description,
        maturity: dailyIdea.maturity,
        domain: dailyIdea.domain,
        guidingQuestions: dailyIdea.guidingQuestions,
        implementationHints: dailyIdea.implementationHints,
        refreshDate: dailyIdea.publishDate
      },
      timeToNext,
      hasSubmittedToday
    });

  } catch (error) {
    console.error('获取今日创意失败:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}