// 生产级WebSocket服务器 - 竞价系统专用
import { WebSocketServer, WebSocket } from 'ws'
import { IncomingMessage, Server } from 'http'
import { PrismaClient } from '@prisma/client'
import Redis from 'ioredis'
import { z } from 'zod'
import jwt from 'jsonwebtoken'

// WebSocket消息类型定义
const WSMessageSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('join_session'),
    sessionId: z.string(),
    token: z.string().optional()
  }),
  z.object({
    type: z.literal('leave_session'),
    sessionId: z.string()
  }),
  z.object({
    type: z.literal('submit_guess'),
    sessionId: z.string(),
    guessedPrice: z.number(),
    confidence: z.number().min(0.1).max(1)
  }),
  z.object({
    type: z.literal('support_agent'),
    sessionId: z.string(),
    agentName: z.string()
  }),
  z.object({
    type: z.literal('react_to_dialogue'),
    sessionId: z.string(),
    reaction: z.string(),
    agentName: z.string().optional()
  }),
  z.object({
    type: z.literal('user_supplement'),
    payload: z.object({
      content: z.string(),
      triggerExtension: z.boolean().optional()
    })
  }),
  z.object({
    type: z.literal('extend_phase'),
    payload: z.object({
      extensionSeconds: z.number(),
      reason: z.string()
    })
  })
])

// 客户端连接信息
interface ClientInfo {
  ws: WebSocket
  userId?: string
  sessionId?: string
  joinedAt: Date
  lastActivity: Date
  isAuthenticated: boolean
  metadata: Record<string, any>
}

// 竞价会话状态
interface SessionState {
  sessionId: string
  status: 'PENDING' | 'ACTIVE' | 'ENDED' | 'CANCELLED'
  phase: 'DISCUSSION' | 'BIDDING' | 'RESULTS'
  participants: Set<string>
  viewers: number
  currentPrice: number
  timeRemaining: number
  lastActivity: Date

  // 快速竞价模式 - 时间管理
  phaseStartTime: Date
  basePhaseDuration: number // 基础阶段时长（秒）
  phaseExtended: boolean // 是否已顺延
  extensionTime: number // 顺延时间（秒）
}

export class BiddingWebSocketServer {
  private wss: WebSocketServer
  private prisma: PrismaClient
  private redis: Redis
  private clients = new Map<string, ClientInfo>()
  private sessions = new Map<string, SessionState>()
  private rateLimiter = new Map<string, { count: number; resetTime: number }>()

  // 配置项
  private readonly config = {
    maxConnectionsPerUser: 3,
    messageRateLimit: 10, // 每分钟最多10条消息
    sessionTimeout: 30 * 60 * 1000, // 30分钟会话超时
    heartbeatInterval: 30 * 1000, // 30秒心跳
    maxViewersPerSession: 500
  }

  constructor(server: Server, prisma: PrismaClient, redis: Redis) {
    this.prisma = prisma
    this.redis = redis

    // 创建WebSocket服务器
    this.wss = new WebSocketServer({
      server,
      path: '/ws/bidding',
      clientTracking: true,
      maxPayload: 1024 * 4, // 4KB最大消息大小
      verifyClient: this.verifyClient.bind(this)
    })

    this.setupEventHandlers()
    this.startHeartbeat()
    this.startSessionCleanup()
  }

  // 验证客户端连接
  private verifyClient(info: {
    origin: string
    secure: boolean
    req: IncomingMessage
  }): boolean {
    // 检查Origin和其他安全头
    const { origin, req } = info

    // 在生产环境中验证origin
    if (process.env.NODE_ENV === 'production') {
      const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || []
      if (!allowedOrigins.includes(origin)) {
        console.warn(`Rejected WebSocket connection from origin: ${origin}`)
        return false
      }
    }

    // 检查连接数限制
    const totalConnections = this.wss.clients.size
    if (totalConnections >= 1000) {
      console.warn('WebSocket connection limit reached')
      return false
    }

    return true
  }

  // 设置事件处理器
  private setupEventHandlers() {
    this.wss.on('connection', this.handleConnection.bind(this))
    this.wss.on('error', this.handleServerError.bind(this))

    // 优雅关闭处理
    process.on('SIGTERM', this.gracefulShutdown.bind(this))
    process.on('SIGINT', this.gracefulShutdown.bind(this))
  }

