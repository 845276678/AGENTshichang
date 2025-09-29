'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Layout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  ArrowLeft,
  Send,
  Brain,
  User,
  Sparkles,
  MessageCircle,
  Clock,
  Star,
  TrendingUp,
  Lightbulb,
  Target,
  RefreshCw
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  id: string
  content: string
  messageType: 'INITIAL_ANALYSIS' | 'CLARIFICATION_REQUEST' | 'USER_RESPONSE' | 'IMPROVEMENT_SUGGESTION' | 'FINAL_ASSESSMENT'
  roundNumber: number
  senderType: 'USER' | 'AI_AGENT'
  senderName?: string
  createdAt: string
  analysisData?: Record<string, any>
  suggestions?: string[]
}

interface Discussion {
  id: string
  currentRound: number
  totalRounds: number
  aiAgentName: string
  aiAgentType: string
  status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED'
  messages: Message[]
  idea: {
    id: string
    title: string
    description: string
    category: string
  }
}

const agentAvatars: Record<string, { emoji: string; color: string }> = {
  tech: { emoji: '🤖', color: 'from-blue-500 to-cyan-500' },
  business: { emoji: '💼', color: 'from-green-500 to-emerald-500' },
  artistic: { emoji: '🎨', color: 'from-purple-500 to-pink-500' },
  trend: { emoji: '📈', color: 'from-orange-500 to-red-500' },
  academic: { emoji: '🎓', color: 'from-indigo-500 to-blue-500' }
}

