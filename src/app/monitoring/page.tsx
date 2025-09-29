/**
 * 监控页面
 * 提供生产环境系统监控界面
 */

'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'

// 动态导入监控组件以避免SSR问题
const ProductionMonitoringDashboard = dynamic(
  () => import('@/components/monitoring/ProductionMonitoringDashboard'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-gray-600">正在加载监控面板...</div>
        </div>
      </div>
    )
  }
)

export default function MonitoringPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-gray-600">正在初始化监控系统...</div>
        </div>
      </div>
    }>
      <ProductionMonitoringDashboard />
    </Suspense>
  )
}