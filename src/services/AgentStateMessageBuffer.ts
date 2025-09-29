/**
 * Agent状态消息缓冲管理器
 * 优化WebSocket消息处理性能，减少UI重渲染
 */

import { BiddingPhase, type AgentState } from '@/components/bidding/AgentDialogPanel'
import { type AgentStateMessage } from '@/hooks/useAgentStates'

// 缓冲配置
interface BufferConfig {
  maxBufferSize: number        // 最大缓冲消息数
  flushInterval: number        // 刷新间隔(ms)
  priorityThreshold: number    // 优先级消息阈值
  batchSize: number           // 批处理大小
}

// 消息优先级
enum MessagePriority {
  LOW = 1,      // 普通状态更新
  NORMAL = 2,   // 常规消息
  HIGH = 3,     // 重要状态变化
  CRITICAL = 4  // 紧急更新（立即处理）
}

// 缓冲的消息项
interface BufferedMessage {
  id: string
  message: AgentStateMessage
  timestamp: number
  priority: MessagePriority
  retryCount: number
}

// 批处理结果
interface BatchResult {
  processedCount: number
  errorCount: number
  errors: Array<{ messageId: string; error: Error }>
}

export class AgentStateMessageBuffer {
  private buffer: Map<string, BufferedMessage> = new Map()
  private flushTimer: NodeJS.Timeout | null = null
  private config: BufferConfig
  private isProcessing = false
  private stats = {
    messagesReceived: 0,
    messagesProcessed: 0,
    messagesFailed: 0,
    averageProcessingTime: 0,
    lastFlushTime: 0
  }

  // 消息处理回调
  private onFlush?: (messages: AgentStateMessage[]) => Promise<void>
  private onError?: (error: Error, messageId: string) => void
  private onStatsUpdate?: (stats: typeof this.stats) => void

  constructor(
    config: Partial<BufferConfig> = {},
    callbacks: {
      onFlush?: (messages: AgentStateMessage[]) => Promise<void>
      onError?: (error: Error, messageId: string) => void
      onStatsUpdate?: (stats: typeof AgentStateMessageBuffer.prototype.stats) => void
    } = {}
  ) {
    this.config = {
      maxBufferSize: 50,
      flushInterval: 100,
      priorityThreshold: MessagePriority.HIGH,
      batchSize: 10,
      ...config
    }

    this.onFlush = callbacks.onFlush
    this.onError = callbacks.onError
    this.onStatsUpdate = callbacks.onStatsUpdate

    this.startPeriodicFlush()
  }

  /**
   * 添加消息到缓冲区
   */
  addMessage(message: AgentStateMessage): void {
    const priority = this.calculatePriority(message)
    const messageId = this.generateMessageId(message)

    const bufferedMessage: BufferedMessage = {
      id: messageId,
      message,
      timestamp: Date.now(),
      priority,
      retryCount: 0
    }

    // 高优先级或紧急消息立即处理
    if (priority >= this.config.priorityThreshold) {
      this.processMessage(bufferedMessage)
      return
    }

    // 添加到缓冲区
    this.buffer.set(messageId, bufferedMessage)
    this.stats.messagesReceived++

    // 检查缓冲区大小，超限时强制刷新
    if (this.buffer.size >= this.config.maxBufferSize) {
      this.flush()
    }

    // 去重：移除相同Agent的旧消息
    this.deduplicateMessages(message.personaId)
  }

  /**
   * 计算消息优先级
   */
  private calculatePriority(message: AgentStateMessage): MessagePriority {
    switch (message.type) {
      case 'agent_thinking':
        return MessagePriority.LOW

      case 'agent_speaking':
        return MessagePriority.HIGH

      case 'agent_bidding':
        return MessagePriority.CRITICAL

      case 'agent_emotion_change':
        // 情绪变化根据具体情绪判断优先级
        const emotion = message.payload.emotion
        if (emotion === 'excited' || emotion === 'aggressive') {
          return MessagePriority.HIGH
        }
        return MessagePriority.NORMAL

      default:
        return MessagePriority.NORMAL
    }
  }

  /**
   * 生成消息ID
   */
  private generateMessageId(message: AgentStateMessage): string {
    return `${message.personaId}_${message.type}_${Date.now()}`
  }

  /**
   * 去重相同Agent的消息
   */
  private deduplicateMessages(personaId: string): void {
    const messagesToRemove: string[] = []

    // 保留最新的3条消息，移除更旧的
    const agentMessages = Array.from(this.buffer.values())
      .filter(msg => msg.message.personaId === personaId)
      .sort((a, b) => b.timestamp - a.timestamp)

    if (agentMessages.length > 3) {
      const toRemove = agentMessages.slice(3)
      toRemove.forEach(msg => {
        this.buffer.delete(msg.id)
      })
    }
  }

