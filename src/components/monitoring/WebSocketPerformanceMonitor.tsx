'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Activity,
  Wifi,
  WifiOff,
  Zap,
  Clock,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Monitor,
  Server,
  Network,
  Eye,
  EyeOff
} from 'lucide-react'

import type { WSPerformanceMetrics } from '@/hooks/useEnhancedBiddingWebSocket'

interface WebSocketPerformanceMonitorProps {
  metrics: WSPerformanceMetrics
  connectionStatus: string
  isConnected: boolean
  className?: string
  compact?: boolean
}

// 性能等级定义
const PERFORMANCE_THRESHOLDS = {
  latency: { good: 100, warning: 300, critical: 1000 },
  messageRate: { good: 10, warning: 50, critical: 100 },
  uptime: { good: 300000, warning: 60000, critical: 10000 } // 毫秒
}

// 格式化工具函数
const formatUptime = (ms: number): string => {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) return `${hours}h ${minutes % 60}m`
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
}

const formatLatency = (ms: number): string => {
  if (ms < 1000) return `${Math.round(ms)}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

const formatMessageRate = (rate: number): string => {
  if (rate < 1) return `${(rate * 60).toFixed(1)}/min`
  return `${rate.toFixed(1)}/s`
}

// 获取性能等级
const getPerformanceLevel = (value: number, thresholds: {good: number, warning: number, critical: number}): 'good' | 'warning' | 'critical' => {
  if (value <= thresholds.good) return 'good'
  if (value <= thresholds.warning) return 'warning'
  return 'critical'
}

// 性能指标卡片组件
const MetricCard: React.FC<{
  title: string
  value: string
  level: 'good' | 'warning' | 'critical'
  icon: React.ReactNode
  trend?: 'up' | 'down' | 'stable'
  compact?: boolean
}> = ({ title, value, level, icon, trend, compact = false }) => {
  const levelColors = {
    good: 'text-green-600 bg-green-50 border-green-200',
    warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    critical: 'text-red-600 bg-red-50 border-red-200'
  }

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null

  return (
    <motion.div
      className={`metric-card p-3 rounded-lg border ${levelColors[level]} ${compact ? 'p-2' : 'p-3'}`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <p className={`font-medium ${compact ? 'text-xs' : 'text-sm'}`}>{title}</p>
            <p className={`font-bold ${compact ? 'text-sm' : 'text-lg'}`}>{value}</p>
          </div>
        </div>
        {TrendIcon && (
          <TrendIcon className={`w-4 h-4 ${level === 'good' ? 'text-green-500' : level === 'warning' ? 'text-yellow-500' : 'text-red-500'}`} />
        )}
      </div>
    </motion.div>
  )
}

// 连接状态指示器
const ConnectionStatusIndicator: React.FC<{
  status: string
  isConnected: boolean
}> = ({ status, isConnected }) => {
  const getStatusConfig = () => {
    if (isConnected) {
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: <CheckCircle className="w-4 h-4" />,
        text: '已连接'
      }
    }

    switch (status) {
      case 'connecting':
        return {
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          icon: <Activity className="w-4 h-4 animate-pulse" />,
          text: '连接中...'
        }
      case 'error':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: <AlertCircle className="w-4 h-4" />,
          text: '连接错误'
        }
      default:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          icon: <WifiOff className="w-4 h-4" />,
          text: '已断开'
        }
    }
  }

  const config = getStatusConfig()

  return (
    <motion.div
      className={`flex items-center gap-2 px-3 py-2 rounded-full ${config.bgColor} ${config.borderColor} border`}
      animate={{
        scale: isConnected ? [1, 1.05, 1] : 1
      }}
      transition={{
        duration: 2,
        repeat: isConnected ? Infinity : 0
      }}
    >
      <div className={config.color}>
        {config.icon}
      </div>
      <span className={`text-sm font-medium ${config.color}`}>
        {config.text}
      </span>
    </motion.div>
  )
}

export const WebSocketPerformanceMonitor: React.FC<WebSocketPerformanceMonitorProps> = ({
  metrics,
  connectionStatus,
  isConnected,
  className = '',
  compact = false
}) => {
  const [isExpanded, setIsExpanded] = useState(!compact)
  const [previousMetrics, setPreviousMetrics] = useState<WSPerformanceMetrics | null>(null)

  // 跟踪指标变化趋势
  useEffect(() => {
    const timer = setTimeout(() => {
      setPreviousMetrics(metrics)
    }, 1000)

    return () => clearTimeout(timer)
  }, [metrics])

  // 计算趋势
  const getTrend = (current: number, previous: number | undefined): 'up' | 'down' | 'stable' => {
    if (previous === undefined || Math.abs(current - previous) < 0.1) return 'stable'
    return current > previous ? 'up' : 'down'
  }

  // 性能等级评估
  const latencyLevel = getPerformanceLevel(metrics.averageLatency, PERFORMANCE_THRESHOLDS.latency)
  const messageRateLevel = getPerformanceLevel(metrics.messagesPerSecond, PERFORMANCE_THRESHOLDS.messageRate)
  const uptimeLevel = getPerformanceLevel(metrics.connectionUptime, PERFORMANCE_THRESHOLDS.uptime)

  // 总体健康度计算
  const healthScore = (() => {
    let score = 100
    if (latencyLevel === 'warning') score -= 20
    if (latencyLevel === 'critical') score -= 40
    if (messageRateLevel === 'warning') score -= 10
    if (messageRateLevel === 'critical') score -= 20
    if (uptimeLevel === 'critical') score -= 30
    if (!isConnected) score -= 50
    return Math.max(0, score)
  })()

  return (
    <Card className={`websocket-monitor ${className}`}>
      <CardHeader className={compact ? 'pb-2' : 'pb-4'}>
        <div className="flex items-center justify-between">
          <CardTitle className={`flex items-center gap-2 ${compact ? 'text-lg' : 'text-xl'}`}>
            <Network className="w-5 h-5" />
            WebSocket性能监控
          </CardTitle>

          <div className="flex items-center gap-2">
            <ConnectionStatusIndicator
              status={connectionStatus}
              isConnected={isConnected}
            />

            {compact && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2"
              >
                {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            )}
          </div>
        </div>

        {/* 总体健康度 */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">连接健康度</span>
            <span className={`text-sm font-bold ${
              healthScore >= 80 ? 'text-green-600' :
              healthScore >= 60 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {healthScore}%
            </span>
          </div>
          <Progress
            value={healthScore}
            className={`h-2 ${
              healthScore >= 80 ? 'bg-green-100' :
              healthScore >= 60 ? 'bg-yellow-100' : 'bg-red-100'
            }`}
          />
        </div>
      </CardHeader>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardContent className={compact ? 'pt-0' : 'pt-2'}>
              <div className="space-y-4">
                {/* 核心指标网格 */}
                <div className={`grid gap-3 ${compact ? 'grid-cols-2' : 'grid-cols-3'}`}>
                  <MetricCard
                    title="平均延迟"
                    value={formatLatency(metrics.averageLatency)}
                    level={latencyLevel}
                    icon={<Zap className="w-4 h-4" />}
                    trend={getTrend(metrics.averageLatency, previousMetrics?.averageLatency)}
                    compact={compact}
                  />

                  <MetricCard
                    title="消息频率"
                    value={formatMessageRate(metrics.messagesPerSecond)}
                    level={messageRateLevel}
                    icon={<Activity className="w-4 h-4" />}
                    trend={getTrend(metrics.messagesPerSecond, previousMetrics?.messagesPerSecond)}
                    compact={compact}
                  />

                  <MetricCard
                    title="连接时长"
                    value={formatUptime(metrics.connectionUptime)}
                    level={uptimeLevel}
                    icon={<Clock className="w-4 h-4" />}
                    compact={compact}
                  />
                </div>

                {/* 详细统计 */}
                {!compact && (
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-gray-700">统计信息</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">接收消息:</span>
                          <span className="font-medium">{metrics.messagesReceived.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">重连次数:</span>
                          <span className={`font-medium ${metrics.reconnectAttempts > 3 ? 'text-red-600' : 'text-gray-900'}`}>
                            {metrics.reconnectAttempts}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">最后延迟:</span>
                          <span className="font-medium">{formatLatency(metrics.lastLatency)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-gray-700">连接质量</h4>
                      <div className="space-y-1">
                        <Badge
                          variant={latencyLevel === 'good' ? 'default' : latencyLevel === 'warning' ? 'secondary' : 'destructive'}
                          className="text-xs"
                        >
                          延迟: {latencyLevel === 'good' ? '优秀' : latencyLevel === 'warning' ? '一般' : '较差'}
                        </Badge>
                        <Badge
                          variant={messageRateLevel === 'good' ? 'default' : messageRateLevel === 'warning' ? 'secondary' : 'destructive'}
                          className="text-xs ml-2"
                        >
                          频率: {messageRateLevel === 'good' ? '正常' : messageRateLevel === 'warning' ? '较高' : '过载'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                {/* 实时状态指示器 */}
                <div className="flex items-center justify-center pt-2">
                  <motion.div
                    className="flex items-center gap-2 text-sm text-gray-500"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span>实时监控中</span>
                  </motion.div>
                </div>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

export default WebSocketPerformanceMonitor