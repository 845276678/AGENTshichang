/**
 * 竞品监控Worker
 *
 * 监控竞争对手在社交媒体上的表现
 */

import { Job } from 'bullmq'
import { BaseWorker } from './base-worker'
import { CompetitorJobData } from '@/lib/queue/queue-manager'
import { prisma } from '@/lib/prisma'
import { SocialPlatform } from '@prisma/client'

export interface CompetitorResult {
  watchId: string
  competitorName: string
  platform: string
  metricsCollected: boolean
  metrics?: {
    followerCount: number
    postCount: number
    avgEngagement: number
    recentPosts: Array<{
      title: string
      publishedAt: string
      views: number
      likes: number
      comments: number
      shares: number
      url: string
    }>
  }
  error?: string
}

export class CompetitorWorker extends BaseWorker<CompetitorJobData, CompetitorResult> {
  constructor() {
    super('analytics:competitor', 'CompetitorWorker')
  }

  protected async processJobInternal(
    job: Job<CompetitorJobData, CompetitorResult>
  ): Promise<CompetitorResult> {
    const { watchId, userId, competitorName, platform, accountUrl } = job.data

    this.log(`Starting competitor monitoring`, {
      watchId,
      competitorName,
      platform
    })

    try {
      await this.updateProgress(job, 10)

      // 1. 验证监控记录存在
      const watch = await prisma.competitorWatch.findUnique({
        where: {
          id: watchId,
          userId
        }
      })

      if (!watch) {
        throw new Error(`Competitor watch ${watchId} not found`)
      }

      await this.updateProgress(job, 30)

      // 2. 采集竞品数据
      const metrics = await this.collectCompetitorMetrics(
        platform as SocialPlatform,
        competitorName,
        accountUrl
      )

      await this.updateProgress(job, 70)

      // 3. 保存数据
      await this.saveCompetitorMetrics(watchId, metrics)

      await this.updateProgress(job, 100)

      this.log(`Competitor monitoring completed`, {
        watchId,
        competitorName,
        followerCount: metrics.followerCount
      })

      return {
        watchId,
        competitorName,
        platform,
        metricsCollected: true,
        metrics
      }

    } catch (error: any) {
      this.logError(`Competitor monitoring failed`, error, {
        watchId,
        competitorName
      })

      return {
        watchId,
        competitorName,
        platform,
        metricsCollected: false,
        error: error.message
      }
    }
  }

  /**
   * 采集竞品指标数据
   *
   * TODO: 后续阶段集成MediaCrawler
   * - 使用MediaCrawler获取竞品账号数据
   * - 采集粉丝数、发文量、互动数据
   * - 分析内容策略和发布频率
   * - 监控热门内容和话题
   */
  private async collectCompetitorMetrics(
    platform: SocialPlatform,
    competitorName: string,
    accountUrl?: string
  ): Promise<{
    followerCount: number
    postCount: number
    avgEngagement: number
    recentPosts: Array<{
      title: string
      publishedAt: string
      views: number
      likes: number
      comments: number
      shares: number
      url: string
    }>
  }> {
    // 阶段1占位实现 - 生成模拟数据
    // 阶段3将集成MediaCrawler的真实采集功能

    this.log(`[PLACEHOLDER] Simulating competitor data collection`, {
      platform,
      competitorName
    })

    // 模拟采集延迟
    await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 3000))

    const recentPosts = Array.from({ length: 10 }, (_, i) => {
      const publishedAt = new Date()
      publishedAt.setDate(publishedAt.getDate() - i)

      return {
        title: `${competitorName}的内容${i + 1}`,
        publishedAt: publishedAt.toISOString(),
        views: Math.floor(Math.random() * 50000),
        likes: Math.floor(Math.random() * 5000),
        comments: Math.floor(Math.random() * 500),
        shares: Math.floor(Math.random() * 200),
        url: `https://${platform.toLowerCase()}.com/${competitorName}/post${i + 1}`
      }
    })

    const totalEngagement = recentPosts.reduce(
      (sum, post) => sum + post.likes + post.comments + post.shares,
      0
    )

    return {
      followerCount: Math.floor(10000 + Math.random() * 90000),
      postCount: Math.floor(100 + Math.random() * 900),
      avgEngagement: Math.floor(totalEngagement / recentPosts.length),
      recentPosts
    }
  }

  /**
   * 保存竞品数据到数据库
   */
  private async saveCompetitorMetrics(
    watchId: string,
    metrics: {
      followerCount: number
      postCount: number
      avgEngagement: number
      recentPosts: Array<{
        title: string
        publishedAt: string
        views: number
        likes: number
        comments: number
        shares: number
        url: string
      }>
    }
  ) {
    const now = new Date()

    await prisma.competitorWatch.update({
      where: { id: watchId },
      data: {
        lastCheckedAt: now,
        metadata: {
          lastMetrics: {
            ...metrics,
            collectedAt: now.toISOString()
          }
        }
      }
    })

    this.log(`Saved competitor metrics to database`, { watchId })
  }
}

// 导出Worker实例
export const competitorWorker = new CompetitorWorker()
