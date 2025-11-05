/**
 * 竞品监控数据API
 *
 * GET    /api/analytics/competitors - 获取竞品列表
 * POST   /api/analytics/competitors - 添加竞品监控
 * DELETE /api/analytics/competitors/[id] - 删除竞品监控
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { competitorQueue } from '@/lib/queue/queue-manager'
import { SocialPlatform } from '@prisma/client'

/**
 * GET /api/analytics/competitors - 获取竞品监控列表
 */
export async function GET(req: NextRequest) {
  try {
    // 1. 验证用户登录
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. 获取查询参数
    const { searchParams } = new URL(req.url)
    const platform = searchParams.get('platform') as SocialPlatform | null
    const isActive = searchParams.get('isActive')

    // 3. 构建查询条件
    const where: any = {
      userId: session.user.id
    }

    if (platform) {
      where.platform = platform
    }

    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }

    // 4. 查询竞品列表
    const competitors = await prisma.competitorWatch.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        competitorName: true,
        platform: true,
        accountUrl: true,
        accountId: true,
        isActive: true,
        lastCheckedAt: true,
        metadata: true,
        createdAt: true
      }
    })

    // 5. 统计信息
    const stats = await prisma.competitorWatch.groupBy({
      by: ['platform'],
      _count: {
        id: true
      },
      where: {
        userId: session.user.id,
        isActive: true
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        competitors,
        stats,
        total: competitors.length
      }
    })

  } catch (error: any) {
    console.error('[Analytics Competitors API] GET error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch competitors',
        details: error.message
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/analytics/competitors - 添加竞品监控
 */
export async function POST(req: NextRequest) {
  try {
    // 1. 验证用户登录
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. 解析请求体
    const body = await req.json()
    const {
      competitorName,
      platform,
      accountUrl,
      accountId,
      metadata
    } = body

    // 3. 验证必填字段
    if (!competitorName || !platform || !accountUrl) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: competitorName, platform, accountUrl'
        },
        { status: 400 }
      )
    }

    // 4. 检查是否已存在
    const existing = await prisma.competitorWatch.findFirst({
      where: {
        userId: session.user.id,
        platform,
        accountUrl
      }
    })

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'Competitor already being monitored'
        },
        { status: 409 }
      )
    }

    // 5. 创建监控记录
    const competitor = await prisma.competitorWatch.create({
      data: {
        userId: session.user.id,
        competitorName,
        platform,
        accountUrl,
        accountId: accountId || accountUrl,
        isActive: true,
        metadata: metadata || {}
      }
    })

    // 6. 添加监控任务到队列
    await competitorQueue.addJob({
      competitorId: competitor.id,
      userId: session.user.id,
      platform,
      accountUrl,
      accountId: accountId || accountUrl
    })

    return NextResponse.json({
      success: true,
      data: competitor,
      message: 'Competitor monitoring started'
    })

  } catch (error: any) {
    console.error('[Analytics Competitors API] POST error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to add competitor',
        details: error.message
      },
      { status: 500 }
    )
  }
}