  /**
   * 处理单个消息
   */
  private async processMessage(message: BufferedMessage): Promise<void> {
    try {
      if (this.onFlush) {
        await this.onFlush([message.message])
      }
      this.stats.messagesProcessed++
    } catch (error) {
      this.stats.messagesFailed++
      this.onError?.(error as Error, message.id)

      // 重试机制
      if (message.retryCount < 3) {
        message.retryCount++
        message.timestamp = Date.now() + 1000 * message.retryCount // 延迟重试
        this.buffer.set(message.id, message)
      }
    }
  }

  /**
   * 刷新缓冲区
   */
  async flush(): Promise<BatchResult> {
    if (this.buffer.size === 0 || this.isProcessing) {
      return { processedCount: 0, errorCount: 0, errors: [] }
    }

    this.isProcessing = true
    const startTime = Date.now()
    const result: BatchResult = {
      processedCount: 0,
      errorCount: 0,
      errors: []
    }

    try {
      // 按优先级和时间排序
      const messages = Array.from(this.buffer.values())
        .sort((a, b) => {
          if (a.priority !== b.priority) {
            return b.priority - a.priority // 高优先级在前
          }
          return a.timestamp - b.timestamp // 早期消息在前
        })

      // 批量处理
      const batches = this.createBatches(messages, this.config.batchSize)

      for (const batch of batches) {
        try {
          const batchMessages = batch.map(msg => msg.message)

          if (this.onFlush) {
            await this.onFlush(batchMessages)
          }

          // 移除已处理的消息
          batch.forEach(msg => {
            this.buffer.delete(msg.id)
            result.processedCount++
          })

        } catch (error) {
          result.errorCount += batch.length
          batch.forEach(msg => {
            result.errors.push({
              messageId: msg.id,
              error: error as Error
            })
            this.onError?.(error as Error, msg.id)
          })
        }
      }

      // 更新统计
      const processingTime = Date.now() - startTime
      this.stats.averageProcessingTime =
        (this.stats.averageProcessingTime + processingTime) / 2
      this.stats.lastFlushTime = Date.now()
      this.stats.messagesProcessed += result.processedCount
      this.stats.messagesFailed += result.errorCount

      this.onStatsUpdate?.(this.stats)

    } finally {
      this.isProcessing = false
    }

    return result
  }

  /**
   * 创建批次
   */
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = []
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize))
    }
    return batches
  }

  /**
   * 启动定期刷新
   */
  private startPeriodicFlush(): void {
    this.flushTimer = setInterval(() => {
      if (this.buffer.size > 0) {
        this.flush()
      }
    }, this.config.flushInterval)
  }

  /**
   * 停止缓冲器
   */
  stop(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
      this.flushTimer = null
    }

    // 处理剩余消息
    if (this.buffer.size > 0) {
      this.flush()
    }
  }

  /**
   * 获取缓冲区状态
   */
  getStatus() {
    return {
      bufferSize: this.buffer.size,
      isProcessing: this.isProcessing,
      stats: { ...this.stats },
      config: { ...this.config }
    }
  }

  /**
   * 清空缓冲区
   */
  clear(): void {
    this.buffer.clear()
  }

  /**
   * 获取待处理消息数量
   */
  getPendingCount(): number {
    return this.buffer.size
  }

  /**
   * 获取指定Agent的待处理消息
   */
  getPendingMessagesForAgent(personaId: string): AgentStateMessage[] {
    return Array.from(this.buffer.values())
      .filter(msg => msg.message.personaId === personaId)
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(msg => msg.message)
  }

  /**
   * 强制处理指定Agent的消息
   */
  async forceFlushAgent(personaId: string): Promise<void> {
    const agentMessages = Array.from(this.buffer.values())
      .filter(msg => msg.message.personaId === personaId)

    if (agentMessages.length === 0) return

    try {
      const messages = agentMessages.map(msg => msg.message)

      if (this.onFlush) {
        await this.onFlush(messages)
      }

      // 移除已处理的消息
      agentMessages.forEach(msg => {
        this.buffer.delete(msg.id)
      })

      this.stats.messagesProcessed += agentMessages.length

    } catch (error) {
      this.stats.messagesFailed += agentMessages.length
      agentMessages.forEach(msg => {
        this.onError?.(error as Error, msg.id)
      })
    }
  }
}

// 工厂函数
export function createAgentStateBuffer(
  config?: Partial<BufferConfig>,
  callbacks?: {
    onFlush?: (messages: AgentStateMessage[]) => Promise<void>
    onError?: (error: Error, messageId: string) => void
    onStatsUpdate?: (stats: any) => void
  }
): AgentStateMessageBuffer {
  return new AgentStateMessageBuffer(config, callbacks)
}

export default AgentStateMessageBuffer