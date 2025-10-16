'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { AI_PERSONAS, type AIPersona } from '@/lib/ai-persona-enhanced'

const MotionDiv = ({ children, className, style, ...props }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => (
  <div className={className} style={style} {...props}>{children}</div>
)
const AnimatePresence = ({ children }: { children: React.ReactNode }) => <>{children}</>

import { type AIMessage } from '@/lib/ai-persona-system'
import { AnimatedMaturityScoreCard, WorkshopRecommendations, ImprovementSuggestions } from '@/components/maturity'
import type { MaturityScoreResult } from '@/lib/business-plan/maturity-scorer'
import { useFixedBiddingWebSocket } from '@/hooks/useFixedBiddingWebSocket'
import { useAgentStates, PhasePermissionManager } from '@/hooks/useAgentStates'
import { agentStateManager } from '@/services/AgentStateManager'
import { tokenStorage } from '@/lib/token-storage'
import { useAgentConversations } from '@/hooks/useAgentConversations'

// Import our new components
import { AgentDialogPanel, BiddingPhase, type AgentState } from './AgentDialogPanel'
import PhaseStatusBar from './PhaseStatusBar'
import EnhancedSupplementPanel, { type SupplementCategory } from './EnhancedSupplementPanel'
import { extractUserContext } from '@/lib/business-plan/context-extractor'
import './AgentDialogPanel.css'

import {
  Wifi,
  WifiOff,
  Users,
  TrendingUp,
  Settings,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Trophy,
  FileText,
  Loader2,
  Send,
  MessageSquarePlus,
  AlertCircle
} from 'lucide-react'

// 简化组件替代motion - 避免生产环境错误




// 使用简化组件替代motion组件


// Props interface
interface UnifiedBiddingStageProps {
  ideaId: string
  sessionId?: string | null
  ideaContent?: string
  onSupportPersona?: (personaId: string) => void
  onPhaseChange?: (phase: string) => void
  className?: string
}

// 阶段映射函数（将WebSocket阶段映射到我们的BiddingPhase）
const mapWebSocketPhase = (wsPhase: string): BiddingPhase => {
  const phaseMap: Record<string, BiddingPhase> = {
    'warmup': BiddingPhase.AGENT_WARMUP,
    'discussion': BiddingPhase.AGENT_DISCUSSION,
    'bidding': BiddingPhase.AGENT_BIDDING,
    'prediction': BiddingPhase.USER_SUPPLEMENT,
    'result': BiddingPhase.RESULT_DISPLAY
  }
  return phaseMap[wsPhase] || BiddingPhase.IDEA_INPUT
}

// 主组件
export default function UnifiedBiddingStage({
  ideaId,
  sessionId,
  ideaContent,
  onSupportPersona,
  onPhaseChange,
  className = ''
}: UnifiedBiddingStageProps) {
  const router = useRouter()

  // WebSocket连接状态
  const {
    isConnected,
    connectionStatus,
    currentPhase: wsPhase,
    timeRemaining,
    aiMessages,
    currentBids,
    highestBid,
    forceShowDialogs,
    sendMessage,
    startBidding,
    reconnect
  } = useFixedBiddingWebSocket(ideaId);

  // 模拟缺失的状态
  const viewerCount = 15;
  const activeSpeaker = aiMessages.length > 0 ? aiMessages[0].personaId : null;
  const supportedPersona = null;

  // 实现缺失的函数
  const supportPersona = (personaId: string) => {
    sendMessage({
      type: 'support_persona',
      payload: { personaId }
    });
  };

  const sendSupplement = (supplementData: string) => {
    return sendMessage({
      type: 'user_supplement',
      payload: { content: supplementData }
    });
  };

  const toIsoString = useCallback((value: unknown): string => {
    if (value instanceof Date) {
      return value.toISOString()
    }
    if (typeof value === 'number') {
      const parsed = new Date(value)
      return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString()
    }
    const parsed = value ? new Date(value as string) : new Date()
    return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString()
  }, [])

  const normalizedBids = useMemo(() => {
    const normalized: Record<string, number> = {}
    Object.entries(currentBids).forEach(([personaId, rawBid]) => {
      const bidValue = typeof rawBid === 'number' ? rawBid : Number(rawBid)
      if (!Number.isNaN(bidValue)) {
        normalized[personaId] = Math.max(0, Math.round(bidValue * 100) / 100)
      }
    })
    return normalized
  }, [currentBids])

  const participantsData = useMemo(() => {
    const seen = new Set<string>()
    return aiMessages.reduce<Array<{
      personaId: string
      name: string
      specialty: string
      bidAmount: number
      participated: boolean
    }>>((result, msg) => {
      if (seen.has(msg.personaId)) {
        return result
      }
      seen.add(msg.personaId)
      const persona = AI_PERSONAS.find(p => p.id === msg.personaId)
      result.push({
        personaId: msg.personaId,
        name: persona?.name || msg.personaId,
        specialty: persona?.specialty || '',
        bidAmount: normalizedBids[msg.personaId] || 0,
        participated: true
      })
      return result
    }, [])
  }, [aiMessages, normalizedBids])

  const expertDiscussionsPayload = useMemo(() => {
    return aiMessages.map(msg => ({
      personaId: msg.personaId,
      personaName: AI_PERSONAS.find(p => p.id === msg.personaId)?.name || msg.personaId,
      content: msg.content || '',
      emotion: msg.emotion || 'neutral',
      bidValue: msg.bidValue,
      timestamp: toIsoString(msg.timestamp)
    }))
  }, [aiMessages, toIsoString])

  const expertAnalysisForReport = useMemo(() => {
    return aiMessages.map(msg => ({
      expert: AI_PERSONAS.find(p => p.id === msg.personaId)?.name || msg.personaId,
      content: msg.content,
      emotion: msg.emotion,
      timestamp: msg.timestamp
    }))
  }, [aiMessages])

  // 映射阶段
  const currentPhase = mapWebSocketPhase(wsPhase)

  // 通知父组件阶段变化
  useEffect(() => {
    if (onPhaseChange && wsPhase) {
      onPhaseChange(wsPhase)
    }
  }, [wsPhase, onPhaseChange])

  // Agent状态管理
  const {
    agentStates,
    currentPermissions,
    supportedAgents,
    supplementCount,
    updateAgentState,
    handleWebSocketMessage,
    supportAgent,
    canSupport
  } = useAgentStates({
    currentPhase,
    onStateChange: (agentId, newState) => {
      console.log(`Agent ${agentId} state updated:`, newState)
    },
    onPermissionUpdate: (permissions) => {
      console.log('Phase permissions updated:', permissions)
    }
  })

  // Agent对话管理 - 初始评分从currentBids获取
  const initialScores = useMemo(() => {
    const scores: Record<string, number> = {}
    AI_PERSONAS.forEach(persona => {
      scores[persona.id] = currentBids[persona.id] || 70 // 默认70分
    })
    return scores
  }, [currentBids])

  const {
    conversations,
    sendReply,
    getConversation,
    canReply,
    getRemainingReplies
  } = useAgentConversations({
    sessionId: sessionId || '',
    biddingId: ideaId,
    originalIdea: ideaContent || '',
    initialScores,
    maxRepliesPerAgent: 3
  })

  // UI状态
  const [enableSound, setEnableSound] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [compactMode, setCompactMode] = useState(false)
  const [isCreatingPlan, setIsCreatingPlan] = useState(false)

  // 创意成熟度评估状态
  const [maturityAssessment, setMaturityAssessment] = useState<MaturityScoreResult | null>(null)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [evaluationError, setEvaluationError] = useState<string | null>(null)

  // 用户补充状态
  const [userSupplement, setUserSupplement] = useState('')
  const [supplementHistory, setSupplementHistory] = useState<Array<{
    category: SupplementCategory | string
    content: string
    timestamp: Date
  }>>([])
  const [isSendingSupplement, setIsSendingSupplement] = useState(false)

  // 计算消息信心度
  const calculateMessageConfidence = useCallback((message: AIMessage): number => {
    let confidence = 0.5

    // 根据情绪调整
    const emotionBonus: Record<string, number> = {
      'confident': 0.3, 'excited': 0.2, 'happy': 0.1,
      'neutral': 0, 'worried': -0.2, 'angry': -0.1
    }
    confidence += emotionBonus[message.emotion] || 0

    // 根据出价调整
    if (message.bidValue) {
      if (message.bidValue > 50) confidence += 0.2
      if (message.bidValue > 100) confidence += 0.1
      if (message.bidValue === 0) confidence -= 0.3
    }

    return Math.max(0, Math.min(1, confidence))
  }, [])

  // 自动启动AI竞价 - 只在StageBasedBidding没有触发时执行
  useEffect(() => {
    // 只有当sessionId存在且是新会话时才自动启动
    if (sessionId && ideaContent && isConnected && wsPhase === 'warmup') {
      console.log('🎭 UnifiedBiddingStage auto-starting AI bidding with sessionId:', sessionId)

      const startTimer = setTimeout(() => {
        startBidding(ideaContent)
      }, 2000)

      return () => clearTimeout(startTimer)
    }
  }, [sessionId, ideaContent, isConnected, wsPhase, startBidding])

  // 自动触发创意成熟度评估 - 当进入RESULT_DISPLAY阶段时
  useEffect(() => {
    const triggerMaturityAssessment = async () => {
      if (currentPhase !== BiddingPhase.RESULT_DISPLAY) return
      if (maturityAssessment || isEvaluating) return // 避免重复评估
      if (!ideaId || !sessionId) return
      if (aiMessages.length === 0) return

      console.log('🎯 触发创意成熟度评估...')
      setIsEvaluating(true)
      setEvaluationError(null)

      try {
        const response = await fetch('/api/maturity/assess', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ideaId,
            userId: sessionId, // 使用sessionId作为userId
            sessionId,
            aiMessages: aiMessages.map(msg => ({
              id: msg.id,
              personaId: msg.personaId,
              content: msg.content,
              emotion: msg.emotion,
              phase: msg.phase,
              timestamp: msg.timestamp
            })),
            bids: Object.keys(normalizedBids).length > 0 ? normalizedBids : {}
          })
        })

        if (!response.ok) {
          throw new Error(`评估失败: ${response.status}`)
        }

        const result = await response.json()

        if (result.success && result.data) {
          console.log('✅ 创意成熟度评估完成:', result.data)
          setMaturityAssessment(result.data)
        } else {
          throw new Error(result.error || '评估返回数据无效')
        }
      } catch (error) {
        console.error('❌ 创意成熟度评估失败:', error)
        setEvaluationError(error instanceof Error ? error.message : '未知错误')
      } finally {
        setIsEvaluating(false)
      }
    }

    triggerMaturityAssessment()
  }, [currentPhase, ideaId, sessionId, aiMessages, normalizedBids, maturityAssessment, isEvaluating])

  // 处理AI消息更新Agent状态 - 为每个agent显示其最新消息
  useEffect(() => {
    if (aiMessages.length === 0) return

    // 按agent分组，获取每个agent的最新消息
    const latestMessagesByAgent = new Map<string, AIMessage>()

    // 倒序遍历（最新的在前）
    for (const msg of aiMessages) {
      if (!latestMessagesByAgent.has(msg.personaId)) {
        latestMessagesByAgent.set(msg.personaId, msg)
      }
    }

    // 更新每个agent的状态
    latestMessagesByAgent.forEach((msg, agentId) => {
      const confidence = calculateMessageConfidence(msg)

      const updates: Partial<AgentState> = {
        currentMessage: msg.content,
        lastActivity: msg.timestamp,
        confidence: confidence
      }

      // 根据消息类型设置状态
      if (msg.type === 'speech') {
        updates.phase = 'speaking'
        updates.emotion = msg.emotion as AgentState['emotion']
      } else if (msg.type === 'bid') {
        updates.phase = 'bidding'
        updates.emotion = 'confident'
      }

      updateAgentState(agentId, updates)
    })

    // 将所有不在最新消息列表中的agent设置为idle（除非他们还有其他状态）
    AI_PERSONAS.forEach(persona => {
      if (!latestMessagesByAgent.has(persona.id)) {
        // 如果这个agent没有最新消息，但之前有消息，保持显示
        // 不自动重置为idle，让消息持续显示
      }
    })
  }, [aiMessages, updateAgentState, calculateMessageConfidence])

  // 处理支持Agent
  const handleSupportAgent = (agentId: string) => {
    if (canSupport(agentId)) {
      supportAgent(agentId)
      supportPersona(agentId)
      onSupportPersona?.(agentId)
    }
  }

  // 处理用户补充创意
  const handleSubmitSupplement = async (content: string, category?: SupplementCategory) => {
    if (!content.trim() || isSendingSupplement) return false

    // 检查是否已达上限
    if (supplementHistory.length >= 3) {
      alert('已达到补充上限（3次）')
      return false
    }

    setIsSendingSupplement(true)
    try {
      // 通过WebSocket发送补充内容给后端
      // 如果有类别信息，可以一起发送
      const supplementData = category
        ? `[${category}] ${content.trim()}`
        : content.trim()

      const success = sendSupplement(supplementData)

      if (success) {
        // 添加到历史记录
        setSupplementHistory(prev => [...prev, {
          category: category || 'other',
          content: content.trim(),
          timestamp: new Date()
        }])

        console.log('✅ 用户补充创意已发送:', content)
        console.log('📊 补充次数:', supplementHistory.length + 1, '/ 3')

        // 清空输入框
        setUserSupplement('')

        return true
      } else {
        throw new Error('发送失败')
      }
    } catch (error) {
      console.error('❌ 补充失败:', error)
      alert('补充失败，请重试')
      return false
    } finally {
      setIsSendingSupplement(false)
    }
  }

  // 兼容旧的简单补充方法
  const handleSubmitSupplementSimple = async () => {
    return await handleSubmitSupplement(userSupplement)
  }

  // 格式化时间
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // 处理创意实现建议
  const handleGenerateBusinessPlan = async () => {
    console.log('🚀 handleGenerateBusinessPlan called')

    if (isCreatingPlan) {
      console.log('⏸️ Already creating plan, skipping')
      return
    }

    setIsCreatingPlan(true)

    try {
      console.log('📊 Starting business plan generation...')
      console.log('ideaContent:', ideaContent)
      console.log('ideaId:', ideaId)
      console.log('currentBids:', currentBids)
      console.log('highestBid:', highestBid)
      console.log('aiMessages count:', aiMessages.length)

      const bidEntries = Object.entries(normalizedBids)
      let winningPersonaId: string | null = null
      let winningBidValue = -Infinity
      bidEntries.forEach(([personaId, bid]) => {
        if (bid > winningBidValue) {
          winningBidValue = bid
          winningPersonaId = personaId
        }
      })

      if (winningBidValue === -Infinity) {
        winningBidValue = typeof highestBid === 'number' ? highestBid : 0
      }

      if (!winningPersonaId) {
        const supported = Array.from(supportedAgents)
        winningPersonaId = activeSpeaker || supported[0] || null
      }

      const winnerPersona = winningPersonaId
        ? AI_PERSONAS.find(persona => persona.id === winningPersonaId)
        : undefined
      const winnerName = winnerPersona?.name || 'AI专家团队'

      const averageBid = bidEntries.length > 0
        ? bidEntries.reduce((total, [, bid]) => total + bid, 0) / bidEntries.length
        : (typeof highestBid === 'number' ? highestBid : 0)

      // Extract user context from idea and supplements for personalized recommendations
      const userContext = extractUserContext({
        ideaContent: ideaContent || '',
        supplements: supplementHistory
      })

      const requestBody = {
        ideaId,
        ideaContent: ideaContent || '未提供创意内容',
        userContext,
        biddingResults: {
          winningBid: Math.round(winningBidValue),
          winningPersona: winningPersonaId,
          winnerName,
          averageBid: Math.round(averageBid * 100) / 100,
          totalBids: bidEntries.length,
          bids: normalizedBids,
          participants: participantsData
        },
        expertDiscussions: expertDiscussionsPayload,
        metadata: {
          sessionDuration: Date.now() - (new Date().getTime()),
          totalMessages: aiMessages.length,
          supportCount: supportedAgents.size,
          phase: currentPhase
        }
      }

      console.log('📤 Request body prepared:', {
        bodySize: JSON.stringify(requestBody).length,
        ideaId,
        messagesCount: requestBody.expertDiscussions.length,
        bidsCount: requestBody.biddingResults.totalBids
      })

      // 使用 sessionStorage 存储数据,避免 URL 过长导致 HTTP 431 错误
      sessionStorage.setItem('biddingData', JSON.stringify(requestBody))
      sessionStorage.setItem('biddingIdeaId', ideaId)
      sessionStorage.setItem('biddingIdeaContent', ideaContent || '')

      console.log('💾 Data saved to sessionStorage, navigating to generation page...')

      // 使用路由跳转到进度页面(不带数据参数)
      window.location.href = `/business-plan/generating?ideaId=${encodeURIComponent(ideaId)}`

    } catch (error) {
      console.error('❌ Business plan generation error:', error)
      alert(`生成失败: ${error instanceof Error ? error.message : '未知错误'}`)
      setIsCreatingPlan(false)
    }
  }

  // 处理详细报告查看
  const handleViewDetailedReport = () => {
    // 生成详细报告数据
    const reportData = {
      ideaContent,
      biddingResults: {
        highestBid,
        averageBid: Object.values(normalizedBids).length > 0
          ? Object.values(normalizedBids).reduce((a, b) => a + b, 0) / Object.values(normalizedBids).length
          : 0,
        totalBids: Object.keys(normalizedBids).length,
        currentBids
      },
      expertAnalysis: expertAnalysisForReport,
      sessionStats: {
        messagesCount: aiMessages.length,
        supportCount: supportedAgents.size,
        phase: currentPhase,
        duration: Date.now() - (new Date().getTime())
      }
    }

    console.log('🎯 Detailed bidding report:', reportData)
    alert('详细报告功能开发中，数据已输出到控制台')
  }
  const calculatePhaseProgress = (): number => {
    const phaseDurations: Record<string, number> = {
      'warmup': 180, 'discussion': 720, 'bidding': 1200, 'prediction': 240, 'result': 300
    }
    const totalDuration = phaseDurations[wsPhase] || 60
    return Math.max(0, 100 - (timeRemaining / totalDuration) * 100)
  }

  // 获取活跃Agent数量统计
  const activeStats = useMemo(() => {
    const stats = { speaking: 0, thinking: 0, bidding: 0, total: Object.keys(agentStates).length }
    Object.values(agentStates).forEach(state => {
      if (state.phase === 'speaking') stats.speaking++
      if (state.phase === 'thinking') stats.thinking++
      if (state.phase === 'bidding') stats.bidding++
    })
    return stats
  }, [agentStates])

  return (
    <div className={`unified-bidding-stage space-y-6 ${className}`}>
      {/* 断连警告横幅 */}
      {!isConnected && (
        <Card className="border-2 border-red-500 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 animate-pulse" />
                <div>
                  <h3 className="font-semibold text-red-800">WebSocket连接断开</h3>
                  <p className="text-sm text-red-600">
                    AI专家团队已离线，竞价数据可能无法实时更新。请检查网络连接后点击重连。
                  </p>
                </div>
              </div>
              <Button
                variant="destructive"
                onClick={reconnect}
                className="ml-4"
              >
                <Loader2 className="w-4 h-4 mr-2" />
                立即重连
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 阶段状态栏 */}
      <PhaseStatusBar
        currentPhase={currentPhase}
        timeRemaining={timeRemaining}
        progress={calculatePhaseProgress()}
        viewerCount={viewerCount}
      />

      {/* 连接状态和统计信息 */}
      <Card className="border-2 border-dashed border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* 连接状态 - 增强版 */}
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <>
                    <Wifi className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium text-green-700">AI专家在线</span>
                    <Badge variant="outline" className="text-xs text-green-600">
                      {connectionStatus}
                    </Badge>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-5 h-5 text-red-500 animate-pulse" />
                    <span className="text-sm font-medium text-red-700">
                      {connectionStatus === 'connecting' ? '正在连接...' : '连接断开'}
                    </span>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={reconnect}
                      className="ml-2 text-xs animate-pulse"
                    >
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      点击重连
                    </Button>
                  </>
                )}
              </div>

              {/* 观众统计 */}
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-medium">观众: {viewerCount}</span>
              </div>

              {/* 活跃统计 */}
              <div className="flex items-center space-x-4 text-xs text-gray-600">
                <span>活跃: {activeStats.speaking + activeStats.thinking + activeStats.bidding}</span>
                <span>发言: {activeStats.speaking}</span>
                <span>思考: {activeStats.thinking}</span>
                {currentPhase === BiddingPhase.AGENT_BIDDING && (
                  <span>竞价: {activeStats.bidding}</span>
                )}
              </div>
            </div>

            {/* 右侧控制 */}
            <div className="flex items-center space-x-4">
              {/* 最高出价显示 */}
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                💰 最高出价: ¥{highestBid}
              </div>

              {/* 设置控制 */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEnableSound(!enableSound)}
                  className="p-2"
                >
                  {enableSound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCompactMode(!compactMode)}
                  className="p-2"
                >
                  {compactMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* 权限提示 */}
          {currentPermissions.userSupplementAllowed && (
            <div className="mt-3 p-2 bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-200">
              <p className="text-sm">
                🎯 您可以支持喜欢的专家（已用 {supplementCount}/{currentPermissions.maxSupplementCount} 次）
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Agent对话面板网格 */}
      <MotionDiv className="agents-grid-container">
        <div className={`agents-grid ${compactMode ? 'compact-mode' : ''}`}>
          {AI_PERSONAS.map((agent, index) => {
            const conversation = getConversation(agent.id)
            return (
              <MotionDiv key={agent.id}>
                <AgentDialogPanel
                  agent={agent}
                  state={agentStates[agent.id] || {
                    id: agent.id,
                    phase: 'idle',
                    emotion: 'neutral',
                    confidence: 0,
                    lastActivity: new Date(),
                    speakingIntensity: 0.8,
                    isSupported: supportedAgents.has(agent.id)
                  }}
                  isActive={activeSpeaker === agent.id}
                  currentPhase={currentPhase}
                  onSupport={() => handleSupportAgent(agent.id)}
                  currentBid={currentBids[agent.id]}
                  className={`${compactMode ? 'compact' : ''}`}
                  conversationMessages={conversation?.messages || []}
                  onSendReply={async (reply: string) => {
                    await sendReply(agent.id, reply)
                  }}
                  remainingReplies={getRemainingReplies(agent.id)}
                  isReplying={conversation?.isReplying || false}
                />
              </MotionDiv>
            )
          })}
        </div>
      </MotionDiv>

      {/* 增强的补充创意面板 - 在所有竞价阶段都显示 */}
      {currentPhase !== BiddingPhase.IDEA_INPUT && currentPhase !== BiddingPhase.RESULT_DISPLAY && (
        <EnhancedSupplementPanel
          onSubmitSupplement={handleSubmitSupplement}
          maxSupplements={3}
          currentSupplementCount={supplementHistory.length}
        />
      )}

      {/* 用户补充创意区域 - 在USER_SUPPLEMENT阶段显示 */}
      {currentPhase === BiddingPhase.USER_SUPPLEMENT && (
        <Card className="w-full max-w-4xl mx-auto border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquarePlus className="w-6 h-6 text-blue-600" />
                <CardTitle className="text-lg">补充您的创意</CardTitle>
              </div>
              <Badge variant="secondary" className="text-sm">
                {supplementHistory.length} / 3 次
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 提示信息 */}
              <div className="bg-blue-100 text-blue-800 p-3 rounded-lg text-sm">
                <p>💡 根据AI专家的讨论，您可以进一步补充和完善您的创意描述（最多3次）</p>
              </div>

              {/* 历史补充记录 */}
              {supplementHistory.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">已提交的补充：</p>
                  <div className="space-y-2">
                    {supplementHistory.map((item, index) => (
                      <div key={index} className="bg-white p-3 rounded-lg border border-gray-200 text-sm">
                        <span className="font-medium text-gray-600">补充 {index + 1}：</span>
                        <p className="mt-1 text-gray-700">{item.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 输入框和提交按钮 */}
              {supplementHistory.length < 3 && (
                <div className="space-y-3">
                  <Textarea
                    value={userSupplement}
                    onChange={(e) => setUserSupplement(e.target.value)}
                    placeholder="请输入您要补充的内容...例如：目标用户群体、具体应用场景、技术实现方案等"
                    className="min-h-[120px] resize-none"
                    disabled={isSendingSupplement}
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500">
                      {userSupplement.length > 0
                        ? `已输入 ${userSupplement.length} 个字符`
                        : '请详细描述您的补充内容'}
                    </p>
                    <Button
                      onClick={handleSubmitSupplementSimple}
                      disabled={!userSupplement.trim() || isSendingSupplement}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isSendingSupplement ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          提交中...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          提交补充 ({supplementHistory.length + 1}/3)
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* 已达上限提示 */}
              {supplementHistory.length >= 3 && (
                <div className="bg-green-100 text-green-800 p-3 rounded-lg text-sm">
                  <p>✅ 您已完成所有3次补充，AI专家将基于您的完整描述给出最终评估</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 结果阶段 - 创意实现建议 */}
      {currentPhase === BiddingPhase.RESULT_DISPLAY && (
        <div className="space-y-6 w-full max-w-4xl mx-auto">
          {/* 竞价结果摘要 */}
          <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Trophy className="w-8 h-8 text-yellow-500" />
                  <h2 className="text-2xl font-bold text-gray-800">🎉 AI竞价完成！</h2>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                  <h3 className="text-lg font-semibold mb-3">竞价结果摘要</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">¥{highestBid}</div>
                      <div className="text-gray-600">最高出价</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{Object.keys(currentBids).length}</div>
                      <div className="text-gray-600">参与专家</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{aiMessages.length}</div>
                      <div className="text-gray-600">专家评论</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{supportedAgents.size}</div>
                      <div className="text-gray-600">获得支持</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 创意成熟度评估结果 */}
          {isEvaluating && (
            <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <CardContent className="p-8 text-center">
                <Loader2 className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-spin" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">正在分析创意成熟度...</h3>
                <p className="text-gray-600">AI专家团队正在基于The Mom Test理论对您的创意进行深度评估</p>
              </CardContent>
            </Card>
          )}

          {evaluationError && (
            <Card className="border-2 border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="w-5 h-5" />
                  <p className="font-medium">评估失败: {evaluationError}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {maturityAssessment && (
            <>
              {/* 成熟度评分卡 - 带动画效果 */}
              <AnimatedMaturityScoreCard
                assessment={maturityAssessment}
                enableSound={enableSound}
                onAnimationComplete={() => {
                  console.log('✨ 评估动画完成')
                }}
              />

              {/* 工作坊推荐 - 只在解锁时显示 */}
              {maturityAssessment.workshopAccess.unlocked && (
                <WorkshopRecommendations
                  recommendations={maturityAssessment.workshopAccess.recommendations}
                  onWorkshopSelect={(workshopId) => {
                    console.log('🎓 用户选择工作坊:', workshopId)
                    // 跳转到工作坊页面，并传递评估ID
                    const assessmentId = maturityAssessment.assessmentId || ideaId
                    router.push(`/workshop/${workshopId}?assessment=${assessmentId}`)
                  }}
                />
              )}

              {/* 改进建议 - 分数低于8.0时显示 */}
              {maturityAssessment.totalScore < 8.0 && (
                <ImprovementSuggestions
                  weakDimensions={maturityAssessment.weakDimensions}
                  dimensions={maturityAssessment.dimensions}
                  invalidSignals={maturityAssessment.invalidSignals}
                />
              )}
            </>
          )}

          {/* 操作按钮 */}
          <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <p className="text-lg text-gray-700">
                  🎯 恭喜！您的创意已通过AI专家团队的全面评估和竞价
                </p>
                <p className="text-gray-600">
                  基于专家讨论和竞价结果，系统将为您生成专业的创意实现建议
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                  <Button
                    onClick={handleGenerateBusinessPlan}
                    disabled={isCreatingPlan}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold rounded-full shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-80 disabled:hover:scale-100 disabled:cursor-not-allowed"
                  >
                    {isCreatingPlan ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        正在生成...
                      </>
                    ) : (
                      <>
                        <FileText className="w-5 h-5 mr-2" />
                        生成创意实现建议
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => handleViewDetailedReport()}
                    className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg font-semibold rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    <TrendingUp className="w-5 h-5 mr-2" />
                    查看详细报告
                  </Button>
                </div>

                <div className="text-xs text-gray-500 mt-4">
                  💡 创意实现建议将基于AI专家的讨论内容和出价分析自动生成
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 设置面板 */}
      <AnimatePresence>
        {showSettings && (
          <MotionDiv>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">显示设置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">音效</label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEnableSound(!enableSound)}
                  >
                    {enableSound ? '已开启' : '已关闭'}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">紧凑模式</label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCompactMode(!compactMode)}
                  >
                    {compactMode ? '已开启' : '已关闭'}
                  </Button>
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  <p>当前阶段: {currentPhase}</p>
                  <p>WebSocket状态: {connectionStatus}</p>
                  <p>消息数量: {aiMessages.length}</p>
                  <p>支持的专家: {supportedAgents.size}</p>
                </div>
              </CardContent>
            </Card>
          </MotionDiv>
        )}
      </AnimatePresence>

      {/* 响应式样式 */}
      <style jsx>{`
        .agents-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(200px, 1fr));
          gap: 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .agents-grid.compact-mode {
          grid-template-columns: repeat(5, minmax(160px, 1fr));
          gap: 1rem;
        }

        @media (max-width: 1279px) {
          .agents-grid {
            grid-template-columns: repeat(3, minmax(200px, 1fr));
            gap: 1.5rem;
          }
          .agents-grid.compact-mode {
            grid-template-columns: repeat(3, minmax(160px, 1fr));
            gap: 1rem;
          }
        }

        @media (max-width: 1023px) {
          .agents-grid {
            grid-template-columns: repeat(3, minmax(180px, 1fr));
            gap: 1rem;
          }
          .agents-grid > *:nth-child(4),
          .agents-grid > *:nth-child(5) {
            justify-self: center;
          }
        }

        @media (max-width: 767px) {
          .agents-grid {
            grid-template-columns: repeat(2, minmax(160px, 1fr));
            gap: 0.75rem;
          }
          .agents-grid > *:last-child {
            grid-column: span 2;
            justify-self: center;
          }
        }
      `}</style>
    </div>
  )
}

export { UnifiedBiddingStage }
