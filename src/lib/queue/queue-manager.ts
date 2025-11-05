/**
 * 队列管理器
 *
 * 统一管理所有BullMQ队列实例
 */

import { Queue } from 'bullmq'
import {
  QUEUE_NAMES,
  getQueueConfig,
  PUBLISH_JOB_OPTIONS,
  VERIFY_JOB_OPTIONS,
  TREND_JOB_OPTIONS,
  COMPETITOR_JOB_OPTIONS
} from './config'

// 队列实例缓存
const queueInstances: Map<string, Queue> = new Map()

/**
 * 获取或创建队列实例
 */
function getOrCreateQueue(queueName: string): Queue {
  if (!queueInstances.has(queueName)) {
    const queue = new Queue(queueName, getQueueConfig(queueName))
    queueInstances.set(queueName, queue)

    console.log(`[Queue] Created queue: ${queueName}`)
  }

  return queueInstances.get(queueName)!
}

// 导出各个队列
export const socialPublishQueue = getOrCreateQueue(QUEUE_NAMES.SOCIAL_PUBLISH)
export const socialVerifyQueue = getOrCreateQueue(QUEUE_NAMES.SOCIAL_VERIFY)
export const analyticsTrendQueue = getOrCreateQueue(QUEUE_NAMES.ANALYTICS_TREND)
export const analyticsCompetitorQueue = getOrCreateQueue(QUEUE_NAMES.ANALYTICS_COMPETITOR)

/**
 * 任务数据接口
 */
export interface PublishJobData {
  taskId: string
  userId: string
  platforms: string[]
  content: {
    type: 'VIDEO' | 'IMAGE' | 'TEXT'
    title: string
    description?: string
    mediaUrls: string[]
    tags: string[]
  }
  accountIds: string[]
  publishType: 'immediate' | 'scheduled'
  scheduledAt?: string
  idempotencyKey?: string
}

export interface VerifyJobData {
  accountId: string
  platform: string
  userId: string
}

export interface TrendJobData {
  userId: string
  platform: string
  keywords?: string[]
  collectTopN?: number
}

export interface CompetitorJobData {
  competitorId: string
  userId: string
  platform: string
  accountUrl: string
  accountId: string
}

/**
 * 发布任务队列操作
 */
export const publishQueue = {
  /**
   * 添加发布任务
   */
  async addJob(data: PublishJobData) {
    const jobId = data.idempotencyKey || data.taskId

    try {
      const job = await socialPublishQueue.add(
        'publish',
        data,
        {
          ...PUBLISH_JOB_OPTIONS,
          jobId // 使用幂等键作为job ID
        }
      )

      console.log(`[PublishQueue] Added job ${job.id} for task ${data.taskId}`)
      return job
    } catch (error) {
      console.error(`[PublishQueue] Failed to add job for task ${data.taskId}:`, error)
      throw error
    }
  },

  /**
   * 获取任务状态
   */
  async getJobStatus(jobId: string) {
    const job = await socialPublishQueue.getJob(jobId)

    if (!job) {
      return null
    }

    const state = await job.getState()
    const progress = job.progress

    return {
      id: job.id,
      state,
      progress,
      data: job.data,
      returnvalue: job.returnvalue,
      failedReason: job.failedReason,
      timestamp: job.timestamp,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
      attemptsMade: job.attemptsMade
    }
  },

  /**
   * 取消任务
   */
  async cancelJob(jobId: string) {
    const job = await socialPublishQueue.getJob(jobId)

    if (job) {
      await job.remove()
      console.log(`[PublishQueue] Cancelled job ${jobId}`)
      return true
    }

    return false
  }
}

/**
 * 验证任务队列操作
 */
export const verifyQueue = {
  async addJob(data: VerifyJobData) {
    const job = await socialVerifyQueue.add(
      'verify',
      data,
      VERIFY_JOB_OPTIONS
    )

    console.log(`[VerifyQueue] Added job ${job.id} for account ${data.accountId}`)
    return job
  }
}

/**
 * 趋势采集队列操作
 */
export const trendQueue = {
  async addJob(data: TrendJobData) {
    const job = await analyticsTrendQueue.add(
      'collect-trend',
      data,
      TREND_JOB_OPTIONS
    )

    console.log(`[TrendQueue] Added job ${job.id} for platform ${data.platform}`)
    return job
  },

  /**
   * 添加周期性趋势采集任务
   */
  async addRepeatableJob(data: TrendJobData, cronPattern: string) {
    const job = await analyticsTrendQueue.add(
      'collect-trend-repeatable',
      data,
      {
        ...TREND_JOB_OPTIONS,
        repeat: {
          pattern: cronPattern
        }
      }
    )

    console.log(`[TrendQueue] Added repeatable job for platform ${data.platform} with pattern ${cronPattern}`)
    return job
  }
}

/**
 * 竞品监控队列操作
 */
export const competitorQueue = {
  async addJob(data: CompetitorJobData) {
    const job = await analyticsCompetitorQueue.add(
      'monitor-competitor',
      data,
      COMPETITOR_JOB_OPTIONS
    )

    console.log(`[CompetitorQueue] Added job ${job.id} for competitor ${data.competitorName}`)
    return job
  }
}

/**
 * 获取队列健康状态
 */
export async function getQueueHealth() {
  const queues = [
    { name: 'social:publish', queue: socialPublishQueue },
    { name: 'social:verify', queue: socialVerifyQueue },
    { name: 'analytics:trend', queue: analyticsTrendQueue },
    { name: 'analytics:competitor', queue: analyticsCompetitorQueue }
  ]

  const health = await Promise.all(
    queues.map(async ({ name, queue }) => {
      const [waiting, active, completed, failed] = await Promise.all([
        queue.getWaitingCount(),
        queue.getActiveCount(),
        queue.getCompletedCount(),
        queue.getFailedCount()
      ])

      return {
        name,
        waiting,
        active,
        completed,
        failed,
        isHealthy: waiting < 200 && active < 50 // 根据HEALTH_CHECK_CONFIG
      }
    })
  )

  return {
    queues: health,
    overall: health.every(q => q.isHealthy)
  }
}

/**
 * 清理队列（用于测试或维护）
 */
export async function cleanQueues() {
  const queues = [
    socialPublishQueue,
    socialVerifyQueue,
    analyticsTrendQueue,
    analyticsCompetitorQueue
  ]

  await Promise.all(
    queues.map(queue => queue.obliterate({ force: true }))
  )

  console.log('[Queue] All queues cleaned')
}

/**
 * 关闭所有队列连接
 */
export async function closeQueues() {
  const queues = Array.from(queueInstances.values())

  await Promise.all(
    queues.map(queue => queue.close())
  )

  queueInstances.clear()
  console.log('[Queue] All queues closed')
}
