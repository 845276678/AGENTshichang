'use client'

import React, { useState, useEffect } from 'react'
import { Layout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import {
  TrendingUp,
  Clock,
  Brain,
  Eye,
  Timer,
  Target,
  Zap,
  TrendingDown,
  Users
} from 'lucide-react'

// MVP版本的创意竞价页面
export default function MVPBiddingPage({ ideaId }) {
  // WebSocket连接和实时状态
  const {
    isConnected,
    currentBids,
    currentPrice,
    viewerCount,
    aiThoughts,
    timeRemaining,
    submitGuess
  } = useMVPBiddingWebSocket(ideaId)

  const [idea, setIdea] = useState(null)
  const [sessionId, setSessionId] = useState(null)
  const [userGuess, setUserGuess] = useState(null)

  // 获取创意和竞价会话信息
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/ideas/${ideaId}/bidding-session`)
        const data = await response.json()
        setIdea(data.idea)
        setSessionId(data.sessionId)
      } catch (error) {
        console.error('Failed to fetch bidding data:', error)
      }
    }

    fetchData()
  }, [ideaId])

  if (!idea || !sessionId) {
    return (
      <Layout>
        <div className="container py-12 text-center">
          <div className="animate-pulse">加载中...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container py-8 max-w-7xl">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline">
              <Zap className="w-4 h-4 mr-2" />
              实时竞价
            </Badge>
            <Badge variant={isConnected ? 'default' : 'secondary'}>
              {isConnected ? '🟢 已连接' : '🔴 连接中'}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Users className="w-4 h-4" />
              {viewerCount} 人在线观看
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-2">{idea.title}</h1>
          <p className="text-gray-600">{idea.description}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 左侧：实时竞价展示 */}
          <div className="lg:col-span-2 space-y-6">

            {/* 当前竞价状态 */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-blue-500"></div>

              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Timer className="w-5 h-5" />
                    实时竞价
                  </CardTitle>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">剩余时间</div>
                    <div className="text-lg font-bold text-orange-600">
                      <Clock className="w-4 h-4 inline mr-1" />
                      {formatTime(timeRemaining)}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {/* 当前最高价 */}
                <div className="text-center mb-6">
                  <div className="text-sm text-gray-500 mb-1">当前最高出价</div>
                  <div className="text-4xl font-bold text-primary mb-2">
                    {currentPrice} 积分
                  </div>
                  <div className="text-sm text-green-600">
                    {currentBids.length > 0 && `由 ${currentBids[0]?.agentName} 出价`}
                  </div>
                </div>

                {/* 价格变化趋势 */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>价格趋势</span>
                    <span className="text-green-600">
                      <TrendingUp className="w-4 h-4 inline" /> +{currentPrice - 50}
                    </span>
                  </div>
                  <Progress
                    value={(currentPrice - 50) / 200 * 100}
                    className="h-2"
                  />
                </div>

                {/* 竞价历史（最近5次） */}
                <div className="space-y-3">
                  <div className="font-medium text-sm">最近竞价:</div>
                  {currentBids.slice(0, 5).map((bid, index) => (
                    <BidHistoryItem
                      key={bid.id || index}
                      bid={bid}
                      isLatest={index === 0}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI实时分析 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  AI竞价师分析
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AIAnalysisDisplay
                  agents={AI_AGENTS}
                  aiThoughts={aiThoughts}
                />
              </CardContent>
            </Card>
          </div>

          {/* 右侧：用户互动区域 */}
          <div className="space-y-6">

            {/* 价格预测竞猜 */}
            <PriceGuessingWidget
              sessionId={sessionId}
              currentPrice={currentPrice}
              timeRemaining={timeRemaining}
              onGuessSubmit={(guess) => {
                setUserGuess(guess)
                submitGuess(guess.price, guess.confidence)
              }}
            />

            {/* 用户等级显示 */}
            <UserLevelDisplay />

            {/* 竞猜统计 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">竞猜统计</CardTitle>
              </CardHeader>
              <CardContent>
                <GuessStatistics sessionId={sessionId} />
              </CardContent>
            </Card>

            {/* 快速操作 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">快速操作</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full">
                  <Eye className="w-4 h-4 mr-2" />
                  查看创意详情
                </Button>
                <Button variant="outline" className="w-full">
                  <Target className="w-4 h-4 mr-2" />
                  查看历史竞价
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}

// 竞价历史项组件
const BidHistoryItem = ({ bid, isLatest }) => {
  return (
    <div className={`flex items-start gap-3 p-3 border rounded-lg ${
      isLatest ? 'border-green-200 bg-green-50' : ''
    }`}>
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
        <Brain className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="font-medium truncate">{bid.agentName}</span>
          <div className="flex items-center gap-1">
            {isLatest && <Badge variant="secondary" className="text-xs">最新</Badge>}
            <span className="font-bold text-primary">{bid.amount} 积分</span>
          </div>
        </div>
        {bid.comment && (
          <p className="text-sm text-gray-600 line-clamp-2">{bid.comment}</p>
        )}
        {bid.confidence && (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500">信心度:</span>
            <Progress value={bid.confidence * 100} className="h-1 w-16" />
            <span className="text-xs text-gray-500">
              {Math.round(bid.confidence * 100)}%
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// 价格竞猜组件（简化版）
const PriceGuessingWidget = ({ sessionId, currentPrice, timeRemaining, onGuessSubmit }) => {
  const [guessedPrice, setGuessedPrice] = useState(currentPrice)
  const [confidence, setConfidence] = useState(0.5)
  const [hasGuessed, setHasGuessed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { user } = useAuth()

  const handleSubmit = async () => {
    if (!user || hasGuessed || isSubmitting) return

    setIsSubmitting(true)
    try {
      await onGuessSubmit({
        price: guessedPrice,
        confidence: confidence
      })
      setHasGuessed(true)
    } catch (error) {
      console.error('Failed to submit guess:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (timeRemaining <= 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">竞价已结束</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500">
            竞价已结束，正在计算结果...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-dashed border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="w-5 h-5" />
          预测最终价格
        </CardTitle>
        <CardDescription>
          投注 10 积分，准确预测可获得丰厚奖励
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {!hasGuessed ? (
          <>
            {/* 价格滑块 */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>预测价格</span>
                <span className="font-bold">{guessedPrice} 积分</span>
              </div>
              <Slider
                value={[guessedPrice]}
                onValueChange={([value]) => setGuessedPrice(value)}
                max={currentPrice * 2}
                min={currentPrice}
                step={5}
                className="mb-2"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>{currentPrice}</span>
                <span>当前价格</span>
                <span>{currentPrice * 2}</span>
              </div>
            </div>

            {/* 信心度 */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>信心度</span>
                <span className="font-bold">{Math.round(confidence * 100)}%</span>
              </div>
              <Slider
                value={[confidence]}
                onValueChange={([value]) => setConfidence(value)}
                max={1}
                min={0.1}
                step={0.1}
              />
            </div>

            {/* 奖励预览 */}
            <div className="bg-blue-50 p-3 rounded-lg text-sm">
              <div className="flex justify-between mb-1">
                <span>投注积分:</span>
                <span className="font-bold">10 积分</span>
              </div>
              <div className="flex justify-between">
                <span>潜在收益:</span>
                <span className="font-bold text-green-600">
                  最高 {Math.round(10 * (1 + confidence * 2))} 积分
                </span>
              </div>
            </div>

            {/* 提交按钮 */}
            <Button
              onClick={handleSubmit}
              disabled={!user || user.credits < 10 || isSubmitting}
              className="w-full"
            >
              {!user ? '请先登录' :
               user.credits < 10 ? '积分不足' :
               isSubmitting ? '提交中...' : '提交预测'}
            </Button>
          </>
        ) : (
          <div className="text-center space-y-3">
            <div className="text-green-600 font-medium">
              ✅ 预测已提交
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-sm text-gray-600">你的预测</div>
              <div className="text-xl font-bold">{guessedPrice} 积分</div>
              <div className="text-sm">信心度: {Math.round(confidence * 100)}%</div>
            </div>
            <div className="text-orange-600 text-sm">
              <Clock className="w-4 h-4 inline mr-1" />
              等待竞价结束...
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// AI分析展示组件
const AIAnalysisDisplay = ({ agents, aiThoughts }) => {
  return (
    <div className="space-y-4">
      {agents.map(agent => {
        const thought = aiThoughts[agent.name]

        return (
          <div key={agent.name} className="p-3 border rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <Brain className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="font-medium">{agent.name}</div>
                <div className="text-xs text-gray-500">{agent.personality}</div>
              </div>
              {thought?.completed && (
                <Badge variant="secondary" className="text-xs">已完成</Badge>
              )}
            </div>

            {thought ? (
              <div className="space-y-2">
                {/* 思考进度 */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(thought.progress || 0) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 min-w-[3rem]">
                    {Math.round((thought.progress || 0) * 100)}%
                  </span>
                </div>

                {/* 当前状态 */}
                <div className="text-sm text-gray-600">
                  {thought.phase === 'analyzing' && '🔍 分析创意价值...'}
                  {thought.phase === 'evaluating' && '⚖️ 评估市场潜力...'}
                  {thought.phase === 'deciding' && '💭 制定出价策略...'}
                  {thought.completed && '✅ 分析完成，准备出价'}
                </div>

                {/* 分析结果（如果有） */}
                {thought.scores && (
                  <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t">
                    <div className="text-center">
                      <div className="text-gray-500">技术</div>
                      <div className="font-bold text-blue-600">
                        {Math.round(thought.scores.tech * 100)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-500">市场</div>
                      <div className="font-bold text-green-600">
                        {Math.round(thought.scores.market * 100)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-500">创新</div>
                      <div className="font-bold text-purple-600">
                        {Math.round(thought.scores.innovation * 100)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-400 text-sm">等待分析开始...</div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// 简化的用户等级显示
const UserLevelDisplay = () => {
  const { user } = useAuth()

  if (!user) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">我的竞猜等级</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="font-bold text-lg">Lv.{user.guessLevel || 1}</div>
            <div className="text-sm text-gray-600">竞猜新手</div>
          </div>
          <div className="text-right">
            <div className="font-bold text-green-600">
              {Math.round((user.guessAccuracy || 0) * 100)}%
            </div>
            <div className="text-sm text-gray-600">准确率</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>等级进度</span>
            <span>{Math.round((user.levelProgress || 0) * 100)}%</span>
          </div>
          <Progress value={(user.levelProgress || 0) * 100} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4 text-center text-sm">
          <div>
            <div className="font-bold">{user.totalGuesses || 0}</div>
            <div className="text-gray-500">总竞猜</div>
          </div>
          <div>
            <div className="font-bold text-green-600">{user.guessEarnings || 0}</div>
            <div className="text-gray-500">收益积分</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// 竞猜统计组件
const GuessStatistics = ({ sessionId }) => {
  const [stats, setStats] = useState({
    totalGuesses: 0,
    averageGuess: 0,
    priceDistribution: []
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/guess/sessions/${sessionId}/stats`)
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('Failed to fetch guess stats:', error)
      }
    }

    fetchStats()
  }, [sessionId])

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4 text-center">
        <div>
          <div className="font-bold text-lg">{stats.totalGuesses}</div>
          <div className="text-sm text-gray-500">参与人数</div>
        </div>
        <div>
          <div className="font-bold text-lg">{stats.averageGuess}</div>
          <div className="text-sm text-gray-500">平均预测</div>
        </div>
      </div>

      {stats.priceDistribution.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium">价格分布:</div>
          {stats.priceDistribution.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span>{item.range}</span>
              <span>{item.count} 人</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// 时间格式化工具函数
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 简化的AI代理配置
const AI_AGENTS = [
  {
    name: '科技先锋艾克斯',
    type: 'tech',
    personality: '数据驱动，理性分析'
  },
  {
    name: '文艺少女小琳',
    type: 'creative',
    personality: '感性温柔，重视创意'
  },
  {
    name: '商人老李',
    type: 'business',
    personality: '务实精明，商业敏感'
  }
]