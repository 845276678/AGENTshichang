import { NextRequest, NextResponse } from 'next/server'

import { requireAdmin } from '@/lib/auth-helper'
import { prisma } from '@/lib/database'

// Ç¿ÖÆ¶¯Ì¬äÖÈ¾
export const dynamic = 'force-dynamic'

type AdminUserStatus = 'ACTIVE' | 'INACTIVE'
type AdminUserRole = 'USER' | 'ADMIN' | 'MODERATOR'

type PatchAction = 'activate' | 'deactivate' | 'changeRole' | 'updateCredits'

interface PatchPayload {
  userId?: string
  action?: PatchAction
  data?: {
    role?: AdminUserRole
    credits?: number
  }
}

const isValidRole = (role: unknown): role is AdminUserRole =>
  typeof role === 'string' && ['USER', 'ADMIN', 'MODERATOR'].includes(role)

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get('page') ?? '1', 10)
    const limit = Number.parseInt(searchParams.get('limit') ?? '20', 10)
    const search = searchParams.get('search') ?? ''
    const role = searchParams.get('role') ?? ''
    const status = searchParams.get('status') ?? ''

    const skip = Math.max(page - 1, 0) * limit

    const where: Record<string, unknown> = {}

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

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request)

    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const { userId, action, data }: PatchPayload = await request.json()

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {}

    switch (action) {
      case 'activate':
        updateData.status = 'ACTIVE' satisfies AdminUserStatus
        break
      case 'deactivate':
        updateData.status = 'INACTIVE' satisfies AdminUserStatus
        break
      case 'changeRole':
        if (!isValidRole(data?.role)) {
          return NextResponse.json(
            { error: 'Invalid role' },
            { status: 400 }
          )
        }
        updateData.role = data.role
        break
      case 'updateCredits':
        if (typeof data?.credits !== 'number' || Number.isNaN(data.credits)) {
          return NextResponse.json(
            { error: 'Invalid credits amount' },
            { status: 400 }
          )
        }
        updateData.credits = data.credits
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
