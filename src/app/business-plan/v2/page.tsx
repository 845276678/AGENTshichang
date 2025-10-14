'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { nanoid } from 'nanoid'

import { Layout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { ClarificationQuestion, ScenarioContext, ScenarioOutput } from '@/types/business-plan'

interface StageView {
  id: string
  name: string
  status: 'pending' | 'in_progress' | 'completed'
  progress: number
  estimatedTime: string
  deliverables: string[]
  aiProvider: string
}

export default function BusinessPlanV2Page() {
  const [ideaTitle, setIdeaTitle] = useState('')
  const [ideaDescription, setIdeaDescription] = useState('')
  const [industry, setIndustry] = useState('')
  const [targetCustomers, setTargetCustomers] = useState('')
  const [regions, setRegions] = useState('')
  const [channels, setChannels] = useState('')
  const [resources, setResources] = useState('')
  const [constraints, setConstraints] = useState('')

  const [loading, setLoading] = useState(false)
  const [scenario, setScenario] = useState<ScenarioOutput | null>(null)
  const [clarifications, setClarifications] = useState<ClarificationQuestion[]>([])
  const [stages, setStages] = useState<StageView[]>([])
  const [error, setError] = useState<string | null>(null)
  const [ideaId, setIdeaId] = useState<string | null>(null)

  const handleGenerate = async () => {
    setError(null)
    setScenario(null)
    setClarifications([])
    setStages([])

    if (!ideaTitle.trim() || !ideaDescription.trim()) {
      setError('请填写创意标题和描述')
      return
    }

    const context: Partial<ScenarioContext> = {
      industry: industry || undefined,
      targetCustomers: splitInput(targetCustomers),
      regions: splitInput(regions),
      channels: splitInput(channels),
      availableResources: splitInput(resources),
      constraints: splitInput(constraints)
    }

    setLoading(true)
    try {
      const response = await fetch('/api/generate-business-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaId: ideaId ?? nanoid(),
          ideaData: {
            title: ideaTitle,
            description: ideaDescription,
            category: industry || 'GENERAL',
            scenarioContext: context
          }
        })
      })

      const result = await response.json()
      if (!result.success) {
        setError(result.error || '生成失败')
        if (result.data?.scenario) {
          setScenario(result.data.scenario)
          setClarifications(result.data.clarifications || [])
        }
        return
      }

      setIdeaId(result.data.ideaId)
      setScenario(result.data.scenario)
      setClarifications(result.data.scenario.clarifications || [])
      setStages(
        (result.data.stages || []).map((stage: any) => ({
          id: stage.id,
          name: stage.name,
          status: stage.status,
          progress: stage.progress,
          estimatedTime: stage.estimatedTime,
          deliverables: stage.deliverables,
          aiProvider: stage.aiProvider
        }))
      )
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : '生成失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="container py-10 space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl font-semibold">创意实现建议生成（新增场景流程）</h1>
            <p className="text-muted-foreground">
              提交创意后系统将先生成场景可行性报告，再进行专业级的阶段式生成商业计划，涉及 DeepSeek、智谱 GLM、阿里通义千问三大模型。
            </p>
          </div>
        </motion.div>

        <Card>
          <CardHeader>
            <CardTitle>创意场景信息</CardTitle>
            <CardDescription>请填充具体细节可提高生成准确度，减少澄清问题。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="idea-title">创意标题</Label>
              <Input
                id="idea-title"
                placeholder="例如：AI 智能客服机器人供应链系统"
                value={ideaTitle}
                onChange={event => setIdeaTitle(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="idea-description">详细描述</Label>
              <Textarea
                id="idea-description"
                placeholder="描述要解决的问题、创造的价值、目标客户"
                value={ideaDescription}
                onChange={event => setIdeaDescription(event.target.value)}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">所属行业</Label>
              <Input
                id="industry"
                placeholder="零售、教育、医疗等"
                value={industry}
                onChange={event => setIndustry(event.target.value)}
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="target-customers">目标客户 (逗号分隔)</Label>
                <Input
                  id="target-customers"
                  placeholder="中小商店, 个体商户"
                  value={targetCustomers}
                  onChange={event => setTargetCustomers(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="regions">地区或城市</Label>
                <Input
                  id="regions"
                  placeholder="长沙, 深圳"
                  value={regions}
                  onChange={event => setRegions(event.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="channels">触达渠道</Label>
                <Input
                  id="channels"
                  placeholder="线上商城, 线下门店"
                  value={channels}
                  onChange={event => setChannels(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resources">可用资源</Label>
                <Input
                  id="resources"
                  placeholder="技术团队, 合作伙伴等"
                  value={resources}
                  onChange={event => setResources(event.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="constraints">潜在限制</Label>
              <Textarea
                id="constraints"
                placeholder="例如：监管要求、数据合规、供应商约束"
                value={constraints}
                onChange={event => setConstraints(event.target.value)}
                rows={2}
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleGenerate} disabled={loading}>
                {loading ? '分析生成中...' : '开始生成商业计划'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {loading && (
          <Card>
            <CardContent className="py-6">
              <div className="flex flex-col gap-3">
                <Progress value={20} />
                <span className="text-sm text-muted-foreground">系统正在验证创意场景...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-destructive/40 bg-destructive/10">
            <CardContent className="py-4">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {scenario && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="grid gap-6 lg:grid-cols-[2fr,1fr]">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>场景分析摘要</CardTitle>
                <CardDescription>
                  整体可行性 {scenario.feasibility.overall}，资源匹配度 {scenario.feasibility.resourceFit}，市场准备度 {scenario.feasibility.marketReadiness}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-relaxed text-muted-foreground">{scenario.summary}</p>
                <div>
                  <h4 className="text-sm font-medium mb-2">主要应用场景</h4>
                  <div className="flex flex-wrap gap-2">
                    {scenario.primaryUseCases.map(item => (
                      <Badge key={item} variant="secondary">{item}</Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">关键角色</h4>
                  {scenario.actors.map(actor => (
                    <div key={actor.name} className="rounded-md border p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{actor.name}</span>
                        <Badge variant="outline">{actor.role}</Badge>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">需求：{actor.needs.join(' / ')}</p>
                      <p className="text-xs text-muted-foreground">成功指标：{actor.successIndicators.join(' / ')}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">风险提示</h4>
                  {scenario.risks.map(risk => (
                    <div key={risk.detail} className="rounded-md bg-muted/60 p-3">
                      <p className="text-xs font-semibold">{risk.type.toUpperCase()} · {risk.severity}</p>
                      <p className="text-sm mt-1">{risk.detail}</p>
                      <p className="text-xs text-muted-foreground mt-1">缓解：{risk.mitigation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="h-full">
              <CardHeader>
                <CardTitle>下一步行动</CardTitle>
                <CardDescription>根据分析自动生成澄清 / 调研 / 试点建议。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {scenario.nextSteps.map(step => (
                  <div key={step.description} className="rounded-md border p-3">
                    <Badge className="mb-2" variant="outline">{step.type}</Badge>
                    <p className="text-sm leading-relaxed">{step.description}</p>
                  </div>
                ))}
                {clarifications.length > 0 && (
                  <div className="rounded-md border border-amber-300 bg-amber-50 p-3">
                    <p className="text-sm font-medium text-amber-800">需澄清信息</p>
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-amber-900">
                      {clarifications.map(item => (
                        <li key={item.id}>{item.question}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {stages.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>生成阶段</CardTitle>
              <CardDescription>验证通过后，生成后续各阶段将按以下顺序执行。</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {stages.map(stage => (
                <div key={stage.id} className="rounded-md border p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{stage.name}</p>
                      <p className="text-xs text-muted-foreground">AI 服务：{stage.aiProvider}</p>
                    </div>
                    <Badge variant={stage.status === 'completed' ? 'default' : 'outline'}>
                      {stage.status === 'completed' ? '已完成' : '待执行'}
                    </Badge>
                  </div>
                  <Progress value={stage.progress} className="h-1.5" />
                  <p className="text-xs text-muted-foreground">预计时间：{stage.estimatedTime}</p>
                  <div className="flex flex-wrap gap-1">
                    {stage.deliverables.map(item => (
                      <Badge key={item} variant="secondary" className="text-[10px]">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  )
}

function splitInput(value: string): string[] {
  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
}