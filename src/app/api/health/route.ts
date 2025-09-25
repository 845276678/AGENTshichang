// 系统健康检查和监控服务
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import AIServiceFactory from '@/lib/ai-services'
// import PaymentManager from '@/lib/payment' // 已移除支付服务
import FileStorageManager from '@/lib/storage'

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  uptime: number
  services: {
    database: ServiceHealth
    ai: ServiceHealth
    storage: ServiceHealth
  }
  metrics: {
    memory: MemoryMetrics
    process: ProcessMetrics
  }
}

interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'unhealthy'
  responseTime?: number
  error?: string
  details?: any
}

interface MemoryMetrics {
  used: number
  total: number
  percentage: number
  heap: {
    used: number
    total: number
  }
}

interface ProcessMetrics {
  pid: number
  uptime: number
  cpuUsage: {
    user: number
    system: number
  }
}

// 健康检查API
export async function GET(_request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now()
  const health: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    services: {
      database: await checkDatabaseHealth(),
      ai: await checkAIServicesHealth(),
      storage: await checkStorageHealth()
    },
    metrics: {
      memory: getMemoryMetrics(),
      process: getProcessMetrics()
    }
  }

  // 评估整体健康状态
  const serviceStatuses = Object.values(health.services).map(service => service.status)
  const unhealthyCount = serviceStatuses.filter(status => status === 'unhealthy').length
  const degradedCount = serviceStatuses.filter(status => status === 'degraded').length

  if (unhealthyCount > 0) {
    health.status = 'unhealthy'
  } else if (degradedCount > 0) {
    health.status = 'degraded'
  }

  const responseTime = Date.now() - startTime

  // 根据健康状态返回相应的HTTP状态码
  const httpStatus = health.status === 'healthy' ? 200 :
                     health.status === 'degraded' ? 206 : 503

  return NextResponse.json({
    ...health,
    responseTime
  }, {
    status: httpStatus,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  })
}

// 检查数据库健康状态
async function checkDatabaseHealth(): Promise<ServiceHealth> {
  const startTime = Date.now()
  try {
    // 执行简单查询测试连接
    await prisma.$queryRaw`SELECT 1`

    // 检查数据库响应时间
    const responseTime = Date.now() - startTime

    // 获取数据库统计信息
    const [userCount, ideaCount, reportCount] = await Promise.all([
      prisma.user.count(),
      prisma.idea.count(),
      prisma.researchReport.count()
    ])

    return {
      status: responseTime < 1000 ? 'healthy' : 'degraded',
      responseTime,
      details: {
        userCount,
        ideaCount,
        reportCount,
        connectionPool: {
          status: 'active'
        }
      }
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : '数据库连接失败',
      responseTime: Date.now() - startTime
    }
  }
}

// 检查AI服务健康状态
async function checkAIServicesHealth(): Promise<ServiceHealth> {
  const startTime = Date.now()
  try {
    const availableServices = await AIServiceFactory.getAvailableServices()
    const healthyServices = availableServices.filter(service => service.isHealthy)

    const healthyPercentage = availableServices.length > 0
      ? (healthyServices.length / availableServices.length) * 100
      : 0

    const status = healthyPercentage >= 80 ? 'healthy' :
                   healthyPercentage >= 50 ? 'degraded' : 'unhealthy'

    return {
      status,
      responseTime: Date.now() - startTime,
      details: {
        totalServices: availableServices.length,
        healthyServices: healthyServices.length,
        healthyPercentage: Math.round(healthyPercentage),
        services: availableServices.map(service => ({
          provider: service.provider,
          healthy: service.isHealthy,
          model: service.modelInfo?.model
        }))
      }
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'AI服务检查失败',
      responseTime: Date.now() - startTime
    }
  }
}

// 检查支付服务健康状态 - 已移除支付服务
// async function checkPaymentHealth(): Promise<ServiceHealth> { ... }

// 检查存储服务健康状态
async function checkStorageHealth(): Promise<ServiceHealth> {
  const startTime = Date.now()
  try {
    const storageManager = new FileStorageManager()
    const isHealthy = await storageManager.healthCheck()
    const config = storageManager.getConfig()

    // 获取存储统计
    const stats = await storageManager.getStorageStats()

    return {
      status: isHealthy ? 'healthy' : 'degraded',
      responseTime: Date.now() - startTime,
      details: {
        ...config,
        statistics: {
          totalFiles: stats.totalFiles,
          totalSize: stats.totalSize,
          quotaUsed: stats.quotaUsed,
          quotaLimit: stats.quotaLimit,
          usagePercentage: (stats.quotaUsed / stats.quotaLimit) * 100
        }
      }
    }
  } catch (error) {
    return {
      status: 'degraded',
      error: error instanceof Error ? error.message : '存储服务检查失败',
      responseTime: Date.now() - startTime
    }
  }
}

// 获取内存指标
function getMemoryMetrics(): MemoryMetrics {
  const memUsage = process.memoryUsage()
  const totalMemory = require('os').totalmem()

  return {
    used: memUsage.rss,
    total: totalMemory,
    percentage: (memUsage.rss / totalMemory) * 100,
    heap: {
      used: memUsage.heapUsed,
      total: memUsage.heapTotal
    }
  }
}

// 获取进程指标
function getProcessMetrics(): ProcessMetrics {
  const cpuUsage = process.cpuUsage()

  return {
    pid: process.pid,
    uptime: process.uptime(),
    cpuUsage: {
      user: cpuUsage.user / 1000000, // 转换为秒
      system: cpuUsage.system / 1000000
    }
  }
}

// 简化的健康检查（用于负载均衡器）
export async function HEAD(): Promise<NextResponse> {
  try {
    // 快速检查关键服务
    await prisma.$queryRaw`SELECT 1`
    return new NextResponse(null, { status: 200 })
  } catch (error) {
    return new NextResponse(null, { status: 503 })
  }
}