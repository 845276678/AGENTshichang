/**
 * Redis 客户端实例
 * 用于缓存和会话管理
 */

// 条件导入 Redis，如果包不存在则使用 Mock
let Redis: any
let redis: any

try {
  Redis = require('ioredis')

  // Redis 连接配置
  redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    // 连接池配置
    family: 4,
    keepAlive: 30000,
    // 错误处理
    retryDelayOnClusterDown: 300,
    enableOfflineQueue: false,
  })

  // 错误处理
  redis.on('error', (error: any) => {
    console.error('Redis 连接错误:', error)
  })

  redis.on('connect', () => {
    console.log('Redis 连接成功')
  })

  redis.on('ready', () => {
    console.log('Redis 准备就绪')
  })

  // 优雅关闭处理
  process.on('SIGINT', async () => {
    console.log('正在关闭 Redis 连接...')
    await redis.quit()
    process.exit(0)
  })

  process.on('SIGTERM', async () => {
    console.log('正在关闭 Redis 连接...')
    await redis.quit()
    process.exit(0)
  })
} catch (error) {
  console.warn('Redis 包未找到，使用内存缓存作为 fallback')

  // Mock Redis 实现
  const memoryCache = new Map<string, { value: any; expiry?: number }>()

  redis = {
    async set(key: string, value: string): Promise<void> {
      memoryCache.set(key, { value })
    },

    async setex(key: string, ttl: number, value: string): Promise<void> {
      const expiry = Date.now() + ttl * 1000
      memoryCache.set(key, { value, expiry })
    },

    async get(key: string): Promise<string | null> {
      const item = memoryCache.get(key)
      if (!item) return null

      if (item.expiry && Date.now() > item.expiry) {
        memoryCache.delete(key)
        return null
      }

      return item.value
    },

    async del(key: string): Promise<void> {
      memoryCache.delete(key)
    },

    async exists(key: string): Promise<number> {
      const item = memoryCache.get(key)
      if (!item) return 0

      if (item.expiry && Date.now() > item.expiry) {
        memoryCache.delete(key)
        return 0
      }

      return 1
    },

    async expire(key: string, ttl: number): Promise<void> {
      const item = memoryCache.get(key)
      if (item) {
        item.expiry = Date.now() + ttl * 1000
      }
    },

    async quit(): Promise<void> {
      memoryCache.clear()
    }
  }
}

export { redis }
export default redis

/**
 * Redis 工具函数
 */
export const redisUtils = {
  /**
   * 设置缓存
   * @param key 键
   * @param value 值
   * @param ttl 过期时间(秒)
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value)
    if (ttl) {
      await redis.setex(key, ttl, serialized)
    } else {
      await redis.set(key, serialized)
    }
  },

  /**
   * 获取缓存
   * @param key 键
   * @returns 解析后的值
   */
  async get<T = any>(key: string): Promise<T | null> {
    const value = await redis.get(key)
    if (!value) return null
    try {
      return JSON.parse(value)
    } catch {
      return value as unknown as T
    }
  },

  /**
   * 删除缓存
   * @param key 键
   */
  async del(key: string): Promise<void> {
    await redis.del(key)
  },

  /**
   * 检查键是否存在
   * @param key 键
   */
  async exists(key: string): Promise<boolean> {
    return (await redis.exists(key)) === 1
  },

  /**
   * 设置过期时间
   * @param key 键
   * @param ttl 过期时间(秒)
   */
  async expire(key: string, ttl: number): Promise<void> {
    await redis.expire(key, ttl)
  }
}