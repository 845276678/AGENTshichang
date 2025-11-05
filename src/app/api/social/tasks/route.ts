/**
 * 社交媒体发布任务API
 *
 * GET  /api/social/tasks - 获取任务列表
 * POST /api/social/tasks - 创建新任务
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { publishQueue } from '@/lib/queue/queue-manager'
import { PublishTaskStatus, PublishContentType, SocialPlatform } from '@prisma/client'
import crypto from 'crypto'

/**
 * GET /api/social/tasks - 获取用户的发布任务列表
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
    const status = searchParams.get('status') as PublishTaskStatus | null
    const mvpId = searchParams.get('mvpId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // 3. 构建查询条件
    const where: any = {
      userId: session.user.id
    }

    if (status) {
      where.status = status
    }

    if (mvpId) {
      where.mvpId = mvpId
    }

    // 4. 查询任务列表
    const [tasks, total] = await Promise.all([
      prisma.socialPublishTask.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          mvpId: true,
          contentType: true,
          title: true,
          description: true,
          tags: true,
          mediaUrls: true,
          targetPlatforms: true,
          selectedAccountIds: true,
          publishType: true,
          scheduledAt: true,
          status: true,
          progress: true,
          publishedCount: true,
          failedCount: true,
          lastError: true,
          creditsCost: true,
          createdAt: true,
          completedAt: true
        }
      }),
      prisma.socialPublishTask.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        tasks,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error: any) {
    console.error('[Social Tasks API] GET error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch tasks',
        details: error.message
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/social/tasks - 创建新的发布任务
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
      mvpId,
      contentType,
      title,
      description,
      tags,
      mediaUrls,
      targetPlatforms,
      selectedAccountIds,
      publishType,
      scheduledAt,
      metadata
    } = body

    // 3. 验证必填字段
    if (!contentType || !title || !targetPlatforms?.length || !selectedAccountIds?.length) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: contentType, title, targetPlatforms, selectedAccountIds'
        },
        { status: 400 }
      )
    }

    // 4. 验证账号所有权和有效性
    const accounts = await prisma.socialAccount.findMany({
      where: {
        id: { in: selectedAccountIds },
        userId: session.user.id,
        status: 'ACTIVE'
      }
    })

    if (accounts.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No valid active accounts found'
        },
        { status: 400 }
      )
    }

    if (accounts.length !== selectedAccountIds.length) {
      return NextResponse.json(
        {
          success: false,
          error: 'Some accounts are invalid or inactive'
        },
        { status: 400 }
      )
    }

    // 5. 验证平台匹配
    const accountPlatforms = new Set(accounts.map(a => a.platform))
    const invalidPlatforms = targetPlatforms.filter(
      (p: SocialPlatform) => !accountPlatforms.has(p)
    )

    if (invalidPlatforms.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `No accounts available for platforms: ${invalidPlatforms.join(', ')}`
        },
        { status: 400 }
      )
    }

    // 6. 计算积分消耗（每个账号10积分）
    const creditsCost = selectedAccountIds.length * 10

    // TODO: 验证用户积分余额

    // 7. 生成幂等键
    const idempotencyKey = crypto.randomBytes(16).toString('hex')

    // 8. 创建任务记录
    const task = await prisma.socialPublishTask.create({
      data: {
        userId: session.user.id,
        mvpId,
        contentType,
        title,
        description,
        tags: tags || [],
        mediaUrls: mediaUrls || [],
        targetPlatforms,
        selectedAccountIds,
        publishType: publishType || 'immediate',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status: PublishTaskStatus.PENDING,
        progress: 0,
        publishedCount: 0,
        failedCount: 0,
        idempotencyKey,
        creditsCost,
        metadata: metadata || {}
      },
      select: {
        id: true,
        contentType: true,
        title: true,
        targetPlatforms: true,
        selectedAccountIds: true,
        publishType: true,
        scheduledAt: true,
        status: true,
        progress: true,
        creditsCost: true,
        createdAt: true
      }
    })

    // 9. 添加到发布队列
    if (publishType === 'immediate' || !scheduledAt) {
      await publishQueue.addJob({
        taskId: task.id,
        userId: session.user.id,
        platforms: targetPlatforms,
        content: {
          type: contentType,
          title,
          description: description || '',
          mediaUrls: mediaUrls || [],
          tags: tags || []
        },
        accountIds: selectedAccountIds,
        publishType: 'immediate',
        idempotencyKey
      })
    } else {
      // 定时任务
      await publishQueue.addJob({
        taskId: task.id,
        userId: session.user.id,
        platforms: targetPlatforms,
        content: {
          type: contentType,
          title,
          description: description || '',
          mediaUrls: mediaUrls || [],
          tags: tags || []
        },
        accountIds: selectedAccountIds,
        publishType: 'scheduled',
        scheduledAt,
        idempotencyKey
      })
    }

    return NextResponse.json({
      success: true,
      data: task,
      message: publishType === 'immediate'
        ? 'Task created and queued for publishing'
        : `Task scheduled for ${scheduledAt}`
    })

  } catch (error: any) {
    console.error('[Social Tasks API] POST error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create task',
        details: error.message
      },
      { status: 500 }
    )
  }
}
