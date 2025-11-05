/**
 * 市场趋势数据API
 *
 * GET  /api/analytics/trends - 获取趋势列表
 * POST /api/analytics/trends/collect - 触发数据采集
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { trendQueue } from '@/lib/queue/queue-manager'
import { SocialPlatform } from '@prisma/client'

/**
 * GET /api/analytics/trends - 获取市场趋势数据
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
    const keyword = searchParams.get('keyword')
    const limit = parseInt(searchParams.get('limit') || '50')
    const sortBy = searchParams.get('sortBy') || 'heat' // heat | collectedAt
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // 3. 构建查询条件
    const where: any = {}

    if (platform) {
      where.platform = platform
    }

    if (keyword) {
      where.keyword = {
        contains: keyword,
        mode: 'insensitive'
      }
    }

    // 4. 查询趋势数据
    const trends = await prisma.marketTrend.findMany({
      where,
      orderBy: sortBy === 'heat'
        ? { heat: sortOrder as 'asc' | 'desc' }
        : { collectedAt: sortOrder as 'asc' | 'desc' },
      take: limit,
      select: {
        id: true,
        platform: true,
        keyword: true,
        heat: true,
        rank: true,
        topPosts: true,
        metadata: true,
        collectedAt: true
      }
    })

    // 5. 统计信息
    const stats = await prisma.marketTrend.groupBy({
      by: ['platform'],
      _count: {
        id: true
      },
      _avg: {
        heat: true
      },
      where
    })

    return NextResponse.json({
      success: true,
      data: {
        trends,
        stats,
        total: trends.length
      }
    })

  } catch (error: any) {
    console.error('[Analytics Trends API] GET error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch trends',
        details: error.message
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/analytics/trends/collect - 触发趋势数据采集
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
    const { platforms, keywords, immediate } = body

    // 3. 验证必填字段
    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'platforms is required and must be a non-empty array'
        },
        { status: 400 }
      )
    }

    // 4. 为每个平台添加采集任务
    const jobs = []

    for (const platform of platforms) {
      const jobData = {
        userId: session.user.id,
        platform: platform as SocialPlatform,
        keywords: keywords || [],
        collectTopN: 50
      }

      const job = await trendQueue.addJob(jobData)
      jobs.push({
        id: job.id,
        platform,
        status: 'queued'
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        jobs,
        message: `Started ${jobs.length} trend collection job(s)`
      }
    })

  } catch (error: any) {
    console.error('[Analytics Trends API] POST error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to start trend collection',
        details: error.message
      },
      { status: 500 }
    )
  }
}
