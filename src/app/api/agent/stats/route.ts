/**
 * Agent使用统计API
 * GET /api/agent/stats
 * 获取Agent使用统计数据（每日18:00更新）
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const agentId = searchParams.get('agentId')
    const module = searchParams.get('module')

    // 获取今天的统计数据
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 构建查询条件
    const where: any = {
      date: today
    }

    if (agentId) {
      where.agentId = agentId
    }

    if (module) {
      where.module = module
    }

    // 查询统计数据
    const stats = await prisma.agentUsageStats.findMany({
      where,
      orderBy: {
        totalUses: 'desc'
      }
    })

    // 如果没有今日统计数据，返回默认值
    if (stats.length === 0) {
      return NextResponse.json({
        stats: [],
        message: '今日统计数据尚未生成，将在18:00更新'
      })
    }

    // 计算总体统计
    const totalStats = {
      totalUses: stats.reduce((sum, s) => sum + s.totalUses, 0),
      totalUniqueUsers: stats.reduce((sum, s) => sum + s.uniqueUsers, 0),
      lastUpdatedAt: stats[0]?.lastUpdatedAt
    }

    // 按模块分组
    const byModule = stats.reduce((acc: any, stat) => {
      if (!acc[stat.module]) {
        acc[stat.module] = {
          totalUses: 0,
          uniqueUsers: 0
        }
      }
      acc[stat.module].totalUses += stat.totalUses
      acc[stat.module].uniqueUsers += stat.uniqueUsers
      return acc
    }, {})

    // 返回结果
    return NextResponse.json({
      stats,
      totalStats,
      byModule,
      date: today
    })
  } catch (error) {
    console.error('获取Agent统计失败:', error)
    return NextResponse.json(
      { error: '获取统计失败' },
      { status: 500 }
    )
  }
}
