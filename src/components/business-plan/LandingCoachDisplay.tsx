'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Brain,
  Target,
  Rocket,
  TrendingUp,
  Users,
  DollarSign,
  Settings,
  Download,
  Share2,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  FileText,
  Lightbulb,
  Zap,
  BarChart3,
  Shield,
  Star,
  AlertTriangle,
  TrendingDown,
  Eye,
  Flame,
  Compass
} from 'lucide-react'

import { LandingCoachGuide } from '@/lib/utils/transformReportToGuide'

interface LandingCoachDisplayProps {
  guide: LandingCoachGuide
  isLoading?: boolean
  onDownload?: (format: 'pdf' | 'docx' | 'markdown') => void
  onShare?: () => void
}

export default function LandingCoachDisplay({
  guide,
  isLoading = false,
  onDownload,
  onShare
}: LandingCoachDisplayProps) {
  const [activeTab, setActiveTab] = useState('situation')
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  // 获取置信度颜色
  const getConfidenceColor = (level: number) => {
    if (level >= 80) return 'text-green-600 bg-green-50 border-green-200'
    if (level >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  // 格式化阅读时间
  const formatReadTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}分钟`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}小时${mins > 0 ? `${mins}分钟` : ''}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">正在生成落地指南...</h3>
            <p className="text-muted-foreground">AI教练正在为您制定详细的实施方案</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* 页面头部 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
            <Brain className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">AI 创意落地教练</span>
          </div>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            {guide.metadata.ideaTitle}
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            专业的创意落地指导方案
          </p>

          {/* 元数据信息 */}
          <div className="flex justify-center items-center gap-6 mb-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>预计阅读：{formatReadTime(guide.metadata.estimatedReadTime)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="w-4 h-4" />
              <span>实施周期：{guide.metadata.implementationTimeframe}</span>
            </div>
            <Badge className={`${getConfidenceColor(guide.metadata.confidenceLevel)} border`}>
              可行性：{guide.metadata.confidenceLevel}%
            </Badge>
          </div>

          {/* AI犀利点评区域 */}
          {guide.aiInsights && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-red-50 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                      <Eye className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-orange-900">AI犀利点评</h3>
                      <p className="text-sm text-orange-700">基于{guide.metadata.source === 'marketplace' ? `竞价专家${guide.metadata.winner}` : '调研数据'}的专业洞察</p>
                    </div>
                    <div className="ml-auto">
                      <Badge className={`${guide.aiInsights.overallAssessment.score >= 8 ? 'bg-green-500' : guide.aiInsights.overallAssessment.score >= 6 ? 'bg-yellow-500' : 'bg-red-500'} text-white`}>
                        {guide.aiInsights.overallAssessment.score}/10分
                      </Badge>
                    </div>
                  </div>

                  <div className="bg-white/60 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Flame className="w-6 h-6 text-orange-600 mt-1 flex-shrink-0" />
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-orange-900">{guide.aiInsights.overallAssessment.level}</span>
                          <div className="flex">
                            {[1,2,3,4,5].map((star) => (
                              <Star key={star} className={`w-4 h-4 ${star <= Math.round(guide.aiInsights.overallAssessment.score/2) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-orange-800 text-base leading-relaxed font-medium">
                          {guide.aiInsights.overallAssessment.summary}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* 核心优势 */}
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <h4 className="font-semibold text-green-900">核心优势</h4>
                      </div>
                      <ul className="space-y-2">
                        {guide.aiInsights.overallAssessment.keyStrengths.map((strength, index) => (
                          <li key={index} className="text-sm text-green-800 flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* 关键挑战 */}
                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <h4 className="font-semibold text-red-900">关键挑战</h4>
                      </div>
                      <ul className="space-y-2">
                        {guide.aiInsights.overallAssessment.criticalChallenges.map((challenge, index) => (
                          <li key={index} className="text-sm text-red-800 flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                            {challenge}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* 长期坚持建议 */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-blue-900">长期坚持策略</h4>
                    </div>
                    <p className="text-sm text-blue-800 mb-3">{guide.aiInsights.sustainabilityAnalysis.longTermViability}</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-blue-900 mb-2">成功关键因素</h5>
                        <ul className="space-y-1">
                          {guide.aiInsights.sustainabilityAnalysis.persistenceFactors.map((factor, index) => (
                            <li key={index} className="text-xs text-blue-700 flex items-start gap-2">
                              <CheckCircle2 className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                              {factor}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium text-blue-900 mb-2">风险缓解</h5>
                        <ul className="space-y-1">
                          {guide.aiInsights.sustainabilityAnalysis.riskMitigation.map((risk, index) => (
                            <li key={index} className="text-xs text-blue-700 flex items-start gap-2">
                              <Shield className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                              {risk}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* 阶段预警 */}
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="w-5 h-5 text-purple-600" />
                      <h4 className="font-semibold text-purple-900">阶段预警指标</h4>
                    </div>
                    <div className="space-y-3">
                      {guide.aiInsights.stageAlerts.map((alert, index) => (
                        <div key={index} className="border border-purple-200 rounded-lg p-3 bg-white/60">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-purple-900">{alert.stage}</h5>
                            <Badge variant="outline" className="text-xs text-purple-700">{alert.timeline}</Badge>
                          </div>
                          <div className="grid md:grid-cols-2 gap-3 text-xs">
                            <div>
                              <h6 className="font-medium text-green-700 mb-1">关键里程碑</h6>
                              <ul className="space-y-1">
                                {alert.criticalMilestones.map((milestone, idx) => (
                                  <li key={idx} className="text-green-600 flex items-start gap-1">
                                    <Target className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                    {milestone}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h6 className="font-medium text-red-700 mb-1">预警信号</h6>
                              <ul className="space-y-1">
                                {alert.warningSignals.map((signal, idx) => (
                                  <li key={idx} className="text-red-600 flex items-start gap-1">
                                    <TrendingDown className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                    {signal}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 快速导航 */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Compass className="w-5 h-5 text-gray-600" />
                      <h4 className="font-semibold text-gray-900">快速导航到详细内容</h4>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab('situation')}
                        className="text-xs h-8"
                      >
                        <BarChart3 className="w-3 h-3 mr-1" />
                        现状分析
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab('mvp')}
                        className="text-xs h-8"
                      >
                        <Rocket className="w-3 h-3 mr-1" />
                        MVP规划
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab('business')}
                        className="text-xs h-8"
                      >
                        <TrendingUp className="w-3 h-3 mr-1" />
                        商业落地
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* 操作按钮 */}
          <div className="flex justify-center gap-4">
            <Button
              onClick={() => onDownload?.('pdf')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Download className="w-4 h-4 mr-2" />
              下载指南
            </Button>
            <Button variant="outline" onClick={onShare}>
              <Share2 className="w-4 h-4 mr-2" />
              分享方案
            </Button>
          </div>
        </motion.div>

        {/* 主要内容区 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="situation" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              现状认知
            </TabsTrigger>
            <TabsTrigger value="mvp" className="flex items-center gap-2">
              <Rocket className="w-4 h-4" />
              MVP定义
            </TabsTrigger>
            <TabsTrigger value="business" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              商业落地
            </TabsTrigger>
          </TabsList>

          {/* 第一段：现状认知与方向确认 */}
          <TabsContent value="situation" className="space-y-6">
            <motion.div
              key="situation"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-2xl">
                          <BarChart3 className="w-6 h-6 text-blue-600" />
                          {guide.currentSituation.title}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          深入了解您的创意在当前市场环境中的定位和机会
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* 核心洞察 */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-yellow-500" />
                        核心洞察
                      </h3>
                      <p className="text-muted-foreground mb-4">{guide.currentSituation.summary}</p>
                      <div className="grid gap-2">
                        {guide.currentSituation.keyInsights.map((insight, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg"
                          >
                            <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{insight}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* 市场现实 */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                        市场现实分析
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <Card className="border-green-200 bg-green-50/50">
                          <CardContent className="p-4">
                            <h4 className="font-medium mb-2">市场规模</h4>
                            <p className="text-sm text-muted-foreground">
                              {guide.currentSituation.marketReality.marketSize}
                            </p>
                          </CardContent>
                        </Card>
                        <Card className="border-orange-200 bg-orange-50/50">
                          <CardContent className="p-4">
                            <h4 className="font-medium mb-2">竞争态势</h4>
                            <p className="text-sm text-muted-foreground">
                              {guide.currentSituation.marketReality.competition}
                            </p>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mt-4">
                        <Card className="border-blue-200 bg-blue-50/50">
                          <CardContent className="p-4">
                            <h4 className="font-medium mb-2 text-blue-700">市场机会</h4>
                            <ul className="space-y-1">
                              {guide.currentSituation.marketReality.opportunities.map((opp, index) => (
                                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <ArrowRight className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                                  {opp}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                        <Card className="border-red-200 bg-red-50/50">
                          <CardContent className="p-4">
                            <h4 className="font-medium mb-2 text-red-700">主要挑战</h4>
                            <ul className="space-y-1">
                              {guide.currentSituation.marketReality.challenges.map((challenge, index) => (
                                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <AlertCircle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                                  {challenge}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    <Separator />

                    {/* 用户需求分析 */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-500" />
                        用户需求分析
                      </h3>
                      <Card className="border-purple-200 bg-purple-50/50">
                        <CardContent className="p-4">
                          <h4 className="font-medium mb-2">目标用户群体</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            {guide.currentSituation.userNeeds.targetUsers}
                          </p>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <h5 className="font-medium text-red-700 mb-2">核心痛点</h5>
                              <ul className="space-y-1">
                                {guide.currentSituation.userNeeds.painPoints.map((pain, index) => (
                                  <li key={index} className="text-sm text-muted-foreground">
                                    • {pain}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h5 className="font-medium text-green-700 mb-2">解决方案</h5>
                              <ul className="space-y-1">
                                {guide.currentSituation.userNeeds.solutions.map((solution, index) => (
                                  <li key={index} className="text-sm text-muted-foreground">
                                    • {solution}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* 行动项目 */}
                    <Alert>
                      <Target className="w-4 h-4" />
                      <AlertDescription>
                        <div className="font-medium mb-2">立即行动项目</div>
                        <ul className="space-y-1">
                          {guide.currentSituation.actionItems.map((item, index) => (
                            <li key={index} className="text-sm">
                              {index + 1}. {item}
                            </li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* 第二段：MVP产品定义与验证计划 */}
            <TabsContent value="mvp" className="space-y-6">
              <motion.div
                key="mvp"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Rocket className="w-6 h-6 text-orange-600" />
                      {guide.mvpDefinition.title}
                    </CardTitle>
                    <CardDescription>
                      明确您的最小可行产品定义，制定详细的开发和验证计划
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* 产品概念 */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        产品概念定义
                      </h3>
                      <div className="grid gap-4">
                        <Card className="border-yellow-200 bg-yellow-50/50">
                          <CardContent className="p-4">
                            <h4 className="font-medium mb-2">独特价值主张</h4>
                            <p className="text-sm text-muted-foreground">
                              {guide.mvpDefinition.productConcept.uniqueValue}
                            </p>
                          </CardContent>
                        </Card>
                        <Card className="border-green-200 bg-green-50/50">
                          <CardContent className="p-4">
                            <h4 className="font-medium mb-2">最小可行范围</h4>
                            <p className="text-sm text-muted-foreground">
                              {guide.mvpDefinition.productConcept.minimumScope}
                            </p>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="mt-4">
                        <h4 className="font-medium mb-2">核心功能清单</h4>
                        <div className="grid gap-2">
                          {guide.mvpDefinition.productConcept.coreFeatures.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                              <span className="text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* 开发计划 */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-blue-500" />
                        开发计划
                      </h3>
                      <div className="space-y-4">
                        {guide.mvpDefinition.developmentPlan.phases.map((phase, index) => (
                          <Card key={index} className="border-blue-200 bg-blue-50/50">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium">{phase.name}</h4>
                                <Badge variant="outline">{phase.duration}</Badge>
                              </div>
                              <div className="grid md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <h5 className="font-medium mb-1">交付物</h5>
                                  <ul className="space-y-1 text-muted-foreground">
                                    {phase.deliverables.map((deliverable, idx) => (
                                      <li key={idx}>• {deliverable}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <h5 className="font-medium mb-1">所需资源</h5>
                                  <ul className="space-y-1 text-muted-foreground">
                                    {phase.resources.map((resource, idx) => (
                                      <li key={idx}>• {resource}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mt-4">
                        <Card className="border-purple-200 bg-purple-50/50">
                          <CardContent className="p-4">
                            <h4 className="font-medium mb-2">技术栈</h4>
                            <div className="flex flex-wrap gap-2">
                              {guide.mvpDefinition.developmentPlan.techStack.map((tech, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="border-green-200 bg-green-50/50">
                          <CardContent className="p-4">
                            <h4 className="font-medium mb-2">预估成本</h4>
                            <p className="text-sm text-muted-foreground">
                              {guide.mvpDefinition.developmentPlan.estimatedCost}
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    <Separator />

                    {/* 验证策略 */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-red-500" />
                        验证策略
                      </h3>
                      <Card className="border-red-200 bg-red-50/50">
                        <CardContent className="p-4">
                          <div className="mb-4">
                            <h4 className="font-medium mb-2">验证时间线</h4>
                            <p className="text-sm text-muted-foreground">
                              {guide.mvpDefinition.validationStrategy.timeline}
                            </p>
                          </div>

                          <div className="grid md:grid-cols-3 gap-4">
                            <div>
                              <h5 className="font-medium mb-2">核心假设</h5>
                              <ul className="space-y-1 text-sm text-muted-foreground">
                                {guide.mvpDefinition.validationStrategy.hypotheses.map((hyp, index) => (
                                  <li key={index}>• {hyp}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h5 className="font-medium mb-2">验证实验</h5>
                              <ul className="space-y-1 text-sm text-muted-foreground">
                                {guide.mvpDefinition.validationStrategy.experiments.map((exp, index) => (
                                  <li key={index}>• {exp}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h5 className="font-medium mb-2">成功指标</h5>
                              <ul className="space-y-1 text-sm text-muted-foreground">
                                {guide.mvpDefinition.validationStrategy.successMetrics.map((metric, index) => (
                                  <li key={index}>• {metric}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* 行动项目 */}
                    <Alert>
                      <Target className="w-4 h-4" />
                      <AlertDescription>
                        <div className="font-medium mb-2">立即行动项目</div>
                        <ul className="space-y-1">
                          {guide.mvpDefinition.actionItems.map((item, index) => (
                            <li key={index} className="text-sm">
                              {index + 1}. {item}
                            </li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* 第三段：商业化落地与运营策略 */}
            <TabsContent value="business" className="space-y-6">
              <motion.div
                key="business"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                      {guide.businessExecution.title}
                    </CardTitle>
                    <CardDescription>
                      制定可执行的商业化策略，确保创意成功转化为可盈利的业务
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* 商业模式 */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-500" />
                        商业模式设计
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <Card className="border-green-200 bg-green-50/50">
                          <CardContent className="p-4">
                            <h4 className="font-medium mb-2">定价策略</h4>
                            <p className="text-sm text-muted-foreground">
                              {guide.businessExecution.businessModel.pricingStrategy}
                            </p>
                          </CardContent>
                        </Card>
                        <Card className="border-blue-200 bg-blue-50/50">
                          <CardContent className="p-4">
                            <h4 className="font-medium mb-2">扩展性</h4>
                            <p className="text-sm text-muted-foreground">
                              {guide.businessExecution.businessModel.scalability}
                            </p>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mt-4">
                        <Card className="border-yellow-200 bg-yellow-50/50">
                          <CardContent className="p-4">
                            <h4 className="font-medium mb-2">收入来源</h4>
                            <ul className="space-y-1">
                              {guide.businessExecution.businessModel.revenueStreams.map((stream, index) => (
                                <li key={index} className="text-sm text-muted-foreground">
                                  • {stream}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                        <Card className="border-red-200 bg-red-50/50">
                          <CardContent className="p-4">
                            <h4 className="font-medium mb-2">成本结构</h4>
                            <ul className="space-y-1">
                              {guide.businessExecution.businessModel.costStructure.map((cost, index) => (
                                <li key={index} className="text-sm text-muted-foreground">
                                  • {cost}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    <Separator />

                    {/* 启动策略 */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <Rocket className="w-5 h-5 text-orange-500" />
                        启动策略
                      </h3>
                      <div className="space-y-4">
                        {guide.businessExecution.launchStrategy.phases.map((phase, index) => (
                          <Card key={index} className="border-orange-200 bg-orange-50/50">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium">{phase.name}</h4>
                                <Badge variant="outline">{phase.timeline}</Badge>
                              </div>
                              <div className="grid md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <h5 className="font-medium mb-1">阶段目标</h5>
                                  <ul className="space-y-1 text-muted-foreground">
                                    {phase.goals.map((goal, idx) => (
                                      <li key={idx}>• {goal}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <h5 className="font-medium mb-1">执行策略</h5>
                                  <ul className="space-y-1 text-muted-foreground">
                                    {phase.tactics.map((tactic, idx) => (
                                      <li key={idx}>• {tactic}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mt-4">
                        <Card className="border-purple-200 bg-purple-50/50">
                          <CardContent className="p-4">
                            <h4 className="font-medium mb-2">营销渠道</h4>
                            <ul className="space-y-1">
                              {guide.businessExecution.launchStrategy.marketingChannels.map((channel, index) => (
                                <li key={index} className="text-sm text-muted-foreground">
                                  • {channel}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                        <Card className="border-indigo-200 bg-indigo-50/50">
                          <CardContent className="p-4">
                            <h4 className="font-medium mb-2">预算分配</h4>
                            <ul className="space-y-1">
                              {guide.businessExecution.launchStrategy.budgetAllocation.map((budget, index) => (
                                <li key={index} className="text-sm text-muted-foreground">
                                  • {budget}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    <Separator />

                    {/* 运营规划 */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-gray-500" />
                        运营规划
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <Card className="border-gray-200 bg-gray-50/50">
                          <CardContent className="p-4">
                            <h4 className="font-medium mb-2">团队结构</h4>
                            <ul className="space-y-1">
                              {guide.businessExecution.operationalPlan.teamStructure.map((role, index) => (
                                <li key={index} className="text-sm text-muted-foreground">
                                  • {role}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                        <Card className="border-gray-200 bg-gray-50/50">
                          <CardContent className="p-4">
                            <h4 className="font-medium mb-2">核心流程</h4>
                            <ul className="space-y-1">
                              {guide.businessExecution.operationalPlan.processes.map((process, index) => (
                                <li key={index} className="text-sm text-muted-foreground">
                                  • {process}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                        <Card className="border-gray-200 bg-gray-50/50">
                          <CardContent className="p-4">
                            <h4 className="font-medium mb-2">基础设施</h4>
                            <ul className="space-y-1">
                              {guide.businessExecution.operationalPlan.infrastructure.map((infra, index) => (
                                <li key={index} className="text-sm text-muted-foreground">
                                  • {infra}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                        <Card className="border-gray-200 bg-gray-50/50">
                          <CardContent className="p-4">
                            <h4 className="font-medium mb-2">风险管理</h4>
                            <ul className="space-y-1">
                              {guide.businessExecution.operationalPlan.riskManagement.map((risk, index) => (
                                <li key={index} className="text-sm text-muted-foreground">
                                  • {risk}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    {/* 行动项目 */}
                    <Alert>
                      <Target className="w-4 h-4" />
                      <AlertDescription>
                        <div className="font-medium mb-2">立即行动项目</div>
                        <ul className="space-y-1">
                          {guide.businessExecution.actionItems.map((item, index) => (
                            <li key={index} className="text-sm">
                              {index + 1}. {item}
                            </li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
        </Tabs>

        {/* 总结卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">🎯 总结与下一步</h3>
                <p className="mb-4 opacity-90">
                  基于当前分析，您的创意「{guide.metadata.ideaTitle}」具有
                  <strong className="text-yellow-300"> {guide.metadata.confidenceLevel}% </strong>
                  的市场可行性。
                </p>
                <p className="text-sm opacity-80">
                  建议按照三个阶段循序渐进：现状认知 → MVP开发 → 商业化落地
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}