  // 处理新连接
  private async handleConnection(ws: WebSocket, req: IncomingMessage) {
    const clientId = this.generateClientId()

    const clientInfo: ClientInfo = {
      ws,
      joinedAt: new Date(),
      lastActivity: new Date(),
      isAuthenticated: false,
      metadata: {
        userAgent: req.headers['user-agent'],
        ip: this.getClientIP(req)
      }
    }

    this.clients.set(clientId, clientInfo)

    // 设置连接事件
    ws.on('message', (data) => this.handleMessage(clientId, data))
    ws.on('close', () => this.handleDisconnection(clientId))
    ws.on('error', (error) => this.handleClientError(clientId, error))
    ws.on('pong', () => this.handlePong(clientId))

    // 发送连接成功消息
    this.sendToClient(clientId, {
      type: 'connected',
      clientId,
      timestamp: Date.now()
    })

    console.log(`WebSocket client connected: ${clientId}`)
  }

  // 处理消息
  private async handleMessage(clientId: string, data: Buffer) {
    const client = this.clients.get(clientId)
    if (!client) return

    try {
      // 更新客户端活动时间
      client.lastActivity = new Date()

      // 频率限制检查
      if (!this.checkRateLimit(clientId)) {
        this.sendToClient(clientId, {
          type: 'error',
          message: 'Rate limit exceeded',
          code: 'RATE_LIMIT'
        })
        return
      }

      // 解析消息
      const rawMessage = JSON.parse(data.toString())
      const message = WSMessageSchema.parse(rawMessage)

      // 处理不同类型的消息
      switch (message.type) {
        case 'join_session':
          await this.handleJoinSession(clientId, message)
          break
        case 'leave_session':
          await this.handleLeaveSession(clientId, message)
          break
        case 'submit_guess':
          await this.handleSubmitGuess(clientId, message)
          break
        case 'support_agent':
          await this.handleSupportAgent(clientId, message)
          break
        case 'react_to_dialogue':
          await this.handleReactToDialogue(clientId, message)
          break
        case 'user_supplement':
          await this.handleUserSupplement(clientId, message)
          break
        case 'extend_phase':
          await this.handleExtendPhase(clientId, message)
          break
      }
    } catch (error) {
      console.error('WebSocket message handling error:', error)
      this.sendToClient(clientId, {
        type: 'error',
        message: 'Invalid message format',
        code: 'INVALID_MESSAGE'
      })
    }
  }

  // 处理加入会话
  private async handleJoinSession(clientId: string, message: any) {
    const client = this.clients.get(clientId)
    if (!client) return

    const { sessionId, token } = message

    try {
      // 验证会话存在性
      const session = await this.prisma.biddingSession.findUnique({
        where: { id: sessionId },
        include: { idea: true }
      })

      if (!session) {
        this.sendToClient(clientId, {
          type: 'error',
          message: 'Session not found',
          code: 'SESSION_NOT_FOUND'
        })
        return
      }

      // 用户身份验证（如果提供token）
      let userId: string | undefined
      if (token) {
        try {
          const payload = jwt.verify(token, process.env.JWT_SECRET!) as any
          userId = payload.userId
          client.userId = userId
          client.isAuthenticated = true
        } catch (error) {
          // Token无效，作为匿名用户处理
          console.warn('Invalid token provided:', error)
        }
      }

      // 检查会话观看人数限制
      const currentViewers = this.getSessionViewers(sessionId)
      if (currentViewers >= this.config.maxViewersPerSession) {
        this.sendToClient(clientId, {
          type: 'error',
          message: 'Session is full',
          code: 'SESSION_FULL'
        })
        return
      }

      // 更新客户端会话信息
      client.sessionId = sessionId

      // 更新或创建会话状态
      let sessionState = this.sessions.get(sessionId)
      if (!sessionState) {
        sessionState = {
          sessionId,
          status: session.status,
          phase: session.phase,
          participants: new Set(),
          viewers: 0,
          currentPrice: session.currentHigh,
          timeRemaining: this.calculateTimeRemaining(session),
          lastActivity: new Date(),

          // 快速竞价模式 - 时间管理
          phaseStartTime: new Date(),
          basePhaseDuration: 120, // 2分钟基础时长
          phaseExtended: false,
          extensionTime: 0
        }
        this.sessions.set(sessionId, sessionState)
      }

      sessionState.viewers++
      if (userId) {
        sessionState.participants.add(userId)
      }

      // 记录用户行为
      if (userId) {
        await this.recordUserBehavior(userId, sessionId, 'enter_session')
      }

      // 更新数据库中的观看人数
      await this.updateSessionViewerCount(sessionId, sessionState.viewers)

      // 发送加入成功消息
      this.sendToClient(clientId, {
        type: 'session_joined',
        sessionId,
        sessionData: {
          status: sessionState.status,
          phase: sessionState.phase,
          currentPrice: sessionState.currentPrice,
          timeRemaining: sessionState.timeRemaining,
          viewers: sessionState.viewers,
          idea: {
            id: session.idea.id,
            title: session.idea.title,
            description: session.idea.description,
            category: session.idea.category
          }
        }
      })

      // 向会话中的其他用户广播新用户加入
      this.broadcastToSession(sessionId, {
        type: 'viewer_joined',
        viewers: sessionState.viewers
      }, clientId)

      console.log(`Client ${clientId} joined session ${sessionId}`)

    } catch (error) {
      console.error('Error handling join session:', error)
      this.sendToClient(clientId, {
        type: 'error',
        message: 'Failed to join session',
        code: 'JOIN_ERROR'
      })
    }
  }

