'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import {
  UserCreativeProfile,
  CreativeDNA,
  CreativeAgent,
  _CollaborationHistory
} from '@/types'
import {
  Brain,
  Lightbulb,
  Target,
  TrendingUp,
  Users,
  Star,
  Zap,
  Heart,
  Shield,
  Puzzle,
  Rocket,
  Palette,
  BarChart3,
  Globe,
  CheckCircle,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Trophy,
  Clock,
} from 'lucide-react'

interface CreativeDNAAnalysisProps {
  userProfile?: UserCreativeProfile
  agents: CreativeAgent[]
  onStartAssessment?: () => void
  onSelectAgent?: (agentId: string) => void
  isAssessing?: boolean
}

interface AssessmentQuestion {
  id: string
  question: string
  category: keyof CreativeDNA
  options: {
    value: string
    label: string
    description: string
  }[]
}

const assessmentQuestions: AssessmentQuestion[] = [
  {
    id: '1',
    question: '面对一个新问题时，你通常会：',
    category: 'dominantThinkingStyle',
    options: [
      { value: 'LOGICAL', label: '逻辑分析', description: '系统性分析问题的各个方面' },
      { value: 'INTUITIVE', label: '直觉判断', description: '依靠第一感觉和经验' },
      { value: 'EXPERIMENTAL', label: '实验尝试', description: '通过试错来寻找答案' },
      { value: 'INTEGRATIVE', label: '整合思考', description: '结合多种方法和观点' }
    ]
  },
  {
    id: '2',
    question: '你更喜欢创造什么类型的解决方案：',
    category: 'creativityType',
    options: [
      { value: 'BREAKTHROUGH', label: '突破性创新', description: '完全颠覆现有方式' },
      { value: 'IMPROVEMENT', label: '渐进式改良', description: '在现有基础上优化' },
      { value: 'SYNTHESIS', label: '融合创新', description: '结合不同领域的想法' },
      { value: 'APPLICATION', label: '应用创新', description: '将现有技术应用到新场景' }
    ]
  },
  {
    id: '3',
    question: '在团队协作中，你更倾向于：',
    category: 'collaborationStyle',
    options: [
      { value: 'LEADER', label: '主导引领', description: '喜欢制定方向和推动进展' },
      { value: 'COLLABORATOR', label: '平等协作', description: '与他人共同讨论和决策' },
      { value: 'SUPPORTER', label: '支持配合', description: '帮助他人实现想法' },
      { value: 'INDEPENDENT', label: '独立贡献', description: '独自完成任务后分享结果' }
    ]
  },
  {
    id: '4',
    question: '你最感兴趣的创新领域是：',
    category: 'innovationPreference',
    options: [
      { value: 'TECHNICAL', label: '技术创新', description: '新技术和工程解决方案' },
      { value: 'ARTISTIC', label: '艺术创新', description: '美学和创意表达' },
      { value: 'BUSINESS', label: '商业创新', description: '商业模式和市场机会' },
      { value: 'SOCIAL', label: '社会创新', description: '社会问题和人文关怀' }
    ]
  },
  {
    id: '5',
    question: '对于风险，你的态度是：',
    category: 'riskTolerance',
    options: [
      { value: 'LOW', label: '谨慎保守', description: '偏好确定性高的方案' },
      { value: 'MEDIUM', label: '平衡考虑', description: '在风险和收益间寻找平衡' },
      { value: 'HIGH', label: '勇于冒险', description: '愿意尝试高风险高回报的想法' }
    ]
  },
  {
    id: '6',
    question: '你更喜欢处理：',
    category: 'complexityPreference',
    options: [
      { value: 'SIMPLE', label: '简单直接', description: '清晰明了的问题和解决方案' },
      { value: 'MODERATE', label: '适中复杂', description: '有一定挑战但可控的问题' },
      { value: 'COMPLEX', label: '复杂系统', description: '多层次、多变量的复杂问题' }
    ]
  }
]

const thinkingStyleIcons = {
  LOGICAL: Brain,
  INTUITIVE: Heart,
  EXPERIMENTAL: Rocket,
  INTEGRATIVE: Puzzle
}

const creativityTypeIcons = {
  BREAKTHROUGH: Sparkles,
  IMPROVEMENT: TrendingUp,
  SYNTHESIS: Globe,
  APPLICATION: Target
}

