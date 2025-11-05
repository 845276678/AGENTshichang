/**
 * 单个竞品监控操作API
 *
 * GET    /api/analytics/competitors/[id] - 获取竞品详情
 * PATCH  /api/analytics/competitors/[id] - 更新竞品状态
 * DELETE /api/analytics/competitors/[id] - 删除竞品监控
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/analytics/competitors/[id] - 获取竞品详情
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. 验证用户登录
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. 查询竞品详情
    const competitor = await prisma.competitorWatch.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!competitor) {
      return NextResponse.json(
        { success: false, error: 'Competitor not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: competitor
    })

  } catch (error: any) {
    console.error('[Analytics Competitor API] GET error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch competitor',
        details: error.message
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/analytics/competitors/[id] - 更新竞品状态
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. 验证用户登录
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. 查询竞品
    const competitor = await prisma.competitorWatch.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!competitor) {
      return NextResponse.json(
        { success: false, error: 'Competitor not found' },
        { status: 404 }
      )
    }

    // 3. 解析请求体
    const body = await req.json()
    const { isActive, metadata } = body

    // 4. 更新竞品
    const updated = await prisma.competitorWatch.update({
      where: { id: params.id },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(metadata && { metadata })
      }
    })

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Competitor updated successfully'
    })

  } catch (error: any) {
    console.error('[Analytics Competitor API] PATCH error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update competitor',
        details: error.message
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/analytics/competitors/[id] - 删除竞品监控
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. 验证用户登录
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. 查询竞品
    const competitor = await prisma.competitorWatch.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!competitor) {
      return NextResponse.json(
        { success: false, error: 'Competitor not found' },
        { status: 404 }
      )
    }

    // 3. 删除竞品
    await prisma.competitorWatch.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Competitor deleted successfully'
    })

  } catch (error: any) {
    console.error('[Analytics Competitor API] DELETE error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete competitor',
        details: error.message
      },
      { status: 500 }
    )
  }
}
