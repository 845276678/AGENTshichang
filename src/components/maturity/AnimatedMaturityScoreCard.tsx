'use client'

import React, { useEffect, useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { MaturityScoreResult } from '@/types/maturity-score'
import { useSoundEffects } from '@/hooks/useSoundEffects'

interface AnimatedMaturityScoreCardProps {
  assessment: MaturityScoreResult
  enableSound?: boolean
  onAnimationComplete?: () => void
}

/**
 * 带动画效果的成熟度评分卡
 *
 * 功能：
 * - 分数从0滚动到实际分数
 * - 维度条形图填充动画
 * - 等级徽章缩放动画
 * - 音效反馈
 */
export function AnimatedMaturityScoreCard({
  assessment,
  enableSound = false,
  onAnimationComplete
}: AnimatedMaturityScoreCardProps) {
  const { totalScore, level, dimensions, confidence } = assessment
  const { playSound } = useSoundEffects(enableSound, 0.5)

  // 分数滚动动画
  const scoreSpring = useSpring(0, {
    stiffness: 50,
    damping: 20
  })

  const [animationStarted, setAnimationStarted] = useState(false)

  useEffect(() => {
    // 延迟启动动画，增加戏剧性
    const timer = setTimeout(() => {
      setAnimationStarted(true)
      scoreSpring.set(totalScore)

      // 播放评估完成音效
      if (enableSound) {
        playSound('assessment-complete')
      }

      // 如果解锁工作坊，播放解锁音效
      if (totalScore >= 5.0 && enableSound) {
        setTimeout(() => {
          playSound('workshop-unlock')
        }, 1500)
      }

      // 动画完成回调
      if (onAnimationComplete) {
        setTimeout(onAnimationComplete, 3000)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [totalScore, scoreSpring, enableSound, playSound, onAnimationComplete])

  // 圆环进度动画
  const circleProgress = useTransform(scoreSpring, [0, 10], [0, 439.6])

  // 等级配置
  const levelConfig = {
    LOW: {
      label: '想法阶段',
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: '💡',
      gradient: 'from-red-400 to-red-600'
    },
    GRAY_LOW: {
      label: '灰色区（想法→方向）',
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      icon: '🌤️',
      gradient: 'from-orange-400 to-orange-600'
    },
    MEDIUM: {
      label: '方向阶段',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: '🎯',
      gradient: 'from-yellow-400 to-yellow-600'
    },
    GRAY_HIGH: {
      label: '灰色区（方向→方案）',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: '🌟',
      gradient: 'from-blue-400 to-blue-600'
    },
    HIGH: {
      label: '方案阶段',
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: '💎',
      gradient: 'from-green-400 to-green-600'
    }
  }

  const currentLevel = levelConfig[level]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-2 overflow-hidden">
        <CardHeader className="relative">
          {/* 背景渐变效果 */}
          <div className={`absolute inset-0 bg-gradient-to-r ${currentLevel.gradient} opacity-5`} />

          <div className="relative flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <span>创意成熟度评估</span>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                >
                  ✨
                </motion.span>
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                基于The Mom Test理论，5维度综合评估
              </p>
            </div>

            {/* 等级徽章 - 缩放动画 */}
            <motion.div
              className={`px-4 py-2 rounded-lg border-2 ${currentLevel.color}`}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.7, type: 'spring', stiffness: 150 }}
            >
              <div className="flex items-center gap-2">
                <motion.span
                  className="text-2xl"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ delay: 1.5, duration: 0.5 }}
                >
                  {currentLevel.icon}
                </motion.span>
                <div>
                  <div className="font-semibold">{currentLevel.label}</div>
                  <div className="text-xs opacity-75">
                    置信度: {(confidence * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 总分显示 - 圆形进度条 */}
          <div className="text-center py-6">
            <div className="relative inline-block">
              <svg width="160" height="160" viewBox="0 0 160 160">
                {/* 背景圆环 */}
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                />
                {/* 得分圆环 - 动画填充 */}
                <motion.circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke={getScoreColor(totalScore)}
                  strokeWidth="12"
                  strokeDasharray="439.6 439.6"
                  strokeDashoffset={useTransform(circleProgress, (v) => 439.6 - v)}
                  strokeLinecap="round"
                  transform="rotate(-90 80 80)"
                  style={{ transition: 'stroke 0.3s' }}
                />
              </svg>

              {/* 中心分数 - 滚动数字 */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span className="text-4xl font-bold">
                  {scoreSpring.get().toFixed(1)}
                </motion.span>
                <span className="text-sm text-gray-500">/ 10.0</span>
              </div>
            </div>

            {/* 解锁提示 */}
            {totalScore >= 5.0 && (
              <motion.div
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.5, type: 'spring' }}
              >
                <span className="text-lg">🎉</span>
                <span>已解锁专业工作坊</span>
              </motion.div>
            )}
          </div>

          {/* 各维度分数 */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-gray-700">维度详情</h4>

            <AnimatedDimensionBar
              label="目标客户"
              score={dimensions.targetCustomer.score}
              status={dimensions.targetCustomer.status}
              weight="20%"
              delay={0}
              enableSound={enableSound}
            />

            <AnimatedDimensionBar
              label="需求场景"
              score={dimensions.demandScenario.score}
              status={dimensions.demandScenario.status}
              weight="20%"
              delay={0.1}
              enableSound={enableSound}
            />

            <AnimatedDimensionBar
              label="核心价值"
              score={dimensions.coreValue.score}
              status={dimensions.coreValue.status}
              weight="25%"
              delay={0.2}
              enableSound={enableSound}
            />

            <AnimatedDimensionBar
              label="商业模式"
              score={dimensions.businessModel.score}
              status={dimensions.businessModel.status}
              weight="20%"
              delay={0.3}
              enableSound={enableSound}
            />

            <AnimatedDimensionBar
              label="可信度"
              score={dimensions.credibility.score}
              status={dimensions.credibility.status}
              weight="15%"
              delay={0.4}
              enableSound={enableSound}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/**
 * 带动画的维度评分条
 */
function AnimatedDimensionBar({
  label,
  score,
  status,
  weight,
  delay = 0,
  enableSound = false
}: {
  label: string
  score: number
  status: 'CLEAR' | 'NEEDS_FOCUS' | 'UNCLEAR'
  weight: string
  delay?: number
  enableSound?: boolean
}) {
  const { playSound } = useSoundEffects(enableSound, 0.3)

  const statusConfig = {
    CLEAR: { label: '清晰', color: 'bg-green-500', textColor: 'text-green-700' },
    NEEDS_FOCUS: { label: '需关注', color: 'bg-yellow-500', textColor: 'text-yellow-700' },
    UNCLEAR: { label: '模糊', color: 'bg-red-500', textColor: 'text-red-700' }
  }

  const currentStatus = statusConfig[status]

  // 分数滚动
  const scoreValue = useSpring(0, { stiffness: 50, damping: 20 })

  useEffect(() => {
    const timer = setTimeout(() => {
      scoreValue.set(score)

      // 播放分数滚动音效
      if (enableSound) {
        playSound('score-tick')
      }
    }, 500 + delay * 1000)

    return () => clearTimeout(timer)
  }, [score, delay, scoreValue, enableSound, playSound])

  return (
    <motion.div
      className="space-y-2"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 + delay, duration: 0.4 }}
    >
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="font-medium">{label}</span>
          <Badge variant="outline" className="text-xs">
            {weight}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs ${currentStatus.textColor}`}>
            {currentStatus.label}
          </span>
          <motion.span className="font-semibold">
            {scoreValue.get().toFixed(1)}/10
          </motion.span>
        </div>
      </div>

      <div className="relative">
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${currentStatus.color}`}
            initial={{ width: 0 }}
            animate={{ width: `${(score / 10) * 100}%` }}
            transition={{
              delay: 0.5 + delay,
              duration: 0.8,
              ease: 'easeOut'
            }}
          />
        </div>
      </div>
    </motion.div>
  )
}

/**
 * 根据分数获取颜色
 */
function getScoreColor(score: number): string {
  if (score >= 7.5) return '#10b981' // green-500
  if (score >= 7.0) return '#3b82f6' // blue-500
  if (score >= 5.0) return '#f59e0b' // yellow-500
  if (score >= 4.0) return '#f97316' // orange-500
  return '#ef4444' // red-500
}
