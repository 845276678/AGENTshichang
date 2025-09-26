// 竞价系统专用监控
import { MonitoringManager } from './monitoring-manager'
import { AIServiceProvider } from '../ai/ai-service-manager'

// 竞价系统指标
export class BiddingMetrics {
  private monitoring: MonitoringManager

  constructor(monitoring: MonitoringManager) {
    this.monitoring = monitoring
  }

  // ==================== 会话指标 ====================

  // 会话开始
  sessionStarted(sessionId: string, ideaId: string, enhanced: boolean): void {
    this.monitoring.counter('bidding_sessions_started_total', 1, {
      idea_id: ideaId,
      enhanced: enhanced.toString()
    })

    this.monitoring.info('Bidding session started', {
      sessionId,
      ideaId,
      enhanced,
      component: 'bidding'
    })
  }

  // 会话结束
  sessionEnded(
    sessionId: string,
    duration: number,
    participants: number,
    maxViewers: number,
    totalBids: number,
    finalPrice: number
  ): void {
    this.monitoring.counter('bidding_sessions_completed_total', 1)
    this.monitoring.histogram('bidding_session_duration_seconds', duration / 1000)
    this.monitoring.histogram('bidding_session_participants', participants)
    this.monitoring.histogram('bidding_session_max_viewers', maxViewers)
    this.monitoring.histogram('bidding_session_total_bids', totalBids)
    this.monitoring.histogram('bidding_session_final_price', finalPrice)

    this.monitoring.info('Bidding session ended', {
      sessionId,
      duration,
      participants,
      maxViewers,
      totalBids,
      finalPrice,
      component: 'bidding'
    })
  }

  // 会话取消
  sessionCancelled(sessionId: string, reason: string): void {
    this.monitoring.counter('bidding_sessions_cancelled_total', 1, {
      reason
    })

    this.monitoring.warn('Bidding session cancelled', {
      sessionId,
      reason,
      component: 'bidding'
    })
  }

  // 会话错误
  sessionError(sessionId: string, error: Error, stage: string): void {
    this.monitoring.counter('bidding_sessions_error_total', 1, {
      stage
    })

    this.monitoring.error('Bidding session error', {
      sessionId,
      stage,
      component: 'bidding'
    }, error)
  }

  // ==================== 用户参与指标 ====================

  // 用户加入会话
  userJoinedSession(sessionId: string, userId: string, isAuthenticated: boolean): void {
    this.monitoring.counter('bidding_users_joined_total', 1, {
      authenticated: isAuthenticated.toString()
    })

    this.monitoring.debug('User joined bidding session', {
      sessionId,
      userId,
      isAuthenticated,
      component: 'bidding'
    })
  }

  // 用户离开会话
  userLeftSession(sessionId: string, userId: string, duration: number): void {
    this.monitoring.counter('bidding_users_left_total', 1)
    this.monitoring.histogram('bidding_user_session_duration_seconds', duration / 1000)

    this.monitoring.debug('User left bidding session', {
      sessionId,
      userId,
      duration,
      component: 'bidding'
    })
  }

  // 价格竞猜提交
  guessSubmitted(
    sessionId: string,
    userId: string,
    guessedPrice: number,
    confidence: number,
    stakeAmount: number
  ): void {
    this.monitoring.counter('bidding_guesses_submitted_total', 1)
    this.monitoring.histogram('bidding_guess_price', guessedPrice)
    this.monitoring.histogram('bidding_guess_confidence', confidence)
    this.monitoring.histogram('bidding_guess_stake_amount', stakeAmount)

    this.monitoring.info('Price guess submitted', {
      sessionId,
      userId,
      guessedPrice,
      confidence,
      stakeAmount,
      component: 'bidding'
    })
  }

  // 竞猜结果
  guessResult(
    sessionId: string,
    userId: string,
    accuracy: number,
    reward: number
  ): void {
    this.monitoring.histogram('bidding_guess_accuracy', accuracy)
    this.monitoring.histogram('bidding_guess_reward', reward)

    this.monitoring.info('Guess result calculated', {
      sessionId,
      userId,
      accuracy,
      reward,
      component: 'bidding'
    })
  }

  // ==================== AI系统指标 ====================

  // AI出价
  aiBidGenerated(
    sessionId: string,
    agentName: string,
    provider: AIServiceProvider,
    amount: number,
    confidence: number,
    responseTime: number,
    cost: number,
    isScripted: boolean
  ): void {
    this.monitoring.counter('ai_bids_generated_total', 1, {
      agent: agentName,
      provider,
      scripted: isScripted.toString()
    })

    this.monitoring.histogram('ai_bid_amount', amount)
    this.monitoring.histogram('ai_bid_confidence', confidence)
    this.monitoring.histogram('ai_bid_response_time_ms', responseTime)
    this.monitoring.histogram('ai_bid_cost', cost)

    this.monitoring.debug('AI bid generated', {
      sessionId,
      agentName,
      provider,
      amount,
      confidence,
      responseTime,
      cost,
      isScripted,
      component: 'ai_bidding'
    })
  }