  // 处理离开会话
  private async handleLeaveSession(clientId: string, message: any) {
    const client = this.clients.get(clientId)
    if (!client || !client.sessionId) return

    const { sessionId } = message

    try {
      const sessionState = this.sessions.get(sessionId)
      if (sessionState) {
        sessionState.viewers = Math.max(0, sessionState.viewers - 1)

        if (client.userId) {
          sessionState.participants.delete(client.userId)
          await this.recordUserBehavior(client.userId, sessionId, 'leave_session')
        }

        await this.updateSessionViewerCount(sessionId, sessionState.viewers)

        // 向其他用户广播用户离开
        this.broadcastToSession(sessionId, {
          type: 'viewer_left',
          viewers: sessionState.viewers
        }, clientId)
      }

      client.sessionId = undefined

      this.sendToClient(clientId, {
        type: 'session_left',
        sessionId
      })

      console.log(`Client ${clientId} left session ${sessionId}`)

    } catch (error) {
      console.error('Error handling leave session:', error)
    }
  }

  // 处理价格竞猜提交
  private async handleSubmitGuess(clientId: string, message: any) {
    const client = this.clients.get(clientId)
    if (!client || !client.isAuthenticated || !client.userId) {
      this.sendToClient(clientId, {
        type: 'error',
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      })
      return
    }

    const { sessionId, guessedPrice, confidence } = message

    try {
      // 检查会话状态
      const session = await this.prisma.biddingSession.findUnique({
        where: { id: sessionId }
      })

      if (!session || session.status !== 'ACTIVE') {
        this.sendToClient(clientId, {
          type: 'error',
          message: 'Session is not active',
          code: 'SESSION_INACTIVE'
        })
        return
      }

      // 检查用户是否已经竞猜过
      const existingGuess = await this.prisma.priceGuess.findUnique({
        where: {
          sessionId_userId: {
            sessionId,
            userId: client.userId
          }
        }
      })

      if (existingGuess) {
        this.sendToClient(clientId, {
          type: 'error',
          message: 'Already submitted guess for this session',
          code: 'ALREADY_GUESSED'
        })
        return
      }

      // 检查用户积分是否足够
      const user = await this.prisma.user.findUnique({
        where: { id: client.userId }
      })

      if (!user || user.credits < 10) {
        this.sendToClient(clientId, {
          type: 'error',
          message: 'Insufficient credits',
          code: 'INSUFFICIENT_CREDITS'
        })
        return
      }

      // 创建竞猜记录
      await this.prisma.priceGuess.create({
        data: {
          sessionId,
          userId: client.userId,
          guessedPrice,
          confidence,
          stakeAmount: 10,
          basedOnDiscussion: session.enhancedByDiscussion
        }
      })

      // 扣除积分
      await this.prisma.user.update({
        where: { id: client.userId },
        data: {
          credits: { decrement: 10 },
          totalGuesses: { increment: 1 }
        }
      })

      // 创建积分交易记录
      await this.prisma.creditTransaction.create({
        data: {
          userId: client.userId,
          amount: -10,
          type: 'RESEARCH_COST',
          description: `价格竞猜投注 - 会话 ${sessionId.slice(0, 8)}`,
          relatedId: sessionId,
          balanceBefore: user.credits,
          balanceAfter: user.credits - 10
        }
      })

      // 记录用户行为
      await this.recordUserBehavior(client.userId, sessionId, 'submit_guess', {
        guessedPrice,
        confidence,
        stakeAmount: 10
      })

      // 发送成功消息
      this.sendToClient(clientId, {
        type: 'guess_submitted',
        sessionId,
        guess: {
          guessedPrice,
          confidence,
          stakeAmount: 10
        },
        newBalance: user.credits - 10
      })

      // 向会话广播（不透露具体金额）
      this.broadcastToSession(sessionId, {
        type: 'new_guess_submitted',
        totalGuesses: await this.getSessionGuessCount(sessionId)
      }, clientId)

      console.log(`User ${client.userId} submitted guess for session ${sessionId}`)

    } catch (error) {
      console.error('Error handling submit guess:', error)
      this.sendToClient(clientId, {
        type: 'error',
        message: 'Failed to submit guess',
        code: 'SUBMIT_ERROR'
      })
    }
  }

