// Redis缓存策略和集成系统
import Redis, { RedisOptions } from 'ioredis'
import { AIServiceProvider } from '../ai/ai-service-manager'

// 缓存配置
interface CacheConfig {
  defaultTTL: number
  maxRetries: number
  retryDelayMs: number
  keyPrefix: string
  compression: boolean
}

// 缓存键类型
enum CacheKeyType {
  SESSION = 'session',
  USER = 'user',
  IDEA = 'idea',
  BIDDING = 'bidding',
  AI_RESPONSE = 'ai_response',
  RATE_LIMIT = 'rate_limit',
  DISCUSSION = 'discussion',
  STATS = 'stats'
}

// 缓存项
interface CacheItem<T = any> {
  data: T
  timestamp: number
  version: string
  ttl?: number
}

// Redis管理器
export class RedisCacheManager {
  private redis: Redis
  private config: CacheConfig
  private connected = false

  constructor(options: RedisOptions = {}, config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 3600, // 1小时
      maxRetries: 3,
      retryDelayMs: 1000,
      keyPrefix: 'ai_platform:',
      compression: true,
      ...config
    }

    // Redis连接配置
    const redisConfig: RedisOptions = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: this.config.maxRetries,
      lazyConnect: true,
      keepAlive: 30000,
      family: 4,
      connectTimeout: 10000,
      commandTimeout: 5000,
      ...options
    }

    this.redis = new Redis(redisConfig)
    this.setupEventHandlers()
  }

  private setupEventHandlers() {
    this.redis.on('connect', () => {
      console.log('Redis connected')
      this.connected = true
    })

    this.redis.on('ready', () => {
      console.log('Redis ready')
    })

    this.redis.on('error', (error) => {
      console.error('Redis error:', error)
      this.connected = false
    })

    this.redis.on('close', () => {
      console.log('Redis connection closed')
      this.connected = false
    })

    this.redis.on('reconnecting', () => {
      console.log('Redis reconnecting...')
    })
  }

  // 生成缓存键
  private generateKey(type: CacheKeyType, ...parts: (string | number)[]): string {
    return `${this.config.keyPrefix}${type}:${parts.join(':')}`
  }

  // 序列化数据
  private serialize<T>(data: T): string {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      version: '1.0'
    }

    const json = JSON.stringify(item)

    if (this.config.compression && json.length > 1024) {
      // 这里可以添加压缩逻辑，如使用 lz4 或 gzip
      return json
    }

    return json
  }

  // 反序列化数据
  private deserialize<T>(serialized: string): T | null {
    try {
      const item: CacheItem<T> = JSON.parse(serialized)

      // 检查数据是否过期（额外的TTL检查）
      if (item.ttl && Date.now() - item.timestamp > item.ttl * 1000) {
        return null
      }

      return item.data
    } catch (error) {
      console.error('Failed to deserialize cache data:', error)
      return null
    }
  }

  // 基础缓存操作

  async get<T>(type: CacheKeyType, ...keyParts: (string | number)[]): Promise<T | null> {
    if (!this.connected) return null

    try {
      const key = this.generateKey(type, ...keyParts)
      const serialized = await this.redis.get(key)

      if (!serialized) return null

      return this.deserialize<T>(serialized)
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  async set<T>(
    type: CacheKeyType,
    data: T,
    ttl?: number,
    ...keyParts: (string | number)[]
  ): Promise<boolean> {
    if (!this.connected) return false

    try {
      const key = this.generateKey(type, ...keyParts)
      const serialized = this.serialize(data)
      const cacheTTL = ttl || this.config.defaultTTL

      const result = await this.redis.setex(key, cacheTTL, serialized)
      return result === 'OK'
    } catch (error) {
      console.error('Cache set error:', error)
      return false
    }
  }

  async del(type: CacheKeyType, ...keyParts: (string | number)[]): Promise<boolean> {
    if (!this.connected) return false

    try {
      const key = this.generateKey(type, ...keyParts)
      const result = await this.redis.del(key)
      return result > 0
    } catch (error) {
      console.error('Cache delete error:', error)
      return false
    }
  }

  async exists(type: CacheKeyType, ...keyParts: (string | number)[]): Promise<boolean> {
    if (!this.connected) return false

    try {
      const key = this.generateKey(type, ...keyParts)
      const result = await this.redis.exists(key)
      return result === 1
    } catch (error) {
      console.error('Cache exists error:', error)
      return false
    }
  }

  async expire(type: CacheKeyType, ttl: number, ...keyParts: (string | number)[]): Promise<boolean> {
    if (!this.connected) return false

    try {
      const key = this.generateKey(type, ...keyParts)
      const result = await this.redis.expire(key, ttl)
      return result === 1
    } catch (error) {
      console.error('Cache expire error:', error)
      return false
    }
  }

  // 高级缓存操作

  async getOrSet<T>(
    type: CacheKeyType,
    fetcher: () => Promise<T>,
    ttl?: number,
    ...keyParts: (string | number)[]
  ): Promise<T | null> {
    // 先尝试从缓存获取
    const cached = await this.get<T>(type, ...keyParts)
    if (cached !== null) {
      return cached
    }

    // 缓存未命中，执行获取函数
    try {
      const data = await fetcher()
      if (data !== null && data !== undefined) {
        await this.set(type, data, ttl, ...keyParts)
      }
      return data
    } catch (error) {
      console.error('Fetcher function error:', error)
      return null
    }
  }

  async mget<T>(type: CacheKeyType, keyParts: Array<(string | number)[]>): Promise<(T | null)[]> {
    if (!this.connected || keyParts.length === 0) return []

    try {
      const keys = keyParts.map(parts => this.generateKey(type, ...parts))
      const serializedValues = await this.redis.mget(...keys)

      return serializedValues.map(serialized =>
        serialized ? this.deserialize<T>(serialized) : null
      )
    } catch (error) {
      console.error('Cache mget error:', error)
      return new Array(keyParts.length).fill(null)
    }
  }

  async mset<T>(
    type: CacheKeyType,
    items: Array<{ data: T; ttl?: number; keyParts: (string | number)[] }>
  ): Promise<boolean> {
    if (!this.connected || items.length === 0) return false

    try {
      const pipeline = this.redis.pipeline()

      items.forEach(item => {
        const key = this.generateKey(type, ...item.keyParts)
        const serialized = this.serialize(item.data)
        const ttl = item.ttl || this.config.defaultTTL

        pipeline.setex(key, ttl, serialized)
      })

      const results = await pipeline.exec()
      return results?.every(result => result[1] === 'OK') || false
    } catch (error) {
      console.error('Cache mset error:', error)
      return false
    }
  }

  // 专用缓存方法

  // 竞价会话缓存
  async cacheSession(sessionId: string, sessionData: any, ttl: number = 1800): Promise<boolean> {
    return this.set(CacheKeyType.SESSION, sessionData, ttl, sessionId)
  }

  async getSession(sessionId: string): Promise<any | null> {
    return this.get(CacheKeyType.SESSION, sessionId)
  }

  async invalidateSession(sessionId: string): Promise<boolean> {
    return this.del(CacheKeyType.SESSION, sessionId)
  }

  // 用户信息缓存
  async cacheUser(userId: string, userData: any, ttl: number = 3600): Promise<boolean> {
    return this.set(CacheKeyType.USER, userData, ttl, userId)
  }

  async getUser(userId: string): Promise<any | null> {
    return this.get(CacheKeyType.USER, userId)
  }

  async invalidateUser(userId: string): Promise<boolean> {
    return this.del(CacheKeyType.USER, userId)
  }

  // 创意信息缓存
  async cacheIdea(ideaId: string, ideaData: any, ttl: number = 7200): Promise<boolean> {
    return this.set(CacheKeyType.IDEA, ideaData, ttl, ideaId)
  }

  async getIdea(ideaId: string): Promise<any | null> {
    return this.get(CacheKeyType.IDEA, ideaId)
  }

  // AI响应缓存
  async cacheAIResponse(
    provider: AIServiceProvider,
    promptHash: string,
    response: any,
    ttl: number = 86400
  ): Promise<boolean> {
    return this.set(CacheKeyType.AI_RESPONSE, response, ttl, provider, promptHash)
  }

  async getAIResponse(provider: AIServiceProvider, promptHash: string): Promise<any | null> {
    return this.get(CacheKeyType.AI_RESPONSE, provider, promptHash)
  }

  // 讨论缓存
  async cacheDiscussion(discussionId: string, discussionData: any, ttl: number = 3600): Promise<boolean> {
    return this.set(CacheKeyType.DISCUSSION, discussionData, ttl, discussionId)
  }

  async getDiscussion(discussionId: string): Promise<any | null> {
    return this.get(CacheKeyType.DISCUSSION, discussionId)
  }

  // 统计数据缓存
  async cacheStats(statsType: string, data: any, ttl: number = 300): Promise<boolean> {
    return this.set(CacheKeyType.STATS, data, ttl, statsType)
  }

  async getStats(statsType: string): Promise<any | null> {
    return this.get(CacheKeyType.STATS, statsType)
  }

  // 频率限制

  async checkRateLimit(
    identifier: string,
    limit: number,
    windowSeconds: number
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    if (!this.connected) {
      return { allowed: true, remaining: limit, resetTime: Date.now() + windowSeconds * 1000 }
    }

    try {
      const key = this.generateKey(CacheKeyType.RATE_LIMIT, identifier)
      const now = Date.now()
      const windowStart = now - (windowSeconds * 1000)

      // 使用Lua脚本保证原子性
      const luaScript = `
        local key = KEYS[1]
        local now = tonumber(ARGV[1])
        local window = tonumber(ARGV[2])
        local limit = tonumber(ARGV[3])

        -- 移除过期的记录
        redis.call('ZREMRANGEBYSCORE', key, '-inf', now - window * 1000)

        -- 获取当前窗口内的请求数
        local current = redis.call('ZCARD', key)

        if current < limit then
          -- 添加新的请求记录
          redis.call('ZADD', key, now, now .. ':' .. math.random())
          redis.call('EXPIRE', key, window)
          return {1, limit - current - 1, now + window * 1000}
        else
          -- 超出限制
          return {0, 0, now + window * 1000}
        end
      `

      const result = await this.redis.eval(
        luaScript,
        1,
        key,
        now.toString(),
        windowSeconds.toString(),
        limit.toString()
      ) as number[]

      return {
        allowed: result[0] === 1,
        remaining: result[1],
        resetTime: result[2]
      }
    } catch (error) {
      console.error('Rate limit check error:', error)
      return { allowed: true, remaining: limit, resetTime: Date.now() + windowSeconds * 1000 }
    }
  }

  // 分布式锁

  async acquireLock(
    lockName: string,
    ttl: number = 30,
    timeout: number = 10000
  ): Promise<string | null> {
    const lockKey = this.generateKey(CacheKeyType.SESSION, 'lock', lockName)
    const lockValue = `${Date.now()}-${Math.random()}`
    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
      try {
        const result = await this.redis.set(lockKey, lockValue, 'EX', ttl, 'NX')
        if (result === 'OK') {
          return lockValue
        }

        // 等待一小段时间再重试
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.error('Lock acquisition error:', error)
        return null
      }
    }

    return null
  }

  async releaseLock(lockName: string, lockValue: string): Promise<boolean> {
    const lockKey = this.generateKey(CacheKeyType.SESSION, 'lock', lockName)

    try {
      const luaScript = `
        if redis.call("GET", KEYS[1]) == ARGV[1] then
          return redis.call("DEL", KEYS[1])
        else
          return 0
        end
      `

      const result = await this.redis.eval(luaScript, 1, lockKey, lockValue) as number
      return result === 1
    } catch (error) {
      console.error('Lock release error:', error)
      return false
    }
  }

  // 批量操作

  async clearPattern(pattern: string): Promise<number> {
    if (!this.connected) return 0

    try {
      const keys = await this.redis.keys(pattern)
      if (keys.length === 0) return 0

      const result = await this.redis.del(...keys)
      return result
    } catch (error) {
      console.error('Clear pattern error:', error)
      return 0
    }
  }

  async clearCache(type?: CacheKeyType): Promise<number> {
    const pattern = type
      ? `${this.config.keyPrefix}${type}:*`
      : `${this.config.keyPrefix}*`

    return this.clearPattern(pattern)
  }

  // 统计和监控

  async getConnectionStats(): Promise<{
    connected: boolean
    uptime: number
    usedMemory: string
    totalConnections: string
    commandsProcessed: string
  } | null> {
    if (!this.connected) return null

    try {
      const info = await this.redis.info()
      const lines = info.split('\r\n')
      const stats: any = {}

      lines.forEach(line => {
        if (line.includes(':')) {
          const [key, value] = line.split(':')
          stats[key] = value
        }
      })

      return {
        connected: this.connected,
        uptime: parseInt(stats.uptime_in_seconds || '0'),
        usedMemory: stats.used_memory_human || '0',
        totalConnections: stats.total_connections_received || '0',
        commandsProcessed: stats.total_commands_processed || '0'
      }
    } catch (error) {
      console.error('Get connection stats error:', error)
      return null
    }
  }

  async getCacheStats(type?: CacheKeyType): Promise<{
    totalKeys: number
    memoryUsage: number
    hitRate?: number
  }> {
    const pattern = type
      ? `${this.config.keyPrefix}${type}:*`
      : `${this.config.keyPrefix}*`

    try {
      const keys = await this.redis.keys(pattern)
      let totalMemory = 0

      if (keys.length > 0) {
        const pipeline = this.redis.pipeline()
        keys.forEach(key => pipeline.memory('USAGE', key))

        const results = await pipeline.exec()
        if (results) {
          totalMemory = results.reduce((sum, result) => {
            return sum + (typeof result[1] === 'number' ? result[1] : 0)
          }, 0)
        }
      }

      return {
        totalKeys: keys.length,
        memoryUsage: totalMemory
      }
    } catch (error) {
      console.error('Get cache stats error:', error)
      return { totalKeys: 0, memoryUsage: 0 }
    }
  }

  // 健康检查

  async healthCheck(): Promise<{
    healthy: boolean
    latency?: number
    error?: string
  }> {
    const startTime = Date.now()

    try {
      await this.redis.ping()
      const latency = Date.now() - startTime

      return {
        healthy: true,
        latency
      }
    } catch (error) {
      return {
        healthy: false,
        error: (error as Error).message
      }
    }
  }

  // 优雅关闭

  async disconnect(): Promise<void> {
    try {
      await this.redis.quit()
      console.log('Redis connection closed gracefully')
    } catch (error) {
      console.error('Error closing Redis connection:', error)
      this.redis.disconnect()
    }
  }
}

// 创建全局Redis管理器实例
let redisCacheManager: RedisCacheManager | null = null

export function getCacheManager(options?: RedisOptions, config?: Partial<CacheConfig>): RedisCacheManager {
  if (!redisCacheManager) {
    redisCacheManager = new RedisCacheManager(options, config)
  }
  return redisCacheManager
}

// 缓存装饰器
export function cached(
  type: CacheKeyType,
  ttl: number = 3600,
  keyGenerator?: (...args: any[]) => (string | number)[]
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const cache = getCacheManager()
      const keyParts = keyGenerator ? keyGenerator(...args) : [propertyName, JSON.stringify(args)]

      // 尝试从缓存获取
      const cached = await cache.get(type, ...keyParts)
      if (cached !== null) {
        return cached
      }

      // 执行原方法
      const result = await method.apply(this, args)

      // 缓存结果
      if (result !== null && result !== undefined) {
        await cache.set(type, result, ttl, ...keyParts)
      }

      return result
    }

    return descriptor
  }
}

// 导出类型和枚举
export { CacheKeyType }
export type { CacheConfig, CacheItem }