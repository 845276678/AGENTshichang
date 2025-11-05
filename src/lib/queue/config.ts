/**
 * BullMQ队列配置
 *
 * 用于社交媒体自动发布和市场数据采集系统
 */

import Redis from 'ioredis'
import { QueueOptions, WorkerOptions, JobsOptions } from 'bullmq'

// Redis连接配置
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null, // BullMQ要求设置为null
  enableReadyCheck: false,
  retryStrategy: (times: number) => {
    // 指数退避重试策略
    return Math.min(times * 50, 2000)
  }
}

// 创建Redis连接
export const createRedisConnection = () => {
  return new Redis(redisConfig)
}

// 队列名称常量
export const QUEUE_NAMES = {
  SOCIAL_PUBLISH: 'social-publish',
  SOCIAL_VERIFY: 'social-verify',
  ANALYTICS_TREND: 'analytics-trend',
  ANALYTICS_COMPETITOR: 'analytics-competitor'
} as const

// 队列前缀
const QUEUE_PREFIX = process.env.BULLMQ_QUEUE_PREFIX || 'social-media'

// 通用队列配置
export const getQueueConfig = (queueName: string): QueueOptions => ({
  connection: createRedisConnection(),
  prefix: QUEUE_PREFIX,
  defaultJobOptions: {
    removeOnComplete: {
      age: 7 * 24 * 60 * 60, // 保留7天
      count: 1000
    },
    removeOnFail: {
      age: 30 * 24 * 60 * 60, // 保留30天
      count: 5000
    },
    attempts: 3, // 默认重试3次
    backoff: {
      type: 'exponential',
      delay: 2000 // 2秒起始延迟
    }
  }
})

// Worker配置
export const getWorkerConfig = (queueName: string): WorkerOptions => ({
  connection: createRedisConnection(),
  prefix: QUEUE_PREFIX,
  concurrency: parseInt(
    process.env[`${queueName.toUpperCase()}_WORKER_CONCURRENCY`] || '5'
  ),
  limiter: {
    max: 10, // 每个时间窗口最多处理10个任务
    duration: 1000 // 1秒
  },
  autorun: true,
  removeOnComplete: { count: 1000 },
  removeOnFail: { count: 5000 }
})

// 任务配置 - 发布任务
export const PUBLISH_JOB_OPTIONS: JobsOptions = {
  attempts: 5, // 发布任务重试5次
  backoff: {
    type: 'exponential',
    delay: 5000 // 5秒起始延迟
  },
  removeOnComplete: true,
  removeOnFail: false, // 保留失败任务用于调试
  timeout: 5 * 60 * 1000 // 5分钟超时
}

// 任务配置 - Cookie验证
export const VERIFY_JOB_OPTIONS: JobsOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000
  },
  timeout: 30 * 1000 // 30秒超时
}

// 任务配置 - 趋势采集
export const TREND_JOB_OPTIONS: JobsOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 3000
  },
  timeout: 2 * 60 * 1000, // 2分钟超时
  repeat: {
    pattern: '0 */6 * * *' // 每6小时执行一次
  }
}

// 任务配置 - 竞品监控
export const COMPETITOR_JOB_OPTIONS: JobsOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 3000
  },
  timeout: 3 * 60 * 1000 // 3分钟超时
}

// 健康检查配置
export const HEALTH_CHECK_CONFIG = {
  // 队列最大积压任务数
  maxQueuedJobs: 200,
  // 最大等待时间(秒)
  maxWaitTime: 300,
  // 检查间隔(毫秒)
  checkInterval: 60000
}