  // 处理支持AI
  private async handleSupportAgent(clientId: string, message: any) {
    const client = this.clients.get(clientId)
    if (!client || !client.sessionId) return

    const { sessionId, agentName } = message

    try {
      if (client.userId) {
        await this.recordUserBehavior(client.userId, sessionId, 'support_agent', {
          agentName
        })
      }

      // 向会话广播支持事件
      this.broadcastToSession(sessionId, {
        type: 'agent_supported',
        agentName,
        supportCount: await this.getAgentSupportCount(sessionId, agentName)
      })

      this.sendToClient(clientId, {
        type: 'agent_support_recorded',
        agentName
      })

    } catch (error) {
      console.error('Error handling support agent:', error)
    }
  }

  // 处理对话反应
  private async handleReactToDialogue(clientId: string, message: any) {
    const client = this.clients.get(clientId)
    if (!client || !client.sessionId) return

    const { sessionId, reaction, agentName } = message

    try {
      if (client.userId) {
        await this.recordUserBehavior(client.userId, sessionId, 'react_to_dialogue', {
          reaction,
          agentName
        })
      }

      // 向会话广播反应事件
      this.broadcastToSession(sessionId, {
        type: 'dialogue_reaction',
        reaction,
        agentName,
        reactionCount: await this.getReactionCount(sessionId, reaction)
      })

    } catch (error) {
      console.error('Error handling react to dialogue:', error)
    }
  }

  // 广播AI出价事件
  public async broadcastNewBid(sessionId: string, bidData: any) {
    const sessionState = this.sessions.get(sessionId)
    if (sessionState) {
      sessionState.currentPrice = bidData.amount
      sessionState.lastActivity = new Date()
    }

    this.broadcastToSession(sessionId, {
      type: 'new_bid',
      bid: bidData,
      timestamp: Date.now()
    })
  }

  // 广播AI交互事件
  public async broadcastAIInteraction(sessionId: string, interactionData: any) {
    this.broadcastToSession(sessionId, {
      type: 'ai_interaction',
      interaction: interactionData,
      timestamp: Date.now()
    })
  }

  // 广播竞价结束事件
  public async broadcastBiddingEnd(sessionId: string, results: any) {
    const sessionState = this.sessions.get(sessionId)
    if (sessionState) {
      sessionState.status = 'ENDED'
      sessionState.phase = 'RESULTS'
    }

    this.broadcastToSession(sessionId, {
      type: 'bidding_ended',
      results,
      timestamp: Date.now()
    })
  }

  // 工具方法

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getClientIP(req: IncomingMessage): string {
    return req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() ||
           req.headers['x-real-ip']?.toString() ||
           req.socket.remoteAddress ||
           'unknown'
  }

  private checkRateLimit(clientId: string): boolean {
    const now = Date.now()
    const limit = this.rateLimiter.get(clientId)

    if (!limit) {
      this.rateLimiter.set(clientId, { count: 1, resetTime: now + 60000 })
      return true
    }

    if (now > limit.resetTime) {
      limit.count = 1
      limit.resetTime = now + 60000
      return true
    }

    if (limit.count >= this.config.messageRateLimit) {
      return false
    }

    limit.count++
    return true
  }

