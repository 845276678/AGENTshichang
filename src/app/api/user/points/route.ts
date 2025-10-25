import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth-helper';

export const dynamic = 'force-dynamic'


// 获取用户积分信息
export async function GET(request: NextRequest) {
  try {
    console.log('API /api/user/points called');

    let user;
    try {
      user = await getUserFromRequest(request);
      console.log('User from request:', user ? 'authenticated' : 'guest');
    } catch (authError) {
      console.warn('Authentication error:', authError);
      user = null;
    }

    // 如果用户未登录，返回默认值而不是错误
    if (!user) {
      console.log('Returning guest defaults');
      return NextResponse.json({
        points: 0,
        dailyPoints: 0,
        weeklyPoints: 0,
        streakDays: 0,
        bestStreak: 0,
        level: 1,
        experience: 0,
        experienceToNextLevel: 100,
        currentLevelProgress: 0,
        recentTransactions: [],
        isGuest: true
      });
    }

    // 获取用户积分信息
    let userPoints;
    try {
      console.log('Querying user points for userId:', user.id);
      userPoints = await prisma.userPoints.findUnique({
        where: { userId: user.id },
        include: {
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 10 // 最近10条交易记录
          }
        }
      });
      console.log('User points query result:', userPoints ? 'found' : 'not found');
    } catch (dbError) {
      console.error('Database query error:', dbError);
      // 数据库查询失败，返回默认值
      return NextResponse.json({
        points: 0,
        dailyPoints: 0,
        weeklyPoints: 0,
        streakDays: 0,
        bestStreak: 0,
        level: 1,
        experience: 0,
        experienceToNextLevel: 100,
        currentLevelProgress: 0,
        recentTransactions: [],
        isGuest: false,
        error: 'Database query failed'
      });
    }

    if (!userPoints) {
      // 如果不存在，创建默认积分记录
      try {
        console.log('Creating new user points record');
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

        console.log('New user points created successfully');
        return NextResponse.json({
          points: newUserPoints.totalPoints,
          dailyPoints: newUserPoints.dailyPoints,
          weeklyPoints: newUserPoints.weeklyPoints,
          streakDays: newUserPoints.streakDays,
          bestStreak: newUserPoints.bestStreak,
          level: newUserPoints.level,
          experience: newUserPoints.experience,
          experienceToNextLevel: 100,
          currentLevelProgress: 0,
          recentTransactions: [],
          isGuest: false
        });
      } catch (createError) {
        console.error('Failed to create user points:', createError);
        // 创建失败，返回默认值
        return NextResponse.json({
          points: 0,
          dailyPoints: 0,
          weeklyPoints: 0,
          streakDays: 0,
          bestStreak: 0,
          level: 1,
          experience: 0,
          experienceToNextLevel: 100,
          currentLevelProgress: 0,
          recentTransactions: [],
          isGuest: false,
          error: 'Failed to create user points'
        });
      }
    }

    // 计算当前等级所需经验值
    console.log('Processing existing user points');
    try {
      const experienceToNextLevel = userPoints.level * 100;
      const currentLevelProgress = (userPoints.experience % 100) / 100;

      const response = {
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
        })),
        isGuest: false
      };

      console.log('Successfully returning user points');
      return NextResponse.json(response);
    } catch (processingError) {
      console.error('Error processing user points data:', processingError);
      // 处理数据时出错，返回基础信息
      return NextResponse.json({
        points: userPoints.totalPoints || 0,
        dailyPoints: userPoints.dailyPoints || 0,
        weeklyPoints: userPoints.weeklyPoints || 0,
        streakDays: userPoints.streakDays || 0,
        bestStreak: userPoints.bestStreak || 0,
        level: userPoints.level || 1,
        experience: userPoints.experience || 0,
        experienceToNextLevel: 100,
        currentLevelProgress: 0,
        recentTransactions: [],
        isGuest: false,
        error: 'Data processing error'
      });
    }

  } catch (error) {
    console.error('获取用户积分失败:', error);
    // 即使出错也返回默认值，避免500错误
    return NextResponse.json({
      points: 0,
      dailyPoints: 0,
      weeklyPoints: 0,
      streakDays: 0,
      bestStreak: 0,
      level: 1,
      experience: 0,
      experienceToNextLevel: 100,
      currentLevelProgress: 0,
      recentTransactions: [],
      isGuest: true,
      error: '获取积分信息失败'
    });
  }
}