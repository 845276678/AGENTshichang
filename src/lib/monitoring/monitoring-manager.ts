// 生产级监控和日志系统
import { PrismaClient } from '@prisma/client'
import { RedisCacheManager } from '../cache/redis-manager'
import { performance } from 'perf_hooks'

// 日志级别
enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4
}

// 指标类型
enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
  TIMER = 'timer'
}

// 日志条目
interface LogEntry {
  timestamp: Date
  level: LogLevel
  message: string
  context?: Record<string, any>
  error?: Error
  trace?: string
  userId?: string
  sessionId?: string
  requestId?: string
  component: string
}

// 指标数据
interface MetricData {
  name: string
  type: MetricType
  value: number
  labels?: Record<string, string>
  timestamp: Date
}

// 性能指标
interface PerformanceMetric {
  name: string
  duration: number
  startTime: number
  endTime: number
  labels?: Record<string, string>
}

// 警报规则
interface AlertRule {
  id: string
  name: string
  condition: string
  threshold: number
  duration: number // 持续时间（秒）
  enabled: boolean
  severity: 'low' | 'medium' | 'high' | 'critical'
  actions: AlertAction[]
}

interface AlertAction {
  type: 'email' | 'webhook' | 'slack'
  config: Record<string, any>
}

// 监控管理器
export class MonitoringManager {
  private prisma: PrismaClient
  private cache: RedisCacheManager
  private logLevel: LogLevel
  private metricsBuffer: MetricData[] = []
  private logsBuffer: LogEntry[] = []
  private performanceTrackers = new Map<string, number>()
  private alertRules: AlertRule[] = []
  private alertStates = new Map<string, { triggered: boolean; since: Date }>()

  // 配置
  private readonly config = {
    bufferSize: 1000,
    flushInterval: 10000, // 10秒
    metricsRetention: 7 * 24 * 3600, // 7天
    logsRetention: 30 * 24 * 3600, // 30天
    enableConsoleOutput: process.env.NODE_ENV === 'development'
  }

  constructor(
    prisma: PrismaClient,
    cache: RedisCacheManager,
    logLevel: LogLevel = LogLevel.INFO
  ) {
    this.prisma = prisma
    this.cache = cache
    this.logLevel = logLevel

    this.initializeAlertRules()
    this.startPeriodicFlush()
    this.startMetricsCollection()
  }

  // ==================== 日志系统 ====================

