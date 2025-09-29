import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // 基础健康检查
    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      database: process.env.DATABASE_URL ? 'configured' : 'not_configured',
      services: {
        deepseek: process.env.DEEPSEEK_API_KEY ? 'configured' : 'not_configured',
        zhipu: process.env.ZHIPU_API_KEY ? 'configured' : 'not_configured',
        dashscope: process.env.DASHSCOPE_API_KEY ? 'configured' : 'not_configured',
      }
    }

    return NextResponse.json(healthData, { status: 200 })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Health check failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// 简单的健康检查端点
export async function HEAD(request: NextRequest) {
  return new NextResponse(null, { status: 200 })
}