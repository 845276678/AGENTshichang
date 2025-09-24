'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui'
import { Progress } from '@/components/ui/progress'
import {
  CreativeAgent
} from '@/types'
import {
  Brain,
  Heart,
  Target,
  TrendingUp,
  Clock,
  Users,
  Star,
  BarChart3,
  Lightbulb,
  Flame,
  Snowflake,
  Sun,
  Cloud,
  Activity,
  MessageCircle,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface AgentPersonalityCardProps {
  agent: CreativeAgent
  onInteract?: () => void
  showDetailedView?: boolean
}

const personalityTraitIcons = {
  ANALYTICAL: BarChart3,
  CREATIVE: Lightbulb,
  EMPATHETIC: Heart,
  LOGICAL: Brain,
  INTUITIVE: Sparkles,
  PRAGMATIC: Target,
  INNOVATIVE: TrendingUp,
  METHODICAL: Clock
}

const personalityTraitLabels = {
  ANALYTICAL: '分析型',
  CREATIVE: '创造型',
  EMPATHETIC: '共情型',
  LOGICAL: '逻辑型',
  INTUITIVE: '直觉型',
  PRAGMATIC: '实用型',
  INNOVATIVE: '创新型',
  METHODICAL: '系统型'
}

const communicationStyleLabels = {
  FORMAL: '正式严谨',
  CASUAL: '轻松随意',
  TECHNICAL: '技术专业',
  EMPATHETIC: '温和共情',
  DIRECT: '直接明了'
}

const thinkingModeLabels = {
  SYSTEMATIC: '系统性思维',
  INTUITIVE: '直觉性思维',
  EXPERIMENTAL: '实验性思维',
  INTEGRATIVE: '整合性思维'
}

const decisionMakingLabels = {
  DATA_DRIVEN: '数据驱动',
  EXPERIENCE_BASED: '经验导向',
  RISK_TOLERANT: '风险偏好',
  CONSERVATIVE: '保守稳健'
}

const moodColors = {
  high: 'text-green-500',
  medium: 'text-yellow-500',
  low: 'text-red-500'
}

const getMoodLevel = (value: number) => {
  if (value >= 7) {return 'high'}
  if (value >= 4) {return 'medium'}
  return 'low'
}

const getMoodIcon = (energy: number, creativity: number) => {
  if (energy >= 8 && creativity >= 8) {return Sun}
  if (energy >= 6 && creativity >= 6) {return Flame}
  if (energy <= 3 || creativity <= 3) {return Cloud}
  return Snowflake
}

export const AgentPersonalityCard: React.FC<AgentPersonalityCardProps> = ({
  agent,
  onInteract,
  showDetailedView = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const { personality, cognitionStyle, currentMood, biddingStrategy } = agent

  const MoodIcon = currentMood ? getMoodIcon(currentMood.energy, currentMood.creativity) : Sun

  const renderPersonalityTraits = () => (
    <div className="space-y-3">
      <h4 className="font-semibold text-sm">性格特质</h4>
      <div className="grid grid-cols-2 gap-2">
        {personality.traits.map((trait) => {
          const Icon = personalityTraitIcons[trait]
          return (
            <div key={trait} className="flex items-center gap-2 text-sm">
              <Icon className="w-4 h-4 text-primary" />
              <span>{personalityTraitLabels[trait]}</span>
            </div>
          )
        })}
      </div>
    </div>
  )

  const renderCognitionStyle = () => (
    <div className="space-y-3">
      <h4 className="font-semibold text-sm">认知风格</h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">思维模式:</span>
          <span>{thinkingModeLabels[cognitionStyle.primaryThinkingMode]}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">决策风格:</span>
          <span>{decisionMakingLabels[cognitionStyle.decisionMakingStyle]}</span>
        </div>
      </div>
    </div>
  )

  const renderCurrentMood = () => {
    if (!currentMood) {return null}

    return (
      <div className="space-y-3">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <MoodIcon className={`w-4 h-4 ${moodColors[getMoodLevel(currentMood.energy)]}`} />
          当前状态
        </h4>
        <div className="space-y-2">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>活力</span>
              <span className={moodColors[getMoodLevel(currentMood.energy)]}>
                {currentMood.energy}/10
              </span>
            </div>
            <Progress value={currentMood.energy * 10} className="h-1" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>创造力</span>
              <span className={moodColors[getMoodLevel(currentMood.creativity)]}>
                {currentMood.creativity}/10
              </span>
            </div>
            <Progress value={currentMood.creativity * 10} className="h-1" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>批判性</span>
              <span className={moodColors[getMoodLevel(currentMood.criticalness)]}>
                {currentMood.criticalness}/10
              </span>
            </div>
            <Progress value={currentMood.criticalness * 10} className="h-1" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>协作意愿</span>
              <span className={moodColors[getMoodLevel(currentMood.collaboration)]}>
                {currentMood.collaboration}/10
              </span>
            </div>
            <Progress value={currentMood.collaboration * 10} className="h-1" />
          </div>
        </div>
        {currentMood.factors.length > 0 && (
          <div className="text-xs text-muted-foreground">
            <span>影响因素: </span>
            {currentMood.factors.join(', ')}
          </div>
        )}
      </div>
    )
  }

  const renderBiddingStrategy = () => (
    <div className="space-y-3">
      <h4 className="font-semibold text-sm">竞价策略</h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">策略类型:</span>
          <Badge variant="outline">
            {biddingStrategy.baseStrategy === 'AGGRESSIVE' && '激进型'}
            {biddingStrategy.baseStrategy === 'CONSERVATIVE' && '保守型'}
            {biddingStrategy.baseStrategy === 'ADAPTIVE' && '适应型'}
            {biddingStrategy.baseStrategy === 'OPPORTUNITY_BASED' && '机会型'}
          </Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">日预算:</span>
          <span className="font-semibold text-primary">{agent.dailyBudget} 积分</span>
        </div>
        <div className="space-y-1">
          <span className="text-muted-foreground">评估权重:</span>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>技术可行性</span>
              <span>{Math.round(biddingStrategy.factorWeights.technicalFeasibility * 100)}%</span>
            </div>
            <Progress value={biddingStrategy.factorWeights.technicalFeasibility * 100} className="h-1" />
            <div className="flex justify-between text-xs">
              <span>市场潜力</span>
              <span>{Math.round(biddingStrategy.factorWeights.marketPotential * 100)}%</span>
            </div>
            <Progress value={biddingStrategy.factorWeights.marketPotential * 100} className="h-1" />
            <div className="flex justify-between text-xs">
              <span>个人兴趣</span>
              <span>{Math.round(biddingStrategy.factorWeights.personalInterest * 100)}%</span>
            </div>
            <Progress value={biddingStrategy.factorWeights.personalInterest * 100} className="h-1" />
            <div className="flex justify-between text-xs">
              <span>协作潜力</span>
              <span>{Math.round(biddingStrategy.factorWeights.collaborationPotential * 100)}%</span>
            </div>
            <Progress value={biddingStrategy.factorWeights.collaborationPotential * 100} className="h-1" />
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-agent-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

      <CardHeader className="relative">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-agent-500/20 flex items-center justify-center border">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              {currentMood && (
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-background border-2 border-border flex items-center justify-center">
                  <MoodIcon className={`w-3 h-3 ${moodColors[getMoodLevel(currentMood.energy)]}`} />
                </div>
              )}
            </div>
            <div>
              <CardTitle className="group-hover:text-primary transition-colors">
                {agent.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {communicationStyleLabels[personality.communicationStyle]}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant="outline" className="text-xs">
              {agent.category}
            </Badge>
            <div className="text-right">
              <div className="text-lg font-bold text-primary">{agent.dailyBudget}</div>
              <div className="text-xs text-muted-foreground">日预算</div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {agent.description}
        </p>

        {/* 快速特质预览 */}
        <div className="flex flex-wrap gap-1">
          {personality.traits.slice(0, 3).map((trait) => (
            <Badge key={trait} variant="secondary" className="text-xs">
              {personalityTraitLabels[trait]}
            </Badge>
          ))}
          {personality.traits.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{personality.traits.length - 3}
            </Badge>
          )}
        </div>

        {/* 专业领域 */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">专业领域</h4>
          <div className="flex flex-wrap gap-1">
            {agent.specialties.slice(0, 4).map((specialty) => (
              <Badge key={specialty} variant="outline" className="text-xs">
                {specialty}
              </Badge>
            ))}
          </div>
        </div>

        {/* 详细信息展开/收起 */}
        {showDetailedView && (
          <motion.div
            initial={false}
            animate={{
              height: isExpanded ? 'auto' : 0,
              opacity: isExpanded ? 1 : 0
            }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden space-y-4"
          >
            {renderPersonalityTraits()}
            {renderCognitionStyle()}
            {renderCurrentMood()}
            {renderBiddingStrategy()}
          </motion.div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-2 pt-2">
          {onInteract && (
            <Button onClick={onInteract} className="flex-1">
              <MessageCircle className="w-4 h-4 mr-2" />
              开始协作
            </Button>
          )}
          {showDetailedView && (
            <Button
              variant="outline"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  收起
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  详情
                </>
              )}
            </Button>
          )}
        </div>

        {/* 状态指示器 */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/20">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span>{agent.rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{agent.totalReviews} 评价</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Activity className={`w-3 h-3 ${agent.isActive ? 'text-green-500' : 'text-gray-400'}`} />
            <span>{agent.isActive ? '在线' : '离线'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}