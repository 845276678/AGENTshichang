'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui'
import { Textarea } from '@/components/ui/textarea'

import {
  CreativeChallenge,
  ChallengeSubmission,
  ChallengeReward
} from '@/types'
import {
  Trophy,
  Target,
  Users,
  Star,
  Send,
  Eye,
  Award,
  Zap,
  CheckCircle,
  AlertCircle,
  Timer,
  Brain,
  Flame,
  Crown,
  Gift
} from 'lucide-react'

interface CreativeChallengeCardProps {
  challenge: CreativeChallenge
  userSubmission?: ChallengeSubmission
  onSubmit?: (content: string) => void
  onView?: () => void
  isSubmitting?: boolean
}

const difficultyConfig = {
  EASY: {
    color: 'bg-green-500',
    textColor: 'text-green-600',
    icon: Star,
    label: '入门'
  },
  MEDIUM: {
    color: 'bg-yellow-500',
    textColor: 'text-yellow-600',
    icon: Target,
    label: '进阶'
  },
  HARD: {
    color: 'bg-orange-500',
    textColor: 'text-orange-600',
    icon: Flame,
    label: '困难'
  },
  EXPERT: {
    color: 'bg-red-500',
    textColor: 'text-red-600',
    icon: Crown,
    label: '专家'
  }
}

// const rarityConfig = {
//   COMMON: {
//     color: 'text-gray-500',
//     bgColor: 'bg-gray-100',
//     label: '普通'
//   },
//   RARE: {
//     color: 'text-blue-500',
//     bgColor: 'bg-blue-100',
//     label: '稀有'
//   },
//   EPIC: {
//     color: 'text-purple-500',
//     bgColor: 'bg-purple-100',
//     label: '史诗'
//   },
//   LEGENDARY: {
//     color: 'text-yellow-500',
//     bgColor: 'bg-yellow-100',
//     label: '传说'
//   }
// }

