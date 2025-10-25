import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic'


interface CheckInStats {
  currentStreak: number;
  totalCheckIns: number;
  lastCheckIn: string | null;
  nextRewardMultiplier: number;
  todayCredits: number;
  canCheckInToday: boolean;
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 获取签到状态API开始处理...');

    // 获取Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: '未提供认证令牌'
      }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    // 验证JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    } catch (error) {
      return NextResponse.json({
        success: false,
        message: '无效的认证令牌'
      }, { status: 401 });
    }

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        lastLoginAt: true,
        totalGuesses: true,
        consecutiveGuesses: true,
        credits: true
      }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: '用户不存在'
      }, { status: 404 });
    }

    // 计算签到状态 - 检查今日是否已签到
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const todayCheckin = await prisma.creditTransaction.findFirst({
      where: {
        userId: decoded.userId,
        description: {
          contains: '每日签到奖励'
        },
        createdAt: {
          gte: todayStart,
          lt: todayEnd
        }
      }
    });

    const stats: CheckInStats = {
      currentStreak: user.consecutiveGuesses || 0,
      totalCheckIns: user.totalGuesses || 0,
      lastCheckIn: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
      nextRewardMultiplier: user.consecutiveGuesses >= 6 ? 1.5 : 1,
      todayCredits: Math.floor(((user.consecutiveGuesses % 7) + 1) * 10 * (user.consecutiveGuesses >= 6 ? 1.5 : 1)),
      canCheckInToday: !todayCheckin
    };

    console.log('✅ 签到状态获取成功');

    return NextResponse.json({
      success: true,
      data: stats,
      message: '签到状态获取成功'
    });

  } catch (error) {
    console.error('❌ 获取签到状态API错误:', error);
    return NextResponse.json({
      success: false,
      message: '服务器内部错误'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 执行签到API开始处理...');

    // 获取Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: '未提供认证令牌'
      }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    // 验证JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    } catch (error) {
      return NextResponse.json({
        success: false,
        message: '无效的认证令牌'
      }, { status: 401 });
    }

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: '用户不存在'
      }, { status: 404 });
    }

    // 检查今日是否已签到 - 查询今日是否有签到记录
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const todayCheckin = await prisma.creditTransaction.findFirst({
      where: {
        userId: decoded.userId,
        description: {
          contains: '每日签到奖励'
        },
        createdAt: {
          gte: todayStart,
          lt: todayEnd
        }
      }
    });

    if (todayCheckin) {
      return NextResponse.json({
        success: false,
        message: '今日已签到'
      }, { status: 400 });
    }

    // 计算奖励
    const currentDay = (user.consecutiveGuesses % 7) + 1;
    const baseCredits = currentDay * 10;
    const multiplier = user.consecutiveGuesses >= 6 ? 1.5 : 1;
    const creditsToAdd = Math.floor(baseCredits * multiplier);

    // 更新用户数据
    await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        credits: { increment: creditsToAdd },
        totalGuesses: { increment: 1 },
        consecutiveGuesses: { increment: 1 },
        totalEarned: { increment: creditsToAdd },
        lastLoginAt: new Date()
      }
    });

    // 创建积分交易记录
    await prisma.creditTransaction.create({
      data: {
        userId: decoded.userId,
        amount: creditsToAdd,
        type: 'REGISTER_BONUS', // 暂时使用这个类型，真实场景应该有DAILY_CHECKIN类型
        description: `每日签到奖励 - 第${currentDay}天`,
        balanceBefore: user.credits,
        balanceAfter: user.credits + creditsToAdd
      }
    });

    console.log('✅ 签到成功');

    return NextResponse.json({
      success: true,
      data: {
        creditsEarned: creditsToAdd,
        newBalance: user.credits + creditsToAdd,
        currentStreak: user.consecutiveGuesses + 1,
        totalCheckIns: user.totalGuesses + 1
      },
      message: '签到成功'
    });

  } catch (error) {
    console.error('❌ 执行签到API错误:', error);
    return NextResponse.json({
      success: false,
      message: '服务器内部错误'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}