'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AI_PERSONAS, type AIMessage, type AIPersona } from '@/lib/ai-persona-system'
import { useBiddingWebSocket } from '@/hooks/useBiddingWebSocket'
import { useAgentStates, PhasePermissionManager } from '@/hooks/useAgentStates'
import { agentStateManager } from '@/services/AgentStateManager'

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
  EyeOff
} from 'lucide-react'

// Props interface
interface UnifiedBiddingStageProps {
  ideaId: string
  sessionId?: string | null
  ideaContent?: string
  onSupportPersona?: (personaId: string) => void
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

  // 计算阶段进度
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
      <motion.div
        className="agents-grid-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className={`agents-grid ${compactMode ? 'compact-mode' : ''}`}>
          {AI_PERSONAS.map((agent, index) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: "easeOut"
              }}
            >
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
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* 设置面板 */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
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
          </motion.div>
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