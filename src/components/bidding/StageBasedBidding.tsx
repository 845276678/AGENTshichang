'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'

import { useRouter } from 'next/navigation'
import { useBiddingWebSocket, useBiddingWebSocketOriginal } from '@/hooks/useBiddingWebSocket'
import { tokenStorage } from '@/lib/token-storage'
import { useAuth } from '@/contexts/AuthContext'
import EnhancedBiddingStage from './EnhancedBiddingStage'
import UnifiedBiddingStage from './UnifiedBiddingStage'
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

interface ComponentProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

interface FormProps extends ComponentProps {
  onSubmit?: (e: React.FormEvent) => void
}

// 简化的无动画组件，避免framer-motion导致的初始化问题
const SimpleDiv = ({ children, className, style, ...props }: ComponentProps) => (
  <div className={className} style={style} {...props}>{children}</div>
)
const SimpleForm = ({ children, className, style, onSubmit, ...props }: FormProps) => (
  <form className={className} style={style} onSubmit={onSubmit} {...props}>{children}</form>
)
const SimpleH1 = ({ children, className, style, ...props }: ComponentProps) => (
  <h1 className={className} style={style} {...props}>{children}</h1>
)
const SimpleP = ({ children, className, style, ...props }: ComponentProps) => (
  <p className={className} style={style} {...props}>{children}</p>
)
const SimpleH3 = ({ children, className, style, ...props }: ComponentProps) => (
  <h3 className={className} style={style} {...props}>{children}</h3>
)
const SimplePresence = ({ children }: { children: React.ReactNode }) => <>{children}</>;

// 使用简化组件替代motion组件
const MotionDiv = SimpleDiv
const MotionForm = SimpleForm
const MotionH1 = SimpleH1
const MotionP = SimpleP
const MotionH3 = SimpleH3
const AnimatePresence = SimplePresence

type SubmitResult = Promise<void | boolean> | void | boolean

