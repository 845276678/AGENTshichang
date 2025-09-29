/**
 * WebSocket连接管理器
 * 提供连接池管理、负载均衡、故障转移等功能
 */

import { WSMessage, WSMessageValidator, WS_ERROR_CODES } from '@/types/websocket-messages'

// 连接配置
interface ConnectionConfig {
  url: string
  priority: number // 优先级，数字越小优先级越高
  maxConnections: number
  timeout: number
  retryAttempts: number
  retryDelay: number
}

// 连接状态
interface ConnectionState {
  id: string
  websocket: WebSocket | null
  status: 'connecting' | 'connected' | 'disconnected' | 'error'
  lastPing: number
  lastPong: number
  messagesSent: number
  messagesReceived: number
  errors: number
  createdAt: number
  reconnectAttempts: number
}

// 连接池统计
interface PoolStats {
  totalConnections: number
  activeConnections: number
  averageLatency: number
  messageRate: number
  errorRate: number
  uptime: number
}

// 事件回调接口
interface ConnectionManagerEvents {
  onMessage: (message: WSMessage, connectionId: string) => void
  onConnect: (connectionId: string) => void
  onDisconnect: (connectionId: string, reason: string) => void
  onError: (error: Error, connectionId: string) => void
  onStatsUpdate: (stats: PoolStats) => void
}

export class WebSocketConnectionManager {
  private connections: Map<string, ConnectionState> = new Map()
  private configs: ConnectionConfig[] = []
  private events: Partial<ConnectionManagerEvents> = {}
  private statsTimer: NodeJS.Timeout | null = null
  private heartbeatTimer: NodeJS.Timeout | null = null
  private isDestroyed = false

  // 默认配置
  private readonly DEFAULT_CONFIG: ConnectionConfig = {
    url: '',
    priority: 1,
    maxConnections: 3,
    timeout: 10000,
    retryAttempts: 5,
    retryDelay: 3000
  }

  constructor(events: Partial<ConnectionManagerEvents> = {}) {
    this.events = events
    this.startStatsCollection()
    this.startHeartbeat()
  }

  /**
   * 添加WebSocket服务器配置
   */
  addServer(config: Partial<ConnectionConfig> & { url: string }) {
    const fullConfig: ConnectionConfig = {
      ...this.DEFAULT_CONFIG,
      ...config
    }

    this.configs.push(fullConfig)
    this.configs.sort((a, b) => a.priority - b.priority) // 按优先级排序
  }

  /**
   * 启动连接池
   */
  async connect(ideaId: string): Promise<boolean> {
    if (this.configs.length === 0) {
      throw new Error('No WebSocket servers configured')
    }

    const promises = this.configs.map(config =>
      this.createConnection(config, ideaId)
    )

    const results = await Promise.allSettled(promises)
    const successCount = results.filter(r => r.status === 'fulfilled').length

    console.log(`🔌 Connected to ${successCount}/${this.configs.length} WebSocket servers`)
    return successCount > 0
  }

