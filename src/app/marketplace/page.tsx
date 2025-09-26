'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WebSocketProvider, useBiddingSession } from '@/lib/websocket'

import { Layout } from '@/components/layout'
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
  RotateCcw
} from 'lucide-react'

// AI 角色配置
const AI_PERSONAS = [
  {
    id: 'alex',
    name: '科技先锋艾克斯',
    avatar: '👨‍💻',
    specialty: '架构评估、算法优化',
    personality: '理性、技术控',
    color: 'bg-blue-500',
    icon: Brain
  },
  {
    id: 'wang',
    name: '商业大亨老王',
    avatar: '💼',
    specialty: '盈利模型、风险评估',
    personality: '结果导向',
    color: 'bg-green-500',
    icon: DollarSign
  },
  {
    id: 'lin',
    name: '文艺少女小琳',
    avatar: '🎨',
    specialty: '用户体验、品牌故事',
    personality: '情感共鸣',
    color: 'bg-pink-500',
    icon: Heart
  },
  {
    id: 'alan',
    name: '趋势达人阿伦',
    avatar: '📈',
    specialty: '传播策略、热点预测',
    personality: '营销、社交',
    color: 'bg-purple-500',
    icon: TrendingUp
  },
  {
    id: 'prof',
    name: '学者教授李博',
    avatar: '👨‍🏫',
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

// 模拟创意数据
const mockIdeas = [
  {
    id: '1',
    title: '智能家居语音控制系统',
    description: '基于AI的全屋智能语音控制方案，支持自然语言理解和多设备联动',
    category: '科技创新',
    author: '创意者001',
    submittedAt: '2小时前',
    status: '等待讨论',
    participants: 12,
    estimatedDuration: '35-45分钟'
  },
  {
    id: '2',
    title: '城市回忆录文化传承项目',
    description: '通过AR技术和口述历史，打造沉浸式城市文化体验',
    category: '文艺创作',
    author: '创意者002',
    submittedAt: '5小时前',
    status: '竞价中',
    currentBid: 280,
    participants: 8,
    estimatedDuration: '25分钟剩余'
  }
]

export default function MarketplacePage() {
  const [currentView, setCurrentView] = useState<'lobby' | 'session'>('lobby')
  const [selectedIdea, setSelectedIdea] = useState<string | null>(null)

  const handleJoinSession = (ideaId: string) => {
    setSelectedIdea(ideaId)
    setCurrentView('session')
  }

  const handleBackToLobby = () => {
    setCurrentView('lobby')
    setSelectedIdea(null)
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            {currentView === 'lobby' && (
              <MarketplaceLobby
                key="lobby"
                ideas={mockIdeas}
                onJoinSession={handleJoinSession}
              />
            )}
            {currentView === 'session' && selectedIdea && (
              <WebSocketProvider sessionId={selectedIdea}>
                <BiddingSessionView
                  key="session"
                  ideaId={selectedIdea}
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

// 市场大厅组件
function MarketplaceLobby({ ideas, onJoinSession }: {
  ideas: typeof mockIdeas
  onJoinSession: (ideaId: string) => void
}) {
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
            创意竞价市场
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            体验全新的三阶段交互：深度讨论 → 激烈竞价 → 丰厚奖励
          </p>
        </motion.div>
      </div>

      {/* AI 专家团队展示 */}
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
              {AI_PERSONAS.map((persona, index) => {
                const PersonaIcon = persona.icon
                return (
                  <motion.div
                    key={persona.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center group cursor-pointer"
                  >
                    <div className={`w-20 h-20 rounded-full ${persona.color} flex items-center justify-center text-3xl mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                      <PersonaIcon className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="font-semibold text-sm">{persona.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{persona.specialty}</p>
                    <Badge variant="outline" className="mt-2 text-xs">{persona.personality}</Badge>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 流程说明 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-center">🎯 三阶段互动流程</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      </motion.div>

      {/* 创意列表 */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center mb-6">🔥 热门创意正在进行</h2>
        {ideas.map((idea, index) => (
          <motion.div
            key={idea.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <IdeaCard idea={idea} onJoin={() => onJoinSession(idea.id)} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// 创意卡片组件
function IdeaCard({ idea, onJoin }: { idea: typeof mockIdeas[0], onJoin: () => void }) {
  return (
    <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 group">
      <div className="absolute top-4 right-4 z-10">
        <Badge
          variant={idea.status === '竞价中' ? 'default' : 'secondary'}
          className={idea.status === '竞价中' ? 'bg-green-500 animate-pulse' : ''}
        >
          {idea.status}
        </Badge>
      </div>

      <CardHeader className="pb-4">
        <div className="flex items-start justify-between pr-20">
          <div>
            <CardTitle className="text-xl mb-2 group-hover:text-blue-600 transition-colors">
              {idea.title}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
              <span>创意者: {idea.author}</span>
              <span>提交: {idea.submittedAt}</span>
              <Badge variant="outline">{idea.category}</Badge>
            </div>
          </div>
        </div>
        <p className="text-muted-foreground">{idea.description}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 状态信息 */}
        <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
          <div className="flex items-center gap-6">
            <div>
              <div className="text-sm text-muted-foreground">参与人数</div>
              <div className="text-lg font-bold flex items-center gap-1">
                <Users className="w-4 h-4" />
                {idea.participants}
              </div>
            </div>
            {idea.currentBid && (
              <div>
                <div className="text-sm text-muted-foreground">当前最高价</div>
                <div className="text-lg font-bold text-green-600">{idea.currentBid} 积分</div>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">预计时长</div>
            <div className="font-semibold text-blue-600">
              <Timer className="w-4 h-4 inline mr-1" />
              {idea.estimatedDuration}
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <Button
            onClick={onJoin}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Play className="w-4 h-4 mr-2" />
            {idea.status === '竞价中' ? '立即观看' : '开始讨论'}
          </Button>
          <Button variant="outline" className="px-6">
            了解详情
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// 竞价会话主视图
function BiddingSessionView({ ideaId, onBackToLobby }: {
  ideaId: string
  onBackToLobby: () => void
}) {
  const [currentPhase, setCurrentPhase] = useState<BiddingPhase>(BiddingPhase.DISCUSSION)
  const [timeRemaining, setTimeRemaining] = useState(600) // 10分钟讨论阶段
  const [isPaused, setIsPaused] = useState(false)

  const {
    sessionData,
    messages,
    bids,
    sendUserMessage,
    submitPrediction,
    isConnected
  } = useBiddingSession(ideaId)

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
  personas
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
          />
        )}

        {phase === BiddingPhase.BIDDING && (
          <BiddingPhase
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
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// 讨论阶段组件
function DiscussionPhase({
  messages,
  userInput,
  setUserInput,
  onSendMessage,
  personas
}: any) {
  const handleSendMessage = () => {
    if (userInput.trim()) {
      onSendMessage(userInput, 1) // 默认第1轮
      setUserInput('')
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
          </div>

          {/* 消息输入 */}
          <div className="flex gap-2">
            <Input
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="与 AI 专家交流您的想法..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button onClick={handleSendMessage} disabled={!userInput.trim()}>
              发送
            </Button>
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
                <div className={`w-8 h-8 rounded-full ${persona.color} flex items-center justify-center`}>
                  <PersonaIcon className="w-4 h-4 text-white" />
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

// 结果阶段组件（占位符）
function ResultsPhase({ bids, userPrediction }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="text-center p-12"
    >
      <Trophy className="w-16 h-16 text-amber-500 mx-auto mb-4" />
      <h3 className="text-2xl font-bold mb-4">竞价结果</h3>
      <p className="text-muted-foreground mb-6">恭喜！您获得了积分奖励</p>
      <Badge className="text-lg px-4 py-2">+150 积分</Badge>
    </motion.div>
  )
}