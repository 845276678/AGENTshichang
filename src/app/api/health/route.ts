import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { validateAIServices } from '@/lib/validate-env'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const checks: Record<string, { status: string; message?: string; latency?: number }> = {}

  try {
    // 1. 检查数据库连接
    const dbStart = Date.now()
    try {
      await prisma.$queryRaw`SELECT 1`
      checks.database = {
        status: 'healthy',
        latency: Date.now() - dbStart
      }
    } catch (error) {
      checks.database = {
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Database connection failed'
      }
    }

    // 2. 检查AI服务配置
    const aiServices = validateAIServices()
    checks.aiServices = {
      status: aiServices.available > 0 ? 'healthy' : 'degraded',
      message: `${aiServices.available}/3 services configured (DeepSeek: ${aiServices.deepseek ? 'yes' : 'no'}, GLM: ${aiServices.zhipu ? 'yes' : 'no'}, Qwen: ${aiServices.qwen ? 'yes' : 'no'})`
    }

    // 3. 检查环境配置
    const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'NEXTAUTH_SECRET']
    const missingVars = requiredEnvVars.filter(v => !process.env[v])
    checks.environment = {
      status: missingVars.length === 0 ? 'healthy' : 'unhealthy',
      message: missingVars.length > 0 ? `Missing: ${missingVars.join(', ')}` : 'All required variables set'
    }

    // 4. 计算总体状态
    const allChecks = Object.values(checks)
    const hasUnhealthy = allChecks.some(c => c.status === 'unhealthy')
    const hasDegraded = allChecks.some(c => c.status === 'degraded')

    const overallStatus = hasUnhealthy ? 'unhealthy' : hasDegraded ? 'degraded' : 'healthy'
    const statusCode = hasUnhealthy ? 503 : 200

    return NextResponse.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: Date.now() - startTime,
      checks,
      version: process.env.NEXT_PUBLIC_APP_VERSION || process.env.npm_package_version || 'unknown',
      gitCommit: process.env.NEXT_PUBLIC_GIT_COMMIT || 'unknown',
      buildTime: process.env.NEXT_PUBLIC_BUILD_TIME || 'unknown',
      environment: process.env.NODE_ENV || 'unknown'
    }, { status: statusCode })

  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Health check failed',
      checks
    }, { status: 503 })
  }
}

// 简单的健康检查端点
export async function HEAD(request: NextRequest) {
  return new NextResponse(null, { status: 200 })
}