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
            <p className="text-sm text-muted-foreground">Compiling the landing coach guide...</p>
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
            <p className="text-sm text-muted-foreground">Landing coach execution guide</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {metaItem("Generated", new Date(guide.metadata.generatedAt).toLocaleString())}
          {metaItem("Execution window", guide.metadata.implementationTimeframe)}
          {metaItem("Estimated read", `${guide.metadata.estimatedReadTime} min`)}
          <Badge variant="secondary" className="text-base font-semibold">
            Confidence: {guide.metadata.confidenceLevel}%
          </Badge>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => onDownload?.("pdf")} variant="default">
            <Download className="mr-2 h-4 w-4" /> Export PDF
          </Button>
          <Button onClick={() => onDownload?.("markdown")} variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export Markdown
          </Button>
          <Button onClick={onShare} variant="ghost">
            <Share2 className="mr-2 h-4 w-4" /> Share guide
          </Button>
        </div>
      </motion.header>

      {guide.aiInsights && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="flex flex-col gap-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="h-5 w-5 text-primary" /> AI perspective
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Fast summary from the landing coach agent collective.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-3">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-medium text-emerald-700">Overall assessment</span>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>{guide.aiInsights.overallAssessment.summary}</p>
                <p>
                  <strong>Score:</strong> {guide.aiInsights.overallAssessment.score} / 10 - level{' '}
                  {guide.aiInsights.overallAssessment.level}
                </p>
              </div>
              {bulletList(guide.aiInsights.overallAssessment.keyStrengths)}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium text-amber-700">Critical challenges</span>
              </div>
              {bulletList(guide.aiInsights.overallAssessment.criticalChallenges)}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-sky-500" />
                <span className="text-sm font-medium text-sky-700">Sustainability check</span>
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
          <TabsTrigger value="situation">Current situation</TabsTrigger>
          <TabsTrigger value="mvp">MVP plan</TabsTrigger>
          <TabsTrigger value="business">Commercial plan</TabsTrigger>
          {executionEnabled && <TabsTrigger value="execution">Execution plan</TabsTrigger>}
        </TabsList>

        <TabsContent value="situation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <BarChart3 className="h-5 w-5" /> Current situation & alignment
              </CardTitle>
              <CardDescription>{guide.currentSituation.summary}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {infoBlock('Key insights', undefined, guide.currentSituation.keyInsights)}
                {infoBlock('Market reality', undefined, [
                  `Market size: ${guide.currentSituation.marketReality.marketSize}`,
                  `Competitive landscape: ${guide.currentSituation.marketReality.competition}`
                ])}
                {infoBlock('Opportunities', undefined, guide.currentSituation.marketReality.opportunities)}
                {infoBlock('Challenges', undefined, guide.currentSituation.marketReality.challenges)}
              </div>
              <Separator />
              <div className="grid gap-4 md:grid-cols-2">
                {infoBlock('Target users', guide.currentSituation.userNeeds.targetUsers, guide.currentSituation.userNeeds.painPoints)}
                {infoBlock('Proposed solutions', undefined, guide.currentSituation.userNeeds.solutions)}
              </div>
              <Separator />
              {infoBlock('Immediate actions', undefined, guide.currentSituation.actionItems)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mvp" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Rocket className="h-5 w-5" /> MVP definition & validation
              </CardTitle>
              <CardDescription>{guide.mvpDefinition.productConcept.uniqueValue}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {infoBlock('Core capabilities', undefined, guide.mvpDefinition.productConcept.coreFeatures)}
              <Separator />
              <div className="grid gap-4 md:grid-cols-2">
                {infoBlock(
                  'Development plan',
                  guide.mvpDefinition.developmentPlan.estimatedCost,
                  guide.mvpDefinition.developmentPlan.phases.map(phase => `${phase.name} (${phase.duration}): ${phase.deliverables.join(', ')}`)
                )}
                {infoBlock('Recommended tech stack', undefined, guide.mvpDefinition.developmentPlan.techStack)}
              </div>
              <Separator />
              {infoBlock('Validation approach', guide.mvpDefinition.validationStrategy.timeline, [
                `Key hypotheses: ${guide.mvpDefinition.validationStrategy.hypotheses.join(', ')}`,
                `Experiments: ${guide.mvpDefinition.validationStrategy.experiments.join(', ')}`,
                `Success metrics: ${guide.mvpDefinition.validationStrategy.successMetrics.join(', ')}`
              ])}
              <Separator />
              {infoBlock('Action items', undefined, guide.mvpDefinition.actionItems)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <TrendingUp className="h-5 w-5" /> Business model & operations
              </CardTitle>
              <CardDescription>{guide.businessExecution.businessModel.pricingStrategy}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {infoBlock('Revenue streams', undefined, guide.businessExecution.businessModel.revenueStreams)}
                {infoBlock('Cost structure', undefined, guide.businessExecution.businessModel.costStructure)}
              </div>
              <Separator />
              {infoBlock('Go-to-market phases', undefined, guide.businessExecution.launchStrategy.phases.map(
                phase => `${phase.name} (${phase.timeline}): ${phase.goals.join(', ')}`
              ))}
              <Separator />
              <div className="grid gap-4 md:grid-cols-2">
                {infoBlock('Team & process readiness', undefined, guide.businessExecution.operationalPlan.teamStructure)}
                {infoBlock('Infrastructure', undefined, guide.businessExecution.operationalPlan.infrastructure)}
              </div>
              <Separator />
              {infoBlock('Risk management', undefined, guide.businessExecution.operationalPlan.riskManagement)}
              <Separator />
              {infoBlock('Action items', undefined, guide.businessExecution.actionItems)}
            </CardContent>
          </Card>
        </TabsContent>

        {executionEnabled && guide.executionPlan && (
          <TabsContent value="execution" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Compass className="h-5 w-5" /> 90-day execution plan
                </CardTitle>
                <CardDescription>{guide.executionPlan.summary}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {infoBlock('Phase breakdown', undefined, guide.executionPlan.phases.map(
                  phase => `${phase.name} (${phase.timeline}): ${phase.focus}`
                ))}
                <Separator />
                {infoBlock('Weekly sprints', undefined, guide.executionPlan.weeklySprints.map(
                  sprint => `${sprint.name}: ${sprint.focus}`
                ))}
                <Separator />
                {infoBlock('Feedback loop', undefined, [
                  `Cadence: ${guide.executionPlan.feedbackLoop.cadence.join(' / ')}`,
                  `Channels: ${guide.executionPlan.feedbackLoop.channels.join(' / ')}`,
                  `Decision gates: ${guide.executionPlan.feedbackLoop.decisionGates.join(' / ')}`,
                  `Tooling: ${guide.executionPlan.feedbackLoop.tooling.join(' / ')}`
                ])}
                <Separator />
                {infoBlock('Daily routines', undefined, guide.executionPlan.dailyRoutines)}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
