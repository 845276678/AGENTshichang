'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Heart } from 'lucide-react'
import { SpeakingIndicator, ThinkingIndicator, BiddingIndicator, WaitingIndicator } from './StatusIndicators'
import type { AIPersona } from '@/lib/ai-persona-enhanced'

const MotionDiv = ({ children, className, style, ...props }: any) => (
  <div className={className} style={style} {...props}>{children}</div>
)
const AnimatePresence = ({ children }: any) => <>{children}</>



// 简化组件替代motion - 避免生产环境错误

// 使用简化组件替代motion组件

// Agent状态接口定义
export interface AgentState {
  id: string
  phase: 'idle' | 'thinking' | 'speaking' | 'bidding' | 'waiting'
  emotion: 'neutral' | 'excited' | 'confident' | 'worried' | 'aggressive'
  currentMessage?: string
  confidence: number // 0-1
  lastActivity: Date
  speakingIntensity: number // 0-1
  thinkingDuration?: number
  isSupported?: boolean
}

// 竞价阶段枚举
export enum BiddingPhase {
  IDEA_INPUT = 'idea_input',
  AGENT_WARMUP = 'warmup',
  AGENT_DISCUSSION = 'discussion',
  AGENT_BIDDING = 'bidding',
  USER_SUPPLEMENT = 'prediction',
  RESULT_DISPLAY = 'result'
}

interface AgentDialogPanelProps {
  agent: AIPersona
  state: AgentState
  isActive: boolean
  currentPhase: BiddingPhase
  onSupport: () => void
  currentBid?: number
  className?: string
}

// 状态颜色映射
const AGENT_STATE_COLORS = {
  idle: 'bg-slate-100 text-slate-600 border-slate-200',
  thinking: 'bg-blue-100 text-blue-700 border-blue-200',
  speaking: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  bidding: 'bg-amber-100 text-amber-700 border-amber-200',
  waiting: 'bg-purple-100 text-purple-700 border-purple-200'
} as const

// 状态显示文本
const STATE_DISPLAY_NAMES = {
  idle: 'Idle',
  thinking: 'Thinking',
  speaking: 'Speaking',
  bidding: 'Bidding',
  waiting: 'Waiting'
} as const

// 情感动画映射（增强版）
const EMOTION_ANIMATIONS = {
  neutral: {
    animate: { scale: 1, rotate: 0 },
    transition: { duration: 0.3 }
  },
  excited: {
    animate: {
      scale: [1, 1.08, 1.02, 1.06, 1],
      rotate: [0, 2, -2, 1, 0]
    },
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: "easeInOut"
    }
  },
  confident: {
    animate: {
      scale: [1, 1.04, 1],
      y: [0, -2, 0]
    },
    transition: {
      repeat: Infinity,
      duration: 2.0,
      ease: "easeInOut"
    }
  },
  worried: {
    animate: {
      x: [-2, 2, -2, 1, 0],
      scale: [1, 0.98, 1]
    },
    transition: {
      repeat: Infinity,
      duration: 1.0,
      ease: "easeInOut"
    }
  },
  aggressive: {
    animate: {
      scale: [1, 1.12, 1.08, 1.15, 1],
      rotate: [0, -1, 1, -0.5, 0]
    },
    transition: {
      repeat: Infinity,
      duration: 0.8,
      ease: "easeInOut"
    }
  }
} as const

// 工具函数
const formatRelativeTime = (date: Date): string => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)

  if (seconds < 10) return 'just now'
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStateColor = (phase: AgentState['phase']): string => {
  return AGENT_STATE_COLORS[phase] || AGENT_STATE_COLORS.idle
}

const getStateDisplayName = (phase: AgentState['phase']): string => {
  return STATE_DISPLAY_NAMES[phase] || 'Unknown'
}

// 对话气泡动画变体
const bubbleVariants = {
  initial: {
    opacity: 0,
    scale: 0.92,
    y: 12
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 22,
      duration: 0.3
    }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: -8,
    transition: { duration: 0.2 }
  }
} as const

// 面板动画变体（增强版）
const panelVariants = {
  initial: {
    opacity: 0,
    scale: 0.9,
    y: 30,
    rotateX: -15
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    rotateX: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
      duration: 0.6,
      ease: "easeOut"
    }
  },
  hover: {
    scale: 1.03,
    y: -6,
    rotateX: 2,
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 30,
      duration: 0.2
    }
  },
  active: {
    scale: 1.05,
    y: -10,
    rotateX: 5,
    boxShadow: "0 25px 50px -12px rgba(59, 130, 246, 0.5)",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
      duration: 0.4
    }
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 }
  }
} as const

