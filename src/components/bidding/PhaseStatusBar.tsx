'use client'

import React from 'react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { BiddingPhase } from '@/components/bidding/AgentDialogPanel'
import { PhasePermissionManager } from '@/hooks/useAgentStates'
import { Clock, Users, Zap, TrendingUp, Award, CheckCircle } from 'lucide-react'

// 简化组件替代motion - 避免生产环境错误
const SimpleDiv = ({ children, className, style, ...props }: any) => (
  <div className={className} style={style} {...props}>{children}</div>
)

// 使用简化组件替代motion组件
const MotionDiv = SimpleDiv

interface PhaseStatusBarProps {
  currentPhase: BiddingPhase
  timeRemaining: number // 剩余秒数
  progress: number // 0-100
  viewerCount?: number
  className?: string
}

// 阶段配置
const PHASE_CONFIG = {
  [BiddingPhase.IDEA_INPUT]: {
    icon: CheckCircle,
    title: '创意输入',
    description: '请详细描述您的创意想法',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    duration: 0 // 无时间限制
  },
  [BiddingPhase.AGENT_WARMUP]: {
    icon: Zap,
    title: '专家预热',
    description: 'AI专家正在了解您的创意',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    duration: 180 // 3分钟
  },
  [BiddingPhase.AGENT_DISCUSSION]: {
    icon: Users,
    title: '深度讨论',
    description: 'AI专家正在深入分析创意',
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    duration: 720 // 12分钟
  },
  [BiddingPhase.AGENT_BIDDING]: {
    icon: TrendingUp,
    title: '激烈竞价',
    description: 'AI专家正在竞价您的创意',
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    duration: 1200 // 20分钟
  },
  [BiddingPhase.USER_SUPPLEMENT]: {
    icon: Award,
    title: '预测互动',
    description: '您可以支持喜欢的专家',
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    duration: 240 // 4分钟
  },
  [BiddingPhase.RESULT_DISPLAY]: {
    icon: Award,
    title: '结果展示',
    description: '查看最终竞价结果和奖励',
    color: 'from-indigo-500 to-purple-500',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    duration: 300 // 5分钟
  }
} as const

// 格式化时间
const formatTime = (seconds: number): string => {
  if (seconds <= 0) return '00:00'

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

// 获取进度条颜色类
const getProgressColor = (phase: BiddingPhase, progress: number) => {
  const config = PHASE_CONFIG[phase]
  if (progress < 30) return config.color
  if (progress < 70) return config.color
  return 'from-red-400 to-red-600' // 时间紧急时变红
}

export const PhaseStatusBar: React.FC<PhaseStatusBarProps> = ({
  currentPhase,
  timeRemaining,
  progress,
  viewerCount,
  className = ''
}) => {
  const config = PHASE_CONFIG[currentPhase]
  const IconComponent = config.icon
  const permissions = PhasePermissionManager.getPermissions(currentPhase)

  // 计算完成百分比（基于时间）
  const timeProgress = config.duration > 0
    ? Math.max(0, 100 - (timeRemaining / config.duration) * 100)
    : progress

  return (
    <MotionDiv className={`phase-status-bar relative bg-white border-b border-gray-200 shadow-sm ${className}`}>
      {/* 背景渐变 */}
      <div className={`absolute inset-0 bg-gradient-to-r ${config.color} opacity-5`} />

      <div className="relative px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            {/* 左侧：阶段信息 */}
            <div className="flex items-center gap-4">
              <MotionDiv className={`phase-icon flex items-center justify-center w-12 h-12 rounded-full ${config.bgColor} ${config.textColor}`}>
                <IconComponent className="w-6 h-6" />
              </MotionDiv>

              <div className="phase-info">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {config.title}
                  </h3>
                  <Badge variant="outline" className={`${config.textColor} border-current`}>
                    当前阶段
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  {config.description}
                </p>
              </div>
            </div>

            {/* 中部：进度条 */}
            <div className="progress-section flex-1 max-w-md mx-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500">阶段进度</span>
                <span className="text-xs font-medium text-gray-700">
                  {Math.round(timeProgress)}%
                </span>
              </div>

              <div className="relative">
                <Progress
                  value={timeProgress}
                  className="h-3 bg-gray-100"
                />

                {/* 进度条渐变覆盖 */}
                <div
                  className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getProgressColor(currentPhase, timeProgress)} rounded-full transition-all duration-300`}
                  style={{ width: `${timeProgress}%` }}
                />

                {/* 脉冲效果 */}
                {timeProgress > 0 && (
                  <MotionDiv
                    className={`absolute top-0 right-0 h-full w-4 bg-gradient-to-r ${config.color} rounded-r-full opacity-60`}
                    style={{ right: `${100 - timeProgress}%` }}
                  />
                )}
              </div>
            </div>

            {/* 右侧：时间和统计 */}
            <div className="flex items-center gap-6">
              {/* 倒计时 */}
              {config.duration > 0 && (
                <div className="time-display flex items-center gap-2">
                  <Clock className={`w-4 h-4 ${timeRemaining < 60 ? 'text-red-500' : 'text-gray-500'}`} />
                  <div className="text-right">
                    <div className={`text-lg font-mono font-semibold ${
                      timeRemaining < 60 ? 'text-red-600' : 'text-gray-800'
                    }`}>
                      {formatTime(timeRemaining)}
                    </div>
                    <div className="text-xs text-gray-500">剩余时间</div>
                  </div>
                </div>
              )}

              {/* 观众数 */}
              {viewerCount !== undefined && (
                <div className="viewer-count flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-800">
                      {viewerCount.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">观众</div>
                  </div>
                </div>
              )}

              {/* 实时指示器 */}
              <MotionDiv className="realtime-indicator flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full border border-green-200">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs font-medium">实时</span>
              </MotionDiv>
            </div>
          </div>

          {/* 阶段提示信息 */}
          {!permissions.canUserInput && permissions.canUserWatch && (
            <MotionDiv className="phase-hint mt-3 p-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
              <p className="text-sm">
                📺 当前为观看阶段，请耐心观看专家们的精彩表现
              </p>
            </MotionDiv>
          )}

          {permissions.userSupplementAllowed && (
            <MotionDiv className="phase-hint mt-3 p-2 bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-200">
              <p className="text-sm">
                🎯 您可以支持喜欢的专家（最多 {permissions.maxSupplementCount} 次）
              </p>
            </MotionDiv>
          )}
        </div>
      </div>

      {/* 阶段切换动画效果 - 简化版本 */}
      <MotionDiv
        className={`absolute inset-0 bg-gradient-to-r ${config.color} opacity-20`}
        key={currentPhase} // 确保阶段变化时重新触发动画
      />
    </MotionDiv>
  )
}

export default PhaseStatusBar