  private sendToClient(clientId: string, message: any) {
    const client = this.clients.get(clientId)
    if (client && client.ws.readyState === WebSocket.OPEN) {
      try {
        client.ws.send(JSON.stringify(message))
      } catch (error) {
        console.error(`Error sending message to client ${clientId}:`, error)
      }
    }
  }

  private broadcastToSession(sessionId: string, message: any, excludeClientId?: string) {
    this.clients.forEach((client, clientId) => {
      if (client.sessionId === sessionId && clientId !== excludeClientId) {
        this.sendToClient(clientId, message)
      }
    })
  }

  private getSessionViewers(sessionId: string): number {
    return Array.from(this.clients.values()).filter(client =>
      client.sessionId === sessionId
    ).length
  }

  private calculateTimeRemaining(session: any): number {
    if (!session.startedAt || session.status !== 'ACTIVE') return 0

    const elapsed = Date.now() - new Date(session.startedAt).getTime()
    const total = session.durationSeconds * 1000

    return Math.max(0, Math.floor((total - elapsed) / 1000))
  }

  private async updateSessionViewerCount(sessionId: string, viewerCount: number) {
    try {
      await this.prisma.biddingSession.update({
        where: { id: sessionId },
        data: {
          viewerCount,
          maxViewerCount: { set: Math.max(viewerCount, 0) }
        }
      })
    } catch (error) {
      console.error('Error updating viewer count:', error)
    }
  }

  private async recordUserBehavior(userId: string, sessionId: string, actionType: string, actionData?: any) {
    try {
      await this.prisma.userBiddingBehavior.create({
        data: {
          userId,
          sessionId,
          actionType: actionType as any,
          actionData: actionData ? JSON.stringify(actionData) : undefined
        }
      })
    } catch (error) {
      console.error('Error recording user behavior:', error)
    }
  }

  private async getSessionGuessCount(sessionId: string): Promise<number> {
    return this.prisma.priceGuess.count({
      where: { sessionId }
    })
  }

  private async getAgentSupportCount(sessionId: string, agentName: string): Promise<number> {
    return this.prisma.userBiddingBehavior.count({
      where: {
        sessionId,
        actionType: 'support_agent',
        agentName
      }
    })
  }

  private async getReactionCount(sessionId: string, reaction: string): Promise<number> {
    return this.prisma.userBiddingBehavior.count({
      where: {
        sessionId,
        actionType: 'react_to_dialogue',
        actionData: {
          path: ['reaction'],
          equals: reaction
        }
      }
    })
  }

