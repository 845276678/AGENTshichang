'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AI_PERSONAS, type AIPersona } from '@/lib/ai-persona-enhanced'
import { type AIMessage } from '@/lib/ai-persona-system'
import { useBiddingWebSocket } from '@/hooks/useBiddingWebSocket'
import { useAgentStates, PhasePermissionManager } from '@/hooks/useAgentStates'
import { agentStateManager } from '@/services/AgentStateManager'
import { tokenStorage } from '@/lib/token-storage'

// Import our new components
import { AgentDialogPanel, BiddingPhase, type AgentState } from './AgentDialogPanel'
import PhaseStatusBar from './PhaseStatusBar'
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
  Loader2
} from 'lucide-react'

// 简化组件替代motion - 避免生产环境错误
const SimpleDiv = ({ children, className, style, ...props }: any) => (
  <div className={className} style={style} {...props}>{children}</div>
)
const SimplePresence = ({ children }: any) => <>{children}</>

// 使用简化组件替代motion组件
const MotionDiv = SimpleDiv
const AnimatePresence = SimplePresence

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
  // WebSocket连接状态
  const {
    isConnected,
    connectionStatus,
    currentPhase: wsPhase,
    timeRemaining,
    viewerCount,
    aiMessages,
    activeSpeaker,
    currentBids,
    highestBid,
    supportedPersona,
    supportPersona,
    startBidding,
    reconnect
  } = useBiddingWebSocket({
    ideaId,
    autoConnect: true
  })

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

  // UI状态
  const [enableSound, setEnableSound] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [compactMode, setCompactMode] = useState(false)
  const [isCreatingPlan, setIsCreatingPlan] = useState(false)

  // 自动启动AI竞价
  useEffect(() => {
    if (sessionId && ideaContent && isConnected && wsPhase === 'warmup') {
      console.log('🎭 Auto-starting AI bidding with sessionId:', sessionId)

      const startTimer = setTimeout(() => {
        startBidding(ideaContent)
      }, 2000)

      return () => clearTimeout(startTimer)
    }
  }, [sessionId, ideaContent, isConnected, wsPhase, startBidding])

  // 处理AI消息更新Agent状态
  useEffect(() => {
    if (aiMessages.length > 0) {
      const latestMessage = aiMessages[0] // 最新消息

      // 更新对应Agent的状态
      const updates: Partial<AgentState> = {
        currentMessage: latestMessage.content,
        lastActivity: latestMessage.timestamp,
        confidence: calculateMessageConfidence(latestMessage)
      }

      // 根据消息类型设置状态
      if (latestMessage.type === 'speech') {
        updates.phase = 'speaking'
        updates.emotion = latestMessage.emotion as AgentState['emotion']
      } else if (latestMessage.type === 'bid') {
        updates.phase = 'bidding'
        updates.emotion = 'confident'
      }

      updateAgentState(latestMessage.personaId, updates)

      // 3秒后将说话状态重置为idle
      setTimeout(() => {
        updateAgentState(latestMessage.personaId, { phase: 'idle' })
      }, 3000)
    }
  }, [aiMessages, updateAgentState])

  // 处理支持Agent
  const handleSupportAgent = (agentId: string) => {
    if (canSupport(agentId)) {
      supportAgent(agentId)
      supportPersona(agentId)
      onSupportPersona?.(agentId)
    }
  }

  // 计算消息信心度
  const calculateMessageConfidence = (message: AIMessage): number => {
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
  }

  // 格式化时间
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // 处理商业计划生成
  const handleGenerateBusinessPlan = async () => {
    console.log('🚀 handleGenerateBusinessPlan called')

    if (isCreatingPlan) {
      console.log('⏸️ Already creating plan, skipping')
      return
    }

    console.log('📝 Opening new window...')
    const previewWindow = typeof window !== 'undefined' ? window.open('', '_blank') : null
    if (!previewWindow) {
      console.error('❌ Failed to open new window')
      alert('浏览器阻止了新窗口，请允许弹窗后重试')
      return
    }

    console.log('✅ New window opened successfully')

    // 显示加载页面
    previewWindow.document.write('<!doctype html><title>正在生成商业计划</title><body style="font-family: system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif; padding: 32px; line-height: 1.6; color: #1f2933; background: #f8fafc;"><h1 style="margin-bottom: 12px; font-size: 20px;">AI 正在整理商业计划...</h1><p style="margin: 0;">请稍候片刻，完成后将自动打开详细报告。</p><div id="status" style="margin-top: 20px; padding: 12px; background: #e3f2fd; border-radius: 8px; font-size: 14px;"></div></body>')
    previewWindow.document.close()

    const updateStatus = (message: string, isError = false) => {
      console.log(`📊 Status update: ${message} (error: ${isError})`)
      const statusDiv = previewWindow.document.getElementById('status')
      if (statusDiv) {
        statusDiv.textContent = message
        statusDiv.style.background = isError ? '#ffebee' : '#e3f2fd'
        statusDiv.style.color = isError ? '#c62828' : '#1565c0'
      }
    }

    setIsCreatingPlan(true)
    console.log('🔄 isCreatingPlan set to true')

    try {
      updateStatus('正在准备竞价数据...')
      console.log('📊 Starting business plan generation...')
      console.log('ideaContent:', ideaContent)
      console.log('ideaId:', ideaId)
      console.log('currentBids:', currentBids)
      console.log('highestBid:', highestBid)
      console.log('aiMessages count:', aiMessages.length)

      const normalizedBids: Record<string, number> = {}
      Object.entries(currentBids || {}).forEach(([personaId, value]) => {
        const bidNumber = typeof value === 'number' ? value : Number(value)
        if (!Number.isNaN(bidNumber)) {
          normalizedBids[personaId] = bidNumber
        }
      })

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

      const toIsoString = (value: unknown): string => {
        if (value instanceof Date) {
          return value.toISOString()
        }
        const parsed = value ? new Date(value as string) : new Date()
        return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString()
      }

      const messagePayload = aiMessages.slice(0, 20).map(message => ({
        id: message.id,
        personaId: message.personaId,
        phase: message.phase,
        round: message.round,
        type: message.type,
        content: message.content,
        emotion: message.emotion,
        bidValue: message.bidValue,
        timestamp: toIsoString(message.timestamp)
      }))

      const requestBody = {
        ideaContent,
        ideaId,
        highestBid: winningBidValue,
        averageBid,
        finalBids: normalizedBids,
        winner: winningPersonaId,
        winnerName,
        aiMessages: messagePayload,
        supportedAgents: Array.from(supportedAgents),
        currentBids: normalizedBids
      }

      console.log('📤 Sending request to /api/business-plan-session:', requestBody)
      updateStatus('正在调用AI生成商业计划...')

      const token = tokenStorage.getAccessToken()
      if (!token) {
        throw new Error('未找到认证令牌，请先登录')
      }

      const response = await fetch('/api/business-plan-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      })

      console.log('📥 Response status:', response.status, response.statusText)

      if (!response.ok) {
        let errorMessage = '生成商业计划会话失败，请稍后重试'
        let errorDetails = ''
        try {
          const errorData = await response.json()
          console.error('❌ API Error Response:', errorData)
          if (errorData?.error) {
            errorMessage = errorData.error
          }
          if (errorData?.details) {
            errorDetails = errorData.details
            console.error('Error details:', errorDetails)
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError)
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log('✅ Business plan session created:', result)

      const sessionIdFromResponse: string | undefined = result?.sessionId
      if (!sessionIdFromResponse) {
        throw new Error('服务器未返回会话ID，生成失败')
      }

      updateStatus('商业计划已生成，正在跳转...')

      try {
        const url = new URL('/business-plan', window.location.origin)
        url.searchParams.set('sessionId', sessionIdFromResponse)
        url.searchParams.set('source', 'ai-bidding')
        console.log('🔗 Redirecting to:', url.toString())
        previewWindow.location.href = url.toString()
      } catch (buildError) {
        console.error('Failed to build business plan URL:', buildError)
        previewWindow.location.href = `/business-plan?sessionId=${encodeURIComponent(sessionIdFromResponse)}&source=ai-bidding`
      }
    } catch (error) {
      console.error('❌ Failed to generate business plan:', error)
      const errorMessage = error instanceof Error ? error.message : '生成商业计划失败，请稍后重试'

      // 在新窗口中显示错误
      updateStatus(`错误: ${errorMessage}`, true)
      previewWindow.document.body.innerHTML += `
        <div style="margin-top: 20px; padding: 16px; background: #ffebee; border-left: 4px solid #c62828; border-radius: 4px;">
          <h2 style="margin: 0 0 8px 0; color: #c62828; font-size: 16px;">生成失败</h2>
          <p style="margin: 0; color: #666;">${errorMessage}</p>
          <button onclick="window.close()" style="margin-top: 12px; padding: 8px 16px; background: #c62828; color: white; border: none; border-radius: 4px; cursor: pointer;">关闭窗口</button>
        </div>
      `

      // 主窗口也显示错误
      alert(errorMessage)
    } finally {
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
        averageBid: Object.values(currentBids).length > 0
          ? Object.values(currentBids).reduce((a, b) => a + b, 0) / Object.values(currentBids).length
          : 0,
        totalBids: Object.keys(currentBids).length,
        currentBids
      },
      expertAnalysis: aiMessages.map(msg => ({
        expert: AI_PERSONAS.find(p => p.id === msg.personaId)?.name || msg.personaId,
        content: msg.content,
        emotion: msg.emotion,
        timestamp: msg.timestamp
      })),
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
              {/* 连接状态 */}
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <>
                    <Wifi className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium text-green-700">AI专家在线</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-5 h-5 text-red-500" />
                    <span className="text-sm font-medium text-red-700">连接中...</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={reconnect}
                      className="ml-2 text-xs"
                    >
                      重连
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
          {AI_PERSONAS.map((agent, index) => (
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
              />
            </MotionDiv>
          ))}
        </div>
      </MotionDiv>

      {/* 结果阶段 - 商业计划生成 */}
      {currentPhase === BiddingPhase.RESULT_DISPLAY && (
        <Card className="w-full max-w-4xl mx-auto border-2 border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
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

              <div className="space-y-3">
                <p className="text-lg text-gray-700">
                  🎯 恭喜！您的创意已通过AI专家团队的全面评估和竞价
                </p>
                <p className="text-gray-600">
                  基于专家讨论和竞价结果，系统将为您生成专业的商业计划书
                </p>
              </div>

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
                      生成商业计划书
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
                💡 商业计划书将基于AI专家的讨论内容和出价分析自动生成
              </div>
            </div>
          </CardContent>
        </Card>
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
