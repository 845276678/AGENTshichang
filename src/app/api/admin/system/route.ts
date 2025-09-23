import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/database'
import AIServiceFactory from '@/lib/ai-services'
import PaymentManager from '@/lib/payment'
import FileStorageManager from '@/lib/storage'

// 系统监控和状态检查API
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 并行检查各个系统组件
    const [
      databaseStatus,
      aiServicesStatus,
      paymentStatus,
      storageStatus,
      systemMetrics
    ] = await Promise.all([
      checkDatabaseStatus(),
      checkAIServicesStatus(),
      checkPaymentStatus(),
      checkStorageStatus(),
      getSystemMetrics()
    ])

    const overallStatus = determineOverallStatus([
      databaseStatus,
      aiServicesStatus,
      paymentStatus,
      storageStatus
    ])

    return NextResponse.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      components: {
        database: databaseStatus,
        aiServices: aiServicesStatus,
        payment: paymentStatus,
        storage: storageStatus
      },
      metrics: systemMetrics
    })

  } catch (error) {
    console.error('System status error:', error)
    return NextResponse.json(
      {
        status: 'error',
        error: 'Failed to check system status',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// 检查数据库状态
async function checkDatabaseStatus() {
  const startTime = Date.now()
  try {
    // 测试数据库连接
    await prisma.$queryRaw`SELECT 1`

    // 获取基本统计
    const [userCount, ideaCount, paymentCount] = await Promise.all([
      prisma.user.count(),
      prisma.idea.count(),
      prisma.payment.count()
    ])

    const responseTime = Date.now() - startTime

    return {
      status: responseTime < 1000 ? 'healthy' : 'degraded',
      responseTime,
      details: {
        userCount,
        ideaCount,
        paymentCount,
        connectionActive: true
      }
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Database connection failed'
    }
  }
}

// 检查AI服务状态
async function checkAIServicesStatus() {
  const startTime = Date.now()
  try {
    const availableServices = await AIServiceFactory.getAvailableServices()
    const healthyServices = availableServices.filter(service => service.isHealthy)

    const healthPercentage = availableServices.length > 0
      ? (healthyServices.length / availableServices.length) * 100
      : 0

    const status = healthPercentage >= 80 ? 'healthy' :
                   healthPercentage >= 50 ? 'degraded' : 'unhealthy'

    return {
      status,
      responseTime: Date.now() - startTime,
      details: {
        totalServices: availableServices.length,
        healthyServices: healthyServices.length,
        healthPercentage: Math.round(healthPercentage),
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
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'AI services check failed'
    }
  }
}

// 检查支付服务状态
async function checkPaymentStatus() {
  const startTime = Date.now()
  try {
    const paymentManager = new PaymentManager()

    // 获取最近24小时的支付统计
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const stats = await paymentManager.getPaymentStats(yesterday)

    return {
      status: 'healthy',
      responseTime: Date.now() - startTime,
      details: {
        last24Hours: {
          totalOrders: stats.totalOrders,
          successOrders: stats.successOrders,
          successRate: stats.successRate
        }
      }
    }
  } catch (error) {
    return {
      status: 'degraded',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Payment service check failed'
    }
  }
}

// 检查存储服务状态
async function checkStorageStatus() {
  const startTime = Date.now()
  try {
    const storageManager = new FileStorageManager()
    const isHealthy = await storageManager.healthCheck()
    const stats = await storageManager.getStorageStats()

    return {
      status: isHealthy ? 'healthy' : 'degraded',
      responseTime: Date.now() - startTime,
      details: {
        healthy: isHealthy,
        totalFiles: stats.totalFiles,
        totalSize: stats.totalSize,
        quotaUsed: stats.quotaUsed,
        quotaLimit: stats.quotaLimit,
        usagePercentage: (stats.quotaUsed / stats.quotaLimit) * 100
      }
    }
  } catch (error) {
    return {
      status: 'degraded',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Storage service check failed'
    }
  }
}

// 获取系统指标
async function getSystemMetrics() {
  try {
    const memUsage = process.memoryUsage()
    const uptime = process.uptime()
    const cpuUsage = process.cpuUsage()

    return {
      memory: {
        used: memUsage.rss,
        heap: {
          used: memUsage.heapUsed,
          total: memUsage.heapTotal
        },
        external: memUsage.external
      },
      process: {
        pid: process.pid,
        uptime: uptime,
        cpuUsage: {
          user: cpuUsage.user / 1000000, // 转换为秒
          system: cpuUsage.system / 1000000
        }
      },
      node: {
        version: process.version,
        platform: process.platform,
        arch: process.arch
      }
    }
  } catch (error) {
    return {
      error: 'Failed to get system metrics'
    }
  }
}

// 确定整体状态
function determineOverallStatus(componentStatuses: Array<{ status: string }>) {
  const unhealthyCount = componentStatuses.filter(c => c.status === 'unhealthy').length
  const degradedCount = componentStatuses.filter(c => c.status === 'degraded').length

  if (unhealthyCount > 0) {return 'unhealthy'}
  if (degradedCount > 0) {return 'degraded'}
  return 'healthy'
}