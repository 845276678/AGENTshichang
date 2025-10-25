/**
 * 性能监控指标API
 * 提供组件渲染性能和用户体验相关数据
 */

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// 模拟性能指标数据
function generatePerformanceMetrics() {
  // 模拟不同时间段的性能表现
  const timeOfDay = new Date().getHours()
  const isBusinessHours = timeOfDay >= 9 && timeOfDay <= 18
  const performanceDegradation = isBusinessHours ? 1.5 : 1.0

  return {
    averageRenderTime: Math.max(5, Math.random() * 12 * performanceDegradation),
    minRenderTime: Math.max(2, Math.random() * 8),
    maxRenderTime: Math.max(15, Math.random() * 25 * performanceDegradation),
    p95RenderTime: Math.max(18, Math.random() * 35 * performanceDegradation),
    p99RenderTime: Math.max(25, Math.random() * 50 * performanceDegradation),
    componentRenderCount: Math.floor(1000 + Math.random() * 2000),
    stateUpdateCount: Math.floor(500 + Math.random() * 1000),
    memoryLeaks: Math.floor(Math.random() * 3),
    bundleSize: Math.floor(800 + Math.random() * 200), // KB
    firstContentfulPaint: Math.max(500, Math.random() * 1000),
    largestContentfulPaint: Math.max(1000, Math.random() * 2000),
    cumulativeLayoutShift: Math.max(0, Math.random() * 0.1),
    firstInputDelay: Math.max(50, Math.random() * 200),
    userInteractionLatency: Math.max(100, Math.random() * 300 * performanceDegradation),
    jsHeapSize: Math.floor(50 + Math.random() * 100), // MB
    domNodes: Math.floor(500 + Math.random() * 1500),
    timestamp: Date.now()
  }
}

export async function GET(request: NextRequest) {
  try {
    // 在实际应用中，这些数据应该来自：
    // 1. Chrome DevTools Performance API
    // 2. Web Vitals measurements
    // 3. React DevTools Profiler
    // 4. 自定义性能监控埋点
    const metrics = generatePerformanceMetrics()

    return NextResponse.json({
      success: true,
      data: metrics,
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('Error fetching performance metrics:', error)

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch performance metrics',
      timestamp: Date.now()
    }, { status: 500 })
  }
}