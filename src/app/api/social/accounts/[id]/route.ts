/**
 * 单个社交账号操作API
 *
 * GET    /api/social/accounts/[id] - 获取账号详情
 * PATCH  /api/social/accounts/[id] - 更新账号
 * DELETE /api/social/accounts/[id] - 删除账号
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { encryptCookie } from '@/lib/security'
import { verifyQueue } from '@/lib/queue/queue-manager'
import { SocialAccountStatus } from '@prisma/client'

/**
 * GET /api/social/accounts/[id] - 获取账号详情
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

    // 2. 查询账号
    const account = await prisma.socialAccount.findFirst({
      where: {
        id: params.id,
        userId: session.user.id // 确保只能访问自己的账号
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
      }
    })

    if (!account) {
      return NextResponse.json(
        { success: false, error: 'Account not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: account
    })

  } catch (error: any) {
    console.error('[Social Account API] GET error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch account',
        details: error.message
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/social/accounts/[id] - 更新账号信息
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

    // 2. 验证账号所有权
    const account = await prisma.socialAccount.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!account) {
      return NextResponse.json(
        { success: false, error: 'Account not found' },
        { status: 404 }
      )
    }

    // 3. 解析请求体
    const body = await req.json()
    const {
      platformUsername,
      cookieString,
      metadata,
      status
    } = body

    // 4. 构建更新数据
    const updateData: any = {
      updatedAt: new Date()
    }

    if (platformUsername !== undefined) {
      updateData.platformUsername = platformUsername
    }

    if (cookieString) {
      // 更新Cookie需要重新加密和验证
      updateData.cookieCipher = encryptCookie(cookieString)
      updateData.status = SocialAccountStatus.PENDING_VERIFICATION
      updateData.cookieExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

      // 添加验证任务
      await verifyQueue.addJob({
        accountId: account.id,
        platform: account.platform,
        userId: session.user.id
      })
    }

    if (metadata) {
      updateData.metadata = {
        ...account.metadata,
        ...metadata
      }
    }

    if (status && !cookieString) {
      // 只有不更新Cookie时才允许手动更新状态
      updateData.status = status
    }

    // 5. 更新账号
    const updatedAccount = await prisma.socialAccount.update({
      where: { id: params.id },
      data: updateData,
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
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedAccount,
      message: cookieString
        ? 'Account updated. Cookie verification in progress.'
        : 'Account updated successfully.'
    })

  } catch (error: any) {
    console.error('[Social Account API] PATCH error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update account',
        details: error.message
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/social/accounts/[id] - 删除账号
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

    // 2. 验证账号所有权
    const account = await prisma.socialAccount.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!account) {
      return NextResponse.json(
        { success: false, error: 'Account not found' },
        { status: 404 }
      )
    }

    // 3. 检查是否有进行中的发布任务
    const activeTasks = await prisma.socialPublishTask.count({
      where: {
        userId: session.user.id,
        selectedAccountIds: {
          has: params.id
        },
        status: {
          in: ['PENDING', 'PROCESSING']
        }
      }
    })

    if (activeTasks > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete account with active publish tasks'
        },
        { status: 409 }
      )
    }

    // 4. 删除账号（会级联删除相关的发布日志）
    await prisma.socialAccount.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully'
    })

  } catch (error: any) {
    console.error('[Social Account API] DELETE error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete account',
        details: error.message
      },
      { status: 500 }
    )
  }
}
