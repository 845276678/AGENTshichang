// AI服务成本跟踪和配额管理系统
import { PrismaClient } from '@prisma/client'
import { AIServiceProvider } from './ai-service-manager'

// 成本计算配置
interface ServicePricing {
  provider: AIServiceProvider
  model: string
  inputTokenPrice: number  // 每1k token的价格（元）
  outputTokenPrice: number // 每1k token的价格（元）
  currency: string
}

// 配额限制配置
interface QuotaLimit {
  provider: AIServiceProvider
  dailyLimit: number    // 每日最大消费（元）
  monthlyLimit: number  // 每月最大消费（元）
  requestLimit: number  // 每分钟请求限制
  enabled: boolean
}

// 使用统计
interface UsageStats {
  provider: AIServiceProvider
  date: string
  requests: number
  inputTokens: number
  outputTokens: number
  totalTokens: number
  totalCost: number
  averageResponseTime: number
  errorRate: number
}

// AI成本管理器
export class AICostManager {
  private prisma: PrismaClient
  private pricing: Map<string, ServicePricing> = new Map()
  private quotas: Map<AIServiceProvider, QuotaLimit> = new Map()
  private dailyUsage: Map<string, number> = new Map()
  private monthlyUsage: Map<string, number> = new Map()
  private requestCounts: Map<string, { count: number; resetTime: number }> = new Map()

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
    this.initializePricing()
    this.initializeQuotas()
    this.loadUsageFromCache()
  }

  private initializePricing() {
    // DeepSeek定价
    this.pricing.set('deepseek-chat', {
      provider: AIServiceProvider.DEEPSEEK,
      model: 'deepseek-chat',
      inputTokenPrice: 0.0014,   // 1.4元/M tokens
      outputTokenPrice: 0.0028,  // 2.8元/M tokens
      currency: 'CNY'
    })

    // 智谱定价
    this.pricing.set('glm-4', {
      provider: AIServiceProvider.ZHIPU,
      model: 'glm-4',
      inputTokenPrice: 0.1,      // 100元/M tokens
      outputTokenPrice: 0.1,     // 100元/M tokens
      currency: 'CNY'
    })

    // 阿里定价
    this.pricing.set('qwen-turbo', {
      provider: AIServiceProvider.ALI,
      model: 'qwen-turbo',
      inputTokenPrice: 0.003,    // 3元/M tokens
      outputTokenPrice: 0.006,   // 6元/M tokens
      currency: 'CNY'
    })

    // 月之暗面定价
    this.pricing.set('moonshot-v1-8k', {
      provider: AIServiceProvider.MOONSHOT,
      model: 'moonshot-v1-8k',
      inputTokenPrice: 0.012,    // 12元/M tokens
      outputTokenPrice: 0.012,   // 12元/M tokens
      currency: 'CNY'
    })
  }

  private initializeQuotas() {
    // 设置各服务的配额限制
    this.quotas.set(AIServiceProvider.DEEPSEEK, {
      provider: AIServiceProvider.DEEPSEEK,
      dailyLimit: 50,     // 每日50元
      monthlyLimit: 1000, // 每月1000元
      requestLimit: 60,   // 每分钟60次请求
      enabled: true
    })

    this.quotas.set(AIServiceProvider.ZHIPU, {
      provider: AIServiceProvider.ZHIPU,
      dailyLimit: 100,    // 每日100元
      monthlyLimit: 2000, // 每月2000元
      requestLimit: 30,   // 每分钟30次请求
      enabled: true
    })

    this.quotas.set(AIServiceProvider.ALI, {
      provider: AIServiceProvider.ALI,
      dailyLimit: 80,     // 每日80元
      monthlyLimit: 1500, // 每月1500元
      requestLimit: 40,   // 每分钟40次请求
      enabled: true
    })

    this.quotas.set(AIServiceProvider.MOONSHOT, {
      provider: AIServiceProvider.MOONSHOT,
      dailyLimit: 30,     // 每日30元
      monthlyLimit: 500,  // 每月500元
      requestLimit: 20,   // 每分钟20次请求
      enabled: true
    })
  }

  private async loadUsageFromCache() {
    // 从数据库加载当日和当月使用量
    const today = new Date().toISOString().split('T')[0]
    const thisMonth = today.substring(0, 7)

    try {
      // 加载日使用量
      const dailyStats = await this.prisma.aIServiceUsage.groupBy({
        by: ['serviceName'],
        where: {
          date: {
            gte: new Date(today + 'T00:00:00.000Z'),
            lt: new Date(today + 'T23:59:59.999Z')
          }
        },
        _sum: {
          totalCost: true
        }
      })

      dailyStats.forEach(stat => {
        this.dailyUsage.set(stat.serviceName, stat._sum.totalCost || 0)
      })

      // 加载月使用量
      const monthlyStats = await this.prisma.aIServiceUsage.groupBy({
        by: ['serviceName'],
        where: {
          date: {
            gte: new Date(thisMonth + '-01T00:00:00.000Z')
          }
        },
        _sum: {
          totalCost: true
        }
      })

      monthlyStats.forEach(stat => {
        this.monthlyUsage.set(stat.serviceName, stat._sum.totalCost || 0)
      })

    } catch (error) {
      console.error('Failed to load usage from database:', error)
    }
  }

  // 检查是否可以发起请求
  async canMakeRequest(provider: AIServiceProvider, estimatedCost: number = 0): Promise<{
    allowed: boolean
    reason?: string
    waitTime?: number
  }> {
    const quota = this.quotas.get(provider)
    if (!quota || !quota.enabled) {
      return { allowed: true }
    }

    // 检查请求频率限制
    const rateLimitCheck = this.checkRateLimit(provider)
    if (!rateLimitCheck.allowed) {
      return rateLimitCheck
    }

    // 检查日配额
    const dailyCost = this.dailyUsage.get(provider) || 0
    if (dailyCost + estimatedCost > quota.dailyLimit) {
      return {
        allowed: false,
        reason: `Daily quota exceeded for ${provider}. Used: ¥${dailyCost.toFixed(2)}, Limit: ¥${quota.dailyLimit}`
      }
    }

    // 检查月配额
    const monthlyCost = this.monthlyUsage.get(provider) || 0
    if (monthlyCost + estimatedCost > quota.monthlyLimit) {
      return {
        allowed: false,
        reason: `Monthly quota exceeded for ${provider}. Used: ¥${monthlyCost.toFixed(2)}, Limit: ¥${quota.monthlyLimit}`
      }
    }

    return { allowed: true }
  }

  // 检查请求频率限制
  private checkRateLimit(provider: AIServiceProvider): { allowed: boolean; reason?: string; waitTime?: number } {
    const quota = this.quotas.get(provider)
    if (!quota) return { allowed: true }

    const key = `${provider}_rate`
    const now = Date.now()
    const limit = this.requestCounts.get(key)

    if (!limit) {
      this.requestCounts.set(key, { count: 1, resetTime: now + 60000 })
      return { allowed: true }
    }

    if (now > limit.resetTime) {
      this.requestCounts.set(key, { count: 1, resetTime: now + 60000 })
      return { allowed: true }
    }

    if (limit.count >= quota.requestLimit) {
      const waitTime = limit.resetTime - now
      return {
        allowed: false,
        reason: `Rate limit exceeded for ${provider}. Limit: ${quota.requestLimit}/min`,
        waitTime
      }
    }

    limit.count++
    return { allowed: true }
  }

  // 计算请求成本
  calculateCost(
    provider: AIServiceProvider,
    model: string,
    inputTokens: number,
    outputTokens: number
  ): number {
    const pricing = this.pricing.get(model)
    if (!pricing) {
      console.warn(`No pricing found for model ${model}`)
      return 0
    }

    const inputCost = (inputTokens / 1000) * pricing.inputTokenPrice
    const outputCost = (outputTokens / 1000) * pricing.outputTokenPrice

    return inputCost + outputCost
  }

  // 记录AI服务使用
  async recordUsage(
    provider: AIServiceProvider,
    model: string,
    inputTokens: number,
    outputTokens: number,
    responseTimeMs: number,
    sessionId?: string,
    agentName?: string,
    success: boolean = true
  ) {
    const totalTokens = inputTokens + outputTokens
    const cost = this.calculateCost(provider, model, inputTokens, outputTokens)

    try {
      // 保存到数据库
      await this.prisma.aIServiceUsage.create({
        data: {
          sessionId,
          agentName,
          serviceName: provider,
          modelName: model,
          promptTokens: inputTokens,
          completionTokens: outputTokens,
          totalTokens,
          totalCost: cost,
          responseTimeMs,
          requestCount: 1,
          errorCount: success ? 0 : 1,
          date: new Date()
        }
      })

      // 更新内存缓存
      if (success) {
        const dailyKey = provider
        const monthlyKey = provider

        this.dailyUsage.set(dailyKey, (this.dailyUsage.get(dailyKey) || 0) + cost)
        this.monthlyUsage.set(monthlyKey, (this.monthlyUsage.get(monthlyKey) || 0) + cost)
      }

      console.log(`AI usage recorded: ${provider} ${model}, Cost: ¥${cost.toFixed(4)}, Tokens: ${totalTokens}`)

    } catch (error) {
      console.error('Failed to record AI usage:', error)
    }
  }

  // 获取使用统计
  async getUsageStats(
    provider?: AIServiceProvider,
    startDate?: Date,
    endDate?: Date
  ): Promise<UsageStats[]> {
    const where: any = {}

    if (provider) {
      where.serviceName = provider
    }

    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = startDate
      if (endDate) where.date.lte = endDate
    }

    try {
      const stats = await this.prisma.aIServiceUsage.groupBy({
        by: ['serviceName', 'date'],
        where,
        _sum: {
          requestCount: true,
          promptTokens: true,
          completionTokens: true,
          totalTokens: true,
          totalCost: true,
          responseTimeMs: true,
          errorCount: true
        },
        orderBy: {
          date: 'desc'
        }
      })

      return stats.map(stat => ({
        provider: stat.serviceName as AIServiceProvider,
        date: stat.date.toISOString().split('T')[0],
        requests: stat._sum.requestCount || 0,
        inputTokens: stat._sum.promptTokens || 0,
        outputTokens: stat._sum.completionTokens || 0,
        totalTokens: stat._sum.totalTokens || 0,
        totalCost: stat._sum.totalCost || 0,
        averageResponseTime: (stat._sum.responseTimeMs || 0) / (stat._sum.requestCount || 1),
        errorRate: (stat._sum.errorCount || 0) / (stat._sum.requestCount || 1)
      }))

    } catch (error) {
      console.error('Failed to get usage stats:', error)
      return []
    }
  }

  // 获取实时配额状态
  getQuotaStatus(): Record<string, {
    provider: AIServiceProvider
    dailyUsed: number
    dailyLimit: number
    dailyRemaining: number
    monthlyUsed: number
    monthlyLimit: number
    monthlyRemaining: number
    requestsThisMinute: number
    requestLimit: number
    status: 'normal' | 'warning' | 'critical'
  }> {
    const result: Record<string, any> = {}

    this.quotas.forEach((quota, provider) => {
      const dailyUsed = this.dailyUsage.get(provider) || 0
      const monthlyUsed = this.monthlyUsage.get(provider) || 0
      const requestKey = `${provider}_rate`
      const requestCount = this.requestCounts.get(requestKey)?.count || 0

      const dailyRemaining = Math.max(0, quota.dailyLimit - dailyUsed)
      const monthlyRemaining = Math.max(0, quota.monthlyLimit - monthlyUsed)

      let status: 'normal' | 'warning' | 'critical' = 'normal'
      if (dailyUsed / quota.dailyLimit > 0.9 || monthlyUsed / quota.monthlyLimit > 0.9) {
        status = 'critical'
      } else if (dailyUsed / quota.dailyLimit > 0.7 || monthlyUsed / quota.monthlyLimit > 0.7) {
        status = 'warning'
      }

      result[provider] = {
        provider,
        dailyUsed,
        dailyLimit: quota.dailyLimit,
        dailyRemaining,
        monthlyUsed,
        monthlyLimit: quota.monthlyLimit,
        monthlyRemaining,
        requestsThisMinute: requestCount,
        requestLimit: quota.requestLimit,
        status
      }
    })

    return result
  }

  // 获取成本效率分析
  async getCostEfficiencyAnalysis(days: number = 7): Promise<{
    provider: AIServiceProvider
    averageCostPerToken: number
    averageResponseTime: number
    successRate: number
    costEfficiencyScore: number // 综合评分，越低越好
  }[]> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    try {
      const stats = await this.prisma.aIServiceUsage.groupBy({
        by: ['serviceName'],
        where: {
          date: {
            gte: startDate
          }
        },
        _avg: {
          totalCost: true,
          responseTimeMs: true
        },
        _sum: {
          totalTokens: true,
          totalCost: true,
          requestCount: true,
          errorCount: true
        }
      })

      return stats.map(stat => {
        const totalRequests = stat._sum.requestCount || 1
        const totalErrors = stat._sum.errorCount || 0
        const totalTokens = stat._sum.totalTokens || 1
        const totalCost = stat._sum.totalCost || 0

        const averageCostPerToken = totalCost / totalTokens
        const averageResponseTime = stat._avg.responseTimeMs || 0
        const successRate = (totalRequests - totalErrors) / totalRequests

        // 成本效率评分：综合考虑成本、速度、成功率
        const costScore = averageCostPerToken * 1000 // 标准化到合理范围
        const speedScore = averageResponseTime / 1000 // 转换为秒
        const reliabilityScore = (1 - successRate) * 10 // 失败率越高分越高

        const costEfficiencyScore = costScore + speedScore + reliabilityScore

        return {
          provider: stat.serviceName as AIServiceProvider,
          averageCostPerToken,
          averageResponseTime,
          successRate,
          costEfficiencyScore
        }
      }).sort((a, b) => a.costEfficiencyScore - b.costEfficiencyScore)

    } catch (error) {
      console.error('Failed to get cost efficiency analysis:', error)
      return []
    }
  }

  // 设置配额限制
  setQuotaLimit(provider: AIServiceProvider, quota: Partial<QuotaLimit>) {
    const existing = this.quotas.get(provider) || {
      provider,
      dailyLimit: 100,
      monthlyLimit: 2000,
      requestLimit: 60,
      enabled: true
    }

    this.quotas.set(provider, { ...existing, ...quota })
  }

  // 获取配额限制
  getQuotaLimits(): Record<string, QuotaLimit> {
    const result: Record<string, QuotaLimit> = {}
    this.quotas.forEach((quota, provider) => {
      result[provider] = { ...quota }
    })
    return result
  }
}

// 创建全局成本管理器实例
let costManagerInstance: AICostManager | null = null

export function getCostManager(prisma: PrismaClient): AICostManager {
  if (!costManagerInstance) {
    costManagerInstance = new AICostManager(prisma)
  }
  return costManagerInstance
}

// 导出类型
export type { ServicePricing, QuotaLimit, UsageStats }