export default function IdeaDiscussionPage() {
  const params = useParams()
  const router = useRouter()
  const [discussion, setDiscussion] = useState<Discussion | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userMessage, setUserMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [skipping, setSkipping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const ideaId = params?.id as string

  useEffect(() => {
    if (!ideaId) return
    loadDiscussion()
  }, [ideaId])

  useEffect(() => {
    scrollToBottom()
  }, [discussion?.messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadDiscussion = async () => {
    try {
      setLoading(true)
      // 首先尝试获取现有讨论
      const token = localStorage.getItem('auth.access_token')
      if (!token) {
        setError('请先登录')
        return
      }

      const response = await fetch(`/api/discussions?ideaId=${ideaId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.discussion) {
          setDiscussion(result.discussion)
          return
        }
      }

      // 如果没有现有讨论，创建新的讨论
      const createResponse = await fetch('/api/discussions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ideaId })
      })

      if (!createResponse.ok) {
        throw new Error('创建讨论失败')
      }

      const createResult = await createResponse.json()
      if (createResult.success) {
        // 重新获取完整的讨论数据
        await loadDiscussion()
      }
    } catch (error) {
      console.error('加载讨论失败:', error)
      setError(error instanceof Error ? error.message : '加载讨论失败')
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!userMessage.trim() || !discussion || sending) return

    try {
      setSending(true)
      const token = localStorage.getItem('auth.access_token')

      const response = await fetch('/api/discussions/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          discussionId: discussion.id,
          content: userMessage.trim()
        })
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || '发送消息失败')
      }

      // 更新讨论状态
      const updatedDiscussion = { ...discussion }
      updatedDiscussion.messages.push(result.userMessage, result.aiMessage)

      if (result.isCompleted) {
        updatedDiscussion.status = 'COMPLETED'
      } else {
        updatedDiscussion.currentRound = result.nextRound
      }

      setDiscussion(updatedDiscussion)
      setUserMessage('')
    } catch (error) {
      console.error('发送消息失败:', error)
      setError(error instanceof Error ? error.message : '发送消息失败')
    } finally {
      setSending(false)
    }
  }

  const skipRound = async () => {
    if (!discussion || skipping) return

    try {
      setSkipping(true)
      const token = localStorage.getItem('auth.access_token')

      const response = await fetch('/api/discussions/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          discussionId: discussion.id,
          action: 'skip'
        })
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || '跳过失败')
      }

      // 更新讨论状态
      const updatedDiscussion = { ...discussion }
      updatedDiscussion.messages.push(result.userMessage, result.aiMessage)

      if (result.isCompleted) {
        updatedDiscussion.status = 'COMPLETED'
      } else {
        updatedDiscussion.currentRound = result.nextRound
      }

      setDiscussion(updatedDiscussion)
    } catch (error) {
      console.error('跳过失败:', error)
      setError(error instanceof Error ? error.message : '跳过失败')
    } finally {
      setSkipping(false)
    }
  }

  const getMessageTypeLabel = (messageType: string) => {
    const labels = {
      'INITIAL_ANALYSIS': '初始分析',
      'CLARIFICATION_REQUEST': '澄清问题',
      'USER_RESPONSE': '用户回应',
      'IMPROVEMENT_SUGGESTION': '改进建议',
      'FINAL_ASSESSMENT': '最终评估'
    }
    return labels[messageType as keyof typeof labels] || messageType
  }

  if (loading) {
    return (
      <Layout>
        <div className="container py-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
              />
              <p className="text-muted-foreground">加载讨论中...</p>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (error || !discussion) {
    return (
      <Layout>
        <div className="container py-6">
          <Card className="max-w-md mx-auto">
            <CardContent className="text-center py-12">
              <div className="text-4xl mb-4">❌</div>
              <p className="text-muted-foreground mb-4">
                {error || '讨论不存在'}
              </p>
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

  const agentInfo = agentAvatars[discussion.aiAgentType] || agentAvatars.tech
  const isCompleted = discussion.status === 'COMPLETED'

  return (
    <Layout>
      <div className="container py-6 max-w-4xl">
        {/* 顶部导航 */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            返回
          </Button>
        </div>

        {/* 讨论头部信息 */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${agentInfo.color} flex items-center justify-center text-2xl`}>
                  {agentInfo.emoji}
                </div>
                <div>
                  <CardTitle className="text-xl">{discussion.idea.title}</CardTitle>
                  <CardDescription className="mt-1">
                    与 <strong>{discussion.aiAgentName}</strong> 的专业讨论
                  </CardDescription>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant={isCompleted ? "default" : "secondary"}>
                      {isCompleted ? '已完成' : `第 ${discussion.currentRound}/${discussion.totalRounds} 轮`}
                    </Badge>
                    <Badge variant="outline">{discussion.idea.category}</Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">讨论状态</div>
                <div className="font-medium">{isCompleted ? '讨论完成' : '进行中'}</div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* 消息区域 */}
        <Card className="flex flex-col h-[600px]">
          <CardHeader className="border-b">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <CardTitle className="text-lg">讨论记录</CardTitle>
              <Badge variant="outline" className="ml-auto">
                {discussion.messages.length} 条消息
              </Badge>
            </div>
          </CardHeader>

          {/* 消息列表 */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              <AnimatePresence>
                {discussion.messages.map((message, index) => {
                  const isUser = message.senderType === 'USER'
                  const isAI = message.senderType === 'AI_AGENT'

                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
                    >
                      {/* 头像 */}
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        {isUser ? (
                          <AvatarFallback className="bg-blue-100">
                            <User className="w-4 h-4" />
                          </AvatarFallback>
                        ) : (
                          <AvatarFallback className={`bg-gradient-to-br ${agentInfo.color} text-white`}>
                            <Brain className="w-4 h-4" />
                          </AvatarFallback>
                        )}
                      </Avatar>

                      {/* 消息内容 */}
                      <div className={`flex-1 max-w-[80%] ${isUser ? 'text-right' : ''}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">
                            {isUser ? '我' : message.senderName}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {getMessageTypeLabel(message.messageType)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </span>
                        </div>

                        <div
                          className={`p-3 rounded-lg ${
                            isUser
                              ? 'bg-blue-500 text-white'
                              : 'bg-muted'
                          }`}
                        >
                          <div className="whitespace-pre-wrap text-sm">
                            {message.content}
                          </div>

                          {/* AI 分析数据 */}
                          {isAI && message.analysisData && (
                            <div className="mt-3 pt-3 border-t border-muted-foreground/20">
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                {Object.entries(message.analysisData).map(([key, value]) => (
                                  <div key={key} className="flex justify-between">
                                    <span className="opacity-70">{key}:</span>
                                    <span className="font-medium">{value}%</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* AI 建议 */}
                          {isAI && message.suggestions && message.suggestions.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-muted-foreground/20">
                              <div className="text-xs opacity-70 mb-2">💡 建议:</div>
                              <ul className="text-xs space-y-1">
                                {message.suggestions.map((suggestion, idx) => (
                                  <li key={idx} className="flex items-start gap-1">
                                    <span className="opacity-70">•</span>
                                    <span>{suggestion}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* 输入区域 */}
          {!isCompleted && (
            <div className="p-4 border-t">
              {/* 讨论进度提示 */}
              <div className="mb-3 text-center">
                <Badge variant="outline" className="text-xs">
                  第 {discussion.currentRound} / {discussion.totalRounds} 轮讨论
                </Badge>
                <div className="text-xs text-muted-foreground mt-1">
                  您可以详细回应AI的问题，或选择跳过此轮进入下一阶段
                </div>
              </div>

              <div className="flex gap-3">
                <Textarea
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  placeholder="输入您的回应...（可选，您也可以选择跳过此轮）"
                  className="min-h-[60px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                  disabled={sending || skipping}
                />
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={sendMessage}
                    disabled={!userMessage.trim() || sending || skipping}
                    size="icon"
                    className="h-[60px] w-[60px] rounded-xl"
                  >
                    {sending ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <RefreshCw className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>

                  <Button
                    onClick={skipRound}
                    disabled={sending || skipping}
                    variant="outline"
                    size="sm"
                    className="text-xs px-2 py-1 h-auto"
                  >
                    {skipping ? '跳过中...' : '跳过此轮'}
                  </Button>
                </div>
              </div>

              <div className="text-xs text-muted-foreground mt-2 text-center">
                💡 提示：跳过后AI会基于现有信息继续分析，您随时可以进入下一轮讨论
              </div>
            </div>
          )}

          {/* 完成状态 */}
          {isCompleted && (
            <div className="p-4 border-t bg-muted/30">
              <div className="text-center">
                <div className="text-2xl mb-2">🎉</div>
                <div className="font-medium mb-1">讨论已完成!</div>
                <div className="text-sm text-muted-foreground">
                  您可以继续查看对话记录，或返回创意详情页面
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  )
}