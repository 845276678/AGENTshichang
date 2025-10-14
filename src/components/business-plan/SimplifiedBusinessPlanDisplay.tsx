"use client"

import React from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Users,
  Target,
  Rocket,
  TestTube,
  DollarSign,
  Download,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  Brain,
  Layers
} from "lucide-react"

import type { SimplifiedBusinessPlan } from "@/lib/business-plan/simplified-guide-structure"

interface SimplifiedBusinessPlanDisplayProps {
  plan: SimplifiedBusinessPlan
  isLoading?: boolean
  onDownload?: (format: "pdf" | "docx" | "markdown" | "txt") => void
  onShare?: () => void
}

const InfoBlock = ({
  title,
  icon: Icon,
  children,
  variant = "default"
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
  variant?: "default" | "success" | "warning" | "info"
}) => {
  const variantStyles = {
    default: "border-gray-200 bg-white",
    success: "border-green-200 bg-green-50",
    warning: "border-amber-200 bg-amber-50",
    info: "border-blue-200 bg-blue-50"
  }

  return (
    <div className={`rounded-lg border p-4 ${variantStyles[variant]}`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-5 w-5 text-primary" />
        <h4 className="font-semibold">{title}</h4>
      </div>
      {children}
    </div>
  )
}

const ListItems = ({ items }: { items: string[] }) => (
  <ul className="space-y-2">
    {items.map((item, idx) => (
      <li key={idx} className="flex gap-2 text-sm text-muted-foreground">
        <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
        <span>{item}</span>
      </li>
    ))}
  </ul>
)

const PriorityBadge = ({ priority }: { priority: 'critical' | 'important' | 'nice-to-have' }) => {
  const variants = {
    critical: "bg-red-100 text-red-800",
    important: "bg-amber-100 text-amber-800",
    'nice-to-have': "bg-gray-100 text-gray-800"
  }

  const labels = {
    critical: "关键",
    important: "重要",
    'nice-to-have': "可选"
  }

  return (
    <Badge className={`text-xs ${variants[priority]}`}>
      {labels[priority]}
    </Badge>
  )
}

const RiskLevel = ({ level }: { level: 'high' | 'medium' | 'low' }) => {
  const variants = {
    high: "text-red-600 bg-red-50",
    medium: "text-amber-600 bg-amber-50",
    low: "text-green-600 bg-green-50"
  }

  const icons = {
    high: "🔴",
    medium: "🟡",
    low: "🟢"
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${variants[level]}`}>
      {icons[level]} {level === 'high' ? '高风险' : level === 'medium' ? '中风险' : '低风险'}
    </span>
  )
}

export default function SimplifiedBusinessPlanDisplay({
  plan,
  isLoading = false,
  onDownload,
  onShare
}: SimplifiedBusinessPlanDisplayProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-80 text-center">
          <CardContent className="space-y-4 p-8">
            <Brain className="mx-auto h-10 w-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">正在生成简化版创意实现建议...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getContentDepthInfo = (depth: string) => {
    const info = {
      basic: { label: "基础版", color: "bg-blue-100 text-blue-800", desc: "核心要点，聚焦验证" },
      detailed: { label: "详细版", color: "bg-green-100 text-green-800", desc: "全面分析，实施指导" },
      comprehensive: { label: "完整版", color: "bg-purple-100 text-purple-800", desc: "深度洞察，投资级别" }
    }
    return info[depth as keyof typeof info] || info.detailed
  }

  const depthInfo = getContentDepthInfo(plan.metadata.contentDepth)

  return (
    <div className="space-y-8">
      {/* 头部信息 */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4 rounded-xl border bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-primary/10 p-3 text-primary">
            <Layers className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">{plan.metadata.ideaTitle}</h1>
            <p className="text-sm text-muted-foreground">简化版创意实现建议</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground/80">生成时间</span>
            <span>{new Date(plan.metadata.generatedAt).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground/80">成熟度评分</span>
            <Badge variant="secondary">{plan.metadata.maturityScore}/10</Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground/80">内容版本</span>
            <Badge className={depthInfo.color}>{depthInfo.label}</Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground/80">可信度</span>
            <Badge variant="outline">{Math.round(plan.metadata.confidence * 100)}%</Badge>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">{depthInfo.desc}</p>

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => onDownload?.("pdf")} variant="default">
            <Download className="mr-2 h-4 w-4" /> 导出 PDF
          </Button>
          <Button onClick={() => onDownload?.("markdown")} variant="outline">
            <Download className="mr-2 h-4 w-4" /> 导出 Markdown
          </Button>
          <Button onClick={onShare} variant="ghost">
            <Share2 className="mr-2 h-4 w-4" /> 分享计划
          </Button>
        </div>
      </motion.header>

      {/* AI专家贡献信息 */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-purple-600" /> AI专家团队贡献
          </CardTitle>
          <CardDescription>
            本计划书由5位AI专家协作完成，每位专家负责特定模块的内容生成
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {plan.metadata.aiContributors.map((expert, idx) => (
              <div key={idx} className="text-center p-3 rounded-lg bg-white border">
                <div className="text-sm font-medium text-purple-700">{expert}</div>
                <div className="text-xs text-purple-600 mt-1">
                  {idx === 0 && "投资与商业模式"}
                  {idx === 1 && "技术架构设计"}
                  {idx === 2 && "用户情感体验"}
                  {idx === 3 && "运营推广策略"}
                  {idx === 4 && "理论框架指导"}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">用户市场</TabsTrigger>
          <TabsTrigger value="product">产品技术</TabsTrigger>
          <TabsTrigger value="validation">验证迭代</TabsTrigger>
          <TabsTrigger value="business">商业资源</TabsTrigger>
        </TabsList>

        {/* 模块1：用户需求与市场 */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Users className="h-5 w-5" /> 用户需求与市场定位
              </CardTitle>
              <CardDescription>明确目标用户、市场机会和应用场景</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <InfoBlock title="目标用户" icon={Target}>
                  <div className="space-y-3">
                    <div>
                      <h5 className="text-sm font-medium text-green-700 mb-2">核心用户群体</h5>
                      <p className="text-sm text-gray-700">{plan.userAndMarket.targetUsers.primary}</p>
                    </div>
                    {plan.userAndMarket.targetUsers.secondary && (
                      <div>
                        <h5 className="text-sm font-medium text-blue-700 mb-2">次要用户群体</h5>
                        <p className="text-sm text-gray-700">{plan.userAndMarket.targetUsers.secondary}</p>
                      </div>
                    )}
                    <div>
                      <h5 className="text-sm font-medium mb-2">用户特征</h5>
                      <ListItems items={plan.userAndMarket.targetUsers.characteristics} />
                    </div>
                  </div>
                </InfoBlock>

                <InfoBlock title="用户痛点" icon={AlertTriangle} variant="warning">
                  <ListItems items={plan.userAndMarket.targetUsers.painPoints} />
                </InfoBlock>
              </div>

              <Separator />

              <InfoBlock title="市场分析" icon={TrendingUp} variant="info">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h5 className="text-sm font-medium mb-2">市场规模</h5>
                    <p className="text-sm text-gray-700">{plan.userAndMarket.marketAnalysis.size}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium mb-2">主要竞争对手</h5>
                    <ListItems items={plan.userAndMarket.marketAnalysis.competitors} />
                  </div>
                  <div>
                    <h5 className="text-sm font-medium mb-2">市场趋势</h5>
                    <ListItems items={plan.userAndMarket.marketAnalysis.trends} />
                  </div>
                  <div>
                    <h5 className="text-sm font-medium mb-2">市场机会</h5>
                    <ListItems items={plan.userAndMarket.marketAnalysis.opportunities} />
                  </div>
                </div>
              </InfoBlock>

              <Separator />

              <InfoBlock title="应用场景" icon={Layers} variant="success">
                <div className="space-y-3">
                  <div>
                    <h5 className="text-sm font-medium text-green-700 mb-2">主要应用场景</h5>
                    <p className="text-sm text-gray-700">{plan.userAndMarket.applicationScenarios.primary}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium mb-2">次要应用场景</h5>
                    <ListItems items={plan.userAndMarket.applicationScenarios.secondary} />
                  </div>
                  <div>
                    <h5 className="text-sm font-medium mb-2">具体用例</h5>
                    <ListItems items={plan.userAndMarket.applicationScenarios.useCases} />
                  </div>
                </div>
              </InfoBlock>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 模块2：产品方案与技术 */}
        <TabsContent value="product" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Rocket className="h-5 w-5" /> 产品方案与技术实现
              </CardTitle>
              <CardDescription>{plan.productAndTech.coreValue}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <InfoBlock title="核心功能" icon={CheckCircle2} variant="success">
                  <ListItems items={plan.productAndTech.keyFeatures} />
                </InfoBlock>

                <InfoBlock title="差异化优势" icon={TrendingUp}>
                  <ListItems items={plan.productAndTech.differentiators} />
                </InfoBlock>
              </div>

              <Separator />

              <InfoBlock title="技术栈" icon={Brain} variant="info">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h5 className="text-sm font-medium text-blue-700 mb-2">推荐技术栈</h5>
                    <ListItems items={plan.productAndTech.techStack.recommended} />
                  </div>
                  <div>
                    <h5 className="text-sm font-medium mb-2">备选方案</h5>
                    <ListItems items={plan.productAndTech.techStack.alternatives} />
                  </div>
                  <div className="md:col-span-2">
                    <h5 className="text-sm font-medium mb-2">选择理由</h5>
                    <p className="text-sm text-gray-700">{plan.productAndTech.techStack.reasoning}</p>
                  </div>
                </div>
              </InfoBlock>

              <Separator />

              <InfoBlock title="开发计划" icon={Clock}>
                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm font-medium mb-2">MVP功能清单</h5>
                    <ListItems items={plan.productAndTech.developmentPlan.mvpFeatures} />
                  </div>
                  <div>
                    <h5 className="text-sm font-medium mb-2">开发时间线</h5>
                    <p className="text-sm text-gray-700">{plan.productAndTech.developmentPlan.timeline}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium mb-2">开发里程碑</h5>
                    <div className="space-y-3">
                      {plan.productAndTech.developmentPlan.milestones.map((milestone, idx) => (
                        <div key={idx} className="border rounded-lg p-3 bg-gray-50">
                          <div className="flex items-center justify-between mb-2">
                            <h6 className="font-medium">{milestone.phase}</h6>
                            <Badge variant="outline">{milestone.duration}</Badge>
                          </div>
                          <ListItems items={milestone.deliverables} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </InfoBlock>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 模块3：验证策略与迭代 */}
        <TabsContent value="validation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <TestTube className="h-5 w-5" /> 验证策略与迭代路径
              </CardTitle>
              <CardDescription>系统性验证假设，持续优化产品</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoBlock title="核心假设" icon={Brain}>
                <ListItems items={plan.validationAndIteration.hypotheses} />
              </InfoBlock>

              <Separator />

              <InfoBlock title="验证方法" icon={TestTube} variant="info">
                <div className="space-y-3">
                  {plan.validationAndIteration.validationMethods.map((method, idx) => (
                    <div key={idx} className="border rounded-lg p-3 bg-blue-50">
                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <h6 className="font-medium text-blue-800 mb-1">{method.method}</h6>
                          <p className="text-sm text-blue-700">时间安排: {method.timeline}</p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-700 mb-2">成功标准: {method.successCriteria}</p>
                          <div className="text-xs">
                            <span className="font-medium">所需资源: </span>
                            {method.resources.join(', ')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </InfoBlock>

              <Separator />

              <InfoBlock title="迭代计划" icon={Clock} variant="success">
                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm font-medium mb-3">迭代周期</h5>
                    <div className="space-y-3">
                      {plan.validationAndIteration.iterationPlan.cycles.map((cycle, idx) => (
                        <div key={idx} className="border rounded-lg p-3 bg-green-50">
                          <div className="flex items-center justify-between mb-2">
                            <h6 className="font-medium text-green-800">{cycle.focus}</h6>
                            <Badge className="bg-green-200 text-green-800">{cycle.duration}</Badge>
                          </div>
                          <div className="grid gap-2 md:grid-cols-2 text-sm">
                            <div>
                              <span className="font-medium">实验内容: </span>
                              {cycle.experiments.join(', ')}
                            </div>
                            <div>
                              <span className="font-medium">关键指标: </span>
                              {cycle.metrics.join(', ')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <h5 className="text-sm font-medium mb-2">反馈渠道</h5>
                      <ListItems items={plan.validationAndIteration.iterationPlan.feedbackChannels} />
                    </div>
                    <div>
                      <h5 className="text-sm font-medium mb-2">决策框架</h5>
                      <p className="text-sm text-gray-700">{plan.validationAndIteration.iterationPlan.decisionFramework}</p>
                    </div>
                  </div>
                </div>
              </InfoBlock>

              <Separator />

              <InfoBlock title="风险缓解" icon={AlertTriangle} variant="warning">
                <div className="space-y-3">
                  {plan.validationAndIteration.riskMitigation.map((risk, idx) => (
                    <div key={idx} className="border rounded-lg p-3 bg-amber-50">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h6 className="font-medium text-amber-800 mb-1">{risk.risk}</h6>
                          <p className="text-sm text-amber-700">{risk.mitigation}</p>
                        </div>
                        <RiskLevel level={risk.impact} />
                      </div>
                    </div>
                  ))}
                </div>
              </InfoBlock>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 模块4：商业模式与资源 */}
        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <DollarSign className="h-5 w-5" /> 商业模式与资源规划
              </CardTitle>
              <CardDescription>{plan.businessAndResources.businessModel.pricingStrategy}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <InfoBlock title="商业模式" icon={DollarSign} variant="success">
                  <div className="space-y-3">
                    <div>
                      <h5 className="text-sm font-medium mb-2">收入来源</h5>
                      <ListItems items={plan.businessAndResources.businessModel.revenueStreams} />
                    </div>
                    <div>
                      <h5 className="text-sm font-medium mb-2">成本结构</h5>
                      <ListItems items={plan.businessAndResources.businessModel.costStructure} />
                    </div>
                    <div>
                      <h5 className="text-sm font-medium mb-2">关键指标</h5>
                      <ListItems items={plan.businessAndResources.businessModel.keyMetrics} />
                    </div>
                  </div>
                </InfoBlock>

                <InfoBlock title="团队构成" icon={Users}>
                  <div className="space-y-3">
                    {plan.businessAndResources.teamAndResources.coreTeam.map((member, idx) => (
                      <div key={idx} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h6 className="font-medium">{member.role}</h6>
                          <PriorityBadge priority={member.priority} />
                        </div>
                        <div className="text-sm text-gray-700">
                          <span className="font-medium">技能要求: </span>
                          {member.skills.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </InfoBlock>
              </div>

              <Separator />

              <InfoBlock title="预算规划" icon={DollarSign} variant="info">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h5 className="text-sm font-medium mb-2">开发预算</h5>
                    <p className="text-sm text-gray-700">{plan.businessAndResources.teamAndResources.budget.development}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium mb-2">营销预算</h5>
                    <p className="text-sm text-gray-700">{plan.businessAndResources.teamAndResources.budget.marketing}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium mb-2">运营预算</h5>
                    <p className="text-sm text-gray-700">{plan.businessAndResources.teamAndResources.budget.operations}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium mb-2">预算周期</h5>
                    <p className="text-sm text-gray-700">{plan.businessAndResources.teamAndResources.budget.timeline}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <h5 className="text-sm font-medium mb-2">潜在合作伙伴</h5>
                  <ListItems items={plan.businessAndResources.teamAndResources.partnerships} />
                </div>
              </InfoBlock>

              <Separator />

              <InfoBlock title="启动策略" icon={Rocket}>
                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm font-medium mb-3">推广阶段</h5>
                    <div className="space-y-3">
                      {plan.businessAndResources.launchStrategy.phases.map((phase, idx) => (
                        <div key={idx} className="border rounded-lg p-3 bg-gray-50">
                          <div className="flex items-center justify-between mb-2">
                            <h6 className="font-medium">{phase.name}</h6>
                            <Badge variant="outline">{phase.timeline}</Badge>
                          </div>
                          <div className="grid gap-2 md:grid-cols-2 text-sm">
                            <div>
                              <span className="font-medium">阶段目标: </span>
                              {phase.goals.join(', ')}
                            </div>
                            <div>
                              <span className="font-medium">具体策略: </span>
                              {phase.tactics.join(', ')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <h5 className="text-sm font-medium mb-2">推广渠道</h5>
                      <ListItems items={plan.businessAndResources.launchStrategy.channels} />
                    </div>
                    <div>
                      <h5 className="text-sm font-medium mb-2">成功指标</h5>
                      <ListItems items={plan.businessAndResources.launchStrategy.metrics} />
                    </div>
                  </div>
                </div>
              </InfoBlock>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}