/**
 * 市场趋势采集Worker
 *
 * 采集社交媒体平台的热门趋势数据
 */

import { Job } from 'bullmq'
import { BaseWorker } from './base-worker'
import { TrendJobData } from '@/lib/queue/queue-manager'
import { prisma } from '@/lib/prisma'
import { SocialPlatform } from '@prisma/client'

export interface TrendResult {
  platform: string
  trendsCollected: number
  trends: Array<{
    keyword: string
    heat: number
    category?: string
  }>
}

export class TrendWorker extends BaseWorker<TrendJobData, TrendResult> {
  constructor() {
    super('analytics:trend', 'TrendWorker')
  }

  protected async processJobInternal(
    job: Job<TrendJobData, TrendResult>
  ): Promise<TrendResult> {
    const { platform, keyword, category } = job.data

    this.log(`Starting trend collection`, { platform, keyword, category })

    try {
      await this.updateProgress(job, 10)

      // 1. 采集趋势数据
      const trends = await this.collectTrends(
        platform as SocialPlatform,
        keyword,
        category
      )

      await this.updateProgress(job, 60)

      this.log(`Collected ${trends.length} trends`, { platform })

      // 2. 保存到数据库
      await this.saveTrends(platform as SocialPlatform, trends)

      await this.updateProgress(job, 100)

      this.log(`Trend collection completed`, {
        platform,
        trendsCollected: trends.length
      })

      return {
        platform,
        trendsCollected: trends.length,
        trends: trends.slice(0, 10) // 只返回前10条
      }

    } catch (error: any) {
      this.logError(`Trend collection failed`, error, { platform })
      throw error
    }
  }

  /**
   * 采集趋势数据
   *
   * TODO: 后续阶段集成MediaCrawler
   * - 使用MediaCrawler采集各平台热榜数据
   * - 抖音热榜、小红书热搜、B站热门、微博热搜
   * - 解析热度指标和内容详情
   */
  private async collectTrends(
    platform: SocialPlatform,
    keyword?: string,
    category?: string
  ): Promise<Array<{
    keyword: string
    heat: number
    category: string
    relatedTopics: string[]
    topPosts: Array<{
      title: string
      author: string
      views: number
      likes: number
      url: string
    }>
  }>> {
    // 阶段1占位实现 - 生成模拟数据
    // 阶段3将集成MediaCrawler的真实采集功能

    this.log(`[PLACEHOLDER] Simulating trend collection for ${platform}`)

    // 模拟采集延迟
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000))

    const mockCategories = ['科技', '生活', '美食', '时尚', '娱乐', '教育']
    const trendCount = 20 + Math.floor(Math.random() * 30)

    return Array.from({ length: trendCount }, (_, i) => ({
      keyword: keyword || `热门话题${i + 1}`,
      heat: Math.floor(Math.random() * 1000000),
      category: category || mockCategories[Math.floor(Math.random() * mockCategories.length)],
      relatedTopics: [
        `相关话题${i * 3 + 1}`,
        `相关话题${i * 3 + 2}`,
        `相关话题${i * 3 + 3}`
      ],
      topPosts: Array.from({ length: 5 }, (_, j) => ({
        title: `热门内容${i}-${j + 1}`,
        author: `作者${Math.floor(Math.random() * 1000)}`,
        views: Math.floor(Math.random() * 100000),
        likes: Math.floor(Math.random() * 10000),
        url: `https://${platform.toLowerCase()}.com/post/${Date.now()}-${j}`
      }))
    }))
  }

  /**
   * 保存趋势数据到数据库
   */
  private async saveTrends(
    platform: SocialPlatform,
    trends: Array<{
      keyword: string
      heat: number
      category: string
      relatedTopics: string[]
      topPosts: Array<{
        title: string
        author: string
        views: number
        likes: number
        url: string
      }>
    }>
  ) {
    const now = new Date()

    // 批量创建或更新趋势记录
    await Promise.all(
      trends.map(trend =>
        prisma.marketTrend.upsert({
          where: {
            platform_keyword: {
              platform,
              keyword: trend.keyword
            }
          },
          create: {
            platform,
            keyword: trend.keyword,
            heat: trend.heat,
            category: trend.category,
            relatedTopics: trend.relatedTopics,
            topPosts: trend.topPosts as any,
            collectedAt: now,
            metadata: {
              source: 'worker',
              collectionTime: now.toISOString()
            }
          },
          update: {
            heat: trend.heat,
            category: trend.category,
            relatedTopics: trend.relatedTopics,
            topPosts: trend.topPosts as any,
            collectedAt: now,
            metadata: {
              source: 'worker',
              collectionTime: now.toISOString()
            }
          }
        })
      )
    )

    this.log(`Saved ${trends.length} trends to database`, { platform })
  }
}

// 导出Worker实例
export const trendWorker = new TrendWorker()
