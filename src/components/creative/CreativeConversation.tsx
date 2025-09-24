'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui'

import { Textarea } from '@/components/ui/textarea'
import {
  CreativeConversation as CreativeConversationType,
  CreativeMessage,
  CreativePhase,
  CreativeMessageType,
  CreativeMessageMetadata
} from '@/types'
import {
  Brain,
  User,
  Lightbulb,
  HelpCircle,
  Target,
  CheckCircle,
  Send,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  RefreshCw
} from 'lucide-react'

interface CreativeConversationProps {
  conversation: CreativeConversationType
  onSendMessage: (content: string, messageType: CreativeMessageType) => void
  onPhaseTransition: (newPhase: CreativePhase) => void
  isLoading?: boolean
}

const phaseIcons = {
  INITIAL_SUBMISSION: Lightbulb,
  AI_EVALUATION: Brain,
  ITERATIVE_REFINEMENT: RefreshCw,
  FEASIBILITY_VALIDATION: CheckCircle,
  VALUE_PACKAGING: TrendingUp,
  FINALIZATION: Target
}

const phaseLabels = {
  INITIAL_SUBMISSION: '初始提交',
  AI_EVALUATION: 'AI评估',
  ITERATIVE_REFINEMENT: '迭代优化',
  FEASIBILITY_VALIDATION: '可行性验证',
  VALUE_PACKAGING: '价值包装',
  FINALIZATION: '最终定稿'
}

const messageTypeIcons = {
  INITIAL_IDEA: Lightbulb,
  QUESTION: HelpCircle,
  SUGGESTION: Sparkles,
  CHALLENGE: Target,
  REFINEMENT: RefreshCw,
  VALIDATION: CheckCircle,
  ENHANCEMENT: TrendingUp,
  FINAL_PROPOSAL: ArrowRight
}

const messageTypeLabels = {
  INITIAL_IDEA: '初始想法',
  QUESTION: '问题',
  SUGGESTION: '建议',
  CHALLENGE: '挑战',
  REFINEMENT: '优化',
  VALIDATION: '验证',
  ENHANCEMENT: '增强',
  FINAL_PROPOSAL: '最终方案'
}

export const CreativeConversation: React.FC<CreativeConversationProps> = ({
  conversation,
  onSendMessage,
  isLoading = false
}) => {
  const [newMessage, setNewMessage] = useState('')
  const [selectedMessageType, setSelectedMessageType] = useState<CreativeMessageType>('QUESTION')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation.messages])

  const PhaseIcon = phaseIcons[conversation.phase]

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim(), selectedMessageType)
      setNewMessage('')
    }
  }

  const renderMessageMetadata = (metadata?: CreativeMessageMetadata) => {
    if (!metadata) {return null}

    return (
      <div className="flex flex-wrap gap-1 mt-2 text-xs">
        {metadata.questionType && (
          <Badge variant="outline" className="text-xs">
            {metadata.questionType}式提问
          </Badge>
        )}
        {metadata.challengeLevel && (
          <Badge variant="outline" className="text-xs">
            挑战难度: {metadata.challengeLevel}
          </Badge>
        )}
        {metadata.suggestionCategory && (
          <Badge variant="outline" className="text-xs">
            {metadata.suggestionCategory}建议
          </Badge>
        )}
        {metadata.confidenceScore && (
          <Badge variant="outline" className="text-xs">
            置信度: {Math.round(metadata.confidenceScore * 100)}%
          </Badge>
        )}
      </div>
    )
  }

  const renderMessage = (message: CreativeMessage, index: number) => {
    const isUser = message.role === 'USER'
    const isSystem = message.role === 'SYSTEM'
    const MessageIcon = messageTypeIcons[message.messageType]

    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} ${
          isSystem ? 'justify-center' : ''
        }`}
      >
        {!isSystem && (
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              isUser
                ? 'bg-primary text-primary-foreground'
                : 'bg-gradient-to-br from-agent-500/20 to-primary/20 border'
            }`}
          >
            {isUser ? <User className="w-5 h-5" /> : <Brain className="w-5 h-5 text-primary" />}
          </div>
        )}

        <div
          className={`max-w-[80%] ${
            isSystem ? 'w-full flex justify-center' : ''
          }`}
        >
          <Card
            className={`${
              isUser
                ? 'bg-primary text-primary-foreground border-primary'
                : isSystem
                ? 'bg-secondary/50 border-dashed'
                : 'bg-background border'
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageIcon className="w-4 h-4" />
                <Badge variant="secondary" className="text-xs">
                  {messageTypeLabels[message.messageType]}
                </Badge>
                <span className="text-xs text-muted-foreground ml-auto">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>

              <div className="prose prose-sm max-w-none">
                {message.content}
              </div>

              {renderMessageMetadata(message.metadata)}

              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {message.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center gap-2 p-2 bg-secondary/20 rounded-lg"
                    >
                      <Badge variant="outline" className="text-xs">
                        {attachment.type}
                      </Badge>
                      <span className="text-sm">{attachment.title}</span>
                    </div>
                  ))}
                </div>
              )}

              {!isUser && !isSystem && (
                <div className="flex gap-2 mt-3 pt-2 border-t border-border/20">
                  <Button variant="ghost" size="sm">
                    <ThumbsUp className="w-3 h-3 mr-1" />
                    有用
                  </Button>
                  <Button variant="ghost" size="sm">
                    <ThumbsDown className="w-3 h-3 mr-1" />
                    需要改进
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* 阶段进度指示器 */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-agent-500/20 flex items-center justify-center">
              <PhaseIcon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-lg">{phaseLabels[conversation.phase]}</h3>
              <p className="text-sm text-muted-foreground">
                与 {conversation.agent.name} 的第 {conversation.iterationCount} 轮协作
              </p>
            </div>
            {conversation.qualityScore && (
              <Badge variant="outline" className="ml-auto">
                质量分: {Math.round(conversation.qualityScore * 100)}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-secondary/5 rounded-lg">
        <AnimatePresence>
          {conversation.messages.map((message, index) => renderMessage(message, index))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* 消息输入区域 */}
      <Card className="mt-4">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* 消息类型选择 */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(messageTypeLabels).map(([type, label]) => {
                const Icon = messageTypeIcons[type as CreativeMessageType]
                return (
                  <Button
                    key={type}
                    variant={selectedMessageType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedMessageType(type as CreativeMessageType)}
                    className="flex items-center gap-1"
                  >
                    <Icon className="w-3 h-3" />
                    {label}
                  </Button>
                )
              })}
            </div>

            {/* 输入框 */}
            <div className="flex gap-2">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="分享你的想法、提出问题或回应AI的建议..."
                className="flex-1 min-h-[80px]"
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    handleSendMessage()
                  }
                }}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isLoading}
                className="self-end"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              按 Ctrl/Cmd + Enter 快速发送
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}