export const AgentDialogPanel: React.FC<AgentDialogPanelProps> = ({
  agent,
  state,
  isActive,
  currentPhase,
  onSupport,
  currentBid,
  className = ''
}) => {
  const showBidInfo = currentBid !== undefined ||
    currentPhase === 'bidding' ||
    currentPhase === 'prediction' ||
    currentPhase === BiddingPhase.AGENT_BIDDING ||
    currentPhase === BiddingPhase.USER_SUPPLEMENT

  // const emotionAnimation = EMOTION_ANIMATIONS[state.emotion] || {} // 已移除动画

  return (
    <MotionDiv
      className={`agent-panel-container relative flex flex-col gap-5 bg-white rounded-2xl shadow-lg border-2 p-5 transition-all duration-300 ease-out ${
        isActive
          ? 'ring-4 ring-blue-500 ring-opacity-70 shadow-2xl border-blue-500 bg-blue-50 is-active scale-105 z-10'
          : 'border-gray-200 hover:shadow-xl hover:-translate-y-1'
      } ${className}`}
      style={{
        width: '100%',
        minWidth: '240px',
        maxWidth: '320px'
      }}
    >
      {/* 1. 头像区域 */}
      <div className="agent-avatar-section flex flex-col items-center gap-2">
        <div className="avatar-container relative w-16 h-16 mb-2">
          <MotionDiv className="agent-avatar relative">
            {/* 使用真实头像图片 */}
            <div className="w-full h-full rounded-full overflow-hidden shadow-lg">
              <img
                src={agent.avatar}
                alt={agent.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // 如果图片加载失败，使用渐变背景和首字母
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `<div class="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                      ${agent.name.charAt(0)}
                    </div>`;
                  }
                }}
              />
            </div>

            {/* 状态指示器叠加层 */}
            <div className="absolute inset-0 pointer-events-none">
              <SpeakingIndicator
                show={state.phase === 'speaking'}
                intensity={state.speakingIntensity}
              />
              <ThinkingIndicator
                show={state.phase === 'thinking'}
                duration={state.thinkingDuration || 3}
              />
              <BiddingIndicator
                show={state.phase === 'bidding'}
                amount={currentBid}
              />
              <WaitingIndicator
                show={state.phase === 'waiting'}
              />
            </div>

            {/* 活跃光环效果 - 增强版 */}
            {isActive && (
              <>
                <div
                  className="absolute -inset-2 rounded-full opacity-90 animate-pulse"
                  style={{
                    background: 'conic-gradient(from 0deg, #3B82F6, #8B5CF6, #EC4899, #10B981, #F59E0B, #3B82F6)',
                    zIndex: -1,
                    animation: 'rotate 2s linear infinite, pulse 1.5s ease-in-out infinite'
                  }}
                />
                <div
                  className="absolute -inset-3 rounded-full opacity-40"
                  style={{
                    background: 'radial-gradient(circle, rgba(59,130,246,0.6) 0%, rgba(59,130,246,0) 70%)',
                    zIndex: -2,
                    animation: 'pulse 2s ease-in-out infinite'
                  }}
                />
              </>
            )}
          </MotionDiv>

          {/* 状态标签 */}
          <Badge
            className={`text-xs font-medium transition-colors duration-300 ${getStateColor(state.phase)}`}
            variant="outline"
          >
            {getStateDisplayName(state.phase)}
          </Badge>
        </div>
      </div>

      {/* 2. 信息区域 */}
      <div className="agent-info-section text-center flex flex-col items-center gap-2">
        <h4 className="agent-name text-sm font-semibold text-gray-800 leading-snug line-clamp-1">
          {agent.name}
          {agent.age && <span className="text-xs text-gray-500 ml-1">({agent.age}岁)</span>}
        </h4>

        {/* 背景信息 */}
        {agent.background && (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
            {agent.background}
          </p>
        )}

        <p className="agent-specialty text-xs text-gray-600 leading-relaxed line-clamp-2">
          专长：{agent.specialty}
        </p>

        {/* 口头禅 */}
        {agent.catchPhrase && (
          <p className="text-xs italic text-blue-600 leading-relaxed">
            "{agent.catchPhrase}"
          </p>
        )}

        {/* 关系标签 */}
        <div className="flex flex-wrap justify-center gap-1.5">
          {agent.conflicts && agent.conflicts.length > 0 && (
            <Badge variant="outline" className="text-xs bg-red-50 text-red-600">
              易冲突：{agent.conflicts.length}人
            </Badge>
          )}
          {agent.allies && agent.allies.length > 0 && (
            <Badge variant="outline" className="text-xs bg-green-50 text-green-600">
              盟友：{agent.allies.length}人
            </Badge>
          )}
        </div>

        {/* 信心度指示器 */}
        {state.confidence > 0 && (
          <div className="confidence-indicator flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <MotionDiv
                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                style={{ width: `${state.confidence * 100}%` }}
              />
            </div>
            <span className="text-xs font-medium text-gray-600">
              {Math.round(state.confidence * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* 3. 对话气泡区域 */}
      <div
        className="dialog-section relative flex w-full items-start justify-center py-3"
        style={{
          overflow: 'visible'
        }}
      >
        <AnimatePresence>
          {state.currentMessage && (
            <MotionDiv
              className="dialog-bubble relative bg-white border border-gray-200 rounded-2xl shadow-md p-4 w-full max-w-none"
              style={{
                width: '100%',
                maxHeight: '22rem',
                overflowY: 'auto',
                paddingRight: '0.75rem'
              }}
            >
              {/* 气泡内容 */}
              <div className="bubble-content relative z-10">
                <div
                  className="message-text text-sm text-gray-900 leading-7 tracking-[0.005em] break-words"
                  style={{
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word'
                  }}
                >
                  {state.currentMessage}
                </div>
              </div>

              {/* 气泡尾巴 */}
              <div
                className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-r border-b border-gray-200 rotate-45"
                style={{ zIndex: -1 }}
              />

              {/* 时间戳 */}
              <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 whitespace-nowrap">
                {formatRelativeTime(state.lastActivity)}
              </div>
            </MotionDiv>
          )}
        </AnimatePresence>
      </div>

      {/* 4. 竞价状态区域 */}
      {showBidInfo && (
        <MotionDiv className="bidding-section relative flex items-center justify-center mt-2">
          <MotionDiv
            className={`bid-amount flex items-center gap-1 px-4 py-2 rounded-full shadow-lg ${
              currentBid === 0
                ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700'
                : 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white'
            }`}
          >
            <span className="text-base font-medium">¥</span>
            <span
              className="text-base font-bold min-w-[40px] text-center"
              key={currentBid} // 重新动画当出价变化时
            >
              {currentBid || 0}
            </span>
          </MotionDiv>

          {/* 0出价特殊提示 */}
          {currentBid === 0 && (
            <MotionDiv className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 whitespace-nowrap">
              <span className="animate-pulse">
                尚无溢价
              </span>
            </MotionDiv>
          )}

          {/* 高出价闪烁效果 */}
          {currentBid && currentBid > 100 && (
            <MotionDiv
              className="absolute inset-0 bg-yellow-400 rounded-full pointer-events-none"
              style={{ zIndex: -1 }}
            />
          )}

          {/* 竞价脉冲效果（增强版） */}
          {state.phase === 'bidding' && currentBid !== undefined && (
            <>
              <MotionDiv
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background: currentBid === 0
                    ? 'radial-gradient(circle, rgba(156, 163, 175, 0.2) 0%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(245, 158, 11, 0.3) 0%, transparent 70%)',
                  zIndex: -1
                }}
              />

              {/* 额外的竞价指示器 */}
              <MotionDiv className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full" />
            </>
          )}
        </MotionDiv>
      )}

      {/* 5. 交互区域 */}
      <div className="interaction-section flex justify-center mt-2">
        {currentPhase === BiddingPhase.USER_SUPPLEMENT && (
          <MotionDiv>
            <Button
              size="sm"
              variant={state.isSupported ? "default" : "outline"}
              onClick={onSupport}
              className={`support-button transition-all duration-200 hover:scale-105 active:scale-95 ${
                state.isSupported ? 'is-supported' : ''
              }`}
              aria-label={`${state.isSupported ? '已支持' : '支持'} ${agent.name}`}
              disabled={state.isSupported}
            >
              <MotionDiv>
                <Heart className={`w-3 h-3 mr-1 ${state.isSupported ? 'fill-current text-red-500' : ''}`} />
              </MotionDiv>
              <span>{state.isSupported ? '已支持' : '支持'}</span>
            </Button>
          </MotionDiv>
        )}
      </div>

      {/* 加载状态覆盖层 */}
      <AnimatePresence>
        {state.phase === 'thinking' && (
          <MotionDiv className="absolute inset-0 bg-white bg-opacity-50 rounded-2xl flex items-center justify-center">
            <div className="loading-spinner w-8 h-8 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
          </MotionDiv>
        )}
      </AnimatePresence>
    </MotionDiv>
  )
}

// 默认Agent状态生成函数
export const getDefaultAgentState = (agentId: string): AgentState => ({
  id: agentId,
  phase: 'idle',
  emotion: 'neutral',
  confidence: 0,
  lastActivity: new Date(),
  speakingIntensity: 0.8,
  thinkingDuration: 3,
  isSupported: false
})

export default AgentDialogPanel