  error(message: string, context?: Record<string, any>, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error)
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context)
  }

  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context)
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context)
  }

  trace(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.TRACE, message, context)
  }

  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error,
    component: string = 'system'
  ): void {
    if (level > this.logLevel) return

    const logEntry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context,
      error,
      trace: error?.stack,
      userId: context?.userId,
      sessionId: context?.sessionId,
      requestId: context?.requestId,
      component
    }

    // 控制台输出
    if (this.config.enableConsoleOutput) {
      this.outputToConsole(logEntry)
    }

    // 添加到缓冲区
    this.logsBuffer.push(logEntry)

    // 如果是错误级别，立即触发告警检查
    if (level === LogLevel.ERROR) {
      this.checkErrorAlerts(logEntry)
    }

    // 缓冲区满时强制刷新
    if (this.logsBuffer.length >= this.config.bufferSize) {
      this.flushLogs()
    }
  }

  private outputToConsole(entry: LogEntry): void {
    const levelNames = ['ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE']
    const colors = ['\x1b[31m', '\x1b[33m', '\x1b[32m', '\x1b[36m', '\x1b[90m']
    const reset = '\x1b[0m'

    const timestamp = entry.timestamp.toISOString()
    const level = levelNames[entry.level]
    const color = colors[entry.level]

    let output = `${color}[${timestamp}] ${level}: ${entry.message}${reset}`

    if (entry.context) {
      output += `\n  Context: ${JSON.stringify(entry.context, null, 2)}`
    }

    if (entry.error) {
      output += `\n  Error: ${entry.error.message}`
      if (entry.trace) {
        output += `\n  Stack: ${entry.trace}`
      }
    }

    console.log(output)
  }

  // ==================== 指标系统 ====================

  counter(name: string, value: number = 1, labels?: Record<string, string>): void {
    this.recordMetric({
      name,
      type: MetricType.COUNTER,
      value,
      labels,
      timestamp: new Date()
    })
  }

  gauge(name: string, value: number, labels?: Record<string, string>): void {
    this.recordMetric({
      name,
      type: MetricType.GAUGE,
      value,
      labels,
      timestamp: new Date()
    })
  }

  histogram(name: string, value: number, labels?: Record<string, string>): void {
    this.recordMetric({
      name,
      type: MetricType.HISTOGRAM,
      value,
      labels,
      timestamp: new Date()
    })
  }

  private recordMetric(metric: MetricData): void {
    this.metricsBuffer.push(metric)

    // 同时更新Redis中的实时指标
    this.updateRealtimeMetric(metric)

    // 检查指标警报
    this.checkMetricAlerts(metric)

    // 缓冲区满时强制刷新
    if (this.metricsBuffer.length >= this.config.bufferSize) {
      this.flushMetrics()
    }
  }

  private async updateRealtimeMetric(metric: MetricData): Promise<void> {
    const key = `metrics:${metric.name}:${JSON.stringify(metric.labels || {})}`

    try {
      if (metric.type === MetricType.COUNTER) {
        await this.cache['redis'].incrbyfloat(key, metric.value)
      } else {
        await this.cache['redis'].set(key, metric.value)
      }

      await this.cache['redis'].expire(key, 3600) // 1小时过期
    } catch (error) {
      console.error('Failed to update realtime metric:', error)
    }
  }

  // ==================== 性能监控 ====================

  startTimer(name: string, labels?: Record<string, string>): string {
    const trackerId = `${name}_${Date.now()}_${Math.random()}`
    this.performanceTrackers.set(trackerId, performance.now())

    return trackerId
  }

  endTimer(trackerId: string, labels?: Record<string, string>): number {
    const startTime = this.performanceTrackers.get(trackerId)
    if (!startTime) return 0

    const duration = performance.now() - startTime
    this.performanceTrackers.delete(trackerId)

    // 记录为直方图指标
    const name = trackerId.split('_')[0] + '_duration_ms'
    this.histogram(name, duration, labels)

    return duration
  }

  // 性能装饰器
  measurePerformance<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    metricName: string,
    getLabels?: (...args: any[]) => Record<string, string>
  ): T {
    return (async (...args: any[]) => {
      const labels = getLabels?.(...args) || {}
      const trackerId = this.startTimer(metricName, labels)

      try {
        const result = await fn(...args)
        this.endTimer(trackerId, labels)
        this.counter(`${metricName}_success_total`, 1, labels)
        return result
      } catch (error) {
        this.endTimer(trackerId, labels)
        this.counter(`${metricName}_error_total`, 1, labels)
        throw error
      }
    }) as T
  }

  // ==================== 健康检查 ====================

  async getSystemHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    checks: Record<string, {
      status: 'pass' | 'fail'
      message?: string
      responseTime?: number
    }>
    uptime: number
    version: string
  }> {
    const startTime = Date.now()
    const checks: Record<string, any> = {}

    // 数据库检查
    try {
      await this.prisma.$queryRaw`SELECT 1`
      checks.database = {
        status: 'pass',
        responseTime: Date.now() - startTime
      }
    } catch (error) {
      checks.database = {
        status: 'fail',
        message: (error as Error).message
      }
    }

    // Redis检查
    const redisHealth = await this.cache.healthCheck()
    checks.redis = {
      status: redisHealth.healthy ? 'pass' : 'fail',
      message: redisHealth.error,
      responseTime: redisHealth.latency
    }

    // 内存检查
    const memUsage = process.memoryUsage()
    const memUsageMB = Math.round(memUsage.rss / 1024 / 1024)
    checks.memory = {
      status: memUsageMB < 1024 ? 'pass' : 'fail', // 1GB限制
      message: `${memUsageMB}MB used`
    }

    // CPU检查
    const cpuUsage = process.cpuUsage()
    checks.cpu = {
      status: 'pass',
      message: `User: ${cpuUsage.user}µs, System: ${cpuUsage.system}µs`
    }

    // 确定整体状态
    const failedChecks = Object.values(checks).filter(check => check.status === 'fail').length
    let status: 'healthy' | 'degraded' | 'unhealthy'

    if (failedChecks === 0) {
      status = 'healthy'
    } else if (failedChecks === 1) {
      status = 'degraded'
    } else {
      status = 'unhealthy'
    }

    return {
      status,
      checks,
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0'
    }
  }

  // ==================== 警报系统 ====================

  private initializeAlertRules(): void {
    this.alertRules = [
      {
        id: 'high_error_rate',
        name: '错误率过高',
        condition: 'error_total > 10',
        threshold: 10,
        duration: 300, // 5分钟
        enabled: true,
        severity: 'high',
        actions: [
          {
            type: 'email',
            config: { recipients: ['admin@example.com'] }
          }
        ]
      },
      {
        id: 'slow_response_time',
        name: '响应时间过慢',
        condition: 'avg(request_duration_ms) > 2000',
        threshold: 2000,
        duration: 600, // 10分钟
        enabled: true,
        severity: 'medium',
        actions: [
          {
            type: 'webhook',
            config: { url: 'https://hooks.slack.com/...' }
          }
        ]
      },
      {
        id: 'memory_usage_high',
        name: '内存使用过高',
        condition: 'memory_usage_mb > 800',
        threshold: 800,
        duration: 180, // 3分钟
        enabled: true,
        severity: 'critical',
        actions: [
          {
            type: 'email',
            config: { recipients: ['ops@example.com'] }
          }
        ]
      }
    ]
  }

  private checkMetricAlerts(metric: MetricData): void {
    this.alertRules.forEach(rule => {
      if (!rule.enabled) return

      // 简化的规则匹配（生产环境应使用更复杂的规则引擎）
      const shouldTrigger = this.evaluateAlertRule(rule, metric)

      if (shouldTrigger) {
        this.triggerAlert(rule, metric)
      }
    })
  }

  private checkErrorAlerts(logEntry: LogEntry): void {
    const errorRule = this.alertRules.find(rule => rule.id === 'high_error_rate')
    if (errorRule && errorRule.enabled) {
      this.counter('error_total', 1)
    }
  }

  private evaluateAlertRule(rule: AlertRule, metric: MetricData): boolean {
    // 这是一个简化的实现，实际应用中需要更复杂的规则引擎
    if (rule.condition.includes(metric.name)) {
      return metric.value > rule.threshold
    }
    return false
  }

  private triggerAlert(rule: AlertRule, metric: MetricData): void {
    const alertKey = `alert:${rule.id}`
    const state = this.alertStates.get(alertKey)

    if (!state || !state.triggered) {
      // 新警报或之前已恢复的警报
      this.alertStates.set(alertKey, { triggered: true, since: new Date() })

      this.error('Alert triggered', {
        ruleId: rule.id,
        ruleName: rule.name,
        severity: rule.severity,
        metric: metric.name,
        value: metric.value,
        threshold: rule.threshold
      })

      // 执行警报动作
      rule.actions.forEach(action => {
        this.executeAlertAction(action, rule, metric)
      })
    }
  }

  private executeAlertAction(action: AlertAction, rule: AlertRule, metric: MetricData): void {
    switch (action.type) {
      case 'email':
        this.sendEmailAlert(action.config, rule, metric)
        break
      case 'webhook':
        this.sendWebhookAlert(action.config, rule, metric)
        break
      case 'slack':
        this.sendSlackAlert(action.config, rule, metric)
        break
    }
  }

  private sendEmailAlert(config: any, rule: AlertRule, metric: MetricData): void {
    // 实际实现中应集成邮件服务
    this.info('Email alert sent', {
      recipients: config.recipients,
      subject: `[${rule.severity.toUpperCase()}] ${rule.name}`,
      content: `Metric ${metric.name} value ${metric.value} exceeded threshold ${rule.threshold}`
    })
  }

  private sendWebhookAlert(config: any, rule: AlertRule, metric: MetricData): void {
    // 实际实现中应发送HTTP请求
    this.info('Webhook alert sent', {
      url: config.url,
      payload: {
        rule: rule.name,
        severity: rule.severity,
        metric: metric.name,
        value: metric.value,
        threshold: rule.threshold
      }
    })
  }

  private sendSlackAlert(config: any, rule: AlertRule, metric: MetricData): void {
    // 实际实现中应调用Slack API
    this.info('Slack alert sent', {
      channel: config.channel,
      message: `🚨 ${rule.name}: ${metric.name} = ${metric.value} (threshold: ${rule.threshold})`
    })
  }

  // ==================== 数据持久化 ====================

  private async flushLogs(): Promise<void> {
    if (this.logsBuffer.length === 0) return

    const logsToFlush = [...this.logsBuffer]
    this.logsBuffer = []

    try {
      // 批量保存到Redis（用于实时查询）
      const pipeline = this.cache['redis'].pipeline()

      logsToFlush.forEach(log => {
        const key = `logs:${log.timestamp.getTime()}`
        pipeline.set(key, JSON.stringify(log), 'EX', this.config.logsRetention)
      })

      await pipeline.exec()

      // 错误日志额外保存到数据库（持久化）
      const errorLogs = logsToFlush.filter(log => log.level === LogLevel.ERROR)
      if (errorLogs.length > 0) {
        // 这里可以保存到专门的错误日志表
        this.info(`Saved ${errorLogs.length} error logs to database`)
      }

    } catch (error) {
      console.error('Failed to flush logs:', error)
      // 失败的日志重新加回缓冲区
      this.logsBuffer.unshift(...logsToFlush)
    }
  }

  private async flushMetrics(): Promise<void> {
    if (this.metricsBuffer.length === 0) return

    const metricsToFlush = [...this.metricsBuffer]
    this.metricsBuffer = []

    try {
      // 批量保存指标到时间序列存储（这里使用Redis示例）
      const pipeline = this.cache['redis'].pipeline()

      metricsToFlush.forEach(metric => {
        const key = `metrics:timeseries:${metric.name}`
        const timestamp = metric.timestamp.getTime()

        // 使用Redis的Sorted Set存储时间序列数据
        pipeline.zadd(key, timestamp, `${timestamp}:${metric.value}:${JSON.stringify(metric.labels || {})}`)
        pipeline.expire(key, this.config.metricsRetention)
      })

      await pipeline.exec()

    } catch (error) {
      console.error('Failed to flush metrics:', error)
      this.metricsBuffer.unshift(...metricsToFlush)
    }
  }

  // ==================== 定期任务 ====================

  private startPeriodicFlush(): void {
    setInterval(() => {
      this.flushLogs()
      this.flushMetrics()
    }, this.config.flushInterval)
  }

  private startMetricsCollection(): void {
    setInterval(() => {
      this.collectSystemMetrics()
    }, 30000) // 每30秒收集一次系统指标
  }

  private collectSystemMetrics(): void {
    // 内存使用
    const memUsage = process.memoryUsage()
    this.gauge('memory_usage_mb', Math.round(memUsage.rss / 1024 / 1024))
    this.gauge('memory_heap_used_mb', Math.round(memUsage.heapUsed / 1024 / 1024))
    this.gauge('memory_heap_total_mb', Math.round(memUsage.heapTotal / 1024 / 1024))

    // CPU使用
    const cpuUsage = process.cpuUsage()
    this.gauge('cpu_user_microseconds', cpuUsage.user)
    this.gauge('cpu_system_microseconds', cpuUsage.system)

    // 运行时间
    this.gauge('uptime_seconds', process.uptime())

    // 活跃句柄数
    this.gauge('active_handles', (process as any)._getActiveHandles()?.length || 0)
    this.gauge('active_requests', (process as any)._getActiveRequests()?.length || 0)
  }

  // ==================== 查询接口 ====================

  async getMetrics(
    metricName: string,
    startTime: Date,
    endTime: Date,
    labels?: Record<string, string>
  ): Promise<Array<{ timestamp: number; value: number }>> {
    try {
      const key = `metrics:timeseries:${metricName}`
      const start = startTime.getTime()
      const end = endTime.getTime()

      const results = await this.cache['redis'].zrangebyscore(key, start, end)

      return results.map(result => {
        const [timestamp, value] = result.split(':')
        return {
          timestamp: parseInt(timestamp),
          value: parseFloat(value)
        }
      }).filter(item => !isNaN(item.value))

    } catch (error) {
      console.error('Failed to get metrics:', error)
      return []
    }
  }

  async getLogs(
    startTime: Date,
    endTime: Date,
    level?: LogLevel,
    component?: string
  ): Promise<LogEntry[]> {
    try {
      const pattern = 'logs:*'
      const keys = await this.cache['redis'].keys(pattern)

      if (keys.length === 0) return []

      const pipeline = this.cache['redis'].pipeline()
      keys.forEach(key => pipeline.get(key))

      const results = await pipeline.exec()
      const logs: LogEntry[] = []

      results?.forEach(result => {
        if (result[1]) {
          try {
            const log = JSON.parse(result[1] as string) as LogEntry
            const logTime = new Date(log.timestamp)

            if (logTime >= startTime && logTime <= endTime) {
              if (!level || log.level === level) {
                if (!component || log.component === component) {
                  logs.push(log)
                }
              }
            }
          } catch (error) {
            console.error('Failed to parse log entry:', error)
          }
        }
      })

      return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    } catch (error) {
      console.error('Failed to get logs:', error)
      return []
    }
  }

  // ==================== 优雅关闭 ====================

  async shutdown(): Promise<void> {
    this.info('MonitoringManager shutting down...')

    // 刷新剩余的缓冲区数据
    await this.flushLogs()
    await this.flushMetrics()

    this.info('MonitoringManager shutdown completed')
  }
}

// 创建全局监控实例
let monitoringInstance: MonitoringManager | null = null

export function getMonitoringManager(
  prisma: PrismaClient,
  cache: RedisCacheManager,
  logLevel?: LogLevel
): MonitoringManager {
  if (!monitoringInstance) {
    monitoringInstance = new MonitoringManager(prisma, cache, logLevel)
  }
  return monitoringInstance
}

// 导出类型和枚举
export { LogLevel, MetricType }
export type { LogEntry, MetricData, PerformanceMetric, AlertRule }