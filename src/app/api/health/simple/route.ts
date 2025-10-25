// 简化的本地开发健康检查
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export const dynamic = 'force-dynamic'


export async function GET(_request: NextRequest) {
  const startTime = Date.now()

  try {
    // 基本数据库连接测试
    await prisma.$queryRaw`SELECT 1`

    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      environment: process.env.NODE_ENV || 'development',
      responseTime: Date.now() - startTime
    }

    return NextResponse.json(health)
  } catch (error) {
    const health = {
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : '数据库连接失败',
      responseTime: Date.now() - startTime
    }

    return NextResponse.json(health, { status: 503 })
  }
}

// HEAD请求用于快速检查
export async function HEAD() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return new NextResponse(null, { status: 200 })
  } catch (error) {
    return new NextResponse(null, { status: 503 })
  }
}