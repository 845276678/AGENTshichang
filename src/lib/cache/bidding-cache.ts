// 竞价系统专用缓存策略
import { RedisCacheManager, CacheKeyType } from './redis-manager'
import { AIServiceProvider } from '../ai/ai-service-manager'

// 竞价会话缓存数据结构
interface CachedBiddingSession {
  id: string
  ideaId: string
  status: string
  phase: string
  currentPrice: number
  timeRemaining: number
  participants: string[]
  viewers: number
  bids: CachedBid[]
  interactions: CachedAIInteraction[]
  enhancedByDiscussion: boolean
  lastUpdated: number
}

interface CachedBid {
  id: string
  agentName: string
  agentType: string
  amount: number
  comment?: string
  confidence?: number
  timestamp: number
}

interface CachedAIInteraction {
  id: string
  agentName: string
  interactionType: string
  content: string
  emotion: string
  animation: string
  timestamp: number
}

interface CachedUserGuess {
  userId: string
  guessedPrice: number
  confidence: number
  stakeAmount: number
  timestamp: number
}

interface CachedSessionStats {
  totalGuesses: number
  averageGuess: number
  priceDistribution: Array<{
    range: string
    count: number
  }>
  lastUpdated: number
}

// 竞价缓存管理器
export class BiddingCacheManager {
  private cache: RedisCacheManager
  private readonly TTL = {
    SESSION: 1800,      // 30分钟
    BID: 3600,          // 1小时
    INTERACTION: 3600,  // 1小时
    USER_GUESS: 7200,   // 2小时
    STATS: 300,         // 5分钟
    AI_CONTENT: 86400,  // 24小时（AI生成的内容）
    USER_DATA: 600      // 10分钟（用户相关数据）
  }

  constructor(cache: RedisCacheManager) {
    this.cache = cache
  }

  // ==================== 竞价会话缓存 ====================

  async cacheSession(session: CachedBiddingSession): Promise<boolean> {
    const success = await this.cache.set(
      CacheKeyType.BIDDING,
      { ...session, lastUpdated: Date.now() },
      this.TTL.SESSION,
      'session',
      session.id
    )

    // 同时缓存会话列表（用于快速查询）
    if (success) {
      await this.addToSessionList(session.id, session.status, session.ideaId)
    }

    return success
  }

  async getSession(sessionId: string): Promise<CachedBiddingSession | null> {
    return this.cache.get<CachedBiddingSession>(CacheKeyType.BIDDING, 'session', sessionId)
  }

  async updateSessionField(
    sessionId: string,
    field: keyof CachedBiddingSession,
    value: any
  ): Promise<boolean> {
    const session = await this.getSession(sessionId)
    if (!session) return false

    session[field] = value as any
    session.lastUpdated = Date.now()

    return this.cacheSession(session)
  }

  async addBidToSession(sessionId: string, bid: CachedBid): Promise<boolean> {
    const session = await this.getSession(sessionId)
    if (!session) return false

    // 保持最新的20个出价
    session.bids = [bid, ...session.bids.slice(0, 19)]
    session.currentPrice = bid.amount
    session.lastUpdated = Date.now()

    return this.cacheSession(session)
  }

  async addInteractionToSession(sessionId: string, interaction: CachedAIInteraction): Promise<boolean> {
    const session = await this.getSession(sessionId)
    if (!session) return false

    // 保持最新的50个交互
    session.interactions = [interaction, ...session.interactions.slice(0, 49)]
    session.lastUpdated = Date.now()

    return this.cacheSession(session)
  }

  // ==================== 会话列表缓存 ====================

  private async addToSessionList(sessionId: string, status: string, ideaId: string): Promise<boolean> {
    const pipeline = this.cache['redis'].pipeline()

    // 添加到活跃会话列表
    if (status === 'ACTIVE') {
      pipeline.sadd(this.generateKey('active_sessions'), sessionId)
    }

    // 添加到创意相关会话列表
    pipeline.sadd(this.generateKey('idea_sessions', ideaId), sessionId)

    // 设置过期时间
    pipeline.expire(this.generateKey('active_sessions'), this.TTL.SESSION)
    pipeline.expire(this.generateKey('idea_sessions', ideaId), this.TTL.SESSION * 2)

    const results = await pipeline.exec()
    return results?.every(result => result[1] === 1 || result[1] === 'OK') || false
  }

  async getActiveSessions(): Promise<string[]> {
    try {
      const sessions = await this.cache['redis'].smembers(this.generateKey('active_sessions'))
      return sessions
    } catch (error) {
      console.error('Failed to get active sessions:', error)
      return []
    }
  }

  async getIdeaSessions(ideaId: string): Promise<string[]> {
    try {
      const sessions = await this.cache['redis'].smembers(this.generateKey('idea_sessions', ideaId))
      return sessions
    } catch (error) {
      console.error('Failed to get idea sessions:', error)
      return []
    }
  }

