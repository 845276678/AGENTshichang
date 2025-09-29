/**
 * 生产环境监控仪表板
 * 实时监控AI Agent对话框系统性能和健康状态
 */

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

// 监控数据类型定义
interface SystemMetrics {
  timestamp: number
  websocketConnections: number
  activeAgents: number
  messageLatency: number
  errorRate: number
  memoryUsage: number
  cpuUsage: number
  requestsPerMinute: number
}

interface PerformanceMetrics {
  averageRenderTime: number
  p95RenderTime: number
  componentRenderCount: number
  stateUpdateCount: number
  memoryLeaks: number
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical'
  services: {
    database: 'online' | 'offline' | 'degraded'
    websocket: 'online' | 'offline' | 'degraded'
    ai_services: 'online' | 'offline' | 'degraded'
    cache: 'online' | 'offline' | 'degraded'
  }
  lastChecked: number
}

interface AlertData {
  id: string
  type: 'error' | 'warning' | 'info'
  message: string
  timestamp: number
  component?: string
  resolved: boolean
}

export const ProductionMonitoringDashboard: React.FC = () => {
  // 状态管理
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics[]>([])
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null)
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [alerts, setAlerts] = useState<AlertData[]>([])
  const [isMonitoring, setIsMonitoring] = useState(false)

  // 获取系统指标
  const fetchSystemMetrics = useCallback(async () => {
    try {
      const response = await fetch('/api/monitoring/system-metrics')
      if (response.ok) {
        const data = await response.json()
        setSystemMetrics(prev => [...prev.slice(-19), {
          ...data,
          timestamp: Date.now()
        }])
      }
    } catch (error) {
      console.error('Failed to fetch system metrics:', error)
      addAlert({
        type: 'error',
        message: '系统指标获取失败',
        component: 'SystemMetrics'
      })
    }
  }, [])

  // 获取性能指标
  const fetchPerformanceMetrics = useCallback(async () => {
    try {
      const response = await fetch('/api/monitoring/performance-metrics')
      if (response.ok) {
        const data = await response.json()
        setPerformanceMetrics(data)
      }
    } catch (error) {
      console.error('Failed to fetch performance metrics:', error)
      addAlert({
        type: 'error',
        message: '性能指标获取失败',
        component: 'PerformanceMetrics'
      })
    }
  }, [])

  // 获取系统健康状态
  const fetchSystemHealth = useCallback(async () => {
    try {
      const response = await fetch('/api/monitoring/health')
      if (response.ok) {
        const data = await response.json()
        setSystemHealth(data)
      }
    } catch (error) {
      console.error('Failed to fetch system health:', error)
      addAlert({
        type: 'error',
        message: '系统健康检查失败',
        component: 'SystemHealth'
      })
    }
  }, [])

  // 添加警报
  const addAlert = (alert: Omit<AlertData, 'id' | 'timestamp' | 'resolved'>) => {
    const newAlert: AlertData = {
      id: `alert-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      resolved: false,
      ...alert
    }
    setAlerts(prev => [newAlert, ...prev.slice(0, 49)]) // 保持最多50个警报
  }

  // 解决警报
  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ))
  }

  // 清除所有警报
  const clearAllAlerts = () => {
    setAlerts([])
  }

  // 开始监控
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true)

    // 立即获取一次数据
    Promise.all([
      fetchSystemMetrics(),
      fetchPerformanceMetrics(),
      fetchSystemHealth()
    ])

    // 设置定时器
    const metricsInterval = setInterval(fetchSystemMetrics, 5000) // 每5秒
    const performanceInterval = setInterval(fetchPerformanceMetrics, 30000) // 每30秒
    const healthInterval = setInterval(fetchSystemHealth, 10000) // 每10秒

    return () => {
      clearInterval(metricsInterval)
      clearInterval(performanceInterval)
      clearInterval(healthInterval)
    }
  }, [fetchSystemMetrics, fetchPerformanceMetrics, fetchSystemHealth])

  // 停止监控
  const stopMonitoring = () => {
    setIsMonitoring(false)
  }

  // 组件挂载时开始监控
  useEffect(() => {
    const cleanup = startMonitoring()
    return cleanup
  }, [startMonitoring])

  // 监控警报条件
  useEffect(() => {
    if (!systemMetrics.length || !performanceMetrics) return

    const latest = systemMetrics[systemMetrics.length - 1]

    // 检查各种警报条件
    if (latest.errorRate > 0.05) {
      addAlert({
        type: 'error',
        message: `错误率过高: ${(latest.errorRate * 100).toFixed(2)}%`,
        component: 'ErrorRate'
      })
    }

    if (latest.messageLatency > 1000) {
      addAlert({
        type: 'warning',
        message: `消息延迟过高: ${latest.messageLatency}ms`,
        component: 'MessageLatency'
      })
    }

    if (performanceMetrics.averageRenderTime > 16) {
      addAlert({
        type: 'warning',
        message: `渲染性能降低: ${performanceMetrics.averageRenderTime.toFixed(2)}ms`,
        component: 'RenderPerformance'
      })
    }

    if (latest.memoryUsage > 80) {
      addAlert({
        type: 'error',
        message: `内存使用率过高: ${latest.memoryUsage}%`,
        component: 'MemoryUsage'
      })
    }
  }, [systemMetrics, performanceMetrics])

  // 获取系统状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return 'text-green-600'
      case 'warning':
      case 'degraded':
        return 'text-yellow-600'
      case 'critical':
      case 'offline':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  // 获取状态徽章变体
  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' => {
    switch (status) {
      case 'healthy':
      case 'online':
        return 'default'
      case 'warning':
      case 'degraded':
        return 'secondary'
      case 'critical':
      case 'offline':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const latestMetrics = systemMetrics[systemMetrics.length - 1]
  const unresolvedAlerts = alerts.filter(alert => !alert.resolved)

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* 标题和控制 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Agent系统监控</h1>
          <p className="text-gray-600 mt-1">实时监控系统性能和健康状态</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 ${isMonitoring ? 'text-green-600' : 'text-gray-500'}`}>
            <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-sm font-medium">
              {isMonitoring ? '监控中' : '已停止'}
            </span>
          </div>
          <Button
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
            variant={isMonitoring ? "destructive" : "default"}
          >
            {isMonitoring ? '停止监控' : '开始监控'}
          </Button>
        </div>
      </div>

      {/* 系统健康状态概览 */}
      {systemHealth && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              系统健康状态
              <Badge variant={getStatusVariant(systemHealth.status)}>
                {systemHealth.status === 'healthy' ? '健康' :
                 systemHealth.status === 'warning' ? '警告' : '严重'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(systemHealth.services).map(([service, status]) => (
                <div key={service} className="text-center">
                  <div className="text-sm text-gray-600 mb-1">
                    {service === 'database' ? '数据库' :
                     service === 'websocket' ? 'WebSocket' :
                     service === 'ai_services' ? 'AI服务' : '缓存'}
                  </div>
                  <div className={`font-medium ${getStatusColor(status)}`}>
                    {status === 'online' ? '在线' :
                     status === 'offline' ? '离线' : '降级'}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-xs text-gray-500 mt-4">
              最后检查: {new Date(systemHealth.lastChecked).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 核心指标 */}
      {latestMetrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">WebSocket连接</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {latestMetrics.websocketConnections}
              </div>
              <div className="text-xs text-gray-500">活跃连接数</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">活跃Agent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {latestMetrics.activeAgents}
              </div>
              <div className="text-xs text-gray-500">正在工作的Agent</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">消息延迟</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${latestMetrics.messageLatency > 500 ? 'text-red-600' : 'text-green-600'}`}>
                {latestMetrics.messageLatency}ms
              </div>
              <div className="text-xs text-gray-500">平均响应时间</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">错误率</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${latestMetrics.errorRate > 0.01 ? 'text-red-600' : 'text-green-600'}`}>
                {(latestMetrics.errorRate * 100).toFixed(2)}%
              </div>
              <div className="text-xs text-gray-500">系统错误率</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 性能指标 */}
      {performanceMetrics && (
        <Card>
          <CardHeader>
            <CardTitle>性能指标</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-sm text-gray-600 mb-1">平均渲染时间</div>
                <div className={`text-xl font-bold ${performanceMetrics.averageRenderTime > 16 ? 'text-red-600' : 'text-green-600'}`}>
                  {performanceMetrics.averageRenderTime.toFixed(2)}ms
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">P95渲染时间</div>
                <div className={`text-xl font-bold ${performanceMetrics.p95RenderTime > 50 ? 'text-red-600' : 'text-green-600'}`}>
                  {performanceMetrics.p95RenderTime.toFixed(2)}ms
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">组件渲染次数</div>
                <div className="text-xl font-bold text-blue-600">
                  {performanceMetrics.componentRenderCount}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">状态更新次数</div>
                <div className="text-xl font-bold text-purple-600">
                  {performanceMetrics.stateUpdateCount}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 实时警报 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              系统警报
              {unresolvedAlerts.length > 0 && (
                <Badge variant="destructive">{unresolvedAlerts.length}</Badge>
              )}
            </CardTitle>
            {alerts.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllAlerts}
              >
                清除所有
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <div className="text-green-600 text-lg mb-2">✓</div>
              <div>系统运行正常，暂无警报</div>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    alert.resolved
                      ? 'bg-gray-50 border-gray-200 opacity-60'
                      : alert.type === 'error'
                        ? 'bg-red-50 border-red-200'
                        : alert.type === 'warning'
                          ? 'bg-yellow-50 border-yellow-200'
                          : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      alert.resolved
                        ? 'bg-gray-400'
                        : alert.type === 'error'
                          ? 'bg-red-500'
                          : alert.type === 'warning'
                            ? 'bg-yellow-500'
                            : 'bg-blue-500'
                    }`} />
                    <div>
                      <div className={`font-medium ${alert.resolved ? 'text-gray-600' : 'text-gray-900'}`}>
                        {alert.message}
                      </div>
                      <div className="text-xs text-gray-500">
                        {alert.component && `组件: ${alert.component} • `}
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  {!alert.resolved && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => resolveAlert(alert.id)}
                    >
                      解决
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 系统资源使用情况 */}
      {latestMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>内存使用率</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${
                        latestMetrics.memoryUsage > 80 ? 'bg-red-500' :
                        latestMetrics.memoryUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(latestMetrics.memoryUsage, 100)}%` }}
                    />
                  </div>
                </div>
                <div className={`text-lg font-bold ${
                  latestMetrics.memoryUsage > 80 ? 'text-red-600' :
                  latestMetrics.memoryUsage > 60 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {latestMetrics.memoryUsage}%
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>请求频率</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {latestMetrics.requestsPerMinute}
                </div>
                <div className="text-sm text-gray-600">请求/分钟</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default ProductionMonitoringDashboard