const collaborationStyleIcons = {
  LEADER: Trophy,
  COLLABORATOR: Users,
  SUPPORTER: Heart,
  INDEPENDENT: Shield
}

const innovationPreferenceIcons = {
  TECHNICAL: Zap,
  ARTISTIC: Palette,
  BUSINESS: BarChart3,
  SOCIAL: Users
}

const calculateCompatibility = (userDNA: CreativeDNA, agent: CreativeAgent): number => {
  let score = 0
  let factors = 0

  // 思维风格匹配 (30%)
  if (agent.cognitionStyle.primaryThinkingMode.toLowerCase().includes(userDNA.dominantThinkingStyle.toLowerCase())) {
    score += 30
  }
  factors += 30

  // 创新偏好匹配 (25%)
  if (agent.specialties.some(specialty =>
    specialty.toLowerCase().includes(userDNA.innovationPreference.toLowerCase())
  )) {
    score += 25
  }
  factors += 25

  // 协作风格兼容性 (20%)
  const collaborationCompatibility = {
    LEADER: ['SUPPORTER', 'COLLABORATOR'],
    COLLABORATOR: ['COLLABORATOR', 'LEADER'],
    SUPPORTER: ['LEADER', 'COLLABORATOR'],
    INDEPENDENT: ['INDEPENDENT', 'SUPPORTER']
  }

  if (collaborationCompatibility[userDNA.collaborationStyle]?.includes(agent.personality.traits[0] as any)) {
    score += 20
  }
  factors += 20

  // 复杂度匹配 (15%)
  const complexityMatch = {
    SIMPLE: agent.cognitionStyle.informationProcessing === 'SEQUENTIAL',
    MODERATE: agent.cognitionStyle.informationProcessing === 'CONTEXTUAL',
    COMPLEX: agent.cognitionStyle.informationProcessing === 'PARALLEL'
  }

  if (complexityMatch[userDNA.complexityPreference]) {
    score += 15
  }
  factors += 15

  // 风险偏好匹配 (10%)
  const riskMatch = {
    LOW: agent.cognitionStyle.decisionMakingStyle === 'CONSERVATIVE',
    MEDIUM: agent.cognitionStyle.decisionMakingStyle === 'DATA_DRIVEN',
    HIGH: agent.cognitionStyle.decisionMakingStyle === 'RISK_TOLERANT'
  }

  if (riskMatch[userDNA.riskTolerance]) {
    score += 10
  }
  factors += 10

  return Math.round((score / factors) * 100)
}

