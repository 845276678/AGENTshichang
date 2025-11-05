/**
 * 社交媒体发布Worker
 *
 * 处理社交媒体内容自动发布任务
 */

import { Job } from 'bullmq'
import { BaseWorker } from './base-worker'
import { PublishJobData } from '@/lib/queue/queue-manager'
import { prisma } from '@/lib/prisma'
import { PublishTaskStatus, SocialPlatform } from '@prisma/client'

export interface PublishResult {
  taskId: string
  success: boolean
  publishedCount: number
  failedCount: number
  details: Array<{
    platform: string
    accountId: string
    success: boolean
    publishUrl?: string
    error?: string
  }>
}

export class PublishWorker extends BaseWorker<PublishJobData, PublishResult> {
  constructor() {
    super('social:publish', 'PublishWorker')
  }

  protected async processJobInternal(
    job: Job<PublishJobData, PublishResult>
  ): Promise<PublishResult> {
    const { taskId, userId, platforms, content, accountIds, publishType } = job.data

    this.log(`Starting publish task`, { taskId, platforms, accountIds })

    // 1. 更新任务状态为处理中
    await this.updateTaskStatus(taskId, PublishTaskStatus.PROCESSING, 0)

    const results: PublishResult = {
      taskId,
      success: false,
      publishedCount: 0,
      failedCount: 0,
      details: []
    }

    try {
      // 2. 获取任务详情
      const task = await prisma.socialPublishTask.findUnique({
        where: { id: taskId },
        include: {
          user: true
        }
      })

      if (!task) {
        throw new Error(`Task ${taskId} not found`)
      }

      // 3. 获取账号信息
      const accounts = await prisma.socialAccount.findMany({
        where: {
          id: { in: accountIds },
          userId,
          status: 'ACTIVE'
        }
      })

      if (accounts.length === 0) {
        throw new Error('No active accounts found')
      }

      this.log(`Found ${accounts.length} active accounts`, { taskId })

      // 4. 为每个账号发布内容
      const totalAccounts = accounts.length
      let processedAccounts = 0

      for (const account of accounts) {
        try {
          this.log(`Publishing to ${account.platform} account ${account.id}`, {
            taskId,
            accountId: account.id,
            platform: account.platform
          })

          // 调用平台发布逻辑
          const publishResult = await this.publishToPlatform(
            account.platform,
            account,
            content,
            task
          )

          // 记录成功
          await this.createPublishLog(
            taskId,
            account.id,
            account.platform,
            'SUCCESS',
            publishResult.publishUrl,
            null
          )

          results.details.push({
            platform: account.platform,
            accountId: account.id,
            success: true,
            publishUrl: publishResult.publishUrl
          })

          results.publishedCount++

        } catch (error: any) {
          this.logError(`Failed to publish to ${account.platform}`, error, {
            taskId,
            accountId: account.id
          })

          // 记录失败
          await this.createPublishLog(
            taskId,
            account.id,
            account.platform,
            'FAILED',
            null,
            error.message
          )

          results.details.push({
            platform: account.platform,
            accountId: account.id,
            success: false,
            error: error.message
          })

          results.failedCount++
        }

        // 更新进度
        processedAccounts++
        const progress = Math.round((processedAccounts / totalAccounts) * 100)
        await this.updateProgress(job, progress)
        await this.updateTaskStatus(taskId, PublishTaskStatus.PROCESSING, progress)
      }

      // 5. 更新最终状态
      const finalStatus = results.publishedCount > 0
        ? PublishTaskStatus.COMPLETED
        : PublishTaskStatus.FAILED

      await this.updateTaskStatus(
        taskId,
        finalStatus,
        100,
        results.publishedCount,
        results.failedCount
      )

      results.success = results.publishedCount > 0

      this.log(`Publish task completed`, {
        taskId,
        publishedCount: results.publishedCount,
        failedCount: results.failedCount
      })

      return results

    } catch (error: any) {
      this.logError(`Publish task failed`, error, { taskId })

      // 更新任务失败状态
      await this.updateTaskStatus(
        taskId,
        PublishTaskStatus.FAILED,
        0,
        results.publishedCount,
        results.failedCount,
        error.message
      )

      throw error
    }
  }

  /**
   * 发布到特定平台
   *
   * TODO: 后续阶段实现具体的平台自动化逻辑
   * - 使用Playwright进行浏览器自动化
   * - 集成social-auto-upload的发布脚本
   * - 处理验证码、二次确认等交互
   */
  private async publishToPlatform(
    platform: SocialPlatform,
    account: any,
    content: PublishJobData['content'],
    task: any
  ): Promise<{ publishUrl: string }> {
    // 阶段1占位实现 - 仅模拟发布
    // 阶段2将实现真实的Playwright自动化逻辑

    this.log(`[PLACEHOLDER] Simulating publish to ${platform}`, {
      accountId: account.id,
      contentType: content.type
    })

    // 模拟发布延迟
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000))

    // 模拟95%成功率
    if (Math.random() < 0.95) {
      return {
        publishUrl: `https://${platform.toLowerCase()}.com/mock/${Date.now()}`
      }
    } else {
      throw new Error(`Mock platform error: ${platform} service temporarily unavailable`)
    }
  }

  /**
   * 更新任务状态
   */
  private async updateTaskStatus(
    taskId: string,
    status: PublishTaskStatus,
    progress: number,
    publishedCount?: number,
    failedCount?: number,
    error?: string
  ) {
    const updateData: any = {
      status,
      progress,
      updatedAt: new Date()
    }

    if (publishedCount !== undefined) {
      updateData.publishedCount = publishedCount
    }

    if (failedCount !== undefined) {
      updateData.failedCount = failedCount
    }

    if (error) {
      updateData.lastError = {
        message: error,
        timestamp: new Date().toISOString()
      }
    }

    if (status === PublishTaskStatus.COMPLETED || status === PublishTaskStatus.FAILED) {
      updateData.completedAt = new Date()
    }

    await prisma.socialPublishTask.update({
      where: { id: taskId },
      data: updateData
    })
  }

  /**
   * 创建发布日志
   */
  private async createPublishLog(
    taskId: string,
    accountId: string,
    platform: SocialPlatform,
    status: 'SUCCESS' | 'FAILED',
    publishUrl: string | null,
    errorMessage: string | null
  ) {
    await prisma.socialPublishLog.create({
      data: {
        taskId,
        accountId,
        platform,
        status,
        publishUrl,
        errorMessage,
        publishedAt: status === 'SUCCESS' ? new Date() : null
      }
    })
  }
}

// 导出Worker实例（用于worker进程）
export const publishWorker = new PublishWorker()
