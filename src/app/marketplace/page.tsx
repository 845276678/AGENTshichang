'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { WebSocketProvider, useBiddingSession } from '@/lib/websocket'
import ReactMarkdown from 'react-markdown'

import { tokenStorage } from '@/lib/token-storage'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  MessageCircle,
  Gavel,
  Trophy,
  Timer,
  TrendingUp,
  Users,
  Sparkles,
  Brain,
  DollarSign,
  Heart,
  Lightbulb,
  BookOpen,
  Play,
  Pause,
  RotateCcw,
  FileText,
  Share2,
  Send,
  Rocket,
  Zap,
  LogIn
} from 'lucide-react'

// AI 角色配置
const AI_PERSONAS = [
  {
    id: 'alex',
    name: '科技先锋艾克斯',
    avatar: '/avatars/alex.png',
    specialty: '架构评估、算法优化',
    personality: '理性、技术控',
    color: 'bg-blue-500',
    icon: Brain
  },
  {
    id: 'wang',
    name: '商业大亨老王',
    avatar: '/avatars/wang.png',
    specialty: '盈利模型、风险评估',
    personality: '结果导向',
    color: 'bg-green-500',
    icon: DollarSign
  },
  {
    id: 'lin',
    name: '文艺少女小琳',
    avatar: '/avatars/lin.png',
    specialty: '用户体验、品牌故事',
    personality: '情感共鸣',
    color: 'bg-pink-500',
    icon: Heart
  },
  {
    id: 'alan',
    name: '趋势达人阿伦',
    avatar: '/avatars/alan.png',
    specialty: '传播策略、热点预测',
    personality: '营销、社交',
    color: 'bg-purple-500',
    icon: TrendingUp
  },
  {
    id: 'prof',
    name: '学者教授李博',
    avatar: '/avatars/prof.png',
    specialty: '理论支撑、系统分析',
    personality: '严谨权威',
    color: 'bg-amber-500',
    icon: BookOpen
  }
]

// 阶段枚举
enum BiddingPhase {
  LOBBY = 'lobby',
  DISCUSSION = 'discussion',
  BIDDING = 'bidding',
  RESULTS = 'results'
}

// 模拟创意提交状态
const CREATE_IDEA_PHASE = {
  FORM: 'form',
  PROCESSING: 'processing',
  SESSION: 'session'
}