  /**
   * 创建单个连接
   */
  private async createConnection(config: ConnectionConfig, ideaId: string): Promise<string> {
    const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`

    const state: ConnectionState = {
      id: connectionId,
      websocket: null,
      status: 'connecting',
      lastPing: 0,
      lastPong: 0,
      messagesSent: 0,
      messagesReceived: 0,
      errors: 0,
      createdAt: Date.now(),
      reconnectAttempts: 0
    }

    this.connections.set(connectionId, state)

    return new Promise((resolve, reject) => {
      const wsUrl = `${config.url}/${ideaId}`

      try {
        const ws = new WebSocket(wsUrl)
        state.websocket = ws

        const connectTimeout = setTimeout(() => {
          ws.close()
          state.status = 'error'
          state.errors++
          reject(new Error(`Connection timeout: ${wsUrl}`))
        }, config.timeout)

        ws.onopen = () => {
          clearTimeout(connectTimeout)
          state.status = 'connected'
          console.log(`✅ WebSocket connected: ${connectionId} -> ${wsUrl}`)
          this.events.onConnect?.(connectionId)
          resolve(connectionId)
        }

        ws.onmessage = (event) => {
          this.handleMessage(event, connectionId)
        }

        ws.onclose = (event) => {
          clearTimeout(connectTimeout)
          state.status = 'disconnected'
          console.log(`🔌 WebSocket disconnected: ${connectionId} (${event.code})`)
          this.events.onDisconnect?.(connectionId, event.reason)

          // 自动重连
          if (!this.isDestroyed && state.reconnectAttempts < config.retryAttempts) {
            setTimeout(() => {
              this.reconnectConnection(connectionId, config, ideaId)
            }, config.retryDelay)
          }
        }

        ws.onerror = (error) => {
          clearTimeout(connectTimeout)
          state.status = 'error'
          state.errors++
          console.error(`❌ WebSocket error: ${connectionId}`, error)
          this.events.onError?.(new Error(`WebSocket error: ${connectionId}`), connectionId)
          reject(error)
        }

      } catch (error) {
        state.status = 'error'
        state.errors++
        reject(error)
      }
    })
  }

  /**
   * 重连连接
   */
  private async reconnectConnection(connectionId: string, config: ConnectionConfig, ideaId: string) {
    const state = this.connections.get(connectionId)
    if (!state || this.isDestroyed) return

    state.reconnectAttempts++
    console.log(`🔄 Reconnecting ${connectionId} (attempt ${state.reconnectAttempts}/${config.retryAttempts})`)

    try {
      await this.createConnection(config, ideaId)
    } catch (error) {
      console.error(`❌ Reconnection failed: ${connectionId}`, error)
    }
  }

  /**
   * 处理接收到的消息
   */
  private handleMessage(event: MessageEvent, connectionId: string) {
    const state = this.connections.get(connectionId)
    if (!state) return

    state.messagesReceived++
    state.lastPong = Date.now() // 更新最后收到消息的时间

    try {
      const data = JSON.parse(event.data)

      // 验证消息格式
      if (!WSMessageValidator.isValidMessage(data)) {
        console.warn('⚠️ Invalid message format:', data)
        return
      }

      // 处理心跳响应
      if (data.type === 'pong') {
        const latency = Date.now() - (data.timestamp || 0)
        console.log(`💓 Heartbeat: ${connectionId} latency=${latency}ms`)
        return
      }

      this.events.onMessage?.(data, connectionId)

    } catch (error) {
      console.error('❌ Error parsing message:', error)
      state.errors++
    }
  }

  /**
   * 发送消息（负载均衡）
   */
  sendMessage(message: any): boolean {
    const activeConnections = Array.from(this.connections.values())
      .filter(state => state.status === 'connected' && state.websocket)
      .sort((a, b) => {
        // 按消息数量和延迟排序，选择最优连接
        const aScore = a.messagesSent + (Date.now() - a.lastPong) / 1000
        const bScore = b.messagesSent + (Date.now() - b.lastPong) / 1000
        return aScore - bScore
      })

    if (activeConnections.length === 0) {
      console.warn('⚠️ No active WebSocket connections')
      return false
    }

    const connection = activeConnections[0]
    const messageWithMeta = {
      ...message,
      timestamp: Date.now(),
      connectionId: connection.id
    }

    try {
      connection.websocket!.send(JSON.stringify(messageWithMeta))
      connection.messagesSent++
      return true
    } catch (error) {
      console.error(`❌ Error sending message via ${connection.id}:`, error)
      connection.errors++
      connection.status = 'error'

      // 尝试备用连接
      if (activeConnections.length > 1) {
        return this.sendMessage(message)
      }

      return false
    }
  }

  /**
   * 广播消息到所有连接
   */
  broadcast(message: any): number {
    let successCount = 0

    this.connections.forEach((state) => {
      if (state.status === 'connected' && state.websocket) {
        try {
          const messageWithMeta = {
            ...message,
            timestamp: Date.now(),
            connectionId: state.id
          }

          state.websocket.send(JSON.stringify(messageWithMeta))
          state.messagesSent++
          successCount++
        } catch (error) {
          console.error(`❌ Broadcast error to ${state.id}:`, error)
          state.errors++
        }
      }
    })

    return successCount
  }

  /**
   * 获取连接池统计
   */
  getStats(): PoolStats {
    const states = Array.from(this.connections.values())
    const activeConnections = states.filter(s => s.status === 'connected').length
    const totalMessages = states.reduce((sum, s) => sum + s.messagesReceived, 0)
    const totalErrors = states.reduce((sum, s) => sum + s.errors, 0)
    const uptime = states.length > 0 ? Date.now() - Math.min(...states.map(s => s.createdAt)) : 0

    // 计算平均延迟
    const latencies = states
      .filter(s => s.lastPong > s.lastPing)
      .map(s => s.lastPong - s.lastPing)
    const averageLatency = latencies.length > 0
      ? latencies.reduce((sum, l) => sum + l, 0) / latencies.length
      : 0

    const messageRate = uptime > 0 ? (totalMessages / (uptime / 1000)) : 0
    const errorRate = totalMessages > 0 ? (totalErrors / totalMessages) : 0

    return {
      totalConnections: states.length,
      activeConnections,
      averageLatency,
      messageRate,
      errorRate,
      uptime
    }
  }

  /**
   * 启动统计收集
   */
  private startStatsCollection() {
    this.statsTimer = setInterval(() => {
      if (!this.isDestroyed) {
        const stats = this.getStats()
        this.events.onStatsUpdate?.(stats)
      }
    }, 5000) // 每5秒更新一次统计
  }

  /**
   * 启动心跳检测
   */
  private startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.isDestroyed) return

      this.connections.forEach((state) => {
        if (state.status === 'connected' && state.websocket) {
          const now = Date.now()
          state.lastPing = now

          try {
            state.websocket.send(JSON.stringify({
              type: 'ping',
              timestamp: now,
              connectionId: state.id
            }))
          } catch (error) {
            console.error(`❌ Heartbeat error for ${state.id}:`, error)
            state.status = 'error'
            state.errors++
          }
        }
      })
    }, 30000) // 每30秒发送心跳
  }

  /**
   * 获取最佳连接
   */
  getBestConnection(): ConnectionState | null {
    return Array.from(this.connections.values())
      .filter(state => state.status === 'connected')
      .sort((a, b) => {
        // 评分：错误数越少，延迟越低，消息数越少的连接越好
        const aScore = a.errors * 100 + (Date.now() - a.lastPong) / 10 + a.messagesSent
        const bScore = b.errors * 100 + (Date.now() - b.lastPong) / 10 + b.messagesSent
        return aScore - bScore
      })[0] || null
  }

  /**
   * 关闭所有连接
   */
  disconnect(): void {
    this.isDestroyed = true

    if (this.statsTimer) {
      clearInterval(this.statsTimer)
      this.statsTimer = null
    }

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }

    this.connections.forEach((state) => {
      if (state.websocket) {
        state.websocket.close(1000, 'Manager shutdown')
      }
    })

    this.connections.clear()
    console.log('🔌 WebSocket ConnectionManager destroyed')
  }

  /**
   * 获取连接详情
   */
  getConnectionDetails(): Array<{id: string, status: string, messagesSent: number, messagesReceived: number, errors: number}> {
    return Array.from(this.connections.values()).map(state => ({
      id: state.id,
      status: state.status,
      messagesSent: state.messagesSent,
      messagesReceived: state.messagesReceived,
      errors: state.errors
    }))
  }
}

// 单例实例（可选）
let globalConnectionManager: WebSocketConnectionManager | null = null

export function getGlobalConnectionManager(): WebSocketConnectionManager {
  if (!globalConnectionManager) {
    globalConnectionManager = new WebSocketConnectionManager()
  }
  return globalConnectionManager
}

export function destroyGlobalConnectionManager(): void {
  if (globalConnectionManager) {
    globalConnectionManager.disconnect()
    globalConnectionManager = null
  }
}

export default WebSocketConnectionManager