  // AI交互生成
  aiInteractionGenerated(
    sessionId: string,
    agentName: string,
    provider: AIServiceProvider,
    interactionType: string,
    responseTime: number,
    cost: number,
    qualityScore: number
  ): void {
    this.monitoring.counter('ai_interactions_generated_total', 1, {
      agent: agentName,
      provider,
      type: interactionType
    })

    this.monitoring.histogram('ai_interaction_response_time_ms', responseTime)
    this.monitoring.histogram('ai_interaction_cost', cost)
    this.monitoring.histogram('ai_interaction_quality_score', qualityScore)

    this.monitoring.debug('AI interaction generated', {
      sessionId,
      agentName,
      provider,
      interactionType,
      responseTime,
      cost,
      qualityScore,
      component: 'ai_bidding'
    })
  }

  // AI服务错误
  aiServiceError(
    provider: AIServiceProvider,
    errorType: string,
    sessionId?: string,
    agentName?: string
  ): void {
    this.monitoring.counter('ai_service_errors_total', 1, {
      provider,
      error_type: errorType
    })

    this.monitoring.error('AI service error', {
      provider,
      errorType,
      sessionId,
      agentName,
      component: 'ai_service'
    })
  }

  // AI服务配额超限
  aiQuotaExceeded(provider: AIServiceProvider, quotaType: 'daily' | 'monthly' | 'rate'): void {
    this.monitoring.counter('ai_quota_exceeded_total', 1, {
      provider,
      quota_type: quotaType
    })

    this.monitoring.warn('AI quota exceeded', {
      provider,
      quotaType,
      component: 'ai_service'
    })
  }

  // ==================== WebSocket连接指标 ====================

  // WebSocket连接建立
  websocketConnected(clientId: string, userAgent?: string): void {
    this.monitoring.counter('websocket_connections_total', 1)
    this.monitoring.gauge('websocket_active_connections', this.getActiveConnections())

    this.monitoring.debug('WebSocket connected', {
      clientId,
      userAgent,
      component: 'websocket'
    })
  }

  // WebSocket连接断开
  websocketDisconnected(clientId: string, reason: string, duration: number): void {
    this.monitoring.counter('websocket_disconnections_total', 1, {
      reason
    })

    this.monitoring.gauge('websocket_active_connections', this.getActiveConnections())
    this.monitoring.histogram('websocket_connection_duration_seconds', duration / 1000)

    this.monitoring.debug('WebSocket disconnected', {
      clientId,
      reason,
      duration,
      component: 'websocket'
    })
  }

  // WebSocket消息发送
  websocketMessageSent(type: string, recipientCount: number): void {
    this.monitoring.counter('websocket_messages_sent_total', 1, {
      message_type: type
    })

    this.monitoring.histogram('websocket_message_recipients', recipientCount)
  }

  // WebSocket消息接收
  websocketMessageReceived(type: string, clientId: string, processingTime: number): void {
    this.monitoring.counter('websocket_messages_received_total', 1, {
      message_type: type
    })

    this.monitoring.histogram('websocket_message_processing_time_ms', processingTime)

    this.monitoring.trace('WebSocket message received', {
      type,
      clientId,
      processingTime,
      component: 'websocket'
    })
  }

  // WebSocket错误
  websocketError(clientId: string, error: Error, stage: string): void {
    this.monitoring.counter('websocket_errors_total', 1, {
      stage
    })

    this.monitoring.error('WebSocket error', {
      clientId,
      stage,
      component: 'websocket'
    }, error)
  }

  // ==================== 缓存指标 ====================

  // 缓存命中
  cacheHit(cacheType: string, key: string): void {
    this.monitoring.counter('cache_hits_total', 1, {
      cache_type: cacheType
    })
  }

  // 缓存未命中
  cacheMiss(cacheType: string, key: string): void {
    this.monitoring.counter('cache_misses_total', 1, {
      cache_type: cacheType
    })
  }

  // 缓存设置
  cacheSet(cacheType: string, key: string, ttl: number): void {
    this.monitoring.counter('cache_sets_total', 1, {
      cache_type: cacheType
    })

    this.monitoring.histogram('cache_ttl_seconds', ttl)
  }

  // 缓存错误
  cacheError(cacheType: string, operation: string, error: Error): void {
    this.monitoring.counter('cache_errors_total', 1, {
      cache_type: cacheType,
      operation
    })

    this.monitoring.error('Cache error', {
      cacheType,
      operation,
      component: 'cache'
    }, error)
  }

  // ==================== 业务指标 ====================

  // 讨论完成率
  discussionCompletionRate(completed: number, total: number): void {
    const rate = total > 0 ? completed / total : 0
    this.monitoring.gauge('discussion_completion_rate', rate)
    this.monitoring.histogram('discussions_completed', completed)
    this.monitoring.histogram('discussions_total', total)
  }

