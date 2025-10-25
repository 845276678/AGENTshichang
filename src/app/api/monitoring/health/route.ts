/**
 * 系统健康检查API
 * 检查各个服务的运行状态
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const dynamic = 'force-dynamic'

// 全局Prisma实例（实际应用中应该使用连接池）
const prisma = new PrismaClient()

// 检查数据库连接
async function checkDatabase(): Promise<'online' | 'offline' | 'degraded'> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return 'online'
  } catch (error) {
    console.error('Database health check failed:', error)
    return 'offline'
  }
}

// 检查WebSocket服务
async function checkWebSocket(): Promise<'online' | 'offline' | 'degraded'> {
  try {
    // 在实际应用中，这里应该检查WebSocket服务器状态
    // 例如：连接数、活跃连接、消息队列长度等

    // 模拟健康检查
    const isHealthy = Math.random() > 0.05 // 95%健康率

    if (!isHealthy) {
      return Math.random() > 0.5 ? 'degraded' : 'offline'
    }

    return 'online'
  } catch (error) {
    console.error('WebSocket health check failed:', error)
    return 'offline'
  }
}

// 检查AI服务
async function checkAIServices(): Promise<'online' | 'offline' | 'degraded'> {
  try {
    // 检查各个AI服务提供商的健康状态
    const services = [
      { name: 'deepseek', endpoint: process.env.DEEPSEEK_API_BASE_URL },
      { name: 'dashscope', endpoint: process.env.DASHSCOPE_API_BASE_URL },
      { name: 'zhipu', endpoint: process.env.ZHIPU_API_BASE_URL }
    ]

    let onlineCount = 0
    const totalServices = services.length

    for (const service of services) {
      try {
        if (service.endpoint) {
          // 实际应用中应该发送健康检查请求
          // const response = await fetch(`${service.endpoint}/health`, { timeout: 5000 })
          // if (response.ok) onlineCount++

          // 模拟健康检查
          if (Math.random() > 0.1) onlineCount++ // 90%可用性
        }
      } catch (error) {
        console.warn(`AI service ${service.name} health check failed:`, error)
      }
    }

    if (onlineCount === totalServices) return 'online'
    if (onlineCount === 0) return 'offline'
    return 'degraded'

  } catch (error) {
    console.error('AI services health check failed:', error)
    return 'offline'
  }
}

// 检查缓存服务（Redis等）
async function checkCache(): Promise<'online' | 'offline' | 'degraded'> {
  try {
    // 在实际应用中，这里应该检查Redis或其他缓存服务
    // 例如：连接状态、内存使用、命中率等

    // 模拟健康检查
    const isHealthy = Math.random() > 0.02 // 98%健康率

    if (!isHealthy) {
      return Math.random() > 0.7 ? 'degraded' : 'offline'
    }

    return 'online'
  } catch (error) {
    console.error('Cache health check failed:', error)
    return 'offline'
  }
}

// 评估系统整体健康状态
function evaluateSystemHealth(services: Record<string, string>): 'healthy' | 'warning' | 'critical' {
  const serviceStates = Object.values(services)

  const offlineCount = serviceStates.filter(state => state === 'offline').length
  const degradedCount = serviceStates.filter(state => state === 'degraded').length

  if (offlineCount > 0) {
    return 'critical'
  }

  if (degradedCount > 1) {
    return 'warning'
  }

  if (degradedCount > 0) {
    return 'warning'
  }

  return 'healthy'
}

export async function GET(request: NextRequest) {
  try {
    // 并行检查所有服务
    const [database, websocket, aiServices, cache] = await Promise.all([
      checkDatabase(),
      checkWebSocket(),
      checkAIServices(),
      checkCache()
    ])

    const services = {
      database,
      websocket,
      ai_services: aiServices,
      cache
    }

    const overallStatus = evaluateSystemHealth(services)

    const healthData = {
      status: overallStatus,
      services,
      lastChecked: Date.now(),
      uptime: process.uptime(),
      nodeVersion: process.version,
      memoryUsage: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development'
    }

    return NextResponse.json({
      success: true,
      data: healthData,
      timestamp: Date.now()
    })

  } catch (error) {
    console.error('System health check failed:', error)

    return NextResponse.json({
      success: false,
      error: 'Health check failed',
      data: {
        status: 'critical',
        services: {
          database: 'offline',
          websocket: 'offline',
          ai_services: 'offline',
          cache: 'offline'
        },
        lastChecked: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      timestamp: Date.now()
    }, { status: 500 })
  }
}