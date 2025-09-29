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
  autoStart?: boolean
  initialIdeaContent?: string
}

// 创意输入表单组件 - 升级版
const CreativeInputForm = ({
  onSubmit,
  isLoading,
  userCredits,
  defaultContent
}: {
  onSubmit: (idea: string) => Promise<void | boolean> | void | boolean
  isLoading: boolean
  userCredits: number
  defaultContent?: string
}) => {
  const [ideaContent, setIdeaContent] = useState(defaultContent ?? '')
  const REQUIRED_CREDITS = 50 // Required credits to join bidding

  useEffect(() => {
    setIdeaContent(defaultContent ?? '')
  }, [defaultContent])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (ideaContent.trim() && userCredits >= REQUIRED_CREDITS) {
      await onSubmit(ideaContent.trim())
    }
  }

  const hasEnoughCredits = userCredits >= REQUIRED_CREDITS

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 border-purple-200 shadow-2xl backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-500 rounded-full text-white mb-6 shadow-lg">
              <Lightbulb className="w-10 h-10" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
              🎁 AI 创意竞价舞台
            </h1>
            <p className="text-gray-600 text-xl font-medium">
              5 位顶级 AI 专家即将为您的创意展开激烈竞价！
            </p>

            {/* 积分状态显示 */}
            <div className="mt-6 flex items-center justify-center space-x-6">
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
            </div>
          </div>

          {!hasEnoughCredits && (
            <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl">
              <div className="flex items-center">
                <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
                <div>
                  <p className="text-red-800 font-bold text-lg">积分不足，无法启动竞价</p>
                  <p className="text-red-600 mt-1">
                    参与 AI 创意竞价需要至少 {REQUIRED_CREDITS} 积分。请完成每日签到或充值获取积分，然后重新体验这场精彩的创意竞拍！
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
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

            <div className="text-center">
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
                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
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
                    🎀 开始 AI 创意竞价表演 (-{REQUIRED_CREDITS} 积分)
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* 特色说明 */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white/60 rounded-lg border border-purple-100">
              <div className="text-2xl mb-2">🏆</div>
              <h3 className="font-bold text-gray-700">专业评估</h3>
              <p className="text-sm text-gray-600">5位AI专家多维度分析</p>
            </div>
            <div className="text-center p-4 bg-white/60 rounded-lg border border-purple-100">
              <div className="text-2xl mb-2">💰</div>
              <h3 className="font-bold text-gray-700">实时竞价</h3>
              <p className="text-sm text-gray-600">动态竞价过程可视化</p>
            </div>
            <div className="text-center p-4 bg-white/60 rounded-lg border border-purple-100">
              <div className="text-2xl mb-2">📈</div>
              <h3 className="font-bold text-gray-700">商业指导</h3>
              <p className="text-sm text-gray-600">生成专业落地方案</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function CreativeIdeaBidding({ ideaId, autoStart = false, initialIdeaContent }: CreativeIdeaBiddingProps) {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [showForm, setShowForm] = useState(() => !autoStart)
  const [isStarting, setIsStarting] = useState(false)
  const [isAutoStarting, setIsAutoStarting] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [prefilledIdeaContent, setPrefilledIdeaContent] = useState(initialIdeaContent ?? '')
  const autoStartRequestedRef = useRef(false)
  const [loadedIdea, setLoadedIdea] = useState<{ id: string; title?: string; description: string; category?: string } | null>(null)

  useEffect(() => {
    if (initialIdeaContent) {
      setPrefilledIdeaContent(initialIdeaContent)
    }
  }, [initialIdeaContent])

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
    },
    [getAccessToken]
  )

  const handleStartBidding = useCallback(async (ideaContent: string) => {
    const REQUIRED_CREDITS = 50
    const sanitizedContent = ideaContent.trim()

    if (!sanitizedContent) {
      setError('Please describe your idea in detail before starting the bidding.')
      return false
    }

    if (!hasEnoughCredits(REQUIRED_CREDITS)) {
      setError('Not enough credits to enter the bidding stage.')
      return false
    }

    setPrefilledIdeaContent(sanitizedContent)
    setIsStarting(true)
    setError(null)

    try {
      await adjustCredits(-REQUIRED_CREDITS, 'AI bidding entry fee')

      const newSessionId = 'session-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9)
      setSessionId(newSessionId)
      setShowForm(false)

      await new Promise(resolve => setTimeout(resolve, 2000))
      return true
    } catch (error) {
      console.error('Failed to start bidding:', error)
      setShowForm(true)
      setError(error instanceof Error ? error.message || 'Failed to start bidding. Credits were refunded.' : 'Failed to start bidding. Credits were refunded.')
      try {
        await adjustCredits(REQUIRED_CREDITS, 'Bidding launch refund')
      } catch (refundError) {
        console.error('Failed to refund credits:', refundError)
      }
      return false
    } finally {
      setIsStarting(false)
    }
  }, [adjustCredits, hasEnoughCredits])

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
          isLoading={isStarting || isAutoStarting}
          userCredits={user.credits}
          defaultContent={prefilledIdeaContent}
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
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-full p-3 mr-4 shadow-lg">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  🎁 AI 创意竞价舞台
                </h3>
                <p className="text-gray-600 text-lg">
                  观看 5 位 AI 专家为您的创意激烈竞价
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
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
            </div>
          </div>
        </div>

        {/* 使用增强的竞价舞台组件 */}
        <EnhancedBiddingStage
          ideaId={loadedIdea?.id || ideaId || 'demo-idea'}
          messages={[]}
          currentBids={{}}
          activeSpeaker="tech-pioneer-alex"
          currentPhase="warmup"
          onSupportPersona={() => {}}
        />
      </div>
    </div>
  )
}