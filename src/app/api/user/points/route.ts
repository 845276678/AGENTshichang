import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth-helper';

// 获取用户积分信息
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    // 获取用户积分信息
    const userPoints = await prisma.userPoints.findUnique({
      where: { userId: user.id },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10 // 最近10条交易记录
        }
      }
    });

    if (!userPoints) {
      // 如果不存在，创建默认积分记录
      const newUserPoints = await prisma.userPoints.create({
        data: {
          userId: user.id,
          totalPoints: 0,
          dailyPoints: 0,
          weeklyPoints: 0,
          streakDays: 0,
          bestStreak: 0,
          level: 1,
          experience: 0
        },
        include: {
          transactions: true
        }
      });

      return NextResponse.json({
        points: newUserPoints.totalPoints,
        dailyPoints: newUserPoints.dailyPoints,
        weeklyPoints: newUserPoints.weeklyPoints,
        streakDays: newUserPoints.streakDays,
        bestStreak: newUserPoints.bestStreak,
        level: newUserPoints.level,
        experience: newUserPoints.experience,
        recentTransactions: []
      });
    }

    // 计算当前等级所需经验值
    const experienceToNextLevel = userPoints.level * 100;
    const currentLevelProgress = (userPoints.experience % 100) / 100;

    return NextResponse.json({
      points: userPoints.totalPoints,
      dailyPoints: userPoints.dailyPoints,
      weeklyPoints: userPoints.weeklyPoints,
      streakDays: userPoints.streakDays,
      bestStreak: userPoints.bestStreak,
      level: userPoints.level,
      experience: userPoints.experience,
      experienceToNextLevel,
      currentLevelProgress,
      recentTransactions: userPoints.transactions.map(tx => ({
        id: tx.id,
        type: tx.type,
        amount: tx.amount,
        reason: tx.reason,
        createdAt: tx.createdAt
      }))
    });

  } catch (error) {
    console.error('获取用户积分失败:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}