/**
 * 🔧 修复版AI对话面板
 * 确保在任何情况下都能正确显示AI消息
 */
'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  MessageCircle,
  Users,
  Clock,
  TrendingUp,
  Zap,
  Heart,
  RefreshCw,
  AlertCircle,
  Eye,
  EyeOff,
  Volume2,
  VolumeX
} from 'lucide-react'
import { AI_PERSONAS } from '@/lib/ai-persona-enhanced'

interface AIMessage {
  id: string
  personaId: string
  agentName: string
  content: string
  timestamp: Date
  emotion?: string
  bidValue?: number
  type?: 'message' | 'bid'
}

interface FixedAIDialogPanelProps {
  messages: AIMessage[]
  currentPhase: string
  isConnected: boolean
  connectionStatus: string
  onRefresh?: () => void
  forceShow?: boolean
  className?: string
}

// 修复1: 确保消息总是可见的显示组件
const MessageBubble: React.FC<{
  message: AIMessage
  index: number
}> = ({ message, index }) => {
  const agent = AI_PERSONAS.find(p => p.id === message.personaId) || {
    id: message.personaId,
    name: message.agentName,
    avatar: '/default-avatar.png',
    specialty: '专业分析',
    personality: { traits: [] }
  }

  const emotionColors = {
    neutral: 'border-gray-200 bg-gray-50',
    excited: 'border-orange-200 bg-orange-50',
    confident: 'border-blue-200 bg-blue-50',
    worried: 'border-yellow-200 bg-yellow-50',
    aggressive: 'border-red-200 bg-red-50'
  } as const

  const colorClass = emotionColors[message.emotion as keyof typeof emotionColors] || emotionColors.neutral

  return (
    <div
      key={message.id}
      className={`mb-4 p-4 rounded-lg border-l-4 ${colorClass} transition-all duration-300`}
      style={{
        animationDelay: `${index * 0.1}s`,
        animation: 'slideInFromLeft 0.5s ease-out forwards'
      }}
    >
      {/* 消息头部 */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
            <img
              src={agent.avatar}
              alt={agent.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = ''
                target.style.display = 'none'
                const parent = target.parentElement
                if (parent) {
                  parent.innerHTML = `<span class="text-white text-sm font-bold">${agent.name.charAt(0)}</span>`
                }
              }}
            />
          </div>
          <div>
            <div className="font-semibold text-gray-900">{agent.name}</div>
            <div className="text-xs text-gray-500">{agent.specialty}</div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <div className="text-xs text-gray-400">
            {message.timestamp.toLocaleTimeString('zh-CN', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </div>
          {message.emotion && (
            <Badge variant="outline" className="text-xs">
              {message.emotion}
            </Badge>
          )}
        </div>
      </div>

      {/* 消息内容 */}
      <div className="text-sm text-gray-800 leading-relaxed mb-2">
        {message.content}
      </div>

      {/* 竞价信息 */}
      {message.type === 'bid' && message.bidValue && (
        <div className="mt-3 p-2 bg-white rounded border border-amber-200">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-semibold text-amber-700">
              出价：¥{message.bidValue}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// 修复2: 强制显示的空状态组件
const EmptyStateDisplay: React.FC<{
  phase: string
  isConnected: boolean
  onRefresh?: () => void
}> = ({ phase, isConnected, onRefresh }) => {
  const [showDebugMode, setShowDebugMode] = useState(false)

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-center space-y-4">
        {/* 状态图标 */}
        <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
          {isConnected ? (
            <MessageCircle className="w-8 h-8 text-gray-400" />
          ) : (
            <AlertCircle className="w-8 h-8 text-red-400" />
          )}
        </div>

        {/* 状态文本 */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-700">
            {isConnected ? 'AI专家正在思考中...' : '连接已断开'}
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            {isConnected
              ? `当前阶段：${phase}。AI专家们正在深入分析您的创意，精彩对话即将开始！`
              : '正在尝试重新连接到AI竞价系统，请稍候...'}
          </p>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2 justify-center">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              刷新连接
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDebugMode(!showDebugMode)}
            className="flex items-center gap-2"
          >
            {showDebugMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showDebugMode ? '隐藏' : '显示'}调试信息
          </Button>
        </div>

        {/* 调试信息 */}
        {showDebugMode && (
          <div className="mt-4 p-3 bg-gray-100 rounded text-left text-xs font-mono">
            <div>连接状态: {isConnected ? '已连接' : '未连接'}</div>
            <div>当前阶段: {phase}</div>
            <div>时间戳: {new Date().toISOString()}</div>
            <div>WebSocket URL: {typeof window !== 'undefined' ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/bidding/websocket` : 'N/A'}</div>
          </div>
        )}

        {/* 阶段说明 */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg text-left max-w-md">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">当前阶段说明</h4>
          <div className="text-xs text-blue-700 space-y-1">
            {phase === 'warmup' && (
              <p>🔥 AI专家们正在预热，即将开始深度分析您的创意</p>
            )}
            {phase === 'discussion' && (
              <p>💬 AI专家们正在进行热烈讨论，分析创意的各个维度</p>
            )}
            {phase === 'bidding' && (
              <p>💰 激烈的竞价阶段！专家们正在为您的创意出价</p>
            )}
            {phase === 'prediction' && (
              <p>🎯 专家们正在做最终评估和预测</p>
            )}
            {phase === 'result' && (
              <p>🏆 竞价结果即将揭晓！</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// 修复3: 主对话面板组件
export const FixedAIDialogPanel: React.FC<FixedAIDialogPanelProps> = ({
  messages,
  currentPhase,
  isConnected,
  connectionStatus,
  onRefresh,
  forceShow = false,
  className = ''
}) => {
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [lastMessageCount, setLastMessageCount] = useState(0)

  // 修复4: 确保消息排序正确
  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  }, [messages])

  // 修复5: 新消息提示音
  useEffect(() => {
    if (messages.length > lastMessageCount && soundEnabled && lastMessageCount > 0) {
      // 简单的提示音（可以换成真实音频文件）
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      gainNode.gain.value = 0.1

      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.1)
    }
    setLastMessageCount(messages.length)
  }, [messages.length, lastMessageCount, soundEnabled])

  return (
    <Card className={`w-full ${className}`}>
      <CardContent className="p-0">
        {/* 头部状态栏 */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
              <h3 className="text-lg font-semibold">AI专家对话区</h3>
              <Badge variant={isConnected ? 'default' : 'destructive'}>
                {isConnected ? '已连接' : '断开连接'}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="flex items-center gap-1"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>

              {onRefresh && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRefresh}
                  className="flex items-center gap-1"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* 统计信息 */}
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              <span>{messages.length} 条消息</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>阶段: {currentPhase}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{AI_PERSONAS.length} 位专家</span>
            </div>
          </div>
        </div>

        {/* 消息显示区域 */}
        <ScrollArea className="h-[600px] p-4">
          {/* 修复6: 强制显示逻辑 - 无论什么情况都显示内容 */}
          {sortedMessages.length > 0 || forceShow ? (
            <div className="space-y-4">
              {sortedMessages.length === 0 && forceShow ? (
                <EmptyStateDisplay
                  phase={currentPhase}
                  isConnected={isConnected}
                  onRefresh={onRefresh}
                />
              ) : (
                sortedMessages.map((message, index) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    index={index}
                  />
                ))
              )}
            </div>
          ) : (
            <EmptyStateDisplay
              phase={currentPhase}
              isConnected={isConnected}
              onRefresh={onRefresh}
            />
          )}
        </ScrollArea>

        {/* 底部状态栏 */}
        <div className="p-3 border-t bg-gray-50 text-xs text-gray-500">
          <div className="flex items-center justify-between">
            <div>
              状态: {connectionStatus} | 消息: {messages.length} 条
            </div>
            <div>
              {new Date().toLocaleTimeString('zh-CN')}
            </div>
          </div>
        </div>
      </CardContent>

      {/* CSS动画 */}
      <style jsx>{`
        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </Card>
  )
}

export default FixedAIDialogPanel