'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBiddingWebSocket } from '@/hooks/useBiddingWebSocket'
import { AI_PERSONAS, type AIMessage, type BiddingEvent, DISCUSSION_PHASES } from '@/lib/ai-persona-system'
import { Clock, Users, Trophy, Play, Lightbulb, Target, Star, ThumbsUp, Heart, MessageCircle, Gift, TrendingUp } from 'lucide-react'
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
  isLoading
}: {
  onSubmit: (idea: string) => void
  isLoading: boolean
}) => {
  const [ideaContent, setIdeaContent] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (ideaContent.trim()) {
      onSubmit(ideaContent.trim())
    }
  }

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
          </div>

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
              />
              <div className="flex justify-between mt-2 text-sm text-gray-500">
                <span>详细描述有助于获得更准确的评估</span>
                <span>{ideaContent.length}/500</span>
              </div>
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                disabled={!ideaContent.trim() || isLoading}
                className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    启动 AI 竞价...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    开始 AI 竞价表演
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
          <p className="text-sm text-gray-600 mb-3">{persona.role}</p>

          {/* 当前竞价 */}
          <div className="mb-4">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {currentBid} 积分
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
  const phases = [
    { key: 'warmup', label: '预热', icon: Target, duration: 120 },
    { key: 'discussion', label: '讨论', icon: MessageCircle, duration: 720 },
    { key: 'bidding', label: '竞价', icon: Trophy, duration: 1200 },
    { key: 'prediction', label: '预测', icon: TrendingUp, duration: 240 },
    { key: 'result', label: '结果', icon: Star, duration: 300 }
  ]

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
          <div className="text-2xl font-bold text-green-600">{highestBid}</div>
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
  const [showForm, setShowForm] = useState(true)
  const [isStarting, setIsStarting] = useState(false)

  const {
    isConnected,
    connectionStatus,
    currentPhase,
    timeRemaining,
    viewerCount,
    aiMessages,
    activeSpeaker,
    currentBids,
    highestBid,
    supportPersona,
    sendReaction
  } = useBiddingWebSocket({
    ideaId,
    userId: 'user-123',
    autoConnect: !showForm,
    enableMockMode: false
  })

  const handleStartBidding = async (ideaContent: string) => {
    setIsStarting(true)
    // 这里可以添加创意提交逻辑
    await new Promise(resolve => setTimeout(resolve, 2000)) // 模拟提交
    setShowForm(false)
    setIsStarting(false)
  }

  // 显示创意输入表单
  if (showForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <CreativeInputForm
          onSubmit={handleStartBidding}
          isLoading={isStarting}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🎭 AI 创意竞价舞台
          </h1>
          <p className="text-lg text-gray-600">
            观看 5 位 AI 专家为您的创意激烈竞价
          </p>
        </motion.div>

        {/* 阶段进度 */}
        <PhaseIndicator
          currentPhase={currentPhase}
          timeRemaining={timeRemaining}
        />

        {/* 实时统计 */}
        <LiveStatsPanel
          viewerCount={viewerCount}
          highestBid={highestBid}
          messageCount={aiMessages.length}
        />

        {/* AI 角色舞台 - 水平布局 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            🤖 AI 专家团队
          </h2>

          <div className="grid grid-cols-5 gap-4">
            {AI_PERSONAS.map((persona) => (
              <AIPersonaStage
                key={persona.id}
                persona={persona}
                isActive={activeSpeaker === persona.id}
                currentBid={currentBids[persona.id] || 50}
                messages={aiMessages}
                onSupport={() => supportPersona(persona.id)}
              />
            ))}
          </div>
        </motion.div>

        {/* 实时对话流 */}
        <Card className="bg-white shadow-xl">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <MessageCircle className="w-5 h-5 mr-2 text-purple-600" />
              实时讨论
            </h3>

            <div className="h-96 overflow-y-auto space-y-4">
              <AnimatePresence>
                {aiMessages.slice(-20).map((message) => {
                  const persona = AI_PERSONAS.find(p => p.id === message.personaId)
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-start space-x-3"
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        <Image
                          src={persona?.avatar || '/avatars/alex.png'}
                          alt={persona?.name || 'AI专家'}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-800">{persona?.name}</span>
                          {message.type === 'bid' && (
                            <Badge className="bg-green-100 text-green-800">
                              出价 {message.bidValue} 积分
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{message.content}</p>

                        {/* 互动按钮 */}
                        <div className="flex items-center space-x-4 mt-2">
                          <button
                            onClick={() => sendReaction(message.id, 'like')}
                            className="flex items-center space-x-1 text-sm text-gray-500 hover:text-purple-600"
                          >
                            <ThumbsUp className="w-4 h-4" />
                            <span>赞</span>
                          </button>
                          <button
                            onClick={() => sendReaction(message.id, 'love')}
                            className="flex items-center space-x-1 text-sm text-gray-500 hover:text-red-600"
                          >
                            <Heart className="w-4 h-4" />
                            <span>喜欢</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

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