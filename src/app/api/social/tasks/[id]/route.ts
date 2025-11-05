/**
 * 单个发布任务操作API
 *
 * GET    /api/social/tasks/[id] - 获取任务详情
 * DELETE /api/social/tasks/[id] - 取消任务
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { publishQueue } from '@/lib/queue/queue-manager'
import { PublishTaskStatus } from '@prisma/client'

/**
 * GET /api/social/tasks/[id] - 获取任务详情
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

    // 2. 查询任务详情（包含发布日志）
    const task = await prisma.socialPublishTask.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      },
      include: {
        logs: {
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            account: {
              select: {
                platform: true,
                platformUsername: true
              }
            }
          }
        }
      }
    })

    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      )
    }

    // 3. 如果任务还在队列中，获取队列状态
    let queueStatus = null
    if (task.status === PublishTaskStatus.PENDING || task.status === PublishTaskStatus.PROCESSING) {
      try {
        queueStatus = await publishQueue.getJobStatus(task.idempotencyKey || task.id)
      } catch (error) {
        console.error('[Task API] Failed to get queue status:', error)
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...task,
        queueStatus
      }
    })

  } catch (error: any) {
    console.error('[Social Task API] GET error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch task',
        details: error.message
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/social/tasks/[id] - 取消任务
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

    // 2. 查询任务
    const task = await prisma.socialPublishTask.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      )
    }

    // 3. 检查任务状态
    if (task.status === PublishTaskStatus.COMPLETED) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot cancel completed task'
        },
        { status: 400 }
      )
    }

    if (task.status === PublishTaskStatus.CANCELLED) {
      return NextResponse.json(
        {
          success: false,
          error: 'Task already cancelled'
        },
        { status: 400 }
      )
    }

    // 4. 尝试从队列中移除任务
    if (task.status === PublishTaskStatus.PENDING) {
      try {
        await publishQueue.cancelJob(task.idempotencyKey || task.id)
      } catch (error) {
        console.error('[Task API] Failed to cancel queue job:', error)
      }
    }

    // 5. 更新任务状态为已取消
    const updatedTask = await prisma.socialPublishTask.update({
      where: { id: params.id },
      data: {
        status: PublishTaskStatus.CANCELLED,
        completedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedTask,
      message: 'Task cancelled successfully'
    })

  } catch (error: any) {
    console.error('[Social Task API] DELETE error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to cancel task',
        details: error.message
      },
      { status: 500 }
    )
  }
}
