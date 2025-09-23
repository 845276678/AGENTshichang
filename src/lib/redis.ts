/**
 * Redis 客户端实例
 * 用于缓存和会话管理
 * 使用内存缓存替代Redis以避免依赖问题
 */

console.warn('使用内存缓存替代Redis')

// Mock Redis 实现
const memoryCache = new Map<string, { value: any; expiry?: number }>()

const redis = {
  async set(key: string, value: string): Promise<string> {
    memoryCache.set(key, { value })
    return 'OK'
  },

  async setex(key: string, ttl: number, value: string): Promise<string> {
    const expiry = Date.now() + ttl * 1000
    memoryCache.set(key, { value, expiry })
    return 'OK'
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

  async del(key: string): Promise<number> {
    const existed = memoryCache.has(key)
    memoryCache.delete(key)
    return existed ? 1 : 0
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

  async expire(key: string, ttl: number): Promise<number> {
    const item = memoryCache.get(key)
    if (item) {
      item.expiry = Date.now() + ttl * 1000
      return 1
    }
    return 0
  },

  async quit(): Promise<string> {
    memoryCache.clear()
    return 'OK'
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