// 创意输入表单组件 - 升级版
const CreativeInputForm = ({
  onSubmit,
  isLoading,
  userCredits,
  defaultContent
}: {
  onSubmit: (idea: string) => SubmitResult
  isLoading: boolean
  userCredits: number
  defaultContent?: string
}) => {
  const [ideaContent, setIdeaContent] = useState(defaultContent ?? '')
  const REQUIRED_CREDITS = 50 // Required credits to join bidding

  useEffect(() => {
    if (defaultContent) {
      setIdeaContent(defaultContent)
    }
  }, [defaultContent])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ideaContent.trim()) {
      alert('请输入您的创意内容')
      return
    }

    if (userCredits < REQUIRED_CREDITS) {
      alert(`参与AI竞价需要至少 ${REQUIRED_CREDITS} 积分，您当前有 ${userCredits} 积分`)
      return
    }

    await onSubmit(ideaContent.trim())
  }

  const canSubmit = ideaContent.trim().length > 0 && userCredits >= REQUIRED_CREDITS && !isLoading

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <MotionH1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          🚀 AI创意竞价舞台
        </MotionH1>
        <CardDescription className="text-lg text-gray-600">
          让五位AI专家为您的创意进行激烈竞价！发现创意的真实价值
        </CardDescription>
        <div className="flex items-center justify-center gap-4 mt-4">
          <Badge variant="outline" className="flex items-center gap-1">
            <Trophy className="w-4 h-4" />
            专业评估
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            AI专家团
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Target className="w-4 h-4" />
            价值发现
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <MotionForm onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              描述您的创意想法 ✨
            </label>
            <Textarea
              value={ideaContent}
              onChange={(e) => setIdeaContent(e.target.value)}
              placeholder="请详细描述您的创意想法，包括：&#10;• 创意的核心概念和独特价值&#10;• 目标用户群体&#10;• 预期的市场价值&#10;• 实现方式和技术需求&#10;&#10;例如：一个基于AI的个性化学习助手，能够根据学生的学习习惯和知识掌握程度，自动生成个性化的学习计划和练习题..."
              className="min-h-[120px] resize-none"
              disabled={isLoading}
            />
            <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
              <span>{ideaContent.length} 字符</span>
              <span>建议 50-500 字</span>
            </div>
          </div>

          {/* 消耗积分说明 */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg border border-blue-200">
            <MotionP className="text-sm text-blue-700 text-center">
              参与AI竞价需要消耗 {REQUIRED_CREDITS} 积分，竞价结束后您将获得详细的商业价值报告和专家评估意见
            </MotionP>
            {userCredits < REQUIRED_CREDITS && (
              <div className="mt-2 text-sm text-red-600 flex items-center justify-center gap-1">
                <AlertCircle className="w-4 h-4" />
                积分不足，无法参与竞价
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={!canSubmit}
            className="w-full h-12 text-lg font-semibold relative overflow-hidden"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                正在启动AI竞价...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Play className="w-5 h-5" />
                开始AI专家竞价
              </div>
            )}
          </Button>

          {/* 功能说明 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Clock className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h4 className="font-semibold text-gray-800">快速评估</h4>
              <p className="text-sm text-gray-600">35-45分钟完整流程</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Users className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <h4 className="font-semibold text-gray-800">专家团队</h4>
              <p className="text-sm text-gray-600">5位AI专家同时评估</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <FileText className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <h4 className="font-semibold text-gray-800">详细报告</h4>
              <p className="text-sm text-gray-600">完整商业价值分析</p>
            </div>
          </div>
        </MotionForm>
      </CardContent>
    </Card>
  )
}

// 竞价阶段指示器
const BiddingProgressIndicator = ({
  currentPhase,
  progress = 0
}: {
  currentPhase?: string
  progress?: number
}) => {
  const phases = [
    { key: 'input', label: '创意输入', icon: Lightbulb },
    { key: 'warmup', label: 'AI预热', icon: Play },
    { key: 'discussion', label: '深度讨论', icon: MessageCircle },
    { key: 'bidding', label: '激烈竞价', icon: Trophy },
    { key: 'supplement', label: '补充完善', icon: Plus },
    { key: 'decision', label: '最终决策', icon: Target },
    { key: 'result', label: '结果展示', icon: Star }
  ]

  return (
    <Card className="w-full max-w-4xl mx-auto mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">竞价进度</h3>
          <div className="text-sm text-gray-600">{Math.round(progress)}% 完成</div>
        </div>

        <Progress value={progress} className="h-2 mb-4" />

        <div className="grid grid-cols-7 gap-2">
          {phases.map((phase, index) => {
            const Icon = phase.icon
            const isActive = currentPhase === phase.key
            const isCompleted = progress > (index / (phases.length - 1)) * 100

            return (
              <div
                key={phase.key}
                className={`text-center p-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                    : isCompleted
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                <Icon className="w-6 h-6 mx-auto mb-1" />
                <div className="text-xs font-medium">{phase.label}</div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// 主组件
export default function StageBasedBidding({
  ideaId,
  autoStart = false,
  initialIdeaContent
}: CreativeIdeaBiddingProps) {
  const [currentStage, setCurrentStage] = useState<'input' | 'bidding'>('input')
  const [submittedIdea, setSubmittedIdea] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const { user } = useAuth()
  const router = useRouter()

  // 用于同步WebSocket阶段的ref
  const wsPhaseRef = useRef<string>('warmup')
  const [displayPhase, setDisplayPhase] = useState<string>('warmup')

  // Auto-start if specified and has initial content
  useEffect(() => {
    if (autoStart && initialIdeaContent) {
      setSubmittedIdea(initialIdeaContent)
      setCurrentStage('bidding')
      // 生成sessionId以启动真实AI
      const newSessionId = `session_${Date.now()}_${ideaId}`
      setSessionId(newSessionId)
    }
  }, [autoStart, initialIdeaContent, ideaId])

  // 移除模拟竞价阶段进度，让真实AI系统接管
  // useEffect(() => {
  //   if (currentStage === 'bidding') {
  //     const phases = [
  //       { phase: 'warmup', duration: 5000, progress: 15 },
  //       { phase: 'discussion', duration: 15000, progress: 45 },
  //       { phase: 'bidding', duration: 10000, progress: 75 },
  //       { phase: 'supplement', duration: 8000, progress: 90 },
  //       { phase: 'result', duration: 2000, progress: 100 }
  //     ]

  //     let phaseIndex = 0
  //     const progressTimer = () => {
  //       if (phaseIndex < phases.length) {
  //         const currentPhase = phases[phaseIndex]
  //         setBiddingPhase(currentPhase.phase)
  //         setBiddingProgress(currentPhase.progress)

  //         setTimeout(() => {
  //           phaseIndex++
  //           progressTimer()
  //         }, currentPhase.duration)
  //       }
  //     }

  //     progressTimer()
  //   }
  // }, [currentStage])

  const handleIdeaSubmit = async (ideaContent: string) => {
    try {
      setIsSubmitting(true)
      setSubmittedIdea(ideaContent)

      // 生成真实sessionId启动AI服务
      const newSessionId = `session_${Date.now()}_${ideaId}`
      setSessionId(newSessionId)

      // 模拟提交延迟
      await new Promise(resolve => setTimeout(resolve, 1000))

      setCurrentStage('bidding')
      setDisplayPhase('warmup')  // 初始设为warmup，真实AI将接管
    } catch (error) {
      console.error('Idea submission error:', error)
      alert('提交失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBackToInput = () => {
    setCurrentStage('input')
    setSubmittedIdea('')
    setDisplayPhase('warmup')
    setSessionId(null) // 重置sessionId
  }

  const userCredits = user?.credits || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        {currentStage === 'input' && (
          <div className="space-y-8">
            <CreativeInputForm
              onSubmit={handleIdeaSubmit}
              isLoading={isSubmitting}
              userCredits={userCredits}
              defaultContent={initialIdeaContent}
            />
          </div>
        )}

        {currentStage === 'bidding' && submittedIdea && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={handleBackToInput}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                返回修改创意
              </Button>
            </div>

            <BiddingProgressIndicator
              currentPhase={displayPhase}
              progress={0}
            />

            <UnifiedBiddingStage
              ideaContent={submittedIdea}
              ideaId={ideaId}
              sessionId={sessionId}
              onPhaseChange={(phase) => {
                // 接收来自UnifiedBiddingStage的阶段更新
                setDisplayPhase(phase)
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}