  // ==================== 用户竞猜缓存 ====================

  async cacheUserGuess(sessionId: string, guess: CachedUserGuess): Promise<boolean> {
    return this.cache.set(
      CacheKeyType.BIDDING,
      guess,
      this.TTL.USER_GUESS,
      'guess',
      sessionId,
      guess.userId
    )
  }

  async getUserGuess(sessionId: string, userId: string): Promise<CachedUserGuess | null> {
    return this.cache.get<CachedUserGuess>(CacheKeyType.BIDDING, 'guess', sessionId, userId)
  }

  async getUserGuesses(sessionId: string): Promise<CachedUserGuess[]> {
    try {
      const pattern = this.generateKey('bidding', 'guess', sessionId, '*')
      const keys = await this.cache['redis'].keys(pattern)

      if (keys.length === 0) return []

      const pipeline = this.cache['redis'].pipeline()
      keys.forEach(key => pipeline.get(key))

      const results = await pipeline.exec()
      const guesses: CachedUserGuess[] = []

      results?.forEach(result => {
        if (result[1]) {
          try {
            const item = JSON.parse(result[1] as string)
            guesses.push(item.data)
          } catch (error) {
            console.error('Failed to parse guess data:', error)
          }
        }
      })

      return guesses
    } catch (error) {
      console.error('Failed to get user guesses:', error)
      return []
    }
  }

  // ==================== 会话统计缓存 ====================

  async cacheSessionStats(sessionId: string, stats: CachedSessionStats): Promise<boolean> {
    return this.cache.set(
      CacheKeyType.STATS,
      { ...stats, lastUpdated: Date.now() },
      this.TTL.STATS,
      'session',
      sessionId
    )
  }

  async getSessionStats(sessionId: string): Promise<CachedSessionStats | null> {
    return this.cache.get<CachedSessionStats>(CacheKeyType.STATS, 'session', sessionId)
  }

  async updateSessionStats(sessionId: string): Promise<CachedSessionStats | null> {
    const guesses = await this.getUserGuesses(sessionId)

    if (guesses.length === 0) {
      return null
    }

    const totalGuesses = guesses.length
    const averageGuess = guesses.reduce((sum, g) => sum + g.guessedPrice, 0) / totalGuesses

    // 计算价格分布
    const ranges = [
      { min: 0, max: 100, label: '0-100' },
      { min: 101, max: 200, label: '101-200' },
      { min: 201, max: 300, label: '201-300' },
      { min: 301, max: 500, label: '301-500' },
      { min: 501, max: Infinity, label: '500+' }
    ]

    const priceDistribution = ranges.map(range => ({
      range: range.label,
      count: guesses.filter(g => g.guessedPrice >= range.min && g.guessedPrice <= range.max).length
    }))

    const stats: CachedSessionStats = {
      totalGuesses,
      averageGuess: Math.round(averageGuess),
      priceDistribution,
      lastUpdated: Date.now()
    }

    await this.cacheSessionStats(sessionId, stats)
    return stats
  }

  // ==================== AI内容缓存 ====================

  async cacheAIBidContent(
    agentName: string,
    promptHash: string,
    content: {
      amount: number
      comment?: string
      reasoning?: string
      confidence?: number
    }
  ): Promise<boolean> {
    return this.cache.set(
      CacheKeyType.AI_RESPONSE,
      content,
      this.TTL.AI_CONTENT,
      'bid',
      agentName,
      promptHash
    )
  }

  async getAIBidContent(agentName: string, promptHash: string): Promise<any | null> {
    return this.cache.get(CacheKeyType.AI_RESPONSE, 'bid', agentName, promptHash)
  }

  async cacheAIInteractionContent(
    agentName: string,
    interactionType: string,
    promptHash: string,
    content: {
      text: string
      emotion: string
      animation: string
    }
  ): Promise<boolean> {
    return this.cache.set(
      CacheKeyType.AI_RESPONSE,
      content,
      this.TTL.AI_CONTENT,
      'interaction',
      agentName,
      interactionType,
      promptHash
    )
  }

  async getAIInteractionContent(
    agentName: string,
    interactionType: string,
    promptHash: string
  ): Promise<any | null> {
    return this.cache.get(CacheKeyType.AI_RESPONSE, 'interaction', agentName, interactionType, promptHash)
  }

  // ==================== 用户行为缓存 ====================

  async cacheUserBehavior(
    sessionId: string,
    userId: string,
    behavior: {
      action: string
      timestamp: number
      data?: any
    }
  ): Promise<boolean> {
    const key = this.generateKey('behavior', sessionId, userId)

    try {
      // 使用Redis的列表结构存储用户行为序列
      await this.cache['redis'].lpush(key, JSON.stringify(behavior))

      // 只保留最近50个行为
      await this.cache['redis'].ltrim(key, 0, 49)

      // 设置过期时间
      await this.cache['redis'].expire(key, this.TTL.USER_DATA)

      return true
    } catch (error) {
      console.error('Failed to cache user behavior:', error)
      return false
    }
  }

