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

// 鍒涙剰杈撳叆琛ㄥ崟缁勪欢 - 鍗囩骇鐗?
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
              馃幁 AI 鍒涙剰绔炰环鑸炲彴
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-gray-600 text-xl font-medium"
            >
              5 浣嶉《绾?AI 涓撳鍗冲皢涓烘偍鐨勫垱鎰忓睍寮€婵€鐑堢珵浠凤紒
            </motion.p>

            {/* 绉垎鐘舵€佹樉绀?*/}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 flex items-center justify-center space-x-6"
            >
              <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white px-6 py-3 rounded-full text-lg font-bold shadow-lg">
                馃挵 褰撳墠绉垎: {userCredits}
              </div>
              <div className={`px-6 py-3 rounded-full text-lg font-bold shadow-lg transition-all duration-300 ${
                hasEnoughCredits
                  ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white'
                  : 'bg-gradient-to-r from-red-400 to-pink-400 text-white'
              }`}>
                {hasEnoughCredits ? '鉁?鍑嗗灏辩华' : `鈿狅笍 闇€瑕?${REQUIRED_CREDITS} 绉垎`}
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
                  <p className="text-red-800 font-bold text-lg">绉垎涓嶈冻锛屾棤娉曞惎鍔ㄧ珵浠?/p>
                  <p className="text-red-600 mt-1">
                    鍙備笌 AI 鍒涙剰绔炰环闇€瑕佽嚦灏?{REQUIRED_CREDITS} 绉垎銆傝瀹屾垚姣忔棩绛惧埌鎴栧厖鍊艰幏鍙栫Н鍒嗭紝鐒跺悗閲嶆柊浣撻獙杩欏満绮惧僵鐨勫垱鎰忕珵鎷嶏紒
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
                鉁?鎻忚堪鎮ㄧ殑鍒涙剰鎯虫硶
              </label>
              <Textarea
                value={ideaContent}
                onChange={(e) => setIdeaContent(e.target.value)}
                placeholder="渚嬪锛氫竴涓熀浜嶢I鐨勬櫤鑳藉灞呯鐞嗙郴缁燂紝鍙互瀛︿範鐢ㄦ埛涔犳儻骞惰嚜鍔ㄨ皟鑺傜幆澧冨弬鏁帮紝瀹炵幇鐪熸鐨勪釜鎬у寲灞呬綇浣撻獙..."
                className="min-h-[150px] text-lg border-2 border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 rounded-xl transition-all duration-300 shadow-inner"
                maxLength={500}
                disabled={!hasEnoughCredits}
              />
              <div className="flex justify-between mt-3 text-sm">
                <span className="text-gray-500 font-medium">
                  馃挕 璇︾粏鎻忚堪鏈夊姪浜?AI 涓撳鏇村噯纭瘎浼版偍鐨勫垱鎰忎环鍊?
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
                    姝ｅ湪鍚姩 AI 绔炰环鑸炲彴...
                  </>
                ) : !hasEnoughCredits ? (
                  <>
                    <AlertCircle className="w-6 h-6 mr-3" />
                    绉垎涓嶈冻锛屾棤娉曞弬涓庣珵浠?
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6 mr-3" />
                    馃幀 寮€濮?AI 鍒涙剰绔炰环琛ㄦ紨 (-{REQUIRED_CREDITS} 绉垎)
                  </>
                )}
              </Button>
            </motion.div>
          </motion.form>

          {/* 鐗硅壊璇存槑 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div className="text-center p-4 bg-white/60 rounded-lg border border-purple-100">
              <div className="text-2xl mb-2">馃幆</div>
              <h3 className="font-bold text-gray-700">涓撲笟璇勪及</h3>
              <p className="text-sm text-gray-600">5浣岮I涓撳澶氱淮搴﹀垎鏋?/p>
            </div>
            <div className="text-center p-4 bg-white/60 rounded-lg border border-purple-100">
              <div className="text-2xl mb-2">馃挵</div>
              <h3 className="font-bold text-gray-700">瀹炴椂绔炰环</h3>
              <p className="text-sm text-gray-600">鍔ㄦ€佺珵浠疯繃绋嬪彲瑙嗗寲</p>
            </div>
            <div className="text-center p-4 bg-white/60 rounded-lg border border-purple-100">
              <div className="text-2xl mb-2">馃搳</div>
              <h3 className="font-bold text-gray-700">鍟嗕笟鎸囧</h3>
              <p className="text-sm text-gray-600">鐢熸垚涓撲笟钀藉湴鏂规</p>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// 璇ョ粍浠跺凡琚?EnhancedAIPersonaStage 鍙栦唬锛屾彁渚涙洿涓板瘜鐨勮瑙夋晥鏋?

// 闃舵杩涘害鎸囩ず鍣?
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
      'warmup': '棰勭儹',
      'discussion': '璁ㄨ',
      'bidding': '绔炰环',
      'prediction': '棰勬祴',
      'result': '缁撴灉'
    }[phase.phase] || phase.phase,
    icon: {
      'warmup': Target,
      'discussion': MessageCircle,
      'bidding': Trophy,
      'prediction': TrendingUp,
      'result': Star
    }[phase.phase] || Target,
    duration: phase.duration * 60 // 杞崲涓虹
  }))

  const currentPhaseIndex = phases.findIndex(p => p.key === currentPhase)
  const currentPhaseData = phases[currentPhaseIndex]

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">绔炰环杩涘害</h3>
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

// 瀹炴椂缁熻闈㈡澘
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
          <div className="text-sm text-blue-700">鍦ㄧ嚎瑙備紬</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Trophy className="w-5 h-5 text-green-600 mr-1" />
          </div>
          <div className="text-2xl font-bold text-green-600">楼{highestBid}</div>
          <div className="text-sm text-green-700">鏈€楂樺嚭浠?/div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <MessageCircle className="w-5 h-5 text-purple-600 mr-1" />
          </div>
          <div className="text-2xl font-bold text-purple-600">{messageCount}</div>
          <div className="text-sm text-purple-700">璁ㄨ鏉℃暟</div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function CreativeIdeaBidding({ ideaId, autoStart = false, initialIdeaContent }: CreativeIdeaBiddingProps) {
  const router = useRouter()
  const { user, isLoading: authLoading, isInitialized, checkAuthState } = useAuth()
  const [showForm, setShowForm] = useState(() => !autoStart)
  const [isStarting, setIsStarting] = useState(false)
  const [isAutoStarting, setIsAutoStarting] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [prefilledIdeaContent, setPrefilledIdeaContent] = useState(initialIdeaContent ?? '')
  const autoStartRequestedRef = useRef(false)
  const [loadedIdea, setLoadedIdea] = useState<{ id: string; title?: string; description: string; category?: string } | null>(null)

  const getAccessToken = useCallback(() => {
    const token = tokenStorage.getAccessToken()
    if (!token) {
      throw new Error('鐧诲綍鐘舵€佸凡澶辨晥锛岃閲嶆柊鐧诲綍鍚庨噸璇?)
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
          description: description ?? '绮惧僵浼氳瘽鍊煎緱鏈熷緟'
        })
      })

      let data: any = null
      try {
        data = await response.json()
      } catch (parseError) {
        data = null
      }

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || data?.message || '绔炰环鍚姩澶辫触')
      }

      await checkAuthState()
    },
    [getAccessToken, checkAuthState]
  )

  // 鐢熸垚鍟嗕笟鎸囧涔︾浉鍏崇姸鎬?
  const [isGeneratingGuide, setIsGeneratingGuide] = useState(false)
  const [guideProgress, setGuideProgress] = useState(0)

  // 浣跨敤瀹為檯鐨刉ebSocket hook
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

  // 濡傛灉鐢ㄦ埛鏈櫥褰曟垨鏁版嵁鍔犺浇涓紝鏄剧ず鍔犺浇鐘舵€?
  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">鍔犺浇鐢ㄦ埛淇℃伅涓?..</p>
        </div>
      </div>
    )
  }

  // 妯℃嫙鏁版嵁鐢ㄤ簬灞曠ず
  const activeSpeaker = 'tech-pioneer-alex'
  const currentPhase = sessionData?.phase || 'warmup'
  const timeRemaining = sessionData?.timeRemaining || 120
  const highestBid = Math.max(...currentBids.map(b => b.amount), 50)
  const currentBidsMap: Record<string, number> = {}

  // 杞崲鐜版湁绔炰环鏁版嵁涓鸿鑹叉槧灏?
  AI_PERSONAS.forEach(persona => {
    const bid = currentBids.find(b => b.agentName === persona.name)
    currentBidsMap[persona.id] = bid?.amount || Math.floor(Math.random() * 100) + 50
  })

  // 杞崲AI浜や簰涓烘秷鎭牸寮?
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

    // 妫€鏌ョН鍒嗘槸鍚﹀厖瓒?
    if (!hasEnoughCredits(REQUIRED_CREDITS)) {
      setError('绉垎涓嶈冻锛屾棤娉曞弬涓庣珵浠?)
      return
    }

    setIsStarting(true)
    setError(null)

    try {
      // 鎵ｉ櫎绉垎
      await adjustCredits(-REQUIRED_CREDITS, 'AI鍒涙剰绔炰环鍙備笌璐圭敤')

      // 鍒涘缓浼氳瘽ID
      const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      setSessionId(newSessionId)

      // 妯℃嫙鍚姩寤惰繜
      await new Promise(resolve => setTimeout(resolve, 2000))
      setShowForm(false)
    } catch (error) {
      console.error('Failed to start bidding:', error)
      setError('鍚姩绔炰环澶辫触锛岀Н鍒嗗凡閫€杩?)
      // 閫€杩樼Н鍒?
      try {
        await adjustCredits(REQUIRED_CREDITS, '绔炰环鍚姩澶辫触閫€娆?)
      } catch (refundError) {
        console.error('Failed to refund credits:', refundError)
      }
    } finally {
      setIsStarting(false)
    }
  }

  const handleSupportPersona = async (personaId: string) => {
    const SUPPORT_COST = 10 // 鏀寔AI瑙掕壊鐨勭Н鍒嗘秷鑰?

    // 妫€鏌ョН鍒嗘槸鍚﹀厖瓒?
    if (!hasEnoughCredits(SUPPORT_COST)) {
      setError('绉垎涓嶈冻锛屾棤娉曟敮鎸佽瑙掕壊')
      return
    }

    try {
      const persona = AI_PERSONAS.find(p => p.id === personaId)
      if (persona && sessionId) {
        // 鎵ｉ櫎绉垎
        await adjustCredits(-SUPPORT_COST, `鏀寔AI涓撳 ${persona.name}`)
        supportAgent(persona.name)
        setError(null)
      }
    } catch (error) {
      console.error('Failed to support persona:', error)
      setError('鏀寔澶辫触锛岀Н鍒嗗凡閫€杩?)
      // 閫€杩樼Н鍒?
      try {
        await adjustCredits(SUPPORT_COST, '鏀寔澶辫触閫€娆?)
      } catch (refundError) {
        console.error('Failed to refund credits:', refundError)
      }
    }
  }

  const handleSendReaction = async (messageId: string, reaction: string) => {
    const REACTION_COST = 5 // 鍙戦€佸弽搴旂殑绉垎娑堣€?

    // 妫€鏌ョН鍒嗘槸鍚﹀厖瓒?
    if (!hasEnoughCredits(REACTION_COST)) {
      setError('绉垎涓嶈冻锛屾棤娉曞彂閫佸弽搴?)
      return
    }

    try {
      if (sessionId) {
        // 鎵ｉ櫎绉垎
        await adjustCredits(-REACTION_COST, '鍙戦€佷簰鍔ㄥ弽搴?)
        reactToDialogue(reaction)
        setError(null)
      }
    } catch (error) {
      console.error('Failed to send reaction:', error)
      setError('鍙戦€佸弽搴斿け璐ワ紝绉垎宸查€€杩?)
      // 閫€杩樼Н鍒?
      try {
        await adjustCredits(REACTION_COST, '鍙嶅簲鍙戦€佸け璐ラ€€娆?)
      } catch (refundError) {
        console.error('Failed to refund credits:', refundError)
      }
    }
  }

  const handleGenerateGuide = async () => {
    const GUIDE_COST = 100 // 鐢熸垚钀藉湴鎸囧崡鐨勭Н鍒嗘秷鑰?

    // 妫€鏌ョН鍒嗘槸鍚﹀厖瓒?
    if (!hasEnoughCredits(GUIDE_COST)) {
      setError('绉垎涓嶈冻锛岄渶瑕?00绉垎鐢熸垚鍟嗕笟钀藉湴鎸囧崡')
      return
    }

    setIsGeneratingGuide(true)
    setGuideProgress(0)
    setError(null)

    try {
      // 鎵ｉ櫎绉垎
      await adjustCredits(-GUIDE_COST, '鐢熸垚鍟嗕笟钀藉湴鎸囧崡')

      // 妯℃嫙杩涘害鏇存柊
      const progressInterval = setInterval(() => {
        setGuideProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 500)

      // 璋冪敤鐢熸垚钀藉湴鎸囧崡API
      const response = await fetch('/api/generate-business-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAccessToken()}`
        },
        body: JSON.stringify({
          ideaId: sessionId,
          ideaContent: 'AI鍒涙剰绔炰环鑸炲彴绯荤粺', // 浣跨敤褰撳墠浼氳瘽鐨勫垱鎰忓唴瀹?
          biddingResults: currentBids,
          aiDialogue: aiInteractions
        })
      })

      clearInterval(progressInterval)
      setGuideProgress(100)

      if (!response.ok) {
        throw new Error('鐢熸垚澶辫触')
      }

      const result = await response.json()

      // 璺宠浆鍒板晢涓氳鍒掗〉闈?
      router.push(`/business-plan?reportId=${result.reportId}&ideaTitle=${encodeURIComponent('AI鍒涙剰绔炰环鑸炲彴绯荤粺')}`)

    } catch (error) {
      console.error('Failed to generate guide:', error)
      setError('鐢熸垚钀藉湴鎸囧崡澶辫触锛岀Н鍒嗗凡閫€杩?)
      // 閫€杩樼Н鍒?
      try {
        await adjustCredits(GUIDE_COST, '钀藉湴鎸囧崡鐢熸垚澶辫触閫€娆?)
      } catch (refundError) {
        console.error('Failed to refund credits:', refundError)
      }
    } finally {
      setIsGeneratingGuide(false)
      setGuideProgress(0)
    }
  }

  // 鏄剧ず鍒涙剰杈撳叆琛ㄥ崟
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
        {/* 閿欒鎻愮ず */}
        {error && (
          <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          </div>
        )}

        {/* 椤甸潰鏍囬 - 鍗囩骇鐗?*/}
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
                  馃幁 AI 鍒涙剰绔炰环鑸炲彴
                </h3>
                <p className="text-gray-600 text-lg">
                  瑙傜湅 5 浣?AI 涓撳涓烘偍鐨勫垱鎰忔縺鐑堢珵浠?
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white px-4 py-2 rounded-full text-lg font-bold shadow-lg">
                馃挵 绉垎: {user.credits}
              </div>
              <Button
                onClick={() => router.push('/payment')}
                size="sm"
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg"
              >
                <Plus className="w-4 h-4 mr-1" />
                鍏呭€?
              </Button>
              <Button
                onClick={() => router.back()}
                size="sm"
                variant="outline"
                className="border-gray-300 hover:border-gray-400 shadow-lg"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                杩斿洖
              </Button>
            </motion.div>
          </div>

          {/* 瀹炴椂鐘舵€佹寚绀哄櫒 */}
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
                  {isConnected ? '馃煝 绔炰环杩涜涓? : '馃敶 杩炴帴涓?..'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">{viewerCount} 鍦ㄧ嚎瑙備紬</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-gray-700">鏈€楂樼珵浠仿highestBid}</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* 浣跨敤澧炲己鐨勭珵浠疯垶鍙扮粍浠?*/}
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

        {/* 鍟嗕笟钀藉湴鎸囧崡鐢熸垚 - 鍗囩骇鐗?*/}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12"
        >
          <Card className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 border-2 border-emerald-200 shadow-2xl overflow-hidden relative">
            {/* 鑳屾櫙瑁呴グ */}
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
                  馃幆 AI 鍟嗕笟钀藉湴鎸囧崡
                </motion.h3>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4 }}
                  className="text-gray-600 text-xl mb-8 max-w-2xl mx-auto"
                >
                  鍩轰簬 AI 涓撳绔炰环缁撴灉锛岀敓鎴愪笓涓氱殑鍟嗕笟钀藉湴鎸囧鏂规锛屽姪鎮ㄥ疄鐜板垱鎰忓彉鐜?
                </motion.p>

                {/* 鐗硅壊鍔熻兘灞曠ず */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.6 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
                >
                  <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl border border-emerald-100 shadow-lg">
                    <div className="text-3xl mb-3">馃搳</div>
                    <h4 className="font-bold text-gray-700 mb-2">甯傚満鍒嗘瀽</h4>
                    <p className="text-sm text-gray-600">娣卞害甯傚満璋冪爺涓庣珵浜夊垎鏋?/p>
                  </div>
                  <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl border border-emerald-100 shadow-lg">
                    <div className="text-3xl mb-3">馃挕</div>
                    <h4 className="font-bold text-gray-700 mb-2">鎵ц鏂规</h4>
                    <p className="text-sm text-gray-600">璇︾粏鐨勫疄鏂芥楠や笌鏃堕棿瑙勫垝</p>
                  </div>
                  <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl border border-emerald-100 shadow-lg">
                    <div className="text-3xl mb-3">馃挵</div>
                    <h4 className="font-bold text-gray-700 mb-2">鍟嗕笟妯″紡</h4>
                    <p className="text-sm text-gray-600">鍙鐨勭泩鍒╂ā寮忎笌鎶曡祫寤鸿</p>
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
                      馃殌 鐢熸垚涓撲笟钀藉湴鎸囧崡 (100 绉垎)
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
                      <span className="text-emerald-700 text-xl font-bold">AI 姝ｅ湪鍒嗘瀽鎮ㄧ殑鍒涙剰...</span>
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
                        <span>鐢熸垚杩涘害</span>
                        <span>{guideProgress}%</span>
                      </div>
                    </div>

                    <p className="text-emerald-600 font-medium">
                      姝ｅ湪鏁村悎 5 浣?AI 涓撳鐨勮瑙ｏ紝鐢熸垚鎮ㄧ殑涓撳睘鍟嗕笟鏂规...
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
                      <span className="text-amber-800 font-bold text-lg">绉垎涓嶈冻</span>
                    </div>
                    <p className="text-amber-700 mb-4">
                      鐢熸垚涓撲笟钀藉湴鎸囧崡闇€瑕?00 绉垎锛屽綋鍓嶇Н鍒嗕笉瓒炽€傜珛鍗冲厖鍊艰В閿佸畬鏁寸殑 AI 鍟嗕笟鍜ㄨ鏈嶅姟锛?
                    </p>
                    <Button
                      onClick={() => router.push('/payment')}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      绔嬪嵆鍏呭€艰幏鍙栫Н鍒?
                    </Button>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 杩炴帴鐘舵€佹寚绀哄櫒 - 鍗囩骇鐗?*/}
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
                {isConnected ? '馃煝 绔炰环鑸炲彴杩炴帴姝ｅ父' : '馃敶 姝ｅ湪杩炴帴...'}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
