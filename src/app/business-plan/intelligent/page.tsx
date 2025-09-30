'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { nanoid } from 'nanoid'

import { Layout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Brain,
  Lightbulb,
  Target,
  Search,
  Calendar,
  DollarSign,
  Users,
  AlertTriangle,
  TrendingUp,
  Zap,
  ChevronRight,
  Clock,
  CheckCircle,
  Loader2,
  Sparkles,
  Compass,
  Rocket,
  BarChart3,
  Settings
} from 'lucide-react'

import type {
  PracticalStageContext,
  PracticalStageOutput,
  PersonalizedRecommendations,
  IdeaCharacteristics
} from '@/types/business-plan'

interface IntelligentStageView {
  id: string
  name: string
  status: 'pending' | 'analyzing' | 'generating' | 'completed'
  progress: number
  estimatedTime: string
  deliverables: string[]
  aiProvider: string
  description: string
  output?: PracticalStageOutput
  adaptedRecommendations?: PersonalizedRecommendations
}

export default function IntelligentBusinessPlanPage() {
  // 基础状态
  const [ideaTitle, setIdeaTitle] = useState('')
  const [ideaDescription, setIdeaDescription] = useState('')
  const [userLocation, setUserLocation] = useState('北京')
  const [userBackground, setUserBackground] = useState('')

  // 智能分析状态
  const [ideaCharacteristics, setIdeaCharacteristics] = useState<IdeaCharacteristics | null>(null)
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState<PersonalizedRecommendations | null>(null)
  const [currentStage, setCurrentStage] = useState<string | null>(null)
  const [stages, setStages] = useState<IntelligentStageView[]>([])

  // 控制状态
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string>('')

  // 智能适配的5个阶段配置
  const intelligentStages: Omit<IntelligentStageView, 'status' | 'progress' | 'output'>[] = [
    {
      id: 'goal_analysis',
      name: '目标分析与澄清',
      estimatedTime: '8-10分钟',
      deliverables: ['清晰的目标层次结构', '可量化的成功指标', '目标实现的时间节点'],
      aiProvider: 'DeepSeek',
      description: '基于您的创意特征，明确短中长期目标体系和成功指标'
    },
    {
      id: 'basic_market_analysis',
      name: '基本盘需求与市场分析',
      estimatedTime: '12-15分钟',
      deliverables: ['基本盘圈子识别', '需求硬度分析', '个人优势匹配评估'],
      aiProvider: '阿里通义千问',
      description: '从身边朋友圈开始验证，分析需求硬度和个人优势匹配'
    },
    {
      id: 'research_method_guide',
      name: '4周调研方法指导',
      estimatedTime: '10-12分钟',
      deliverables: ['详细调研计划', '用户访谈指南', '竞品分析方法'],
      aiProvider: '智谱GLM',
      description: '个性化的调研渠道和线下活动推荐，确保高效验证'
    },
    {
      id: 'implementation_plan',
      name: '90天聚焦实施计划',
      estimatedTime: '15-20分钟',
      deliverables: ['AI技术栈推荐', '90天详细计划', '正反馈机制设计'],
      aiProvider: 'DeepSeek',
      description: '基于创意特征推荐最适合的AI技术栈和实施方案'
    },
    {
      id: 'business_model_profitability',
      name: '商业模式与盈利路径',
      estimatedTime: '12-15分钟',
      deliverables: ['商业模式画布', '收入模式设计', '竞争优势分析'],
      aiProvider: '阿里通义千问',
      description: '设计可持续的商业模式和清晰的盈利路径'
    }
  ]

  // 实时分析创意特征
  const analyzeIdeaCharacteristics = async () => {
    if (!ideaTitle.trim() || !ideaDescription.trim()) return

    setAnalyzing(true)
    setError(null)

    try {
      // 模拟调用创意分析引擎
      await new Promise(resolve => setTimeout(resolve, 2000))

      // 基于创意内容进行简单的特征分析
      const mockCharacteristics: IdeaCharacteristics = {
        category: detectCategory(ideaTitle + ' ' + ideaDescription),
        techIntensity: calculateTechIntensity(ideaDescription),
        targetAudience: identifyTargetAudience(ideaDescription),
        businessModel: suggestBusinessModel(ideaDescription),
        aiCapabilities: detectAICapabilities(ideaDescription),
        marketMaturity: '成长期',
        competitionLevel: '中等',
        regulationLevel: '中等',
        technicalComplexity: assessTechnicalComplexity(ideaDescription),
        fundingRequirement: '中等（5-20万）',
        teamRequirement: getTeamRequirements(ideaDescription)
      }

      setIdeaCharacteristics(mockCharacteristics)

      // 生成个性化推荐
      const mockRecommendations: PersonalizedRecommendations = {
        ideaCharacteristics: mockCharacteristics,
        techStackRecommendations: generateTechStackRecommendations(mockCharacteristics),
        researchChannels: generateResearchChannels(mockCharacteristics),
        offlineEvents: generateOfflineEvents(mockCharacteristics, userLocation),
        customizedTimeline: generateCustomizedTimeline(mockCharacteristics),
        budgetPlan: generateBudgetPlan(mockCharacteristics),
        teamRecommendations: generateTeamRecommendations(mockCharacteristics),
        riskAssessment: generateRiskAssessment(mockCharacteristics),
        successMetrics: generateSuccessMetrics(mockCharacteristics),
        nextStepActions: generateNextStepActions(mockCharacteristics)
      }

      setPersonalizedRecommendations(mockRecommendations)

      // 初始化智能化阶段
      const initialStages: IntelligentStageView[] = intelligentStages.map(stage => ({
        ...stage,
        status: 'pending' as const,
        progress: 0,
        adaptedRecommendations: mockRecommendations
      }))

      setStages(initialStages)

    } catch (err) {
      console.error('分析失败:', err)
      setError('创意分析失败，请稍后重试')
    } finally {
      setAnalyzing(false)
    }
  }

  // 当创意输入变化时，实时分析
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (ideaTitle.trim() && ideaDescription.trim()) {
        analyzeIdeaCharacteristics()
      }
    }, 1000) // 1秒防抖

    return () => clearTimeout(timeoutId)
  }, [ideaTitle, ideaDescription, userLocation])

  // 生成智能化商业计划
  const handleIntelligentGenerate = async () => {
    if (!ideaCharacteristics || !personalizedRecommendations) {
      setError('请先输入创意信息进行分析')
      return
    }

    setLoading(true)
    setError(null)
    const newSessionId = nanoid()
    setSessionId(newSessionId)

    try {
      // 逐阶段生成
      for (let i = 0; i < stages.length; i++) {
        const stage = stages[i]

        // 更新当前阶段状态
        setCurrentStage(stage.id)
        setStages(prev => prev.map(s =>
          s.id === stage.id
            ? { ...s, status: 'analyzing' as const, progress: 10 }
            : s
        ))

        // 模拟分析阶段
        await new Promise(resolve => setTimeout(resolve, 1000))

        setStages(prev => prev.map(s =>
          s.id === stage.id
            ? { ...s, status: 'generating' as const, progress: 50 }
            : s
        ))

        // 模拟生成阶段
        await new Promise(resolve => setTimeout(resolve, 2000))

        // 生成该阶段的输出
        const stageOutput = await generateStageOutput(stage, ideaCharacteristics, personalizedRecommendations)

        // 更新完成状态
        setStages(prev => prev.map(s =>
          s.id === stage.id
            ? {
                ...s,
                status: 'completed' as const,
                progress: 100,
                output: stageOutput
              }
            : s
        ))
      }

      setCurrentStage(null)

    } catch (err) {
      console.error('生成失败:', err)
      setError('智能生成失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="container py-10 space-y-8">
        {/* 头部介绍 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Brain className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              智能化商业计划生成
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            基于创意特征实时适配的5阶段商业计划框架，提供AI技术栈推荐、需求发现渠道、线下调研活动等个性化指导
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <Badge variant="secondary" className="text-sm">
              <Zap className="w-4 h-4 mr-1" />
              实时适配
            </Badge>
            <Badge variant="secondary" className="text-sm">
              <Target className="w-4 h-4 mr-1" />
              个性化推荐
            </Badge>
            <Badge variant="secondary" className="text-sm">
              <Rocket className="w-4 h-4 mr-1" />
              90天聚焦
            </Badge>
          </div>
        </motion.div>

        {/* 创意输入区域 */}
        <Card className="border-2 border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              创意信息输入
            </CardTitle>
            <CardDescription>
              输入您的创意，系统将实时分析特征并生成个性化推荐
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="idea-title">创意标题</Label>
                <Input
                  id="idea-title"
                  placeholder="例如：AI智能英语学习助手"
                  value={ideaTitle}
                  onChange={(e) => setIdeaTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-location">所在城市</Label>
                <Input
                  id="user-location"
                  placeholder="北京"
                  value={userLocation}
                  onChange={(e) => setUserLocation(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="idea-description">详细描述</Label>
              <Textarea
                id="idea-description"
                placeholder="描述您的创意要解决什么问题，面向什么用户，如何创造价值..."
                value={ideaDescription}
                onChange={(e) => setIdeaDescription(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-background">个人背景（可选）</Label>
              <Input
                id="user-background"
                placeholder="例如：技术背景、行业经验、可用资源等"
                value={userBackground}
                onChange={(e) => setUserBackground(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* 实时分析状态 */}
        <AnimatePresence>
          {analyzing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="py-6">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    <span className="text-sm text-blue-800">正在实时分析创意特征...</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 创意特征分析结果 */}
        <AnimatePresence>
          {ideaCharacteristics && !analyzing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="w-5 h-5" />
                    创意特征分析完成
                  </CardTitle>
                  <CardDescription className="text-green-700">
                    系统已识别您的创意特征，将据此生成个性化商业计划
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">行业</Badge>
                      <span className="text-sm font-medium">{ideaCharacteristics.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">技术复杂度</Badge>
                      <span className="text-sm font-medium">{ideaCharacteristics.technicalComplexity}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">资金需求</Badge>
                      <span className="text-sm font-medium">{ideaCharacteristics.fundingRequirement}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">竞争程度</Badge>
                      <span className="text-sm font-medium">{ideaCharacteristics.competitionLevel}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="text-sm font-medium mb-2">AI能力需求:</div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(ideaCharacteristics.aiCapabilities).map(([key, value]) =>
                        value && (
                          <Badge key={key} variant="secondary" className="text-xs">
                            {getAICapabilityLabel(key)}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 个性化推荐预览 */}
        <AnimatePresence>
          {personalizedRecommendations && !analyzing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Tabs defaultValue="tech-stack" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="tech-stack" className="text-xs">技术栈</TabsTrigger>
                  <TabsTrigger value="research" className="text-xs">调研渠道</TabsTrigger>
                  <TabsTrigger value="offline" className="text-xs">线下活动</TabsTrigger>
                  <TabsTrigger value="timeline" className="text-xs">时间计划</TabsTrigger>
                  <TabsTrigger value="budget" className="text-xs">预算</TabsTrigger>
                </TabsList>

                <TabsContent value="tech-stack">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-blue-600" />
                        AI技术栈推荐
                      </CardTitle>
                      <CardDescription>
                        基于您的创意特征推荐最适合的技术实现方案
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="border rounded-lg p-4 space-y-2">
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">入门级</Badge>
                          <div className="text-sm font-medium">
                            {personalizedRecommendations.techStackRecommendations.beginner.primary}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {personalizedRecommendations.techStackRecommendations.beginner.reason}
                          </div>
                          <div className="text-xs">
                            <strong>成本:</strong> {personalizedRecommendations.techStackRecommendations.beginner.cost}
                          </div>
                          <div className="text-xs">
                            <strong>时间:</strong> {personalizedRecommendations.techStackRecommendations.beginner.timeline}
                          </div>
                        </div>
                        <div className="border rounded-lg p-4 space-y-2">
                          <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">进阶级</Badge>
                          <div className="text-sm font-medium">
                            {personalizedRecommendations.techStackRecommendations.intermediate.primary}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {personalizedRecommendations.techStackRecommendations.intermediate.reason}
                          </div>
                          <div className="text-xs">
                            <strong>成本:</strong> {personalizedRecommendations.techStackRecommendations.intermediate.cost}
                          </div>
                          <div className="text-xs">
                            <strong>时间:</strong> {personalizedRecommendations.techStackRecommendations.intermediate.timeline}
                          </div>
                        </div>
                        <div className="border rounded-lg p-4 space-y-2">
                          <Badge variant="secondary" className="text-xs bg-red-100 text-red-800">专家级</Badge>
                          <div className="text-sm font-medium">
                            {personalizedRecommendations.techStackRecommendations.advanced.primary}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {personalizedRecommendations.techStackRecommendations.advanced.reason}
                          </div>
                          <div className="text-xs">
                            <strong>成本:</strong> {personalizedRecommendations.techStackRecommendations.advanced.cost}
                          </div>
                          <div className="text-xs">
                            <strong>时间:</strong> {personalizedRecommendations.techStackRecommendations.advanced.timeline}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="research">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Search className="w-5 h-5 text-purple-600" />
                        需求发现渠道
                      </CardTitle>
                      <CardDescription>
                        个性化的调研渠道推荐，确保高效验证用户需求
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-6 md:grid-cols-2">
                        <div>
                          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">线上</Badge>
                            数字化调研渠道
                          </h4>
                          <div className="space-y-2">
                            {personalizedRecommendations.researchChannels.online.map((channel, index) => (
                              <div key={index} className="text-sm p-2 bg-gray-50 rounded border-l-2 border-blue-200">
                                {channel}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">线下</Badge>
                            实地调研渠道
                          </h4>
                          <div className="space-y-2">
                            {personalizedRecommendations.researchChannels.offline.map((channel, index) => (
                              <div key={index} className="text-sm p-2 bg-gray-50 rounded border-l-2 border-green-200">
                                {channel}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="offline">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Compass className="w-5 h-5 text-orange-600" />
                        线下调研活动
                      </CardTitle>
                      <CardDescription>
                        基于您的创意和所在城市推荐的线下活动和调研机会
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {personalizedRecommendations.offlineEvents.nationalEvents.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">全国性活动</h4>
                            <div className="grid gap-3 md:grid-cols-2">
                              {personalizedRecommendations.offlineEvents.nationalEvents.map((event, index) => (
                                <div key={index} className="border rounded-lg p-3 space-y-2">
                                  <div className="text-sm font-medium">{event.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {event.time} · {event.location}
                                  </div>
                                  <div className="text-xs">成本: {event.cost}</div>
                                  <div className="text-xs">{event.value}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <h4 className="text-sm font-medium mb-2">本地活动（{userLocation}）</h4>
                          <div className="flex flex-wrap gap-2">
                            {personalizedRecommendations.offlineEvents.localEvents.map((event, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {event}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="timeline">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-green-600" />
                        90天聚焦计划
                      </CardTitle>
                      <CardDescription>
                        基于您的创意特征定制的3个月实施计划
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="text-xs">第1个月</Badge>
                            <span className="text-sm font-medium">
                              {personalizedRecommendations.customizedTimeline.month1.focus}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            {personalizedRecommendations.customizedTimeline.month1.milestones.map((milestone, index) => (
                              <div key={index}>· {milestone}</div>
                            ))}
                          </div>
                        </div>
                        <div className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="text-xs">第2个月</Badge>
                            <span className="text-sm font-medium">
                              {personalizedRecommendations.customizedTimeline.month2.focus}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            {personalizedRecommendations.customizedTimeline.month2.milestones.map((milestone, index) => (
                              <div key={index}>· {milestone}</div>
                            ))}
                          </div>
                        </div>
                        <div className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="text-xs">第3个月</Badge>
                            <span className="text-sm font-medium">
                              {personalizedRecommendations.customizedTimeline.month3.focus}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            {personalizedRecommendations.customizedTimeline.month3.milestones.map((milestone, index) => (
                              <div key={index}>· {milestone}</div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="budget">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-yellow-600" />
                        预算规划
                      </CardTitle>
                      <CardDescription>
                        基于技术复杂度和创意特征的预算分析
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <h4 className="text-sm font-medium mb-2">启动成本</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>技术开发</span>
                              <span className="font-medium">¥{personalizedRecommendations.budgetPlan.startupCosts.technology.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>市场推广</span>
                              <span className="font-medium">¥{personalizedRecommendations.budgetPlan.startupCosts.marketing.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>运营费用</span>
                              <span className="font-medium">¥{personalizedRecommendations.budgetPlan.startupCosts.operations.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2 font-semibold">
                              <span>总计</span>
                              <span>¥{personalizedRecommendations.budgetPlan.startupCosts.total.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-2">优化建议</h4>
                          <div className="space-y-2">
                            {personalizedRecommendations.budgetPlan.costOptimization.map((tip, index) => (
                              <div key={index} className="text-xs p-2 bg-yellow-50 rounded border-l-2 border-yellow-200">
                                {tip}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 开始生成按钮 */}
        <AnimatePresence>
          {personalizedRecommendations && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
                <CardContent className="py-6">
                  <div className="text-center space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800">
                      开始生成智能化商业计划
                    </h3>
                    <p className="text-muted-foreground">
                      系统已完成创意分析，将按照5个阶段逐步生成个性化的商业计划书
                    </p>
                    <Button
                      onClick={handleIntelligentGenerate}
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      开始智能生成
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 错误提示 */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 生成阶段展示 */}
        <AnimatePresence>
          {stages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    智能化生成进度
                    {sessionId && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        会话: {sessionId.slice(0, 8)}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    基于创意特征的个性化5阶段生成流程
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stages.map((stage, index) => (
                      <motion.div
                        key={stage.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`border rounded-lg p-4 ${
                          stage.status === 'completed' ? 'bg-green-50 border-green-200' :
                          stage.status === 'generating' || stage.status === 'analyzing' ? 'bg-blue-50 border-blue-200' :
                          'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                              stage.status === 'completed' ? 'bg-green-500 text-white' :
                              stage.status === 'generating' || stage.status === 'analyzing' ? 'bg-blue-500 text-white' :
                              'bg-gray-300 text-gray-600'
                            }`}>
                              {stage.status === 'completed' ?
                                <CheckCircle className="w-4 h-4" /> :
                                stage.status === 'generating' || stage.status === 'analyzing' ?
                                <Loader2 className="w-4 h-4 animate-spin" /> :
                                index + 1
                              }
                            </div>
                            <div>
                              <h4 className="font-medium">{stage.name}</h4>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Badge variant="outline" className="text-xs">{stage.aiProvider}</Badge>
                                <Clock className="w-3 h-3" />
                                <span>{stage.estimatedTime}</span>
                              </div>
                            </div>
                          </div>
                          <Badge variant={
                            stage.status === 'completed' ? 'default' :
                            stage.status === 'generating' ? 'secondary' :
                            stage.status === 'analyzing' ? 'secondary' :
                            'outline'
                          }>
                            {stage.status === 'completed' ? '已完成' :
                             stage.status === 'generating' ? '生成中' :
                             stage.status === 'analyzing' ? '分析中' :
                             '等待中'}
                          </Badge>
                        </div>

                        <Progress value={stage.progress} className="mb-3" />

                        <p className="text-sm text-muted-foreground mb-3">
                          {stage.description}
                        </p>

                        <div className="flex flex-wrap gap-1 mb-3">
                          {stage.deliverables.map((deliverable, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {deliverable}
                            </Badge>
                          ))}
                        </div>

                        {stage.output && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="border-t pt-3 mt-3"
                          >
                            <h5 className="text-sm font-medium mb-2">{stage.output.title}</h5>
                            <p className="text-xs text-muted-foreground mb-2">{stage.output.summary}</p>
                            <div className="space-y-2">
                              {stage.output.keyInsights.map((insight, idx) => (
                                <div key={idx} className="text-xs p-2 bg-white rounded border-l-2 border-blue-300">
                                  {insight}
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 完成状态 */}
        <AnimatePresence>
          {stages.length > 0 && stages.every(s => s.status === 'completed') && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="border-2 border-green-200 bg-green-50">
                <CardContent className="py-6 text-center">
                  <div className="space-y-4">
                    <div className="flex items-center justify-center">
                      <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-green-800">
                      智能化商业计划生成完成！
                    </h3>
                    <p className="text-green-700">
                      您的个性化商业计划书已生成完成，包含了基于创意特征的专业建议和实施方案
                    </p>
                    <div className="flex justify-center gap-4">
                      <Button variant="default" className="bg-green-600 hover:bg-green-700">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        查看完整计划
                      </Button>
                      <Button variant="outline">
                        <Compass className="w-4 h-4 mr-2" />
                        下载报告
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  )
}

// 辅助函数
function detectCategory(text: string): string {
  const lowerText = text.toLowerCase()
  if (lowerText.includes('教育') || lowerText.includes('学习') || lowerText.includes('培训')) return '教育'
  if (lowerText.includes('电商') || lowerText.includes('购物') || lowerText.includes('商城')) return '电商'
  if (lowerText.includes('金融') || lowerText.includes('投资') || lowerText.includes('理财')) return '金融'
  if (lowerText.includes('医疗') || lowerText.includes('健康') || lowerText.includes('诊断')) return '医疗'
  if (lowerText.includes('游戏') || lowerText.includes('娱乐') || lowerText.includes('视频')) return '娱乐'
  return '通用'
}

function calculateTechIntensity(description: string): number {
  let intensity = 0
  const aiKeywords = ['ai', '人工智能', '机器学习', '深度学习', '神经网络', 'gpt', '大模型']
  aiKeywords.forEach(keyword => {
    if (description.toLowerCase().includes(keyword)) intensity += 2
  })
  return Math.min(intensity, 10)
}

function identifyTargetAudience(description: string): string[] {
  const audiences = []
  if (description.includes('学生')) audiences.push('学生')
  if (description.includes('老师') || description.includes('教师')) audiences.push('教师')
  if (description.includes('家长')) audiences.push('家长')
  if (description.includes('企业') || description.includes('公司')) audiences.push('企业用户')
  if (description.includes('个人') || description.includes('用户')) audiences.push('个人用户')
  return audiences.length > 0 ? audiences : ['普通用户']
}

function suggestBusinessModel(description: string): string {
  if (description.includes('订阅') || description.includes('月费')) return 'SaaS订阅模式'
  if (description.includes('电商') || description.includes('商城')) return '电商平台模式'
  if (description.includes('广告')) return '广告收入模式'
  return '免费增值模式'
}

function detectAICapabilities(description: string) {
  const capabilities = {
    nlp: false,
    cv: false,
    ml: false,
    recommendation: false,
    generation: false,
    automation: false
  }

  const lowerDesc = description.toLowerCase()
  if (lowerDesc.includes('对话') || lowerDesc.includes('聊天') || lowerDesc.includes('文本')) capabilities.nlp = true
  if (lowerDesc.includes('图像') || lowerDesc.includes('视觉') || lowerDesc.includes('识别')) capabilities.cv = true
  if (lowerDesc.includes('推荐') || lowerDesc.includes('个性化')) capabilities.recommendation = true
  if (lowerDesc.includes('生成') || lowerDesc.includes('创作')) capabilities.generation = true
  if (lowerDesc.includes('自动') || lowerDesc.includes('智能')) capabilities.automation = true
  if (lowerDesc.includes('学习') || lowerDesc.includes('分析')) capabilities.ml = true

  return capabilities
}

function assessTechnicalComplexity(description: string): string {
  const complexKeywords = ['深度学习', '神经网络', '大模型', 'ai', '机器学习']
  const simpleKeywords = ['简单', '基础', '入门']

  let complexity = 0
  complexKeywords.forEach(keyword => {
    if (description.toLowerCase().includes(keyword)) complexity += 1
  })
  simpleKeywords.forEach(keyword => {
    if (description.toLowerCase().includes(keyword)) complexity -= 1
  })

  if (complexity >= 3) return '高'
  if (complexity >= 1) return '中'
  return '低'
}

function getTeamRequirements(description: string): string[] {
  const requirements = ['产品经理', '前端开发', '后端开发']
  if (description.includes('ai') || description.includes('智能')) {
    requirements.push('AI工程师')
  }
  if (description.includes('设计') || description.includes('界面')) {
    requirements.push('UI/UX设计师')
  }
  return requirements
}

function getAICapabilityLabel(key: string): string {
  const labels = {
    nlp: '自然语言处理',
    cv: '计算机视觉',
    ml: '机器学习',
    recommendation: '推荐系统',
    generation: '内容生成',
    automation: '自动化'
  }
  return labels[key as keyof typeof labels] || key
}

// 生成模拟数据的函数
function generateTechStackRecommendations(characteristics: IdeaCharacteristics): any {
  return {
    beginner: {
      primary: 'OpenAI API + 基础框架',
      reason: '快速上手，成本可控',
      cost: '2000-4000元/月',
      timeline: '30天',
      examples: ['基础AI应用']
    },
    intermediate: {
      primary: 'LangChain + 本土AI服务',
      reason: '更好的控制和定制',
      cost: '4000-8000元/月',
      timeline: '60天',
      examples: ['定制化AI应用']
    },
    advanced: {
      primary: '自研AI架构',
      reason: '完全定制，技术壁垒',
      cost: '10000+元/月',
      timeline: '90天+',
      examples: ['行业专用AI系统']
    }
  }
}

function generateResearchChannels(characteristics: IdeaCharacteristics): any {
  return {
    online: ['知乎相关话题', '专业论坛', '用户社群', '竞品分析'],
    offline: ['行业会议', '用户访谈', '实地调研', '专家咨询'],
    keywords: ['用户需求', '市场痛点', '解决方案'],
    tools: ['问卷调研', '用户访谈', '数据分析']
  }
}

function generateOfflineEvents(characteristics: IdeaCharacteristics, location: string): any {
  return {
    category: characteristics.category,
    nationalEvents: [
      {
        name: '中国AI大会',
        time: '每年11月',
        location: '北京',
        cost: '1000-3000元',
        value: 'AI技术趋势，行业应用'
      }
    ],
    localEvents: [`${location}创业园区活动`, `${location}科技交流会`],
    industryEvents: [`${characteristics.category}行业大会`],
    customEventSuggestions: []
  }
}

function generateCustomizedTimeline(characteristics: IdeaCharacteristics): any {
  return {
    month1: {
      focus: 'MVP开发与初步验证',
      milestones: [
        '第1周：技术架构确定',
        '第2周：核心功能开发',
        '第3周：用户测试',
        '第4周：反馈收集'
      ]
    },
    month2: {
      focus: '扩大验证与产品优化',
      milestones: [
        '第5周：用户群体扩展',
        '第6周：产品功能优化',
        '第7周：市场推广',
        '第8周：数据分析'
      ]
    },
    month3: {
      focus: '商业化准备',
      milestones: [
        '第9周：商业模式验证',
        '第10周：付费用户测试',
        '第11周：扩展计划',
        '第12周：融资准备'
      ]
    }
  }
}

function generateBudgetPlan(characteristics: IdeaCharacteristics): any {
  return {
    startupCosts: {
      technology: 50000,
      marketing: 20000,
      operations: 15000,
      legal: 5000,
      total: 90000
    },
    monthlyCosts: {
      technology: 8000,
      operations: 5000,
      marketing: 3000,
      total: 16000
    },
    costOptimization: [
      '使用开源技术降低成本',
      '分阶段招聘控制人力成本',
      '选择性价比高的云服务'
    ]
  }
}

function generateTeamRecommendations(characteristics: IdeaCharacteristics): any {
  return {
    coreTeam: characteristics.teamRequirement,
    phaseBasedHiring: [],
    outsourcingOptions: [],
    advisorTypes: ['技术顾问', '商业顾问'],
    teamBuildingStrategy: []
  }
}

function generateRiskAssessment(characteristics: IdeaCharacteristics): any {
  return {
    riskList: [
      {
        type: '技术风险',
        level: '中',
        description: 'AI技术实现可能遇到困难',
        mitigation: ['技术预研', '专家咨询']
      }
    ],
    overallRiskLevel: '中等',
    riskMonitoring: { indicators: [], frequency: '', responsibleParty: [] },
    contingencyPlans: []
  }
}

function generateSuccessMetrics(characteristics: IdeaCharacteristics): any {
  return {
    userMetrics: ['用户注册数', '活跃用户数', '用户满意度'],
    businessMetrics: ['月收入', '客户获取成本', '用户生命周期价值'],
    technicalMetrics: ['系统稳定性', '响应时间', 'API成功率'],
    timelineMilestones: ['30天MVP', '60天用户验证', '90天商业验证'],
    kpiTargets: []
  }
}

function generateNextStepActions(characteristics: IdeaCharacteristics): any {
  return {
    immediate: ['完成技术选型', '制定调研计划', '设计MVP'],
    week1: ['开始技术开发', '启动用户调研'],
    week2: ['完善产品功能', '扩大用户测试'],
    month1: ['完成MVP验证', '制定商业计划'],
    actionPriority: [],
    resourceRequirements: []
  }
}

async function generateStageOutput(
  stage: IntelligentStageView,
  characteristics: IdeaCharacteristics,
  recommendations: PersonalizedRecommendations
): Promise<PracticalStageOutput> {
  // 模拟生成每个阶段的具体输出
  return {
    title: stage.name,
    summary: `基于您的${characteristics.category}创意特征生成的${stage.name}`,
    sections: [
      {
        title: '核心建议',
        content: `针对${characteristics.category}领域的个性化建议内容`,
        actionItems: ['行动项目1', '行动项目2'],
        timeframe: stage.estimatedTime
      }
    ],
    keyInsights: [
      `您的创意属于${characteristics.category}领域，技术复杂度为${characteristics.technicalComplexity}`,
      `推荐采用${recommendations.techStackRecommendations.beginner.primary}技术方案`,
      `预计启动资金需求：${characteristics.fundingRequirement}`
    ],
    nextSteps: [
      '立即开始技术栈调研',
      '制定详细的用户调研计划',
      '确定第一批种子用户'
    ],
    confidenceBooster: `基于智能分析，您的创意具备良好的商业潜力！`
  }
}