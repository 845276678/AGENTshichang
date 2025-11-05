/**
 * Worker基础类
 *
 * 所有Worker的抽象基类，提供通用功能
 */

import { Worker, Job, WorkerOptions } from 'bullmq'
import { getWorkerConfig } from '@/lib/queue/config'

export interface WorkerContext {
  logger: Console
  metrics: {
    jobsProcessed: number
    jobsFailed: number
    totalProcessingTime: number
  }
}

export abstract class BaseWorker<T = any, R = any> {
  protected worker: Worker<T, R>
  protected context: WorkerContext
  protected isShuttingDown = false

  constructor(
    protected queueName: string,
    protected jobName: string,
    options?: Partial<WorkerOptions>
  ) {
    this.context = {
      logger: console,
      metrics: {
        jobsProcessed: 0,
        jobsFailed: 0,
        totalProcessingTime: 0
      }
    }

    const workerConfig = getWorkerConfig(queueName)

    this.worker = new Worker<T, R>(
      queueName,
      async (job: Job<T, R>) => this.processJob(job),
      {
        ...workerConfig,
        ...options
      }
    )

    this.setupEventHandlers()
  }

  /**
   * 处理任务的抽象方法 - 子类必须实现
   */
  protected abstract processJobInternal(
    job: Job<T, R>
  ): Promise<R>

  /**
   * 任务处理包装器 - 添加通用逻辑
   */
  private async processJob(job: Job<T, R>): Promise<R> {
    const startTime = Date.now()

    try {
      this.log(`Processing job ${job.id}`, { jobId: job.id, data: job.data })

      // 调用子类实现
      const result = await this.processJobInternal(job)

      const duration = Date.now() - startTime
      this.context.metrics.jobsProcessed++
      this.context.metrics.totalProcessingTime += duration

      this.log(`Job ${job.id} completed in ${duration}ms`, {
        jobId: job.id,
        duration
      })

      return result
    } catch (error) {
      const duration = Date.now() - startTime
      this.context.metrics.jobsFailed++

      this.logError(`Job ${job.id} failed after ${duration}ms`, error, {
        jobId: job.id,
        duration,
        attemptsMade: job.attemptsMade
      })

      throw error
    }
  }

  /**
   * 设置事件处理器
   */
  private setupEventHandlers() {
    // 任务完成事件
    this.worker.on('completed', (job, result) => {
      this.log(`[${this.jobName}] Job ${job.id} completed`, {
        jobId: job.id
      })
    })

    // 任务失败事件
    this.worker.on('failed', (job, error) => {
      if (job) {
        this.logError(
          `[${this.jobName}] Job ${job.id} failed (attempt ${job.attemptsMade})`,
          error,
          { jobId: job.id, attemptsMade: job.attemptsMade }
        )
      }
    })

    // 任务进度事件
    this.worker.on('progress', (job, progress) => {
      this.log(`[${this.jobName}] Job ${job.id} progress: ${progress}%`, {
        jobId: job.id,
        progress
      })
    })

    // Worker错误事件
    this.worker.on('error', (error) => {
      this.logError(`[${this.jobName}] Worker error`, error)
    })

    // Worker关闭事件
    this.worker.on('closed', () => {
      this.log(`[${this.jobName}] Worker closed`)
    })
  }

  /**
   * 更新任务进度
   */
  protected async updateProgress(job: Job, progress: number) {
    await job.updateProgress(progress)
  }

  /**
   * 日志记录
   */
  protected log(message: string, meta?: any) {
    const timestamp = new Date().toISOString()
    this.context.logger.log(`[${timestamp}] [${this.jobName}] ${message}`, meta || '')
  }

  /**
   * 错误日志
   */
  protected logError(message: string, error: any, meta?: any) {
    const timestamp = new Date().toISOString()
    this.context.logger.error(
      `[${timestamp}] [${this.jobName}] ${message}`,
      error,
      meta || ''
    )
  }

  /**
   * 获取指标数据
   */
  getMetrics() {
    return {
      ...this.context.metrics,
      avgProcessingTime:
        this.context.metrics.jobsProcessed > 0
          ? this.context.metrics.totalProcessingTime /
            this.context.metrics.jobsProcessed
          : 0
    }
  }

  /**
   * 优雅关闭Worker
   */
  async shutdown() {
    if (this.isShuttingDown) {
      return
    }

    this.isShuttingDown = true
    this.log('Shutting down worker...')

    try {
      await this.worker.close()
      this.log('Worker shut down successfully')
    } catch (error) {
      this.logError('Error during worker shutdown', error)
      throw error
    }
  }

  /**
   * 暂停Worker
   */
  async pause() {
    await this.worker.pause()
    this.log('Worker paused')
  }

  /**
   * 恢复Worker
   */
  async resume() {
    await this.worker.resume()
    this.log('Worker resumed')
  }

  /**
   * 检查Worker是否正在运行
   */
  isRunning(): boolean {
    return this.worker.isRunning() && !this.isShuttingDown
  }
}
