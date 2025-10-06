"use client"

import React from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Brain,
  BarChart3,
  Rocket,
  TrendingUp,
  Compass,
  Loader2,
  Download,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ClipboardList
} from "lucide-react"

import type { LandingCoachGuide } from "@/lib/utils/transformReportToGuide"

interface LandingCoachDisplayProps {
  guide: LandingCoachGuide
  isLoading?: boolean
  onDownload?: (format: "pdf" | "docx" | "markdown") => void
  onShare?: () => void
}

const metaItem = (label: string, value: React.ReactNode) => (
  <div className="flex items-center gap-2 text-sm text-muted-foreground">
    <span className="font-medium text-foreground/80">{label}</span>
    <span>{value}</span>
  </div>
)

const bulletList = (items: string[] | undefined) => {
  if (!items || items.length === 0) return null
  return (
    <ul className="space-y-2">
      {items.map((item, idx) => (
        <li key={idx} className="flex gap-2 text-sm text-muted-foreground">
          <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

const infoBlock = (title: string, description?: string | null, list?: string[]) => (
  <div className="space-y-3 rounded-lg border bg-background p-4">
    <h4 className="text-base font-semibold">{title}</h4>
    {description && <p className="text-sm text-muted-foreground">{description}</p>}
    {bulletList(list)}
  </div>
)

export default function LandingCoachDisplay({
  guide,
  isLoading = false,
  onDownload,
  onShare
}: LandingCoachDisplayProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-80 text-center">
          <CardContent className="space-y-4 p-8">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">正在生成落地指南...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const executionEnabled = Boolean(guide.executionPlan)

  return (
    <div className="space-y-8">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4 rounded-xl border bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-primary/10 p-3 text-primary">
            <Brain className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">{guide.metadata.ideaTitle}</h1>
            <p className="text-sm text-muted-foreground">落地执行指南</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {metaItem("生成时间", new Date(guide.metadata.generatedAt).toLocaleString())}
          {metaItem("执行周期", guide.metadata.implementationTimeframe)}
          {metaItem("预计阅读", `${guide.metadata.estimatedReadTime} 分钟`)}
          <Badge variant="secondary" className="text-base font-semibold">
            可信度: {guide.metadata.confidenceLevel}%
          </Badge>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => onDownload?.("pdf")} variant="default">
            <Download className="mr-2 h-4 w-4" /> 导出 PDF
          </Button>
          <Button onClick={() => onDownload?.("markdown")} variant="outline">
            <Download className="mr-2 h-4 w-4" /> 导出 Markdown
          </Button>
          <Button onClick={onShare} variant="ghost">
            <Share2 className="mr-2 h-4 w-4" /> 分享指南
          </Button>
        </div>
      </motion.header>

      {/* 新增：专家核心观点卡片 */}
      {guide.expertInsights && guide.expertInsights.keyQuotes.length > 0 && (
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-white to-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="h-5 w-5 text-purple-600" /> 💬 专家核心观点
            </CardTitle>
            <CardDescription className="text-sm">
              {guide.expertInsights.summary}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 专家共识 */}
            {guide.expertInsights.consensusPoints.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-sm font-semibold text-green-700 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  专家共识
                </h5>
                {bulletList(guide.expertInsights.consensusPoints)}
              </div>
            )}

            {/* 争议点 */}
            {guide.expertInsights.controversialPoints.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-sm font-semibold text-amber-700 flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  需要注意
                </h5>
                {bulletList(guide.expertInsights.controversialPoints)}
              </div>
            )}

            {/* 专家引用 */}
            <div className="space-y-2">
              <h5 className="text-sm font-semibold text-purple-700">关键引用</h5>
              <div className="grid gap-2">
                {guide.expertInsights.keyQuotes.map((quote, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-3 p-3 rounded-lg ${
                      quote.sentiment === 'positive'
                        ? 'bg-green-50 border border-green-200'
                        : quote.sentiment === 'negative'
                        ? 'bg-red-50 border border-red-200'
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      <Badge
                        variant={
                          quote.sentiment === 'positive'
                            ? 'default'
                            : quote.sentiment === 'negative'
                            ? 'destructive'
                            : 'secondary'
                        }
                        className="text-xs"
                      >
                        {quote.personaName}
                      </Badge>
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm text-gray-800 leading-relaxed">{quote.quote}</p>
                      <p className="text-xs text-gray-500">{quote.topic}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {guide.aiInsights && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="flex flex-col gap-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="h-5 w-5 text-primary" /> AI 洞察
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              来自落地教练智能体集群的快速总结。
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-3">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-medium text-emerald-700">整体评估</span>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>{guide.aiInsights.overallAssessment.summary}</p>
                <p>
                  <strong>评分:</strong> {guide.aiInsights.overallAssessment.score} / 10 - {guide.aiInsights.overallAssessment.level}级
                </p>
              </div>
              {bulletList(guide.aiInsights.overallAssessment.keyStrengths)}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium text-amber-700">关键挑战</span>
              </div>
              {bulletList(guide.aiInsights.overallAssessment.criticalChallenges)}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-sky-500" />
                <span className="text-sm font-medium text-sky-700">可持续性检查</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {guide.aiInsights.sustainabilityAnalysis.longTermViability}
              </p>
              <div className="grid gap-2">
                {bulletList(guide.aiInsights.sustainabilityAnalysis.persistenceFactors)}
                {bulletList(guide.aiInsights.sustainabilityAnalysis.riskMitigation)}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="situation" className="space-y-6">
        <TabsList>
          <TabsTrigger value="situation">当前形势</TabsTrigger>
          <TabsTrigger value="mvp">MVP 计划</TabsTrigger>
          <TabsTrigger value="business">商业计划</TabsTrigger>
          {executionEnabled && <TabsTrigger value="execution">执行计划</TabsTrigger>}
        </TabsList>

        <TabsContent value="situation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <BarChart3 className="h-5 w-5" /> 当前形势与校准
              </CardTitle>
              <CardDescription>{guide.currentSituation.summary}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {infoBlock('关键洞察', undefined, guide.currentSituation.keyInsights)}
                {infoBlock('市场现状', undefined, [
                  `市场规模: ${guide.currentSituation.marketReality.marketSize}`,
                  `竞争态势: ${guide.currentSituation.marketReality.competition}`
                ])}
                {infoBlock('机遇', undefined, guide.currentSituation.marketReality.opportunities)}
                {infoBlock('挑战', undefined, guide.currentSituation.marketReality.challenges)}
              </div>
              <Separator />
              <div className="grid gap-4 md:grid-cols-2">
                {infoBlock('目标用户', guide.currentSituation.userNeeds.targetUsers, guide.currentSituation.userNeeds.painPoints)}
                {infoBlock('建议方案', undefined, guide.currentSituation.userNeeds.solutions)}
              </div>
              <Separator />
              {infoBlock('立即行动', undefined, guide.currentSituation.actionItems)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mvp" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Rocket className="h-5 w-5" /> MVP 定义与验证
              </CardTitle>
              <CardDescription>{guide.mvpDefinition.productConcept.uniqueValue}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {infoBlock('核心功能', undefined, guide.mvpDefinition.productConcept.coreFeatures)}
              <Separator />
              <div className="grid gap-4 md:grid-cols-2">
                {infoBlock(
                  '开发计划',
                  guide.mvpDefinition.developmentPlan.estimatedCost,
                  guide.mvpDefinition.developmentPlan.phases.map(phase => `${phase.name} (${phase.duration}): ${phase.deliverables.join(', ')}`)
                )}
                {infoBlock('推荐技术栈', undefined, guide.mvpDefinition.developmentPlan.techStack)}
              </div>
              <Separator />
              {infoBlock('验证方法', guide.mvpDefinition.validationStrategy.timeline, [
                `关键假设: ${guide.mvpDefinition.validationStrategy.hypotheses.join(', ')}`,
                `实验方案: ${guide.mvpDefinition.validationStrategy.experiments.join(', ')}`,
                `成功指标: ${guide.mvpDefinition.validationStrategy.successMetrics.join(', ')}`
              ])}
              <Separator />
              {infoBlock('行动清单', undefined, guide.mvpDefinition.actionItems)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <TrendingUp className="h-5 w-5" /> 商业模式与运营
              </CardTitle>
              <CardDescription>{guide.businessExecution.businessModel.pricingStrategy}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {infoBlock('收入来源', undefined, guide.businessExecution.businessModel.revenueStreams)}
                {infoBlock('成本结构', undefined, guide.businessExecution.businessModel.costStructure)}
              </div>
              <Separator />
              {infoBlock('市场推广阶段', undefined, guide.businessExecution.launchStrategy.phases.map(
                phase => `${phase.name} (${phase.timeline}): ${phase.goals.join(', ')}`
              ))}

              {/* 新增：冷启动策略 */}
              {guide.businessExecution.launchStrategy.coldStart && (
                <>
                  <Separator />
                  <div className="space-y-4 rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
                    <h4 className="flex items-center gap-2 text-lg font-semibold text-blue-900">
                      <Rocket className="h-5 w-5" />
                      冷启动策略（前100个用户）
                    </h4>
                    <p className="text-sm text-blue-800 leading-relaxed">
                      {guide.businessExecution.launchStrategy.coldStart.strategy}
                    </p>
                    <div className="grid gap-3 md:grid-cols-2">
                      {infoBlock('🎯 目标客户', undefined, guide.businessExecution.launchStrategy.coldStart.targetCustomers)}
                      {infoBlock('📢 获客渠道', undefined, guide.businessExecution.launchStrategy.coldStart.acquisitionChannels)}
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {infoBlock('🤝 合作伙伴策略', undefined, guide.businessExecution.launchStrategy.coldStart.partnershipIdeas)}
                      {infoBlock('🔥 病毒传播机制', guide.businessExecution.launchStrategy.coldStart.viralMechanics)}
                    </div>
                  </div>
                </>
              )}

              <Separator />
              <div className="grid gap-4 md:grid-cols-2">
                {infoBlock('团队与流程准备', undefined, guide.businessExecution.operationalPlan.teamStructure)}
                {infoBlock('基础设施', undefined, guide.businessExecution.operationalPlan.infrastructure)}
              </div>
              <Separator />
              {infoBlock('风险管理', undefined, guide.businessExecution.operationalPlan.riskManagement)}

              {/* 新增：早期里程碑 */}
              {guide.businessExecution.earlyMilestones && (
                <>
                  <Separator />
                  <div className="space-y-4 rounded-lg border-2 border-green-200 bg-green-50 p-4">
                    <h4 className="flex items-center gap-2 text-lg font-semibold text-green-900">
                      <CheckCircle2 className="h-5 w-5" />
                      早期里程碑目标
                    </h4>

                    {/* 2周目标 */}
                    <div className="space-y-3">
                      <h5 className="font-medium text-green-800">📅 2周内快速验证</h5>
                      <div className="grid gap-3">
                        {guide.businessExecution.earlyMilestones.twoWeekGoals.map((goal, idx) => (
                          <Card key={idx} className="border-green-300 bg-white">
                            <CardContent className="p-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <p className="font-medium text-gray-800">{goal.title}</p>
                                  <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                                  <p className="text-xs text-green-700 mt-2 flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3" />
                                    成功标准: {goal.successCriteria}
                                  </p>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <Badge variant={goal.impact === 'high' ? 'default' : goal.impact === 'medium' ? 'secondary' : 'outline'} className="text-xs">
                                    影响: {goal.impact === 'high' ? '高' : goal.impact === 'medium' ? '中' : '低'}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    投入: {goal.effort === 'high' ? '高' : goal.effort === 'medium' ? '中' : '低'}
                                  </Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* 1个月目标 */}
                    <div className="space-y-3">
                      <h5 className="font-medium text-green-800">📅 1个月内重要成果</h5>
                      <div className="grid gap-3">
                        {guide.businessExecution.earlyMilestones.oneMonthGoals.map((goal, idx) => (
                          <Card key={idx} className="border-green-300 bg-white">
                            <CardContent className="p-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <p className="font-medium text-gray-800">{goal.title}</p>
                                  <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                                  <p className="text-xs text-green-700 mt-2 flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3" />
                                    成功标准: {goal.successCriteria}
                                  </p>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <Badge variant={goal.impact === 'high' ? 'default' : goal.impact === 'medium' ? 'secondary' : 'outline'} className="text-xs">
                                    影响: {goal.impact === 'high' ? '高' : goal.impact === 'medium' ? '中' : '低'}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    投入: {goal.effort === 'high' ? '高' : goal.effort === 'medium' ? '中' : '低'}
                                  </Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* 快赢行动 */}
                    {infoBlock('⚡ 立即可做的快赢行动', undefined, guide.businessExecution.earlyMilestones.quickWins)}
                  </div>
                </>
              )}

              <Separator />
              {infoBlock('行动清单', undefined, guide.businessExecution.actionItems)}
            </CardContent>
          </Card>
        </TabsContent>

        {executionEnabled && guide.executionPlan && (
          <TabsContent value="execution" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Compass className="h-5 w-5" /> 90天执行计划
                </CardTitle>
                <CardDescription>{guide.executionPlan.summary}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {infoBlock('阶段分解', undefined, guide.executionPlan.phases.map(
                  phase => `${phase.name} (${phase.timeline}): ${phase.focus}`
                ))}
                <Separator />
                {infoBlock('每周冲刺', undefined, guide.executionPlan.weeklySprints.map(
                  sprint => `${sprint.name}: ${sprint.focus}`
                ))}
                <Separator />
                {infoBlock('反馈循环', undefined, [
                  `节奏: ${guide.executionPlan.feedbackLoop.cadence.join(' / ')}`,
                  `渠道: ${guide.executionPlan.feedbackLoop.channels.join(' / ')}`,
                  `决策关卡: ${guide.executionPlan.feedbackLoop.decisionGates.join(' / ')}`,
                  `工具: ${guide.executionPlan.feedbackLoop.tooling.join(' / ')}`
                ])}
                <Separator />
                {infoBlock('日常例行', undefined, guide.executionPlan.dailyRoutines)}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