export const CreativeDNAAnalysis: React.FC<CreativeDNAAnalysisProps> = ({
  userProfile,
  agents,
  onStartAssessment,
  onSelectAgent,
  isAssessing = false
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isCompleted, setIsCompleted] = useState(false)
  const [generatedDNA, setGeneratedDNA] = useState<CreativeDNA | null>(null)
  const [compatibleAgents, setCompatibleAgents] = useState<Array<{ agent: CreativeAgent, compatibility: number }>>([])

  const currentQuestion = assessmentQuestions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / assessmentQuestions.length) * 100

  useEffect(() => {
    if (isCompleted && generatedDNA) {
      const agentCompatibilities = agents.map(agent => ({
        agent,
        compatibility: calculateCompatibility(generatedDNA, agent)
      })).sort((a, b) => b.compatibility - a.compatibility)

      setCompatibleAgents(agentCompatibilities)
    }
  }, [isCompleted, generatedDNA, agents])

  const handleAnswerSelect = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }))
  }

  const handleNext = () => {
    if (currentQuestionIndex < assessmentQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      completeAssessment()
    }
  }

  const completeAssessment = () => {
    const dna: CreativeDNA = {
      dominantThinkingStyle: answers['1'] as any,
      creativityType: answers['2'] as any,
      collaborationStyle: answers['3'] as any,
      innovationPreference: answers['4'] as any,
      riskTolerance: answers['5'] as any,
      complexityPreference: answers['6'] as any,
      lastAssessed: new Date(),
      confidence: 0.85
    }

    setGeneratedDNA(dna)
    setIsCompleted(true)
  }

  const renderDNAProfile = (dna: CreativeDNA) => {
    const ThinkingIcon = thinkingStyleIcons[dna.dominantThinkingStyle]
    const CreativityIcon = creativityTypeIcons[dna.creativityType]
    const CollaborationIcon = collaborationStyleIcons[dna.collaborationStyle]
    const InnovationIcon = innovationPreferenceIcons[dna.innovationPreference]

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            你的创意DNA档案
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ThinkingIcon className="w-4 h-4 text-primary" />
                <span className="font-medium">思维风格</span>
              </div>
              <Badge variant="outline">{dna.dominantThinkingStyle}</Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CreativityIcon className="w-4 h-4 text-primary" />
                <span className="font-medium">创新类型</span>
              </div>
              <Badge variant="outline">{dna.creativityType}</Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CollaborationIcon className="w-4 h-4 text-primary" />
                <span className="font-medium">协作风格</span>
              </div>
              <Badge variant="outline">{dna.collaborationStyle}</Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <InnovationIcon className="w-4 h-4 text-primary" />
                <span className="font-medium">创新偏好</span>
              </div>
              <Badge variant="outline">{dna.innovationPreference}</Badge>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>档案置信度</span>
              <span>{Math.round(dna.confidence * 100)}%</span>
            </div>
            <Progress value={dna.confidence * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderAgentCompatibility = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">推荐AI协作伙伴</h3>
      <div className="space-y-3">
        {compatibleAgents.slice(0, 5).map(({ agent, compatibility }, index) => (
          <Card key={agent.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-agent-500/20 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{agent.name}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {agent.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">匹配度</div>
                    <div className="text-lg font-bold text-primary">{compatibility}%</div>
                  </div>
                  {index === 0 && (
                    <Badge variant="default" className="bg-gradient-to-r from-primary to-agent-500">
                      <Star className="w-3 h-3 mr-1" />
                      最佳匹配
                    </Badge>
                  )}
                  <Button
                    size="sm"
                    onClick={() => onSelectAgent?.(agent.id)}
                    className="flex items-center gap-1"
                  >
                    <Users className="w-3 h-3" />
                    开始协作
                  </Button>
                </div>
              </div>

              {/* 兼容性因子 */}
              <div className="mt-3 pt-3 border-t border-border/20">
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="secondary">
                    思维兼容: {agent.cognitionStyle.primaryThinkingMode}
                  </Badge>
                  <Badge variant="secondary">
                    专业领域: {agent.specialties.slice(0, 2).join(', ')}
                  </Badge>
                  <Badge variant="secondary">
                    协作偏好: {agent.collaborationPreference.collaborationDepth}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  if (userProfile?.creativeDNA && !isAssessing) {
    return (
      <div className="space-y-6">
        {renderDNAProfile(userProfile.creativeDNA)}

        <div className="flex justify-center">
          <Button onClick={onStartAssessment} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            重新评估
          </Button>
        </div>

        {renderAgentCompatibility()}
      </div>
    )
  }

  if (isCompleted && generatedDNA) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">创意DNA分析完成！</h2>
          <p className="text-muted-foreground">
            基于你的回答，我们生成了专属的创意档案
          </p>
        </motion.div>

        {renderDNAProfile(generatedDNA)}
        {renderAgentCompatibility()}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 bg-gradient-to-br from-primary/20 to-agent-500/20 rounded-2xl flex items-center justify-center mx-auto"
        >
          <Sparkles className="w-10 h-10 text-primary" />
        </motion.div>
        <h1 className="text-3xl font-bold">创意DNA评估</h1>
        <p className="text-muted-foreground">
          通过6个简单问题，发现你的创意特质并匹配最适合的AI协作伙伴
        </p>
      </div>

      {/* 进度指示器 */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>评估进度</span>
              <span>{currentQuestionIndex + 1} / {assessmentQuestions.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* 当前问题 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            问题 {currentQuestionIndex + 1}: {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={answers[currentQuestion.id] || ''}
            onValueChange={handleAnswerSelect}
          >
            {currentQuestion.options.map((option) => (
              <div key={option.value} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-secondary/20 transition-colors">
                <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                  <div className="font-medium mb-1">{option.label}</div>
                  <div className="text-sm text-muted-foreground">
                    {option.description}
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
            >
              上一题
            </Button>
            <Button
              onClick={handleNext}
              disabled={!answers[currentQuestion.id]}
              className="flex items-center gap-2"
            >
              {currentQuestionIndex === assessmentQuestions.length - 1 ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  完成评估
                </>
              ) : (
                <>
                  下一题
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}