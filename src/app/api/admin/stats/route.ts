import { NextRequest, NextResponse } from 'next/server'

import { requireAdmin } from '@/lib/auth-helper'

import { prisma } from '@/lib/database'

// 强制动态渲染
export const dynamic = 'force-dynamic'

// 管理员统计数据API
export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const authResult = await requireAdmin(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    // 获取各种统计数据
    const [
      totalUsers,
      totalIdeas,
      totalReports,
      totalRevenue,
      recentUsers,
      recentPayments,
      systemStats
    ] = await Promise.all([
      // 总用户数
      prisma.user.count(),

      // 总创意数
      prisma.idea.count(),

      // 总报告数
      prisma.researchReport.count(),

      // 总收入（使用 Payment 表）
      prisma.payment.aggregate({
        _sum: {
          amount: true
        },
        where: {
          status: 'SUCCESS'
        }
      }),

      // 最近注册用户
      prisma.user.findMany({
        take: 10,
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          username: true,
          email: true,
          createdAt: true,
          role: true,
          credits: true
        }
      }),

      // 最近支付
      prisma.payment.findMany({
        take: 10,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          user: {
            select: {
              username: true,
              email: true
            }
          }
        }
      }),

      // 系统统计
      Promise.all([
        prisma.user.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 过去24小时
            }
          }
        }),
        prisma.idea.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
          }
        }),
        prisma.payment.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
          }
        })
      ])
    ])

    const [newUsersToday, newIdeasToday, paymentsToday] = systemStats

    return NextResponse.json({
      overview: {
        totalUsers,
        totalIdeas,
        totalReports,
        totalRevenue: totalRevenue._sum.amount || 0,
        newUsersToday,
        newIdeasToday,
        paymentsToday
      },
      recentActivity: {
        recentUsers,
        recentPayments
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin statistics' },
      { status: 500 }
    )
  }
}