export default function MarketplacePage() {
  const router = useRouter()
  const { user, isLoading, isInitialized } = useAuth()
  const [currentView, setCurrentView] = useState<'lobby' | 'session'>('lobby')
  const [userIdea, setUserIdea] = useState<any>(null)

  // 显示加载状态
  if (isLoading || !isInitialized) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">加载中...</p>
          </div>
        </div>
      </Layout>
    )
  }

  // 如果用户未登录，显示登录提示
  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogIn className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">需要登录</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                访问AI创意竞价中心需要登录账户。请先登录或注册一个新账户。
              </p>
              <div className="space-y-2">
                <Button
                  onClick={() => router.push('/auth/login')}
                  className="w-full"
                >
                  登录账户
                </Button>
                <Button
                  onClick={() => router.push('/auth/register')}
                  variant="outline"
                  className="w-full"
                >
                  注册新账户
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    )
  }

  const handleStartSession = (ideaData: any) => {
    setUserIdea(ideaData)
    setCurrentView('session')
  }

  const handleBackToLobby = () => {
    setCurrentView('lobby')
    setUserIdea(null)
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            {currentView === 'lobby' && (
              <MarketplaceLobby
                key="lobby"
                onStartSession={handleStartSession}
              />
            )}
            {currentView === 'session' && userIdea && (
              <WebSocketProvider sessionId={userIdea.id}>
                <BiddingSessionView
                  key="session"
                  ideaData={userIdea}
                  onBackToLobby={handleBackToLobby}
                />
              </WebSocketProvider>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  )
}

// 市场大厅组件 - 重新设计为用户创意提交界面
function MarketplaceLobby({ onStartSession }: {
  onStartSession: (ideaData: any) => void
}) {
  const [ideaTitle, setIdeaTitle] = useState('')
  const [ideaDescription, setIdeaDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)


  const handleSubmitIdea = async () => {
    if (!ideaTitle.trim() || !ideaDescription.trim()) {
      alert('请填写完整的创意信息')
      return
    }

    setIsSubmitting(true)

    try {
      // 1. 先创建创意到数据库
      const ideaResponse = await fetch('/api/ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenStorage.getAccessToken()}`
        },
        body: JSON.stringify({
          title: ideaTitle,
          description: ideaDescription,
          category: 'TECH' // 默认分类，因为我们已经删除了分类选择
        })
      })

      if (!ideaResponse.ok) {
        throw new Error('创建创意失败')
      }

      const ideaData = await ideaResponse.json()

      // 2. 创建讨论会话
      const discussionResponse = await fetch('/api/discussions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenStorage.getAccessToken()}`
        },
        body: JSON.stringify({
          ideaId: ideaData.idea.id
        })
      })

      if (!discussionResponse.ok) {
        throw new Error('创建讨论会话失败')
      }

      const discussionData = await discussionResponse.json()

      // 3. 准备传递给会话的数据
      const sessionData = {
        id: ideaData.idea.id,
        title: ideaTitle,
        description: ideaDescription,
        discussionId: discussionData.discussion.id,
        submittedAt: new Date()
      }

      onStartSession(sessionData)
    } catch (error) {
      console.error('创建会话失败:', error)
      alert('创建会话失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* 页面标题 */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            AI创意竞价中心
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            分享您的创意，与AI专家深度交流，获得专业评估和丰厚奖励
          </p>
        </motion.div>
      </div>

      {/* AI 专家团队展示 - 修复头像显示 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-12"
      >
        <Card className="border-2 border-dashed border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-blue-600" />
              五大 AI 专家随时待命
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4">
              {AI_PERSONAS.map((persona, index) => (
                <motion.div
                  key={persona.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center group cursor-pointer"
                >
                  <div className={`w-20 h-20 rounded-full ${persona.color} flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform overflow-hidden border-4 border-white`}>
                    <img
                      src={persona.avatar}
                      alt={persona.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-semibold text-sm">{persona.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{persona.specialty}</p>
                  <Badge variant="outline" className="mt-2 text-xs">{persona.personality}</Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* 主要创意提交表单 */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <motion.div
                  className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Lightbulb className="w-6 h-6 text-white" />
                </motion.div>
                分享您的创意想法
              </CardTitle>
              <p className="text-base text-muted-foreground">
                详细描述您的创意，AI专家将与您深度交流并进行专业评估
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* 创意标题 */}
              <div>
                <label className="text-base font-medium mb-3 block">
                  创意标题 ✨
                </label>
                <Input
                  value={ideaTitle}
                  onChange={(e) => setIdeaTitle(e.target.value)}
                  placeholder="为您的创意起一个吸引人的标题..."
                  className="text-lg p-4 border-2 border-slate-200 focus:border-purple-400 rounded-xl"
                  disabled={isSubmitting}
                />
              </div>


              {/* 创意描述 */}
              <div>
                <label className="text-base font-medium mb-3 block">
                  创意详细描述 🚀
                </label>
                <textarea
                  value={ideaDescription}
                  onChange={(e) => setIdeaDescription(e.target.value)}
                  placeholder="详细描述您的创意想法：

💡 核心概念和独特价值
🎯 目标用户或应用场景
🏆 预期效果和解决的问题
🛠️ 初步实现思路

字数越详细，AI专家的评估越精准！"
                  className="w-full min-h-[200px] text-base p-6 border-2 border-slate-200 focus:border-purple-400 rounded-2xl resize-none transition-all duration-300"
                  disabled={isSubmitting}
                />
                <div className="flex justify-between items-center mt-3">
                  <div className="text-sm text-muted-foreground">
                    当前字数: <span className="font-medium text-purple-600">{ideaDescription.length}</span> / 建议200字以上
                  </div>
                </div>
              </div>

              {/* 提交按钮 */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handleSubmitIdea}
                  disabled={!ideaTitle.trim() || !ideaDescription.trim() || isSubmitting}
                  className="w-full h-14 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Brain className="w-5 h-5" />
                        </motion.div>
                        <span>正在启动AI评估...</span>
                      </>
                    ) : (
                      <>
                        <Rocket className="w-5 h-5" />
                        <span>开始AI专家评估</span>
                        <Send className="w-5 h-5" />
                      </>
                    )}
                  </div>
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 右侧流程说明 */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          {/* 流程说明 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">🎯 三阶段互动流程</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center p-4 rounded-lg bg-blue-50">
                  <MessageCircle className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-blue-600 mb-2">阶段一：深度讨论</h3>
                  <p className="text-sm text-muted-foreground">与AI专家进行3轮深度问答<br />时长：10-12分钟</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-green-50">
                  <Gavel className="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-green-600 mb-2">阶段二：激烈竞价</h3>
                  <p className="text-sm text-muted-foreground">观看AI角色实时竞价博弈<br />时长：18-22分钟</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-amber-50">
                  <Trophy className="w-8 h-8 text-amber-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-amber-600 mb-2">阶段三：丰厚奖励</h3>
                  <p className="text-sm text-muted-foreground">价格预测获得积分奖励<br />时长：4-6分钟</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 积分奖励说明 */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </motion.div>
                积分奖励系统
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { action: '创意分享', reward: '+10积分', icon: '📝' },
                { action: 'AI竞价成功', reward: '+50-500积分', icon: '💰' },
                { action: '高质量创意', reward: '额外奖励', icon: '🏆' },
                { action: '生成商业计划', reward: '专业指导', icon: '🚀' }
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm">{item.action}</span>
                  </div>
                  <span className="font-medium text-amber-600">{item.reward}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}