export const CreativeChallengeCard: React.FC<CreativeChallengeCardProps> = ({
  challenge,
  userSubmission,
  onSubmit,
  onView,
  isSubmitting = false
}) => {
  const [submissionContent, setSubmissionContent] = useState('')
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)

  const difficultyInfo = difficultyConfig[challenge.difficulty]
  const DifficultyIcon = difficultyInfo.icon

  useEffect(() => {
    const updateTimeRemaining = () => {
      const now = new Date().getTime()
      const expiry = new Date(challenge.expiresAt).getTime()
      const remaining = Math.max(0, expiry - now)
      setTimeRemaining(remaining)
    }

    updateTimeRemaining()
    const interval = setInterval(updateTimeRemaining, 1000)

    return () => clearInterval(interval)
  }, [challenge.expiresAt])

  const formatTimeRemaining = (ms: number) => {
    if (ms <= 0) {return '已过期'}

    const days = Math.floor(ms / (1000 * 60 * 60 * 24))
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) {return `${days}天 ${hours}小时`}
    if (hours > 0) {return `${hours}小时 ${minutes}分钟`}
    return `${minutes}分钟`
  }

  const handleSubmit = () => {
    if (submissionContent.trim() && onSubmit) {
      onSubmit(submissionContent.trim())
      setSubmissionContent('')
    }
  }

  const getProgressColor = () => {
    const progress = (new Date().getTime() - new Date(challenge.createdAt).getTime()) /
                    (new Date(challenge.expiresAt).getTime() - new Date(challenge.createdAt).getTime())

    if (progress < 0.5) {return 'bg-green-500'}
    if (progress < 0.8) {return 'bg-yellow-500'}
    return 'bg-red-500'
  }

  const renderRewards = (rewards: ChallengeReward) => (
    <div className="space-y-2">
      <h4 className="font-semibold text-sm flex items-center gap-2">
        <Gift className="w-4 h-4" />
        奖励内容
      </h4>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>积分奖励:</span>
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="font-semibold">{rewards.points}</span>
          </div>
        </div>

        {rewards.badges.length > 0 && (
          <div className="space-y-1">
            <span className="text-sm">解锁徽章:</span>
            <div className="flex flex-wrap gap-1">
              {rewards.badges.map((badge, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  <Award className="w-3 h-3 mr-1" />
                  {badge}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {rewards.unlockFeatures && rewards.unlockFeatures.length > 0 && (
          <div className="space-y-1">
            <span className="text-sm">解锁功能:</span>
            <div className="flex flex-wrap gap-1">
              {rewards.unlockFeatures.map((feature, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const renderSubmission = () => {
    if (userSubmission) {
      return (
        <div className="space-y-3 p-4 bg-secondary/20 rounded-lg">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">我的提交</h4>
            <div className="flex items-center gap-2">
              {userSubmission.score && (
                <Badge variant="outline">
                  评分: {userSubmission.score}/100
                </Badge>
              )}
              <Badge variant={userSubmission.evaluatedAt ? 'default' : 'secondary'}>
                {userSubmission.evaluatedAt ? '已评分' : '待评分'}
              </Badge>
            </div>
          </div>
          <p className="text-sm">{userSubmission.content}</p>
          {userSubmission.feedback && (
            <div className="mt-2 p-2 bg-primary/10 rounded border-l-4 border-primary">
              <h5 className="font-medium text-sm mb-1">AI反馈:</h5>
              <p className="text-sm text-muted-foreground">{userSubmission.feedback}</p>
            </div>
          )}
        </div>
      )
    }

    if (challenge.status === 'EXPIRED') {
      return (
        <div className="text-center p-4 text-muted-foreground">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">挑战已过期</p>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        <h4 className="font-semibold text-sm">提交你的方案</h4>
        <Textarea
          value={submissionContent}
          onChange={(e) => setSubmissionContent(e.target.value)}
          placeholder="详细描述你的创意方案和解决思路..."
          className="min-h-[120px]"
          disabled={isSubmitting}
        />
        <div className="flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            {submissionContent.length} 字符
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!submissionContent.trim() || isSubmitting}
            className="flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? '提交中...' : '提交方案'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-agent-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

      <CardHeader className="relative">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-agent-500/20 flex items-center justify-center border">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="group-hover:text-primary transition-colors mb-1">
                {challenge.title}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm">
                <Badge
                  variant="outline"
                  className={`${difficultyInfo.color} text-white border-transparent`}
                >
                  <DifficultyIcon className="w-3 h-3 mr-1" />
                  {difficultyInfo.label}
                </Badge>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="w-3 h-3" />
                  {challenge.submissions.length} 参与
                </div>
              </div>
            </div>
          </div>

          <div className="text-right space-y-1">
            <div className="flex items-center gap-1 text-primary font-semibold">
              <Zap className="w-4 h-4" />
              {challenge.rewards.points} 积分
            </div>
            <div className="text-xs text-muted-foreground">
              <Timer className="w-3 h-3 inline mr-1" />
              {formatTimeRemaining(timeRemaining)}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {challenge.description}
        </p>

        {/* 时间进度条 */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>挑战进度</span>
            <span>{challenge.status === 'ACTIVE' ? '进行中' : '已结束'}</span>
          </div>
          <div className="w-full bg-secondary/20 rounded-full h-2">
            <motion.div
              className={`h-full rounded-full ${getProgressColor()}`}
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(100, (new Date().getTime() - new Date(challenge.createdAt).getTime()) /
                  (new Date(challenge.expiresAt).getTime() - new Date(challenge.createdAt).getTime()) * 100)}%`
              }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>

        {/* 约束条件 */}
        {challenge.constraints.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">挑战约束</h4>
            <div className="flex flex-wrap gap-1">
              {challenge.constraints.slice(0, 3).map((constraint, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {constraint}
                </Badge>
              ))}
              {challenge.constraints.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{challenge.constraints.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* 展开详细信息 */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 overflow-hidden"
            >
              {/* 评估标准 */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">评估标准</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {challenge.evaluationCriteria.map((criterion, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      {criterion}
                    </li>
                  ))}
                </ul>
              </div>

              {renderRewards(challenge.rewards)}

              {/* 创建者信息 */}
              <div className="flex items-center gap-3 p-3 bg-secondary/20 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-agent-500/20 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-sm">{challenge.creatorAgent.name}</div>
                  <div className="text-xs text-muted-foreground">挑战发起者</div>
                </div>
              </div>

              {renderSubmission()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 操作按钮 */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-2" />
            {isExpanded ? '收起详情' : '查看详情'}
          </Button>
          {onView && (
            <Button onClick={onView} variant="outline">
              <Users className="w-4 h-4 mr-2" />
              查看提交
            </Button>
          )}
        </div>

        {/* 状态栏 */}
        <div className="flex items-center justify-between pt-2 border-t border-border/20 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {challenge.creatorAgent.name}
            </Badge>
            <span>•</span>
            <span>{new Date(challenge.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Trophy className="w-3 h-3" />
            <span>最高奖励 {challenge.rewards.points} 积分</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}