import { NextRequest, NextResponse } from 'next/server'

import { requireAdmin } from '@/lib/auth-helper'

import { prisma } from '@/lib/database'

// 强制动态渲染
export const dynamic = 'force-dynamic'

// 获取用户列表
export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const authResult = await requireAdmin(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    const status = searchParams.get('status') || ''

    const skip = (page - 1) * limit

    // 构建查询条件
    const where: any = {}

    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (role && role !== 'all') {
      where.role = role
    }

    if (status && status !== 'all') {
      where.status = status === 'active' ? 'ACTIVE' : 'INACTIVE'
    }

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          status: true,
          credits: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              ideas: true,
              payments: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ])

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// 更新用户状态
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, action, data } = await request.json()

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    let updateData: any = {}

    switch (action) {
      case 'activate':
        updateData = { status: 'ACTIVE' }
        break
      case 'deactivate':
        updateData = { status: 'INACTIVE' }
        break
      case 'changeRole':
        if (!data.role || !['USER', 'ADMIN', 'MODERATOR'].includes(data.role)) {
          return NextResponse.json(
            { error: 'Invalid role' },
            { status: 400 }
          )
        }
        updateData = { role: data.role }
        break
      case 'updateCredits':
        if (typeof data.credits !== 'number') {
          return NextResponse.json(
            { error: 'Invalid credits amount' },
            { status: 400 }
          )
        }
        updateData = { credits: data.credits }
        break
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        credits: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      user: updatedUser
    })

  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}