// 竞价会话主视图
function BiddingSessionView({ ideaData, onBackToLobby }: {
  ideaData: any
  onBackToLobby: () => void
}) {
  const [currentPhase, setCurrentPhase] = useState<BiddingPhase>(BiddingPhase.DISCUSSION)
  const [timeRemaining, setTimeRemaining] = useState(600) // 10分钟讨论阶段
  const [isPaused, setIsPaused] = useState(false)
  const [discussionData, setDiscussionData] = useState<any>(null)

  // 在组件挂载时获取讨论数据
  useEffect(() => {
    const fetchDiscussionData = async () => {
      if (ideaData?.discussionId) {
        try {
          const response = await fetch(`/api/discussions?ideaId=${ideaData.id}`, {
            headers: {
              'Authorization': `Bearer ${tokenStorage.getAccessToken()}`
            }
          })

          if (response.ok) {
            const data = await response.json()
            setDiscussionData(data.discussion)
          }
        } catch (error) {
          console.error('获取讨论数据失败:', error)
        }
      }
    }

    fetchDiscussionData()
  }, [ideaData])

  const {
    sessionData,
    messages,
    bids,
    sendUserMessage,
    submitPrediction,
    isConnected
  } = useBiddingSession(ideaData.id)

  // 计时器
  useEffect(() => {
    if (!isPaused && timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining(prev => prev - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeRemaining === 0) {
      handlePhaseTransition()
    }
  }, [timeRemaining, isPaused])

  const handlePhaseTransition = () => {
    if (currentPhase === BiddingPhase.DISCUSSION) {
      setCurrentPhase(BiddingPhase.BIDDING)
      setTimeRemaining(1200) // 20分钟竞价阶段
    } else if (currentPhase === BiddingPhase.BIDDING) {
      setCurrentPhase(BiddingPhase.RESULTS)
      setTimeRemaining(300) // 5分钟结果阶段
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      {/* 顶部导航 */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={onBackToLobby}>
          ← 返回大厅
        </Button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm">{isConnected ? '实时连接' : '连接断开'}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPaused(!isPaused)}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            {isPaused ? '继续' : '暂停'}
          </Button>
        </div>
      </div>

      {/* 主要会话界面 */}
      <BiddingSessionInterface
        phase={currentPhase}
        timeRemaining={timeRemaining}
        messages={messages}
        bids={bids}
        onSendMessage={sendUserMessage}
        onSubmitPrediction={submitPrediction}
        personas={AI_PERSONAS}
        discussionData={discussionData}
        ideaData={ideaData}
      />
    </motion.div>
  )
}

// 竞价会话界面组件
function BiddingSessionInterface({
  phase,
  timeRemaining,
  messages,
  bids,
  onSendMessage,
  onSubmitPrediction,
  personas,
  discussionData,
  ideaData
}: any) {
  const [userInput, setUserInput] = useState('')
  const [userPrediction, setUserPrediction] = useState<number | null>(null)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getPhaseInfo = () => {
    switch (phase) {
      case BiddingPhase.DISCUSSION:
        return {
          title: '深度讨论阶段',
          description: '与 AI 专家深入探讨创意细节',
          icon: MessageCircle,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50'
        }
      case BiddingPhase.BIDDING:
        return {
          title: '激烈竞价阶段',
          description: 'AI 角色展开策略博弈',
          icon: Gavel,
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        }
      case BiddingPhase.RESULTS:
        return {
          title: '结果与奖励',
          description: '查看竞价结果并获得奖励',
          icon: Trophy,
          color: 'text-amber-600',
          bgColor: 'bg-amber-50'
        }
      default:
        return {
          title: '准备中',
          description: '正在初始化会话',
          icon: Lightbulb,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50'
        }
    }
  }

  const phaseInfo = getPhaseInfo()
  const PhaseIcon = phaseInfo.icon

  return (
    <div className="space-y-6">
      {/* 阶段状态栏 */}
      <Card className={`border-2 ${phaseInfo.bgColor} border-opacity-50`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full ${phaseInfo.bgColor} flex items-center justify-center border-2`}>
                <PhaseIcon className={`w-6 h-6 ${phaseInfo.color}`} />
              </div>
              <div>
                <h2 className={`text-xl font-bold ${phaseInfo.color}`}>{phaseInfo.title}</h2>
                <p className="text-muted-foreground">{phaseInfo.description}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{formatTime(timeRemaining)}</div>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Timer className="w-4 h-4" />
                剩余时间
              </div>
            </div>
          </div>
          <Progress
            value={phase === BiddingPhase.DISCUSSION ? (600 - timeRemaining) / 600 * 100 :
                   phase === BiddingPhase.BIDDING ? (1200 - timeRemaining) / 1200 * 100 :
                   (300 - timeRemaining) / 300 * 100}
            className="mt-4"
          />
        </CardHeader>
      </Card>

      {/* 阶段特定内容 */}
      <AnimatePresence mode="wait">
        {phase === BiddingPhase.DISCUSSION && (
          <DiscussionPhase
            key="discussion"
            messages={messages}
            userInput={userInput}
            setUserInput={setUserInput}
            onSendMessage={onSendMessage}
            personas={personas}
            discussionData={discussionData}
            ideaData={ideaData}
          />
        )}

        {phase === BiddingPhase.BIDDING && (
          <BiddingPhaseComponent
            key="bidding"
            bids={bids}
            userPrediction={userPrediction}
            setUserPrediction={setUserPrediction}
            onSubmitPrediction={onSubmitPrediction}
            personas={personas}
          />
        )}

        {phase === BiddingPhase.RESULTS && (
          <ResultsPhase
            key="results"
            bids={bids}
            userPrediction={userPrediction}
            personas={personas}
            ideaData={ideaData}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// 讨论阶段组件 - 使用真实API
function DiscussionPhase({
  messages,
  userInput,
  setUserInput,
  onSendMessage,
  personas,
  discussionData,
  ideaData
}: any) {
  const [discussionMessages, setDiscussionMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // 获取讨论数据
  useEffect(() => {
    if (discussionData?.messages) {
      setDiscussionMessages(discussionData.messages)
    }
  }, [discussionData])

  const handleSendMessage = async () => {
    if (!userInput.trim() || !discussionData) return

    setIsLoading(true)
    try {
      // 发送消息到后端API
      const response = await fetch('/api/discussions/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenStorage.getAccessToken()}`
        },
        body: JSON.stringify({
          discussionId: discussionData.id,
          content: userInput
        })
      })

      if (!response.ok) {
        throw new Error('发送消息失败')
      }

      const data = await response.json()

      // 更新消息列表
      setDiscussionMessages(prev => [
        ...prev,
        data.userMessage,
        data.aiMessage
      ])

      setUserInput('')

      // 调用父组件的回调
      onSendMessage(userInput, data.nextRound || 1)

      // 如果讨论完成，可以触发下一阶段
      if (data.isCompleted) {
        // 讨论完成的逻辑
        console.log('讨论已完成，准备进入竞价阶段')
      }
    } catch (error) {
      console.error('发送消息失败:', error)
      alert('发送消息失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="grid grid-cols-1 lg:grid-cols-4 gap-6"
    >
      {/* 消息区域 */}
      <Card className="lg:col-span-3 h-96 flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            AI 专家讨论
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {/* 显示用户消息 */}
            {messages.map((message: any) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}

            {/* 显示真实的讨论消息 */}
            {discussionMessages.map((message: any) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.senderType === 'USER' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] p-4 rounded-lg ${
                  message.senderType === 'USER'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200'
                }`}>
                  {message.senderType === 'AI_AGENT' && (
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                        <Brain className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-purple-800">{message.senderName}</h4>
                        <p className="text-xs text-purple-600">第{message.roundNumber}轮讨论</p>
                      </div>
                    </div>
                  )}
                  <div className={`text-sm leading-relaxed ${
                    message.senderType === 'USER' ? 'text-white' : 'text-gray-800'
                  }`}>
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                  <p className={`text-xs mt-2 ${
                    message.senderType === 'USER' ? 'text-blue-100' : 'text-purple-500'
                  }`}>
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* 加载中提示 */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] p-4 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Brain className="w-5 h-5 text-purple-600" />
                    </motion.div>
                    <span className="text-sm text-purple-700">AI专家正在思考中...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 消息输入 */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="与 AI 专家交流您的想法..."
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!userInput.trim() || isLoading}
              >
                {isLoading ? '发送中...' : '发送'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI 专家面板 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">AI 专家团队</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {personas.slice(0, 3).map((persona: any) => {
            const PersonaIcon = persona.icon
            return (
              <div key={persona.id} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/20">
                <div className={`w-8 h-8 rounded-full ${persona.color} flex items-center justify-center overflow-hidden border-2 border-white`}>
                  <img
                    src={persona.avatar}
                    alt={persona.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{persona.name}</h4>
                  <p className="text-xs text-muted-foreground truncate">{persona.specialty}</p>
                </div>
                <Badge variant="outline" className="text-xs">在线</Badge>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// 竞价阶段组件（占位符）
function BiddingPhaseComponent({ bids, userPrediction, setUserPrediction, onSubmitPrediction }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="text-center p-12"
    >
      <h3 className="text-2xl font-bold mb-4">竞价阶段即将开始</h3>
      <p className="text-muted-foreground">AI 专家正在准备竞价策略...</p>
    </motion.div>
  )
}

// 结果阶段组件
function ResultsPhase({ bids, userPrediction, personas, ideaData }: any) {
  const router = useRouter()

  // 模拟竞价结果数据
  const mockResults = {
    winningBid: 350,
    winner: personas[1], // 商业大亨老王
    userReward: 150,
    reportId: 'report_' + Date.now(), // 模拟生成的报告ID
    ideaTitle: ideaData?.title || '智能创意项目'
  }

  // 动态价格计算逻辑
  const calculateGuideCost = (winningBid: number) => {
    return Math.max(winningBid, 50) // 最低50积分，基于竞价成功价格
  }

  const guideCost = calculateGuideCost(mockResults.winningBid)

  const handleViewBusinessPlan = () => {
    // 跳转到business-plan页面，传递竞价结果数据
    const params = new URLSearchParams({
      reportId: mockResults.reportId,
      ideaTitle: mockResults.ideaTitle,
      source: 'marketplace',
      winningBid: mockResults.winningBid.toString(),
      winner: mockResults.winner.name,
      guideCost: guideCost.toString() // 传递动态计算的价格
    })

    router.push(`/business-plan?${params.toString()}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="space-y-6"
    >
      {/* 竞价结果卡片 */}
      <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-amber-700">竞价结束！</CardTitle>
          <p className="text-amber-600">您的创意获得了AI专家们的激烈竞价</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 获胜者信息 */}
          <div className="text-center p-6 bg-white/60 rounded-xl">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-full ${mockResults.winner.color} flex items-center justify-center overflow-hidden border-2 border-white`}>
                <img
                  src={mockResults.winner.avatar}
                  alt={mockResults.winner.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold">{mockResults.winner.name}</h3>
                <p className="text-sm text-muted-foreground">{mockResults.winner.specialty}</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {mockResults.winningBid} 积分
            </div>
            <Badge className="bg-green-500">获胜出价</Badge>
          </div>

          {/* 用户奖励 */}
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">您获得的奖励</p>
            <div className="text-2xl font-bold text-blue-600">+{mockResults.userReward} 积分</div>
            <p className="text-xs text-muted-foreground mt-1">基于竞价活跃度和预测准确性</p>
          </div>

          {/* 下一步操作 */}
          <div className="space-y-3">
            {/* 价格说明区域 */}
            <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-700 mb-1">
                💰 基于获胜专家<strong>{mockResults.winner.name}</strong>的{mockResults.winningBid}积分竞价结果
              </p>
              <p className="text-xs text-green-600">
                生成专业商业落地指南仅需 <strong>{guideCost}积分</strong>
              </p>
            </div>

            <Button
              onClick={handleViewBusinessPlan}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-3"
            >
              <FileText className="w-5 h-5 mr-2" />
              🚀 生成专业落地指南 ({guideCost} 积分)
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="w-full">
                <MessageCircle className="w-4 h-4 mr-2" />
                查看详细讨论
              </Button>
              <Button variant="outline" className="w-full">
                <Share2 className="w-4 h-4 mr-2" />
                分享竞价结果
              </Button>
            </div>
          </div>

          {/* 商业计划预览 */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-1">
                  AI将为您生成商业计划书
                </h4>
                <p className="text-sm text-blue-700 mb-3">
                  基于竞价讨论和{mockResults.winner.name}的专业建议，系统将自动生成：
                </p>
                <ul className="text-xs text-blue-600 space-y-1 mb-3">
                  <li>• 市场分析与竞品研究</li>
                  <li>• 技术实现路径规划</li>
                  <li>• 商业模式与盈利预测</li>
                  <li>• 落地执行计划</li>
                </ul>
                <div className="p-2 bg-white/60 rounded border border-blue-200">
                  <p className="text-xs text-blue-800">
                    💡 <strong>价格说明：</strong>基于竞价成功价格{mockResults.winningBid}积分，体现AI评估的真实价值。最低门槛50积分确保服务可及性。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}