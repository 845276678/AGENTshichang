/**
 * 社交账号管理API
 *
 * GET    /api/social/accounts - 获取账号列表
 * POST   /api/social/accounts - 添加新账号
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { encryptCookie } from '@/lib/security'
import { verifyQueue } from '@/lib/queue/queue-manager'
import { SocialPlatform, SocialAccountStatus } from '@prisma/client'

/**
 * GET /api/social/accounts - 获取用户的社交账号列表
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
    const status = searchParams.get('status') as SocialAccountStatus | null

    // 3. 构建查询条件
    const where: any = {
      userId: session.user.id
    }

    if (platform) {
      where.platform = platform
    }

    if (status) {
      where.status = status
    }

    // 4. 查询账号列表
    const accounts = await prisma.socialAccount.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        platform: true,
        platformAccountId: true,
        platformUsername: true,
        status: true,
        lastVerifiedAt: true,
        cookieExpiresAt: true,
        metadata: true,
        createdAt: true,
        updatedAt: true
        // 不返回cookieCipher（敏感信息）
      }
    })

    return NextResponse.json({
      success: true,
      data: accounts
    })

  } catch (error: any) {
    console.error('[Social Accounts API] GET error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch accounts',
        details: error.message
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/social/accounts - 添加新的社交账号
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
      platform,
      platformAccountId,
      platformUsername,
      cookieString,
      metadata
    } = body

    // 3. 验证必填字段
    if (!platform || !platformAccountId || !cookieString) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: platform, platformAccountId, cookieString'
        },
        { status: 400 }
      )
    }

    // 4. 检查是否已存在
    const existing = await prisma.socialAccount.findUnique({
      where: {
        userId_platform_platformAccountId: {
          userId: session.user.id,
          platform,
          platformAccountId
        }
      }
    })

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'Account already exists for this platform'
        },
        { status: 409 }
      )
    }

    // 5. 加密Cookie
    const cookieCipher = encryptCookie(cookieString)

    // 6. 计算Cookie过期时间（30天后）
    const cookieExpiresAt = new Date()
    cookieExpiresAt.setDate(cookieExpiresAt.getDate() + 30)

    // 7. 创建账号记录
    const account = await prisma.socialAccount.create({
      data: {
        userId: session.user.id,
        platform,
        platformAccountId,
        platformUsername: platformUsername || platformAccountId,
        cookieCipher,
        cookieExpiresAt,
        status: SocialAccountStatus.PENDING_VERIFICATION,
        metadata: metadata || {},
        lastVerifiedAt: new Date()
      },
      select: {
        id: true,
        platform: true,
        platformAccountId: true,
        platformUsername: true,
        status: true,
        lastVerifiedAt: true,
        cookieExpiresAt: true,
        metadata: true,
        createdAt: true
      }
    })

    // 8. 添加验证任务到队列
    await verifyQueue.addJob({
      accountId: account.id,
      platform,
      userId: session.user.id
    })

    return NextResponse.json({
      success: true,
      data: account,
      message: 'Account added successfully. Verification in progress.'
    })

  } catch (error: any) {
    console.error('[Social Accounts API] POST error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to add account',
        details: error.message
      },
      { status: 500 }
    )
  }
}
