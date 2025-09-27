'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useBiddingWebSocket } from '@/hooks/useBiddingWebSocket'
import { useAuth } from '@/hooks/useAuth'
import EnhancedBiddingStage from './EnhancedBiddingStage'
import { AI_PERSONAS, type AIMessage } from '@/lib/ai-persona-system'
import { DialogueDecisionEngine } from '@/lib/dialogue-strategy'
import AIServiceManager from '@/lib/ai-service-manager'
import { Clock, Users, Trophy, Play, Lightbulb, Target, Star, ThumbsUp, Heart, MessageCircle, Gift, TrendingUp, ArrowLeft, Plus, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import Image from 'next/image'

interface CreativeIdeaBiddingProps {
  ideaId: string
}

// 创意输入表单组件
const CreativeInputForm = ({
  onSubmit,
  isLoading,
  userCredits
}: {
  onSubmit: (idea: string) => void
  isLoading: boolean
  userCredits: number
}) => {
  const [ideaContent, setIdeaContent] = useState('')
  const REQUIRED_CREDITS = 50 // 参与竞价需要的积分

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (ideaContent.trim() && userCredits >= REQUIRED_CREDITS) {
      onSubmit(ideaContent.trim())
    }
  }

  const hasEnoughCredits = userCredits >= REQUIRED_CREDITS

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 shadow-xl">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full text-white mb-4"
            >
              <Lightbulb className="w-8 h-8" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              AI 创意竞价舞台
            </h1>
            <p className="text-gray-600 text-lg">
              分享你的创意，让 5 位 AI 专家为你的想法竞价！
            </p>
            <div className="mt-4 flex items-center justify-center space-x-4">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                💰 当前积分: {userCredits}
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                hasEnoughCredits
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {hasEnoughCredits ? '✅ 积分充足' : `❌ 需要 ${REQUIRED_CREDITS} 积分参与`}
              </div>
            </div>
          </div>

          {!hasEnoughCredits && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <div>
                  <p className="text-red-800 font-medium">积分不足</p>
                  <p className="text-red-600 text-sm">
                    参与 AI 竞价需要至少 {REQUIRED_CREDITS} 积分，请先充值或完成每日签到获取积分。
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ✨ 描述你的创意想法
              </label>
              <Textarea
                value={ideaContent}
                onChange={(e) => setIdeaContent(e.target.value)}
                placeholder="例如：一个基于AI的智能家居管理系统，可以学习用户习惯并自动调节环境..."
                className="min-h-[120px] text-lg border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                maxLength={500}
                disabled={!hasEnoughCredits}
              />
              <div className="flex justify-between mt-2 text-sm text-gray-500">
                <span>详细描述有助于获得更准确的评估</span>
                <span>{ideaContent.length}/500</span>
              </div>
            </div>

            <motion.div
              whileHover={{ scale: hasEnoughCredits ? 1.02 : 1 }}
              whileTap={{ scale: hasEnoughCredits ? 0.98 : 1 }}
            >
              <Button
                type="submit"
                disabled={!ideaContent.trim() || isLoading || !hasEnoughCredits}
                className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    启动 AI 竞价...
                  </>
                ) : !hasEnoughCredits ? (
                  <>
                    <AlertCircle className="w-5 h-5 mr-2" />
                    积分不足，无法参与
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    开始 AI 竞价表演 (-{REQUIRED_CREDITS} 积分)
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// AI 角色舞台组件
const AIPersonaStage = ({
  persona,
  isActive,
  currentBid,
  messages,
  onSupport
}: {
  persona: any
  isActive: boolean
  currentBid: number
  messages: AIMessage[]
  onSupport: () => void
}) => {
  const latestMessage = messages
    .filter(msg => msg.personaId === persona.id)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0]

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="relative"
    >
      <Card className={`
        transition-all duration-300 cursor-pointer
        ${isActive
          ? 'ring-4 ring-purple-400 shadow-xl scale-105 bg-gradient-to-br from-purple-50 to-blue-50'
          : 'hover:shadow-lg hover:scale-102 bg-white'
        }
      `}>
        <CardContent className="p-6 text-center">
          {/* 角色头像 */}
          <motion.div
            animate={isActive ? { scale: [1, 1.1, 1] } : { scale: 1 }}
            transition={{ repeat: isActive ? Infinity : 0, duration: 2 }}
            className="relative mx-auto mb-4"
          >
            <div className={`
              w-20 h-20 rounded-full relative overflow-hidden
              ${isActive ? 'ring-4 ring-purple-400' : ''}
            `}>
              <Image
                src={persona.avatar}
                alt={persona.name}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
              {isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 rounded-full bg-purple-400 opacity-20"
                />
              )}
            </div>

            {/* 说话指示器 */}
            {isActive && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
              >
                <MessageCircle className="w-3 h-3 text-white" />
              </motion.div>
            )}
          </motion.div>

          {/* 角色信息 */}
          <h3 className="font-bold text-lg text-gray-800 mb-1">{persona.name}</h3>
          <p className="text-sm text-gray-600 mb-1">{persona.specialty}</p>
          <div className="text-xs text-purple-600 mb-3 font-medium">
            {persona.personality.slice(0, 2).join(' • ')}
          </div>

          {/* 当前竞价 */}
          <div className="mb-4">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              ¥{(currentBid * 0.01).toFixed(2)}
            </div>
            <Badge variant={currentBid > 100 ? "default" : "secondary"} className="text-xs">
              {currentBid > 100 ? "高价竞争" : "保守出价"}
            </Badge>
          </div>

          {/* 最新对话 */}
          {latestMessage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-50 rounded-lg p-3 mb-4 text-sm text-left"
            >
              <div className="line-clamp-3">{latestMessage.content}</div>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(latestMessage.timestamp).toLocaleTimeString()}
              </div>
            </motion.div>
          )}

          {/* 支持按钮 */}
          <Button
            onClick={onSupport}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Heart className="w-4 h-4 mr-1" />
            支持
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// 阶段进度指示器
const PhaseIndicator = ({
  currentPhase,
  timeRemaining
}: {
  currentPhase: string
  timeRemaining: number
}) => {
  const phases = DISCUSSION_PHASES.map(phase => ({
    key: phase.phase,
    label: {
      'warmup': '预热',
      'discussion': '讨论',
      'bidding': '竞价',
      'prediction': '预测',
      'result': '结果'
    }[phase.phase] || phase.phase,
    icon: {
      'warmup': Target,
      'discussion': MessageCircle,
      'bidding': Trophy,
      'prediction': TrendingUp,
      'result': Star
    }[phase.phase] || Target,
    duration: phase.duration * 60 // 转换为秒
  }))

  const currentPhaseIndex = phases.findIndex(p => p.key === currentPhase)
  const currentPhaseData = phases[currentPhaseIndex]

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">竞价进度</h3>
        <div className="flex items-center text-purple-600 font-medium">
          <Clock className="w-4 h-4 mr-1" />
          {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
        </div>
      </div>

      <div className="flex items-center justify-between">
        {phases.map((phase, index) => {
          const Icon = phase.icon
          const isActive = phase.key === currentPhase
          const isCompleted = index < currentPhaseIndex

          return (
            <div key={phase.key} className="flex flex-col items-center flex-1">
              <motion.div
                animate={isActive ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                transition={{ repeat: isActive ? Infinity : 0, duration: 2 }}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center mb-2
                  ${isCompleted
                    ? 'bg-green-500 text-white'
                    : isActive
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
              </motion.div>
              <span className={`text-sm font-medium ${isActive ? 'text-purple-600' : 'text-gray-500'}`}>
                {phase.label}
              </span>
              {index < phases.length - 1 && (
                <div className={`h-0.5 w-full mt-2 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          )
        })}
      </div>

      {currentPhaseData && (
        <div className="mt-4">
          <Progress
            value={(currentPhaseData.duration - timeRemaining) / currentPhaseData.duration * 100}
            className="h-2"
          />
        </div>
      )}
    </div>
  )
}

// 实时统计面板
const LiveStatsPanel = ({
  viewerCount,
  highestBid,
  messageCount
}: {
  viewerCount: number
  highestBid: number
  messageCount: number
}) => {
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Users className="w-5 h-5 text-blue-600 mr-1" />
          </div>
          <div className="text-2xl font-bold text-blue-600">{viewerCount}</div>
          <div className="text-sm text-blue-700">在线观众</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Trophy className="w-5 h-5 text-green-600 mr-1" />
          </div>
          <div className="text-2xl font-bold text-green-600">¥{highestBid}</div>
          <div className="text-sm text-green-700">最高出价</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <MessageCircle className="w-5 h-5 text-purple-600 mr-1" />
          </div>
          <div className="text-2xl font-bold text-purple-600">{messageCount}</div>
          <div className="text-sm text-purple-700">讨论条数</div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function CreativeIdeaBidding({ ideaId }: CreativeIdeaBiddingProps) {
  const router = useRouter()
  const { user, updateCredits, checkCredits, isLoading: authLoading } = useAuth()
  const [showForm, setShowForm] = useState(true)
  const [isStarting, setIsStarting] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // 使用实际的WebSocket hook
  const {
    isConnected,
    sessionData,
    currentBids,
    aiInteractions,
    viewerCount,
    hasSubmittedGuess,
    supportAgent,
    reactToDialogue
  } = useBiddingWebSocket(sessionId)

  // 如果用户未登录或数据加载中，显示加载状态
  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">加载用户信息中...</p>
        </div>
      </div>
    )
  }

  // 模拟数据用于展示
  const activeSpeaker = 'tech-pioneer-alex'
  const currentPhase = sessionData?.phase || 'warmup'
  const timeRemaining = sessionData?.timeRemaining || 120
  const highestBid = Math.max(...currentBids.map(b => b.amount), 50)
  const currentBidsMap: Record<string, number> = {}

  // 转换现有竞价数据为角色映射
  AI_PERSONAS.forEach(persona => {
    const bid = currentBids.find(b => b.agentName === persona.name)
    currentBidsMap[persona.id] = bid?.amount || Math.floor(Math.random() * 100) + 50
  })

  // 转换AI交互为消息格式
  const aiMessages: AIMessage[] = aiInteractions.map(interaction => ({
    id: interaction.id,
    personaId: AI_PERSONAS.find(p => p.name === interaction.agentName)?.id || 'tech-pioneer-alex',
    phase: 'discussion',
    round: 1,
    type: 'speech',
    content: interaction.content,
    emotion: interaction.emotion as any || 'neutral',
    timestamp: new Date(interaction.timestamp)
  }))

  const handleStartBidding = async (ideaContent: string) => {
    const REQUIRED_CREDITS = 50

    // 检查积分是否充足
    if (!checkCredits(REQUIRED_CREDITS)) {
      setError('积分不足，无法参与竞价')
      return
    }

    setIsStarting(true)
    setError(null)

    try {
      // 扣除积分
      await updateCredits(-REQUIRED_CREDITS)

      // 创建会话ID
      const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      setSessionId(newSessionId)

      // 模拟启动延迟
      await new Promise(resolve => setTimeout(resolve, 2000))
      setShowForm(false)
    } catch (error) {
      console.error('Failed to start bidding:', error)
      setError('启动竞价失败，积分已退还')
      // 退还积分
      try {
        await updateCredits(REQUIRED_CREDITS)
      } catch (refundError) {
        console.error('Failed to refund credits:', refundError)
      }
    } finally {
      setIsStarting(false)
    }
  }

  const handleSupportPersona = async (personaId: string) => {
    const SUPPORT_COST = 10 // 支持AI角色的积分消耗

    // 检查积分是否充足
    if (!checkCredits(SUPPORT_COST)) {
      setError('积分不足，无法支持该角色')
      return
    }

    try {
      const persona = AI_PERSONAS.find(p => p.id === personaId)
      if (persona && sessionId) {
        // 扣除积分
        await updateCredits(-SUPPORT_COST)
        supportAgent(persona.name)
        setError(null)
      }
    } catch (error) {
      console.error('Failed to support persona:', error)
      setError('支持失败，积分已退还')
      // 退还积分
      try {
        await updateCredits(SUPPORT_COST)
      } catch (refundError) {
        console.error('Failed to refund credits:', refundError)
      }
    }
  }

  const handleSendReaction = async (messageId: string, reaction: string) => {
    const REACTION_COST = 5 // 发送反应的积分消耗

    // 检查积分是否充足
    if (!checkCredits(REACTION_COST)) {
      setError('积分不足，无法发送反应')
      return
    }

    try {
      if (sessionId) {
        // 扣除积分
        await updateCredits(-REACTION_COST)
        reactToDialogue(reaction)
        setError(null)
      }
    } catch (error) {
      console.error('Failed to send reaction:', error)
      setError('发送反应失败，积分已退还')
      // 退还积分
      try {
        await updateCredits(REACTION_COST)
      } catch (refundError) {
        console.error('Failed to refund credits:', refundError)
      }
    }
  }

  // 显示创意输入表单
  if (showForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100 flex items-center justify-center p-6">
        {error && (
          <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          </div>
        )}
        <CreativeInputForm
          onSubmit={handleStartBidding}
          isLoading={isStarting}
          userCredits={user.credits}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 错误提示 */}
        {error && (
          <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          </div>
        )}

        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">🎭 AI 创意竞价舞台</h3>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                观看 5 位 AI 专家为您的创意激烈竞价
              </div>
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                💰 当前积分: {user.credits}
              </div>
              <Button
                onClick={() => router.push('/payment')}
                size="sm"
                variant="outline"
                className="border-yellow-400 text-yellow-600 hover:bg-yellow-50"
              >
                <Plus className="w-4 h-4 mr-1" />
                充值
              </Button>
              <Button
                onClick={() => router.back()}
                size="sm"
                variant="ghost"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                返回
              </Button>
            </div>
          </div>
        </motion.div>

        {/* 使用增强的竞价舞台组件 */}
        <EnhancedBiddingStage
          ideaId="demo-idea"
          messages={aiMessages}
          currentBids={Object.fromEntries(
            AI_PERSONAS.map(persona => [
              persona.id,
              currentBidsMap[persona.id] || Math.floor(Math.random() * 200) + 50
            ])
          )}
          activeSpeaker={activeSpeaker}
          currentPhase={currentPhase}
          onSupportPersona={handleSupportPersona}
        />

        {/* 连接状态指示器 */}
        <div className="fixed bottom-4 right-4">
          <Badge
            variant={isConnected ? "default" : "destructive"}
            className="flex items-center space-x-1"
          >
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
            <span>{isConnected ? '已连接' : '连接中...'}</span>
          </Badge>
        </div>
      </div>
    </div>
  )
}