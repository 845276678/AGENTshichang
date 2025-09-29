'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useBiddingWebSocket, useBiddingWebSocketOriginal } from '@/hooks/useBiddingWebSocket'
import { tokenStorage } from '@/lib/token-storage'
import { useAuth } from '@/contexts/AuthContext'
import EnhancedBiddingStage from './EnhancedBiddingStage'
import { AI_PERSONAS, DISCUSSION_PHASES, type AIMessage } from '@/lib/ai-persona-system'
import { DialogueDecisionEngine } from '@/lib/dialogue-strategy'
import AIServiceManager from '@/lib/ai-service-manager'
import { Clock, Users, Trophy, Play, Lightbulb, Target, Star, ThumbsUp, Heart, MessageCircle, Gift, TrendingUp, ArrowLeft, Plus, AlertCircle, FileText, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import Image from 'next/image'

interface CreativeIdeaBiddingProps {
  ideaId: string
}

// 创意输入表单组件 - 升级版
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
      <Card className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 border-purple-200 shadow-2xl backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-500 rounded-full text-white mb-6 shadow-lg"
            >
              <Lightbulb className="w-10 h-10" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3"
            >
              🎭 AI 创意竞价舞台
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-gray-600 text-xl font-medium"
            >
              5 位顶级 AI 专家即将为您的创意展开激烈竞价！
            </motion.p>

            {/* 积分状态显示 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 flex items-center justify-center space-x-6"
            >
              <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white px-6 py-3 rounded-full text-lg font-bold shadow-lg">
                💰 当前积分: {userCredits}
              </div>
              <div className={`px-6 py-3 rounded-full text-lg font-bold shadow-lg transition-all duration-300 ${
                hasEnoughCredits
                  ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white'
                  : 'bg-gradient-to-r from-red-400 to-pink-400 text-white'
              }`}>
                {hasEnoughCredits ? '✅ 准备就绪' : `⚠️ 需要 ${REQUIRED_CREDITS} 积分`}
              </div>
            </motion.div>
          </div>

          {!hasEnoughCredits && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-6 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl"
            >
              <div className="flex items-center">
                <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
                <div>
                  <p className="text-red-800 font-bold text-lg">积分不足，无法启动竞价</p>
                  <p className="text-red-600 mt-1">
                    参与 AI 创意竞价需要至少 {REQUIRED_CREDITS} 积分。请完成每日签到或充值获取积分，然后重新体验这场精彩的创意竞拍！
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            onSubmit={handleSubmit}
            className="space-y-8"
          >
            <div>
              <label className="block text-lg font-bold text-gray-700 mb-4">
                ✨ 描述您的创意想法
              </label>
              <Textarea
                value={ideaContent}
                onChange={(e) => setIdeaContent(e.target.value)}
                placeholder="例如：一个基于AI的智能家居管理系统，可以学习用户习惯并自动调节环境参数，实现真正的个性化居住体验..."
                className="min-h-[150px] text-lg border-2 border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 rounded-xl transition-all duration-300 shadow-inner"
                maxLength={500}
                disabled={!hasEnoughCredits}
              />
              <div className="flex justify-between mt-3 text-sm">
                <span className="text-gray-500 font-medium">
                  💡 详细描述有助于 AI 专家更准确评估您的创意价值
                </span>
                <span className={`font-bold ${ideaContent.length > 400 ? 'text-red-500' : 'text-gray-500'}`}>
                  {ideaContent.length}/500
                </span>
              </div>
            </div>

            <motion.div
              whileHover={{ scale: hasEnoughCredits ? 1.02 : 1 }}
              whileTap={{ scale: hasEnoughCredits ? 0.98 : 1 }}
              className="text-center"
            >
              <Button
                type="submit"
                disabled={!ideaContent.trim() || isLoading || !hasEnoughCredits}
                className={`w-full py-6 text-xl font-bold rounded-xl transition-all duration-300 shadow-lg ${
                  hasEnoughCredits
                    ? 'bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white'
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="inline-block w-6 h-6 border-3 border-white border-t-transparent rounded-full mr-3"
                    />
                    正在启动 AI 竞价舞台...
                  </>
                ) : !hasEnoughCredits ? (
                  <>
                    <AlertCircle className="w-6 h-6 mr-3" />
                    积分不足，无法参与竞价
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6 mr-3" />
                    🎬 开始 AI 创意竞价表演 (-{REQUIRED_CREDITS} 积分)
                  </>
                )}
              </Button>
            </motion.div>
          </motion.form>

          {/* 特色说明 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div className="text-center p-4 bg-white/60 rounded-lg border border-purple-100">
              <div className="text-2xl mb-2">🎯</div>
              <h3 className="font-bold text-gray-700">专业评估</h3>
              <p className="text-sm text-gray-600">5位AI专家多维度分析</p>
            </div>
            <div className="text-center p-4 bg-white/60 rounded-lg border border-purple-100">
              <div className="text-2xl mb-2">💰</div>
              <h3 className="font-bold text-gray-700">实时竞价</h3>
              <p className="text-sm text-gray-600">动态竞价过程可视化</p>
            </div>
            <div className="text-center p-4 bg-white/60 rounded-lg border border-purple-100">
              <div className="text-2xl mb-2">📊</div>
              <h3 className="font-bold text-gray-700">商业指导</h3>
              <p className="text-sm text-gray-600">生成专业落地方案</p>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// 该组件已被 EnhancedAIPersonaStage 取代，提供更丰富的视觉效果

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
  const { user, isLoading: authLoading, isInitialized, checkAuthState } = useAuth()
  const [showForm, setShowForm] = useState(true)
  const [isStarting, setIsStarting] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const getAccessToken = useCallback(() => {
    const token = tokenStorage.getAccessToken()
    if (!token) {
      throw new Error('登录状态已失效，请重新登录后重试')
    }
    return token
  }, [])

  const hasEnoughCredits = useCallback((required: number) => {
    return (user?.credits ?? 0) >= required
  }, [user?.credits])

  const adjustCredits = useCallback(
    async (amount: number, description?: string) => {
      const token = getAccessToken()

      const response = await fetch('/api/user/credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify({
          amount,
          type: amount >= 0 ? 'EARN' : 'SPEND',
          description: description ?? '精彩会话值得期待'
        })
      })

      let data: any = null
      try {
        data = await response.json()
      } catch (parseError) {
        data = null
      }

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || data?.message || '竞价启动失败')
      }

      await checkAuthState()
    },
    [getAccessToken, checkAuthState]
  )

  // 生成商业指导书相关状态
  const [isGeneratingGuide, setIsGeneratingGuide] = useState(false)
  const [guideProgress, setGuideProgress] = useState(0)

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
  } = process.env.NODE_ENV === 'production'
    ? useBiddingWebSocketOriginal({ ideaId: sessionId })
    : useBiddingWebSocket(sessionId)

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
    if (!hasEnoughCredits(REQUIRED_CREDITS)) {
      setError('积分不足，无法参与竞价')
      return
    }

    setIsStarting(true)
    setError(null)

    try {
      // 扣除积分
      await adjustCredits(-REQUIRED_CREDITS, 'AI创意竞价参与费用')

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
        await adjustCredits(REQUIRED_CREDITS, '竞价启动失败退款')
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
    if (!hasEnoughCredits(SUPPORT_COST)) {
      setError('积分不足，无法支持该角色')
      return
    }

    try {
      const persona = AI_PERSONAS.find(p => p.id === personaId)
      if (persona && sessionId) {
        // 扣除积分
        await adjustCredits(-SUPPORT_COST, `支持AI专家 ${persona.name}`)
        supportAgent(persona.name)
        setError(null)
      }
    } catch (error) {
      console.error('Failed to support persona:', error)
      setError('支持失败，积分已退还')
      // 退还积分
      try {
        await adjustCredits(SUPPORT_COST, '支持失败退款')
      } catch (refundError) {
        console.error('Failed to refund credits:', refundError)
      }
    }
  }

  const handleSendReaction = async (messageId: string, reaction: string) => {
    const REACTION_COST = 5 // 发送反应的积分消耗

    // 检查积分是否充足
    if (!hasEnoughCredits(REACTION_COST)) {
      setError('积分不足，无法发送反应')
      return
    }

    try {
      if (sessionId) {
        // 扣除积分
        await adjustCredits(-REACTION_COST, '发送互动反应')
        reactToDialogue(reaction)
        setError(null)
      }
    } catch (error) {
      console.error('Failed to send reaction:', error)
      setError('发送反应失败，积分已退还')
      // 退还积分
      try {
        await adjustCredits(REACTION_COST, '反应发送失败退款')
      } catch (refundError) {
        console.error('Failed to refund credits:', refundError)
      }
    }
  }

  const handleGenerateGuide = async () => {
    const GUIDE_COST = 100 // 生成落地指南的积分消耗

    // 检查积分是否充足
    if (!hasEnoughCredits(GUIDE_COST)) {
      setError('积分不足，需要100积分生成商业落地指南')
      return
    }

    setIsGeneratingGuide(true)
    setGuideProgress(0)
    setError(null)

    try {
      // 扣除积分
      await adjustCredits(-GUIDE_COST, '生成商业落地指南')

      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setGuideProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 500)

      // 调用生成落地指南API
      const response = await fetch('/api/generate-business-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAccessToken()}`
        },
        body: JSON.stringify({
          ideaId: sessionId,
          ideaContent: 'AI创意竞价舞台系统', // 使用当前会话的创意内容
          biddingResults: currentBids,
          aiDialogue: aiInteractions
        })
      })

      clearInterval(progressInterval)
      setGuideProgress(100)

      if (!response.ok) {
        throw new Error('生成失败')
      }

      const result = await response.json()

      // 跳转到商业计划页面
      router.push(`/business-plan?reportId=${result.reportId}&ideaTitle=${encodeURIComponent('AI创意竞价舞台系统')}`)

    } catch (error) {
      console.error('Failed to generate guide:', error)
      setError('生成落地指南失败，积分已退还')
      // 退还积分
      try {
        await adjustCredits(GUIDE_COST, '落地指南生成失败退款')
      } catch (refundError) {
        console.error('Failed to refund credits:', refundError)
      }
    } finally {
      setIsGeneratingGuide(false)
      setGuideProgress(0)
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

        {/* 页面标题 - 升级版 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center"
            >
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-full p-3 mr-4 shadow-lg">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  🎭 AI 创意竞价舞台
                </h3>
                <p className="text-gray-600 text-lg">
                  观看 5 位 AI 专家为您的创意激烈竞价
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white px-4 py-2 rounded-full text-lg font-bold shadow-lg">
                💰 积分: {user.credits}
              </div>
              <Button
                onClick={() => router.push('/payment')}
                size="sm"
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg"
              >
                <Plus className="w-4 h-4 mr-1" />
                充值
              </Button>
              <Button
                onClick={() => router.back()}
                size="sm"
                variant="outline"
                className="border-gray-300 hover:border-gray-400 shadow-lg"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                返回
              </Button>
            </motion.div>
          </div>

          {/* 实时状态指示器 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-purple-100"
          >
            <div className="flex items-center justify-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                <span className="text-sm font-medium text-gray-700">
                  {isConnected ? '🟢 竞价进行中' : '🔴 连接中...'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">{viewerCount} 在线观众</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-gray-700">最高竞价¥{highestBid}</span>
              </div>
            </div>
          </motion.div>
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

        {/* 商业落地指南生成 - 升级版 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12"
        >
          <Card className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 border-2 border-emerald-200 shadow-2xl overflow-hidden relative">
            {/* 背景装饰 */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full opacity-10 transform translate-x-16 -translate-y-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-400 to-emerald-400 rounded-full opacity-10 transform -translate-x-12 translate-y-12" />

            <CardContent className="p-8 relative z-10">
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 1, type: "spring", stiffness: 200 }}
                  className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 rounded-2xl text-white mb-6 shadow-xl"
                >
                  <FileText className="w-8 h-8" />
                </motion.div>

                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="text-3xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent mb-3"
                >
                  🎯 AI 商业落地指南
                </motion.h3>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4 }}
                  className="text-gray-600 text-xl mb-8 max-w-2xl mx-auto"
                >
                  基于 AI 专家竞价结果，生成专业的商业落地指导方案，助您实现创意变现
                </motion.p>

                {/* 特色功能展示 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.6 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
                >
                  <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl border border-emerald-100 shadow-lg">
                    <div className="text-3xl mb-3">📊</div>
                    <h4 className="font-bold text-gray-700 mb-2">市场分析</h4>
                    <p className="text-sm text-gray-600">深度市场调研与竞争分析</p>
                  </div>
                  <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl border border-emerald-100 shadow-lg">
                    <div className="text-3xl mb-3">💡</div>
                    <h4 className="font-bold text-gray-700 mb-2">执行方案</h4>
                    <p className="text-sm text-gray-600">详细的实施步骤与时间规划</p>
                  </div>
                  <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl border border-emerald-100 shadow-lg">
                    <div className="text-3xl mb-3">💰</div>
                    <h4 className="font-bold text-gray-700 mb-2">商业模式</h4>
                    <p className="text-sm text-gray-600">可行的盈利模式与投资建议</p>
                  </div>
                </motion.div>

                {!isGeneratingGuide ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.8 }}
                  >
                    <Button
                      onClick={handleGenerateGuide}
                      disabled={!sessionId || user.credits < 100}
                      className={`px-10 py-4 text-xl font-bold rounded-2xl transition-all duration-300 shadow-xl ${
                        user.credits >= 100
                          ? 'bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-700 hover:via-green-700 hover:to-teal-700 text-white transform hover:scale-105'
                          : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      }`}
                    >
                      <FileText className="w-6 h-6 mr-3" />
                      🚀 生成专业落地指南 (100 积分)
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full mr-4"
                      />
                      <span className="text-emerald-700 text-xl font-bold">AI 正在分析您的创意...</span>
                    </div>

                    <div className="w-full max-w-md mx-auto">
                      <div className="w-full bg-emerald-200 rounded-full h-4 shadow-inner">
                        <motion.div
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 h-4 rounded-full shadow-lg"
                          initial={{ width: 0 }}
                          animate={{ width: `${guideProgress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <div className="flex justify-between mt-2 text-sm text-emerald-600 font-medium">
                        <span>生成进度</span>
                        <span>{guideProgress}%</span>
                      </div>
                    </div>

                    <p className="text-emerald-600 font-medium">
                      正在整合 5 位 AI 专家的见解，生成您的专属商业方案...
                    </p>
                  </motion.div>
                )}

                {user.credits < 100 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2 }}
                    className="mt-6 p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl"
                  >
                    <div className="flex items-center justify-center mb-4">
                      <AlertCircle className="w-6 h-6 text-amber-500 mr-2" />
                      <span className="text-amber-800 font-bold text-lg">积分不足</span>
                    </div>
                    <p className="text-amber-700 mb-4">
                      生成专业落地指南需要100 积分，当前积分不足。立即充值解锁完整的 AI 商业咨询服务！
                    </p>
                    <Button
                      onClick={() => router.push('/payment')}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      立即充值获取积分
                    </Button>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 连接状态指示器 - 升级版 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <div className={`
            px-4 py-3 rounded-2xl shadow-xl backdrop-blur-sm border transition-all duration-300
            ${isConnected
              ? 'bg-green-50/90 border-green-200 text-green-700'
              : 'bg-red-50/90 border-red-200 text-red-700'
            }
          `}>
            <div className="flex items-center space-x-3">
              <motion.div
                animate={isConnected ? { scale: [1, 1.2, 1] } : { opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
              />
              <span className="font-medium text-sm">
                {isConnected ? '🟢 竞价舞台连接正常' : '🔴 正在连接...'}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}