  async getUserBehaviors(sessionId: string, userId: string): Promise<any[]> {
    const key = this.generateKey('behavior', sessionId, userId)

    try {
      const behaviors = await this.cache['redis'].lrange(key, 0, -1)
      return behaviors.map(b => JSON.parse(b))
    } catch (error) {
      console.error('Failed to get user behaviors:', error)
      return []
    }
  }

  // ==================== 频率限制 ====================

  async checkBiddingRateLimit(sessionId: string, userId: string): Promise<{
    allowed: boolean
    remaining: number
    resetTime: number
  }> {
    // 每个用户每分钟最多3次操作
    return this.cache.checkRateLimit(`bidding:${sessionId}:${userId}`, 3, 60)
  }

  async checkAIGenerationRateLimit(provider: AIServiceProvider): Promise<{
    allowed: boolean
    remaining: number
    resetTime: number
  }> {
    // 每个AI服务每分钟的请求限制
    const limits = {
      [AIServiceProvider.DEEPSEEK]: 60,
      [AIServiceProvider.ZHIPU]: 30,
      [AIServiceProvider.ALI]: 40,
      [AIServiceProvider.MOONSHOT]: 20
    }

    return this.cache.checkRateLimit(`ai_gen:${provider}`, limits[provider], 60)
  }

  // ==================== 缓存预热和失效 ====================

  async preloadSessionData(sessionId: string, ideaId: string): Promise<void> {
    // 预加载相关的创意信息和历史数据
    const tasks = [
      this.cache.getIdea(ideaId),
      this.getSession(sessionId),
      this.getSessionStats(sessionId)
    ]

    await Promise.all(tasks)
  }

  async invalidateSessionCache(sessionId: string): Promise<void> {
    const tasks = [
      this.cache.del(CacheKeyType.BIDDING, 'session', sessionId),
      this.cache.del(CacheKeyType.STATS, 'session', sessionId),
      this.invalidateSessionGuesses(sessionId)
    ]

    await Promise.all(tasks)
  }

  async invalidateSessionGuesses(sessionId: string): Promise<void> {
    try {
      const pattern = this.generateKey('bidding', 'guess', sessionId, '*')
      const keys = await this.cache['redis'].keys(pattern)

      if (keys.length > 0) {
        await this.cache['redis'].del(...keys)
      }
    } catch (error) {
      console.error('Failed to invalidate session guesses:', error)
    }
  }

  // ==================== 缓存监控 ====================

  async getCacheHealth(): Promise<{
    healthy: boolean
    sessionsCount: number
    guessesCount: number
    interactionsCount: number
    memoryUsage: number
  }> {
    try {
      const [sessionStats, guessStats, interactionStats] = await Promise.all([
        this.cache.getCacheStats(CacheKeyType.BIDDING),
        this.cache.getCacheStats(CacheKeyType.BIDDING),
        this.cache.getCacheStats(CacheKeyType.AI_RESPONSE)
      ])

      const activeSessions = await this.getActiveSessions()

      return {
        healthy: true,
        sessionsCount: activeSessions.length,
        guessesCount: guessStats.totalKeys,
        interactionsCount: interactionStats.totalKeys,
        memoryUsage: sessionStats.memoryUsage + guessStats.memoryUsage + interactionStats.memoryUsage
      }
    } catch (error) {
      console.error('Failed to get cache health:', error)
      return {
        healthy: false,
        sessionsCount: 0,
        guessesCount: 0,
        interactionsCount: 0,
        memoryUsage: 0
      }
    }
  }

  // ==================== 工具方法 ====================

  private generateKey(...parts: (string | number)[]): string {
    return `ai_platform:bidding:${parts.join(':')}`
  }

  // ==================== 批量操作 ====================

  async batchCacheBids(sessionId: string, bids: CachedBid[]): Promise<boolean> {
    const items = bids.map((bid, index) => ({
      data: bid,
      ttl: this.TTL.BID,
      keyParts: ['bid', sessionId, index.toString()]
    }))

    return this.cache.mset(CacheKeyType.BIDDING, items)
  }

  async batchGetUserGuesses(sessionId: string, userIds: string[]): Promise<(CachedUserGuess | null)[]> {
    const keyParts = userIds.map(userId => ['guess', sessionId, userId])
    return this.cache.mget<CachedUserGuess>(CacheKeyType.BIDDING, keyParts)
  }
}

// 导出类型
export type {
  CachedBiddingSession,
  CachedBid,
  CachedAIInteraction,
  CachedUserGuess,
  CachedSessionStats
}