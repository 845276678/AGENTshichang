/**
 * 系统监控指标API
 * 提供实时系统性能和健康状态数据
 */

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'


// 模拟系统指标数据（在实际生产中，这些数据来自真实的监控服务）
function generateSystemMetrics() {
  const baseTime = Date.now()

  // 模拟真实的系统负载变化
  const timeOfDay = new Date().getHours()
  const isBusinessHours = timeOfDay >= 9 && timeOfDay <= 18
  const baseConcurrency = isBusinessHours ? 50 + Math.random() * 100 : 10 + Math.random() * 30

  return {
    websocketConnections: Math.floor(baseConcurrency + (Math.sin(baseTime / 60000) * 20)),
    activeAgents: Math.floor(baseConcurrency / 10 + Math.random() * 5),
    messageLatency: Math.floor(200 + Math.random() * 300 + (isBusinessHours ? 100 : 0)),
    errorRate: Math.max(0, Math.random() * 0.02 + (Math.random() > 0.9 ? 0.05 : 0)),
    memoryUsage: Math.floor(40 + Math.random() * 30 + (isBusinessHours ? 15 : 0)),
    cpuUsage: Math.floor(20 + Math.random() * 40 + (isBusinessHours ? 20 : 0)),
    requestsPerMinute: Math.floor(baseConcurrency * 2 + Math.random() * 50),
    timestamp: baseTime
  }
}

export async function GET(request: NextRequest) {
  try {
    // 在实际应用中，这里应该从监控系统（如Prometheus、Grafana等）获取真实数据
    const metrics = generateSystemMetrics()

    return NextResponse.json({
      success: true,
      data: metrics,
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('Error fetching system metrics:', error)

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch system metrics',
      timestamp: Date.now()
    }, { status: 500 })
  }
}