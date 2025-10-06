/**
 * AI生成内容缓存机制
 * 用于减少重复的AI调用,降低成本和提高响应速度
 */

import { createHash } from 'crypto'

export interface PersonalizedContent {
  marketAnalysis: string
  competitionAnalysis: string
  targetCustomers: string[]
  userNeeds: string
  mvpFeatures: string[]
  techStack: string[]
  revenueModel: string
  pricingStrategy: string
  customerAcquisition: {
    targetCustomers: string[]
    acquisitionChannels: string[]
    coldStartStrategy: string
    budgetAllocation: string
  }
  marketingStrategy: {
    contentStrategy: string[]
    communityStrategy: string[]
    partnershipIdeas: string[]
    viralMechanics: string
  }
  earlyMilestones: {
    twoWeekGoals: Array<{
      title: string
      description: string
      successCriteria: string
      effort: 'low' | 'medium' | 'high'
      impact: 'low' | 'medium' | 'high'
    }>
    oneMonthGoals: Array<{
      title: string
      description: string
      successCriteria: string
      effort: 'low' | 'medium' | 'high'
      impact: 'low' | 'medium' | 'high'
    }>
    quickWins: string[]
  }
}

interface CachedContent {
  hash: string
  content: PersonalizedContent
  timestamp: number
  expiresAt: number
}

/**
 * 内容缓存管理器
 */
export class ContentCache {
  private cache = new Map<string, CachedContent>()
  private readonly defaultTTL = 24 * 60 * 60 * 1000 // 24小时

  /**
   * 生成内容哈希
   * 基于创意内容和专家上下文
   */
  getHash(ideaContent: string, expertContext: string): string {
    const combined = `${ideaContent}|${expertContext}`
    return createHash('sha256').update(combined, 'utf8').digest('hex')
  }

  /**
   * 获取缓存内容
   * 如果缓存过期则返回null
   */
  get(hash: string): PersonalizedContent | null {
    const cached = this.cache.get(hash)

    if (!cached) {
      return null
    }

    // 检查是否过期
    if (Date.now() > cached.expiresAt) {
      this.cache.delete(hash)
      return null
    }

    console.log(`✅ 缓存命中: ${hash.substring(0, 8)}...`)
    return cached.content
  }

  /**
   * 设置缓存内容
   */
  set(hash: string, content: PersonalizedContent, ttl?: number): void {
    const expiresAt = Date.now() + (ttl ?? this.defaultTTL)

    this.cache.set(hash, {
      hash,
      content,
      timestamp: Date.now(),
      expiresAt
    })

    console.log(`💾 缓存已保存: ${hash.substring(0, 8)}... (TTL: ${(ttl ?? this.defaultTTL) / 1000 / 60}分钟)`)
  }

  /**
   * 清除过期缓存
   * 建议定期调用以释放内存
   */
  cleanup(): number {
    const now = Date.now()
    let cleanedCount = 0

    for (const [hash, cached] of this.cache.entries()) {
      if (now > cached.expiresAt) {
        this.cache.delete(hash)
        cleanedCount++
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 清理了 ${cleanedCount} 个过期缓存`)
    }

    return cleanedCount
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): {
    totalItems: number
    totalSize: number
    oldestItem: number | null
    newestItem: number | null
  } {
    const items = Array.from(this.cache.values())

    return {
      totalItems: items.length,
      totalSize: items.reduce((sum, item) =>
        sum + JSON.stringify(item.content).length, 0
      ),
      oldestItem: items.length > 0
        ? Math.min(...items.map(item => item.timestamp))
        : null,
      newestItem: items.length > 0
        ? Math.max(...items.map(item => item.timestamp))
        : null
    }
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear()
    console.log('🗑️ 缓存已清空')
  }
}

// 全局缓存实例
export const contentCache = new ContentCache()

// 定期清理过期缓存 (每小时)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    contentCache.cleanup()
  }, 60 * 60 * 1000)
}