  // 用户停留时间分布
  userEngagementTime(sessionId: string, userId: string, timeSpent: number, phase: string): void {
    this.monitoring.histogram('user_engagement_time_seconds', timeSpent / 1000, {
      phase
    })

    this.monitoring.debug('User engagement tracked', {
      sessionId,
      userId,
      timeSpent,
      phase,
      component: 'engagement'
    })
  }

  // 积分消费和奖励
  creditsTransaction(
    userId: string,
    type: 'spend' | 'earn',
    amount: number,
    source: string
  ): void {
    this.monitoring.counter('credits_transactions_total', 1, {
      type,
      source
    })

    this.monitoring.histogram('credits_amount', Math.abs(amount), {
      type,
      source
    })

    this.monitoring.info('Credits transaction', {
      userId,
      type,
      amount,
      source,
      component: 'credits'
    })
  }

  // 竞价准确度统计
  biddingAccuracy(
    sessionId: string,
    actualPrice: number,
    aiPredictions: number[],
    userPredictions: number[]
  ): void {
    // AI预测准确度
    aiPredictions.forEach((prediction, index) => {
      const accuracy = 1 - Math.abs(prediction - actualPrice) / actualPrice
      this.monitoring.histogram('ai_prediction_accuracy', Math.max(0, accuracy), {
        agent_index: index.toString()
      })
    })

    // 用户预测准确度
    userPredictions.forEach(prediction => {
      const accuracy = 1 - Math.abs(prediction - actualPrice) / actualPrice
      this.monitoring.histogram('user_prediction_accuracy', Math.max(0, accuracy))
    })

    this.monitoring.info('Bidding accuracy calculated', {
      sessionId,
      actualPrice,
      aiPredictionCount: aiPredictions.length,
      userPredictionCount: userPredictions.length,
      component: 'accuracy'
    })
  }

  // ==================== 工具方法 ====================

  private getActiveConnections(): number {
    // 这个方法需要访问WebSocket服务器的连接数
    // 实际实现中应该从WebSocket服务器获取
    return 0
  }

  // ==================== 仪表盘数据 ====================

  async getDashboardMetrics(): Promise<{
    activeSessions: number
    totalUsers: number
    avgSessionDuration: number
    totalBidsToday: number
    aiServiceHealth: Record<string, number>
    cacheHitRate: number
    errorRate: number
  }> {
    const now = new Date()
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    try {
      // 从监控系统获取今日指标
      const [
        activeSessions,
        totalBidsToday,
        avgSessionDuration,
        cacheHits,
        cacheMisses,
        totalErrors
      ] = await Promise.all([
        this.monitoring.getMetrics('bidding_sessions_active', dayStart, now),
        this.monitoring.getMetrics('ai_bids_generated_total', dayStart, now),
        this.monitoring.getMetrics('bidding_session_duration_seconds', dayStart, now),
        this.monitoring.getMetrics('cache_hits_total', dayStart, now),
        this.monitoring.getMetrics('cache_misses_total', dayStart, now),
        this.monitoring.getMetrics('websocket_errors_total', dayStart, now)
      ])

      const totalCacheRequests = cacheHits.length + cacheMisses.length
      const cacheHitRate = totalCacheRequests > 0 ? cacheHits.length / totalCacheRequests : 1

      const totalRequests = totalBidsToday.length + 1 // 避免除零
      const errorRate = totalErrors.length / totalRequests

      return {
        activeSessions: activeSessions.length,
        totalUsers: 0, // 需要从其他来源获取
        avgSessionDuration: avgSessionDuration.reduce((sum, item) => sum + item.value, 0) / avgSessionDuration.length || 0,
        totalBidsToday: totalBidsToday.length,
        aiServiceHealth: {
          [AIServiceProvider.DEEPSEEK]: 0.95,
          [AIServiceProvider.ZHIPU]: 0.92,
          [AIServiceProvider.ALI]: 0.88,
          [AIServiceProvider.MOONSHOT]: 0.90
        },
        cacheHitRate,
        errorRate
      }
    } catch (error) {
      this.monitoring.error('Failed to get dashboard metrics', { component: 'dashboard' }, error)

      return {
        activeSessions: 0,
        totalUsers: 0,
        avgSessionDuration: 0,
        totalBidsToday: 0,
        aiServiceHealth: {},
        cacheHitRate: 0,
        errorRate: 0
      }
    }
  }
}

// 创建全局竞价指标实例
let biddingMetricsInstance: BiddingMetrics | null = null

export function getBiddingMetrics(monitoring: MonitoringManager): BiddingMetrics {
  if (!biddingMetricsInstance) {
    biddingMetricsInstance = new BiddingMetrics(monitoring)
  }
  return biddingMetricsInstance
}