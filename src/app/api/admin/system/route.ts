import { NextRequest, NextResponse } from 'next/server'

import { requireAdmin } from '@/lib/auth-helper'

import { prisma } from '@/lib/database'

// 强制动态渲染
export const dynamic = 'force-dynamic'

// 系统监控和状态检查API
export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const authResult = await requireAdmin(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    // 简化的系统状态检查
    const systemStatus = await checkSimpleSystemStatus();

    return NextResponse.json({
      success: true,
      data: systemStatus
    });
  } catch (error) {
    console.error('系统状态检查失败:', error);
    return NextResponse.json({ error: '系统状态检查失败' }, { status: 500 });
  }
}

// 简化的系统状态检查函数
async function checkSimpleSystemStatus() {
  try {
    // 检查数据库连接
    const dbStatus = await checkDatabaseStatus();

    // 基本系统指标
    const userCount = await prisma.user.count();
    const ideaCount = await prisma.idea.count();

    return {
      database: dbStatus,
      metrics: {
        totalUsers: userCount,
        totalIdeas: ideaCount,
        timestamp: new Date().toISOString()
      },
      status: dbStatus.status === 'healthy' ? 'healthy' : 'degraded'
    };
  } catch (error) {
    return {
      database: { status: 'error', message: 'Database connection failed' },
      metrics: null,
      status: 'error'
    };
  }
}

// 检查数据库状态
async function checkDatabaseStatus() {
  const startTime = Date.now();
  try {
    // 测试数据库连接
    await prisma.$queryRaw`SELECT 1`;

    // 获取基本统计
    const [userCount, ideaCount, sessionCount] = await Promise.all([
      prisma.user.count(),
      prisma.idea.count(),
      prisma.userSession.count()
    ]);

    const responseTime = Date.now() - startTime;

    return {
      status: 'healthy',
      responseTime,
      stats: {
        users: userCount,
        ideas: ideaCount,
        sessions: sessionCount
      }
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('Database status check failed:', error);
    return {
      status: 'error',
      responseTime,
      error: error instanceof Error ? error.message : 'Unknown database error'
    };
  }
}
