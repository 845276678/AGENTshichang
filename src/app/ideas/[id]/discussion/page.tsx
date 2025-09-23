'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import { Layout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import {
  ArrowLeft,
  Brain,
  MessageCircle,
  Send,
  Clock,
  CheckCircle,
  Star,
  Lightbulb,
  Target,
  Zap,
  User,
  Bot,
  ArrowRight,
  Award,
  Sparkles,
  Timer,
  MessageSquare,
  TrendingUp
} from 'lucide-react'

interface Message {
  id: string
  content: string
  messageType: string
  roundNumber: number
  senderType: 'USER' | 'AI_AGENT'
  senderName: string
  analysisData?: any
  suggestions?: string[]
  createdAt: string
}

interface Discussion {
  id: string
  currentRound: number
  totalRounds: number
  status: string
  aiAgentName: string
  aiAgentType: string
  messages: Message[]
  idea: {
    id: string
    title: string
    description: string
    category: string
  }
}

export default function IdeaDiscussionPage() {
  const params = useParams()
  const router = useRouter()
  const [discussion, setDiscussion] = useState<Discussion | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [userMessage, setUserMessage] = useState('')
  const [error, setError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchDiscussion()
  }, [params.id])

  useEffect(() => {
    scrollToBottom()
  }, [discussion?.messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchDiscussion = async () => {
    try {
      const response = await fetch(`/api/discussions?ideaId=${params.id}`)
      const data = await response.json()

      if (data.success) {
        setDiscussion(data.discussion)
      } else {
        setError(data.error || '获取讨论失败')
      }
    } catch (error) {
      console.error('获取讨论失败:', error)
      setError('网络错误')
    } finally {
      setLoading(false)
    }
  }

  const startDiscussion = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/discussions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ideaId: params.id
        })
      })

      const data = await response.json()

      if (data.success) {
        await fetchDiscussion()
      } else {
        setError(data.error || '启动讨论失败')
      }
    } catch (error) {
      console.error('启动讨论失败:', error)
      setError('网络错误')
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!userMessage.trim() || sending || !discussion) return

    try {
      setSending(true)
      const response = await fetch('/api/discussions/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          discussionId: discussion.id,
          content: userMessage.trim()
        })
      })

      const data = await response.json()

      if (data.success) {
        // 重新获取讨论数据
        await fetchDiscussion()
        setUserMessage('')
      } else {
        setError(data.error || '发送消息失败')
      }
    } catch (error) {
      console.error('发送消息失败:', error)
      setError('网络错误')
    } finally {
      setSending(false)
    }
  }

  const getAgentAvatar = (agentType: string) => {
    const avatars = {
      'tech': '🤖',        // 科技艾克斯
      'business': '💼',    // 商人老王
      'artistic': '🎨',    // 文艺小琳
      'trend': '📈',       // 趋势阿伦
      'academic': '📚'     // 教授李博
    }
    return avatars[agentType as keyof typeof avatars] || '🤖'
  }

  const getAgentColor = (agentType: string) => {
    const colors = {
      'tech': 'from-blue-500 to-cyan-500',         // 科技艾克斯
      'business': 'from-green-500 to-emerald-500', // 商人老王
      'artistic': 'from-purple-500 to-pink-500',   // 文艺小琳
      'trend': 'from-orange-500 to-red-500',       // 趋势阿伦
      'academic': 'from-indigo-500 to-blue-500'    // 教授李博
    }
    return colors[agentType as keyof typeof colors] || 'from-blue-500 to-cyan-500'
  }

  const formatMessageContent = (content: string) => {
    // 简单的markdown-like格式化
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/• (.*?)(?=\n|$)/g, '<li>$1</li>')
      .replace(/(\d+\. .*?)(?=\n|$)/g, '<div class="numbered-item">$1</div>')
      .split('\n').map(line => line.trim()).join('<br />')
  }

  if (loading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="flex items-center justify-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
            />
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="container py-8">
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-red-500 mb-4">❌</div>
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    )
  }

  // 如果没有讨论，显示启动界面
  if (!discussion) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <motion.div
                  className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <MessageCircle className="w-10 h-10 text-white" />
                </motion.div>
                <CardTitle className="text-2xl">🚀 启动AI创意讨论</CardTitle>
                <CardDescription className="text-lg">
                  我们的AI专家将与你进行3轮深度讨论，帮助完善你的创意
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { round: 1, title: '初步分析', desc: 'AI专家分析创意潜力' },
                    { round: 2, title: '深度讨论', desc: '针对关键问题交流' },
                    { round: 3, title: '优化建议', desc: '获得最终改进方案' }
                  ].map((step) => (
                    <motion.div
                      key={step.round}
                      className="text-center p-4 rounded-lg bg-gradient-to-b from-blue-50 to-purple-50"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: step.round * 0.1 }}
                    >
                      <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {step.round}
                      </div>
                      <h3 className="font-semibold">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.desc}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="text-center">
                  <Button
                    onClick={startDiscussion}
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    disabled={loading}
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    开始AI讨论
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    )
  }

  const isCompleted = discussion.status === 'COMPLETED'
  const canSendMessage = !isCompleted && discussion.currentRound <= discussion.totalRounds

  return (
    <Layout>
      <div className="container py-6">
        {/* 面包屑导航 */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            返回创意详情
          </Button>
          <span className="text-muted-foreground">/</span>
          <span>AI讨论</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左侧：创意信息和进度 */}
          <div className="lg:col-span-1 space-y-4">
            {/* 创意信息 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  创意信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h3 className="font-semibold">{discussion.idea.title}</h3>
                  <Badge variant="outline">{discussion.idea.category}</Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {discussion.idea.description}
                </p>
              </CardContent>
            </Card>

            {/* AI专家信息 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bot className="w-5 h-5 text-blue-500" />
                  AI专家
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getAgentColor(discussion.aiAgentType)} flex items-center justify-center text-2xl`}>
                    {getAgentAvatar(discussion.aiAgentType)}
                  </div>
                  <div>
                    <div className="font-semibold">{discussion.aiAgentName}</div>
                    <div className="text-sm text-muted-foreground">
                      {discussion.aiAgentType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 讨论进度 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Timer className="w-5 h-5 text-green-500" />
                  讨论进度
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 整体进度 */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>第 {discussion.currentRound} / {discussion.totalRounds} 轮</span>
                    <span>{Math.round((discussion.currentRound / discussion.totalRounds) * 100)}%</span>
                  </div>
                  <Progress value={(discussion.currentRound / discussion.totalRounds) * 100} />
                </div>

                {/* 讨论质量指标 */}
                <DiscussionQualityMetrics
                  messages={discussion.messages}
                  currentRound={discussion.currentRound}
                  agentType={discussion.aiAgentType}
                />

                {/* 轮次详情 */}
                <div className="space-y-2">
                  {Array.from({ length: discussion.totalRounds }, (_, i) => i + 1).map((round) => {
                    const isActiveRound = round === discussion.currentRound && !isCompleted
                    const isCompletedRound = round < discussion.currentRound || discussion.status === 'COMPLETED'
                    const hasMessages = discussion.messages.some(m => m.roundNumber === round)
                    const roundMessages = discussion.messages.filter(m => m.roundNumber === round)

                    // 计算该轮次的讨论质量
                    const roundQuality = calculateRoundQuality(roundMessages)
                    const roundTopics = extractRoundTopics(roundMessages)

                    return (
                      <motion.div
                        key={round}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: round * 0.1 }}
                        className={`p-3 rounded-lg border ${
                          isActiveRound ? 'bg-blue-50 border-blue-200' :
                          isCompletedRound ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              isCompletedRound ? 'bg-green-500 text-white' :
                              isActiveRound ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
                            }`}>
                              {isCompletedRound ? <CheckCircle className="w-5 h-5" /> : round}
                            </div>
                            <div>
                              <div className={`text-sm font-semibold ${isActiveRound ? 'text-blue-700' : ''}`}>
                                第{round}轮讨论
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {round === 1 ? '初步分析' : round === 2 ? '深度讨论' : '优化建议'}
                              </div>
                            </div>
                          </div>

                          {hasMessages && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MessageSquare className="w-3 h-3" />
                              <span>{roundMessages.length}</span>
                            </div>
                          )}
                        </div>

                        {/* 轮次质量指标 */}
                        {hasMessages && (
                          <div className="space-y-2 mt-3 pt-2 border-t border-gray-200">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">讨论质量</span>
                              <div className="flex items-center gap-1">
                                <div className={`w-2 h-2 rounded-full ${
                                  roundQuality >= 80 ? 'bg-green-500' :
                                  roundQuality >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                }`} />
                                <span className="font-medium">{roundQuality}/100</span>
                              </div>
                            </div>

                            {roundTopics.length > 0 && (
                              <div>
                                <div className="text-xs text-muted-foreground mb-1">讨论要点</div>
                                <div className="flex flex-wrap gap-1">
                                  {roundTopics.slice(0, 3).map((topic, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs px-1 py-0">
                                      {topic}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* 当前轮次的进展提示 */}
                        {isActiveRound && (
                          <div className="mt-2 p-2 bg-blue-100 rounded text-xs text-blue-700">
                            <div className="flex items-center gap-1">
                              <Activity className="w-3 h-3" />
                              <span>
                                {!hasMessages ? '等待AI专家分析...' :
                                 roundMessages.some(m => m.senderType === 'USER') ?
                                 '等待进入下一轮...' : '等待你的回复...'}
                              </span>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>

                {isCompleted && (
                  <div className="text-center pt-4 border-t">
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      讨论完成
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 下一步按钮 */}
            {isCompleted && (
              <Card>
                <CardContent className="pt-6">
                  <Button
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    onClick={() => router.push(`/ideas/${params.id}`)}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    进入竞价阶段
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 右侧：对话区域 */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-purple-500" />
                  AI创意讨论
                  <Badge variant="outline" className="ml-auto">
                    {discussion.messages.filter(m => m.senderType === 'USER').length} / {discussion.totalRounds} 轮已回复
                  </Badge>
                </CardTitle>
              </CardHeader>

              {/* 消息列表 */}
              <CardContent className="flex-1 overflow-y-auto space-y-4">
                <AnimatePresence>
                  {discussion.messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex gap-3 ${
                        message.senderType === 'USER' ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      {/* 头像 */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        message.senderType === 'USER'
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                          : `bg-gradient-to-r ${getAgentColor(discussion.aiAgentType)}`
                      }`}>
                        {message.senderType === 'USER' ? (
                          <User className="w-5 h-5 text-white" />
                        ) : (
                          <span className="text-lg">{getAgentAvatar(discussion.aiAgentType)}</span>
                        )}
                      </div>

                      {/* 消息内容 */}
                      <div className={`flex-1 ${
                        message.senderType === 'USER' ? 'text-right' : 'text-left'
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold">{message.senderName}</span>
                          <Badge variant="outline" className="text-xs">
                            第{message.roundNumber}轮
                          </Badge>
                        </div>

                        <div className={`inline-block p-3 rounded-lg max-w-md ${
                          message.senderType === 'USER'
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-100'
                        }`}>
                          <div
                            className="whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{
                              __html: formatMessageContent(message.content)
                            }}
                          />
                        </div>

                        {/* AI分析数据 */}
                        {message.analysisData && (
                          <div className="mt-2 p-3 bg-blue-50 rounded-lg max-w-md">
                            <h4 className="text-sm font-semibold mb-2">📊 分析数据</h4>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {Object.entries(message.analysisData).map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span>{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
                                  <span className="font-semibold">{value}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* AI建议 */}
                        {message.suggestions && message.suggestions.length > 0 && (
                          <div className="mt-2 p-3 bg-amber-50 rounded-lg max-w-md">
                            <h4 className="text-sm font-semibold mb-2">💡 建议</h4>
                            <ul className="text-xs space-y-1">
                              {message.suggestions.map((suggestion, idx) => (
                                <li key={idx} className="flex items-start gap-1">
                                  <Star className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                                  <span>{suggestion}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </CardContent>

              {/* 输入区域 */}
              {canSendMessage && (
                <div className="p-4 border-t">
                  {/* 用户回复智能指导 */}
                  {userMessage.trim() && (
                    <ReplyGuidance
                      userInput={userMessage}
                      currentRound={discussion.currentRound}
                      agentType={discussion.aiAgentType}
                      previousMessages={discussion.messages}
                    />
                  )}

                  <div className="flex gap-3">
                    <Textarea
                      value={userMessage}
                      onChange={(e) => setUserMessage(e.target.value)}
                      placeholder={`请回答AI专家的问题... (第${discussion.currentRound}轮讨论)`}
                      className="flex-1 min-h-[60px] resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          sendMessage()
                        }
                      }}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!userMessage.trim() || sending}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      {sending ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Brain className="w-4 h-4" />
                        </motion.div>
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
                    <span>按 Enter 发送，Shift + Enter 换行</span>
                    <span>{userMessage.length}/500</span>
                  </div>
                </div>
              )}

// 讨论质量指标组件
function DiscussionQualityMetrics({
  messages,
  currentRound,
  agentType
}: {
  messages: any[]
  currentRound: number
  agentType: string
}) {
  const qualityMetrics = calculateOverallQuality(messages, currentRound, agentType)

  return (
    <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-4 h-4 text-blue-500" />
        <span className="text-sm font-semibold text-blue-700">讨论质量分析</span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <div className="text-muted-foreground mb-1">交流深度</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${qualityMetrics.depth}%` }}
              />
            </div>
            <span className="font-medium">{qualityMetrics.depth}%</span>
          </div>
        </div>

        <div>
          <div className="text-muted-foreground mb-1">专业匹配</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${qualityMetrics.expertise}%` }}
              />
            </div>
            <span className="font-medium">{qualityMetrics.expertise}%</span>
          </div>
        </div>

        <div>
          <div className="text-muted-foreground mb-1">信息完整</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${qualityMetrics.completeness}%` }}
              />
            </div>
            <span className="font-medium">{qualityMetrics.completeness}%</span>
          </div>
        </div>

        <div>
          <div className="text-muted-foreground mb-1">行动指导</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${qualityMetrics.actionable}%` }}
              />
            </div>
            <span className="font-medium">{qualityMetrics.actionable}%</span>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-blue-200">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">综合评分</span>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              qualityMetrics.overall >= 85 ? 'bg-green-500' :
              qualityMetrics.overall >= 70 ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            <span className="text-sm font-bold">{qualityMetrics.overall}/100</span>
          </div>
        </div>
        {qualityMetrics.nextSteps && (
          <div className="mt-2 text-xs text-blue-600">
            💡 {qualityMetrics.nextSteps}
          </div>
        )}
      </div>
    </div>
  )
}

// 计算讨论整体质量
function calculateOverallQuality(messages: any[], currentRound: number, agentType: string) {
  if (messages.length === 0) {
    return {
      depth: 0,
      expertise: 0,
      completeness: 0,
      actionable: 0,
      overall: 0,
      nextSteps: '开始与AI专家交流，获得专业指导'
    }
  }

  const userMessages = messages.filter(m => m.senderType === 'USER')
  const aiMessages = messages.filter(m => m.senderType === 'AI_AGENT')

  // 交流深度分析 (基于消息长度和轮数)
  const avgUserMessageLength = userMessages.reduce((sum, m) => sum + m.content.length, 0) / Math.max(userMessages.length, 1)
  const depth = Math.min(90, Math.max(20, (avgUserMessageLength / 10) + (currentRound * 20)))

  // 专业匹配度 (基于专业词汇使用)
  const expertKeywords = getExpertKeywords(agentType)
  const totalContent = messages.map(m => m.content).join(' ')
  const matchedKeywords = expertKeywords.filter(keyword => totalContent.includes(keyword))
  const expertise = Math.min(95, 60 + (matchedKeywords.length * 8))

  // 信息完整性 (基于AI建议覆盖率)
  const hasAnalysisData = aiMessages.some(m => m.analysisData)
  const hasSuggestions = aiMessages.some(m => m.suggestions && m.suggestions.length > 0)
  const hasUserResponses = userMessages.length >= currentRound - 1
  let completeness = 40
  if (hasAnalysisData) completeness += 20
  if (hasSuggestions) completeness += 20
  if (hasUserResponses) completeness += 20

  // 行动指导性 (基于具体建议和下一步)
  const actionKeywords = ['建议', '推荐', '下一步', '应该', '可以', '需要', '计划', '实施']
  const actionMentions = actionKeywords.filter(keyword => totalContent.includes(keyword))
  const actionable = Math.min(90, 50 + (actionMentions.length * 8))

  const overall = Math.round((depth + expertise + completeness + actionable) / 4)

  // 下一步建议
  let nextSteps = ''
  if (overall < 60) {
    nextSteps = '建议提供更详细的想法和具体需求'
  } else if (overall < 80) {
    nextSteps = '继续深入讨论，关注专业建议的落地'
  } else {
    nextSteps = '讨论质量很高，准备进入下一阶段'
  }

  return {
    depth: Math.round(depth),
    expertise: Math.round(expertise),
    completeness: Math.round(completeness),
    actionable: Math.round(actionable),
    overall,
    nextSteps
  }
}

// 计算单轮讨论质量
function calculateRoundQuality(roundMessages: any[]) {
  if (roundMessages.length === 0) return 0

  const userMessage = roundMessages.find(m => m.senderType === 'USER')
  const aiMessage = roundMessages.find(m => m.senderType === 'AI_AGENT')

  let score = 30 // 基础分

  // 用户回复质量
  if (userMessage) {
    if (userMessage.content.length > 100) score += 20
    if (userMessage.content.length > 200) score += 10
    if (userMessage.content.includes('问题') || userMessage.content.includes('困难')) score += 10
  }

  // AI回复质量
  if (aiMessage) {
    if (aiMessage.suggestions && aiMessage.suggestions.length > 0) score += 15
    if (aiMessage.analysisData) score += 15
    if (aiMessage.content.length > 300) score += 10
  }

  return Math.min(100, score)
}

// 提取轮次讨论要点
function extractRoundTopics(roundMessages: any[]) {
  const topics = []

  for (const message of roundMessages) {
    const content = message.content.toLowerCase()

    // 技术相关
    if (content.includes('技术') || content.includes('开发') || content.includes('系统')) {
      topics.push('技术实现')
    }

    // 商业相关
    if (content.includes('商业') || content.includes('盈利') || content.includes('市场')) {
      topics.push('商业模式')
    }

    // 用户相关
    if (content.includes('用户') || content.includes('体验') || content.includes('需求')) {
      topics.push('用户需求')
    }

    // 竞争相关
    if (content.includes('竞争') || content.includes('优势') || content.includes('差异')) {
      topics.push('竞争优势')
    }

    // 风险相关
    if (content.includes('风险') || content.includes('挑战') || content.includes('困难')) {
      topics.push('风险分析')
    }
  }

  return [...new Set(topics)] // 去重
}

// 获取专家关键词
function getExpertKeywords(agentType: string) {
  const keywords = {
    'tech': ['技术', '开发', '算法', '架构', '代码', '系统', '创新', '实现'],
    'business': ['商业', '盈利', '市场', '成本', '投资', '收入', '模式', '价值'],
    'artistic': ['设计', '美学', '体验', '情感', '创意', '艺术', '视觉', '品牌'],
    'trend': ['趋势', '热点', '传播', '社交', '营销', '推广', '流行', '话题'],
    'academic': ['研究', '理论', '学术', '分析', '框架', '方法', '科学', '系统']
  }

  return keywords[agentType as keyof typeof keywords] || keywords.tech
}

// 用户回复智能指导组件
function ReplyGuidance({
  userInput,
  currentRound,
  agentType,
  previousMessages
}: {
  userInput: string
  currentRound: number
  agentType: string
  previousMessages: any[]
}) {
  const [guidance, setGuidance] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    if (userInput.length > 20) {
      const timer = setTimeout(() => {
        analyzeUserInput()
      }, 1000) // 防抖

      return () => clearTimeout(timer)
    }
  }, [userInput])

  const analyzeUserInput = async () => {
    setIsAnalyzing(true)

    // 模拟分析用户输入质量
    const analysis = analyzeInputQuality(userInput, currentRound, agentType)

    setGuidance(analysis)
    setIsAnalyzing(false)
  }

  const analyzeInputQuality = (input: string, round: number, agent: string) => {
    const suggestions = []
    const warnings = []
    let score = 50

    // 长度检查
    if (input.length < 50) {
      warnings.push('回复较短，建议提供更多细节')
      score -= 15
    } else if (input.length > 300) {
      score += 10
    }

    // 专业性检查
    const expertExpectedTopics = {
      'tech': ['技术', '开发', '功能', '架构', '用户'],
      'business': ['市场', '盈利', '成本', '客户', '商业'],
      'artistic': ['设计', '用户体验', '美观', '情感', '品牌'],
      'trend': ['推广', '营销', '用户', '传播', '社交'],
      'academic': ['研究', '理论', '方法', '分析', '证据']
    }

    const expectedTopics = expertExpectedTopics[agent as keyof typeof expertExpectedTopics] || []
    const mentionedTopics = expectedTopics.filter(topic => input.includes(topic))

    if (mentionedTopics.length === 0) {
      suggestions.push(`建议提及与${getAgentName(agent)}专长相关的内容`)
      score -= 10
    } else {
      score += mentionedTopics.length * 5
    }

    // 轮次特定建议
    if (round === 1) {
      if (!input.includes('想法') && !input.includes('计划')) {
        suggestions.push('第1轮建议分享你的具体想法和初步计划')
      }
    } else if (round === 2) {
      if (!input.includes('问题') && !input.includes('难点')) {
        suggestions.push('第2轮可以重点讨论遇到的问题和难点')
      }
    } else if (round === 3) {
      if (!input.includes('决定') && !input.includes('选择')) {
        suggestions.push('最后一轮建议明确你的决定和优先选择')
      }
    }

    // 问题回应检查
    const lastAIMessage = previousMessages
      .filter(m => m.senderType === 'AI_AGENT')
      .pop()

    if (lastAIMessage && lastAIMessage.content.includes('？')) {
      const questionCount = (lastAIMessage.content.match(/？/g) || []).length
      const answerIndicators = ['1.', '2.', '3.', '首先', '其次', '另外']
      const hasStructuredAnswer = answerIndicators.some(indicator => input.includes(indicator))

      if (questionCount > 1 && !hasStructuredAnswer) {
        suggestions.push('AI专家提出了多个问题，建议分点回答')
        score -= 10
      }
    }

    return {
      score: Math.max(Math.min(score, 100), 0),
      suggestions,
      warnings,
      shouldShow: suggestions.length > 0 || warnings.length > 0 || score < 70
    }
  }

  const getAgentName = (agentType: string) => {
    const names = {
      'tech': '科技艾克斯',
      'business': '商人老王',
      'artistic': '文艺小琳',
      'trend': '趋势阿伦',
      'academic': '教授李博'
    }
    return names[agentType as keyof typeof names] || '专家'
  }

  if (!guidance || !guidance.shouldShow) return null

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
    >
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb className="w-4 h-4 text-blue-500" />
        <span className="text-sm font-semibold text-blue-700">
          回复质量分析 {isAnalyzing && <span className="animate-pulse">分析中...</span>}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${
            guidance.score >= 80 ? 'bg-green-500' :
            guidance.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
          }`} />
          <span className="text-xs text-gray-600">{guidance.score}/100</span>
        </div>
      </div>

      {guidance.warnings.length > 0 && (
        <div className="mb-2">
          <div className="text-xs font-medium text-orange-700 mb-1">⚠️ 注意：</div>
          {guidance.warnings.map((warning: string, idx: number) => (
            <div key={idx} className="text-xs text-orange-600 ml-4">• {warning}</div>
          ))}
        </div>
      )}

      {guidance.suggestions.length > 0 && (
        <div>
          <div className="text-xs font-medium text-blue-700 mb-1">💡 建议：</div>
          {guidance.suggestions.map((suggestion: string, idx: number) => (
            <div key={idx} className="text-xs text-blue-600 ml-4">• {suggestion}</div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}