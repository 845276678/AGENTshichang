// WebSocket服务器集成配置
import { Server } from 'http'
import { BiddingWebSocketServer } from './bidding-websocket-server'
import { PrismaClient } from '@prisma/client'
import Redis from 'ioredis'

let wssInstance: BiddingWebSocketServer | null = null

// 创建WebSocket服务器实例
export function createWebSocketServer(httpServer: Server): BiddingWebSocketServer {
  if (wssInstance) {
    return wssInstance
  }

  // 初始化数据库连接
  const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  })

  // 初始化Redis连接
  const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    lazyConnect: true
  })

  // 监听Redis连接事件
  redis.on('connect', () => {
    console.log('Redis connected successfully')
  })

  redis.on('error', (error) => {
    console.error('Redis connection error:', error)
  })

  // 创建WebSocket服务器
  wssInstance = new BiddingWebSocketServer(httpServer, prisma, redis)

  // 设置优雅关闭
  const gracefulShutdown = async () => {
    console.log('Shutting down WebSocket server...')

    try {
      await prisma.$disconnect()
      console.log('Database connection closed')

      redis.disconnect()
      console.log('Redis connection closed')
    } catch (error) {
      console.error('Error during shutdown:', error)
    }
  }

  process.on('SIGTERM', gracefulShutdown)
  process.on('SIGINT', gracefulShutdown)

  return wssInstance
}

// 获取WebSocket服务器实例
export function getWebSocketServer(): BiddingWebSocketServer | null {
  return wssInstance
}

// Next.js自定义服务器集成
export function setupWebSocketServer(app: any, server: Server) {
  // 创建WebSocket服务器
  const wss = createWebSocketServer(server)

  // 添加健康检查端点
  app.get('/api/ws/health', (req: any, res: any) => {
    const stats = wss.getStats()
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      stats
    })
  })

  // 添加WebSocket统计端点
  app.get('/api/ws/stats', (req: any, res: any) => {
    const stats = wss.getStats()
    res.json(stats)
  })

  console.log('WebSocket server setup completed')
  return wss
}

// 竞价会话管理器
export class BiddingSessionManager {
  private wss: BiddingWebSocketServer

  constructor(wss: BiddingWebSocketServer) {
    this.wss = wss
  }

  // 开始新的竞价会话
  async startBiddingSession(sessionId: string) {
    // 这里可以添加会话开始的逻辑
    console.log(`Starting bidding session: ${sessionId}`)
  }

  // 处理AI出价
  async handleAIBid(sessionId: string, agentName: string, amount: number, comment?: string) {
    const bidData = {
      id: `bid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      agentName,
      agentType: this.getAgentType(agentName),
      amount,
      comment,
      confidence: Math.random() * 0.3 + 0.7, // 0.7-1.0之间的随机信心度
      timestamp: Date.now()
    }

    // 广播给所有观看者
    await this.wss.broadcastNewBid(sessionId, bidData)

    return bidData
  }

  // 处理AI交互
  async handleAIInteraction(
    sessionId: string,
    agentName: string,
    interactionType: string,
    content: string,
    emotion: string = 'neutral',
    animation: string = 'none'
  ) {
    const interactionData = {
      id: `interaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      agentName,
      agentType: this.getAgentType(agentName),
      interactionType,
      content,
      emotion,
      animation,
      timestamp: Date.now()
    }

    // 广播给所有观看者
    await this.wss.broadcastAIInteraction(sessionId, interactionData)

    return interactionData
  }

  // 结束竞价会话
  async endBiddingSession(sessionId: string, winnerAgent: string, finalPrice: number) {
    const results = {
      winnerAgent,
      finalPrice,
      endTime: Date.now()
    }

    // 广播结束事件
    await this.wss.broadcastBiddingEnd(sessionId, results)

    return results
  }

  // 获取AI代理类型
  private getAgentType(agentName: string): string {
    const agentTypeMap: Record<string, string> = {
      '科技艾克斯': 'tech',
      '商人老王': 'business',
      '文艺小琳': 'creative',
      '趋势阿伦': 'trend',
      '教授李博': 'academic'
    }
    return agentTypeMap[agentName] || 'unknown'
  }
}

// 导出单例管理器
export function getBiddingSessionManager(): BiddingSessionManager | null {
  const wss = getWebSocketServer()
  if (!wss) return null
  return new BiddingSessionManager(wss)
}