  // 心跳检测
  private startHeartbeat() {
    setInterval(() => {
      this.wss.clients.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.ping()
        }
      })
    }, this.config.heartbeatInterval)
  }

  private handlePong(clientId: string) {
    const client = this.clients.get(clientId)
    if (client) {
      client.lastActivity = new Date()
    }
  }

  // 会话清理
  private startSessionCleanup() {
    setInterval(() => {
      this.cleanupInactiveSessions()
      this.cleanupInactiveClients()
    }, 5 * 60 * 1000) // 每5分钟清理一次
  }

  private cleanupInactiveSessions() {
    const now = Date.now()
    this.sessions.forEach((session, sessionId) => {
      const inactiveTime = now - session.lastActivity.getTime()
      if (inactiveTime > this.config.sessionTimeout) {
        this.sessions.delete(sessionId)
        console.log(`Cleaned up inactive session: ${sessionId}`)
      }
    })
  }

  private cleanupInactiveClients() {
    const now = Date.now()
    this.clients.forEach((client, clientId) => {
      const inactiveTime = now - client.lastActivity.getTime()
      if (inactiveTime > this.config.sessionTimeout) {
        this.handleDisconnection(clientId)
      }
    })
  }

  private handleDisconnection(clientId: string) {
    const client = this.clients.get(clientId)
    if (!client) return

    // 从会话中移除用户
    if (client.sessionId) {
      const sessionState = this.sessions.get(client.sessionId)
      if (sessionState) {
        sessionState.viewers = Math.max(0, sessionState.viewers - 1)
        if (client.userId) {
          sessionState.participants.delete(client.userId)
        }

        this.broadcastToSession(client.sessionId, {
          type: 'viewer_left',
          viewers: sessionState.viewers
        }, clientId)

        this.updateSessionViewerCount(client.sessionId, sessionState.viewers)
      }
    }

    this.clients.delete(clientId)
    console.log(`WebSocket client disconnected: ${clientId}`)
  }

  private handleClientError(clientId: string, error: Error) {
    console.error(`WebSocket client error ${clientId}:`, error)
    this.handleDisconnection(clientId)
  }

  private handleServerError(error: Error) {
    console.error('WebSocket server error:', error)
  }

  // 优雅关闭
  private async gracefulShutdown() {
    console.log('WebSocket server shutting down gracefully...')

    // 通知所有客户端服务器即将关闭
    this.clients.forEach((client, clientId) => {
      this.sendToClient(clientId, {
        type: 'server_shutdown',
        message: 'Server is shutting down'
      })
    })

    // 关闭所有连接
    this.wss.clients.forEach((ws) => {
      ws.terminate()
    })

    // 关闭WebSocket服务器
    this.wss.close(() => {
      console.log('WebSocket server closed')
      process.exit(0)
    })
  }

  // 处理用户补充消息
  private async handleUserSupplement(clientId: string, message: any) {
    const client = this.clients.get(clientId)
    if (!client || !client.sessionId) return

    const { payload } = message
    const { content, triggerExtension } = payload

    try {
      // 记录用户补充内容
      if (client.userId) {
        await this.recordUserBehavior(client.userId, client.sessionId, 'user_supplement', {
          content,
          triggerExtension
        })
      }

      // 向会话广播用户补充
      this.broadcastToSession(client.sessionId, {
        type: 'user_message',
        userId: client.userId,
        content,
        timestamp: Date.now()
      })

      // 如果需要触发时间顺延
      if (triggerExtension) {
        await this.extendPhaseTime(client.sessionId, 60, 'user_interaction')
      }

      this.sendToClient(clientId, {
        type: 'supplement_recorded',
        content
      })

    } catch (error) {
      console.error('Error handling user supplement:', error)
    }
  }

  // 处理阶段时间顺延
  private async handleExtendPhase(clientId: string, message: any) {
    const client = this.clients.get(clientId)
    if (!client || !client.sessionId) return

    const { payload } = message
    const { extensionSeconds, reason } = payload

    try {
      await this.extendPhaseTime(client.sessionId, extensionSeconds, reason)
    } catch (error) {
      console.error('Error handling extend phase:', error)
      this.sendToClient(clientId, {
        type: 'error',
        message: 'Failed to extend phase time',
        code: 'EXTEND_ERROR'
      })
    }
  }

  // 顺延阶段时间的核心方法
  private async extendPhaseTime(sessionId: string, extensionSeconds: number, reason: string) {
    const sessionState = this.sessions.get(sessionId)
    if (!sessionState || sessionState.phaseExtended) {
      return // 会话不存在或已经顺延过
    }

    // 更新会话状态
    sessionState.phaseExtended = true
    sessionState.extensionTime = extensionSeconds
    sessionState.timeRemaining += extensionSeconds

    console.log(`⏰ Phase extended for session ${sessionId}: +${extensionSeconds}s (${reason})`)

    // 向所有会话参与者广播时间顺延
    this.broadcastToSession(sessionId, {
      type: 'time_extended',
      extensionSeconds,
      newTimeRemaining: sessionState.timeRemaining,
      reason,
      timestamp: Date.now()
    })

    // 记录到数据库（如果需要）
    try {
      // 这里可以添加数据库记录逻辑
      // await this.recordPhaseExtension(sessionId, extensionSeconds, reason)
    } catch (error) {
      console.warn('Failed to record phase extension to database:', error)
    }
  }

  // 获取服务器统计信息
  public getStats() {
    return {
      totalClients: this.clients.size,
      totalSessions: this.sessions.size,
      activeSessions: Array.from(this.sessions.values()).filter(s => s.status === 'ACTIVE').length,
      totalViewers: Array.from(this.sessions.values()).reduce((sum, s) => sum + s.viewers, 0),
      extendedSessions: Array.from(this.sessions.values()).filter(s => s.phaseExtended).length
    }
  }
}

// 导出类型
export type { ClientInfo, SessionState }
export { WSMessageSchema }