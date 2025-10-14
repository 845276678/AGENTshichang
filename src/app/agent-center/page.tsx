'use client'

import React, { useState, useEffect } from 'react'
import { Layout } from '@/components/layout'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AnimatedSection } from '@/components/ui'
import {
  Sparkles,
  Users,
  Target,
  TrendingUp,
  Flame,
  ArrowRight,
  BarChart3,
  Lightbulb,
  BookOpen
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  getAgentsGroupedByModule,
  type Agent,
  type BiddingAgent,
  type WorkshopAgent,
  type AssessmentAgent
} from '@/lib/agent-registry'

interface AgentStats {
  [agentId: string]: {
    todayCount: number
    totalCount: number
    trending: boolean
  }
}

const AgentCenterPage = () => {
  const [agentStats, setAgentStats] = useState<AgentStats>({})
  const [loading, setLoading] = useState(true)

  // 获取分组的agents
  const agentGroups = getAgentsGroupedByModule()

  // 获取agent使用统计
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/agent/stats')
        if (response.ok) {
          const data = await response.json()
          setAgentStats(data.stats || {})
        }
      } catch (error) {
        console.error('Failed to fetch agent stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  // 渲染竞价Agent卡片
  const renderBiddingAgentCard = (agent: BiddingAgent, index: number) => {
    const stats = agentStats[agent.id]

    return (
      <motion.div
        key={agent.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <Link href="/marketplace/bidding">
          <Card className="group cursor-pointer border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="text-4xl">{agent.avatar}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                        {agent.name}
                      </h3>
                      {stats?.trending && (
                        <Flame className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {agent.role}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                {agent.description}
              </p>

              <div className="mb-3">
                <div className="text-xs font-medium text-muted-foreground mb-2">专长领域：</div>
                <div className="flex flex-wrap gap-1">
                  {agent.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mb-3 p-2 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground italic">
                  💬 "{agent.catchPhrase}"
                </p>
              </div>

              {!loading && stats && (
                <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-3 mb-3">
                  <span>今日服务</span>
                  <span className="font-semibold text-primary">{stats.todayCount} 次</span>
                </div>
              )}

              <div className="flex items-center text-sm text-primary font-medium">
                进入竞价市场
                <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    )
  }

  // 渲染工作坊Agent卡片
  const renderWorkshopAgentCard = (agent: WorkshopAgent, index: number) => {
    const stats = agentStats[agent.id]

    return (
      <motion.div
        key={agent.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <Link href="/workshops">
          <Card className="group cursor-pointer border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full bg-gradient-to-br from-blue-50/30 to-indigo-50/30">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="text-4xl">{agent.avatar}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors mb-1">
                      {agent.name}
                    </h3>
                    <Badge variant="outline" className="text-xs bg-white">
                      {agent.role}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-muted-foreground text-sm mb-3">
                {agent.description}
              </p>

              <div className="mb-3">
                <div className="text-xs font-medium text-muted-foreground mb-2">擅长工作坊：</div>
                {Object.entries(agent.expertise).slice(0, 2).map(([key, value]) => (
                  <div key={key} className="text-xs mb-1">
                    <span className="text-primary font-medium">• </span>
                    <span className="text-muted-foreground">{value}</span>
                  </div>
                ))}
                {Object.keys(agent.expertise).length > 2 && (
                  <div className="text-xs text-muted-foreground">
                    + 更多{Object.keys(agent.expertise).length - 2}个专业领域
                  </div>
                )}
              </div>

              {!loading && stats && (
                <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-3 mb-3">
                  <span>今日指导</span>
                  <span className="font-semibold text-primary">{stats.todayCount} 次</span>
                </div>
              )}

              <div className="flex items-center text-sm text-primary font-medium">
                开始工作坊
                <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    )
  }

  // 渲染评估Agent卡片
  const renderAssessmentAgentCard = (agent: AssessmentAgent, index: number) => {
    const stats = agentStats[agent.id]

    return (
      <motion.div
        key={agent.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <Link href="/maturity">
          <Card className="group cursor-pointer border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full bg-gradient-to-br from-orange-50/50 to-amber-50/50">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="text-4xl">{agent.avatar}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors mb-1">
                      {agent.name}
                    </h3>
                    <Badge variant="outline" className="text-xs bg-white">
                      {agent.role}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-muted-foreground text-sm mb-3">
                {agent.description}
              </p>

              <div className="mb-3">
                <div className="text-xs font-medium text-muted-foreground mb-2">评估维度：</div>
                <div className="grid grid-cols-1 gap-1">
                  {agent.dimensions.map((dim, idx) => (
                    <div key={idx} className="text-xs flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span className="text-muted-foreground">{dim}</span>
                    </div>
                  ))}
                </div>
              </div>

              {!loading && stats && (
                <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-3 mb-3">
                  <span>今日评估</span>
                  <span className="font-semibold text-primary">{stats.todayCount} 次</span>
                </div>
              )}

              <div className="flex items-center text-sm text-primary font-medium">
                开始评估
                <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    )
  }

  // 统计数据
  const totalAgents = agentGroups.bidding.length + agentGroups.workshop.length + agentGroups.assessment.length
  const totalInteractions = Object.values(agentStats).reduce((sum, stat) => sum + stat.totalCount, 0)

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-background via-background to-primary/5 py-16 lg:py-20">
        <div className="container">
          <AnimatedSection>
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">
                <Sparkles className="w-4 h-4 mr-2" />
                AI Agent能力中心
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                探索我们的AI Agent团队
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                {totalAgents}位专业AI Agent，覆盖创意竞价、工作坊指导、成熟度评估三大核心场景
                {!loading && totalInteractions > 0 && (
                  <>，已累计服务 <span className="text-primary font-semibold">{totalInteractions.toLocaleString()}</span> 次</>
                )}
              </p>
            </div>
          </AnimatedSection>

          {/* 统计卡片 */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <AnimatedSection delay={0.1}>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50/50 to-orange-50/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
                      <Target className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">竞价系统</h3>
                      <p className="text-sm text-muted-foreground">创意竞价师</p>
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="text-3xl font-bold">{agentGroups.bidding.length}</span>
                    <Link href="/marketplace/bidding">
                      <Button variant="outline" size="sm">
                        查看详情
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">工作坊系统</h3>
                      <p className="text-sm text-muted-foreground">专业导师</p>
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="text-3xl font-bold">{agentGroups.workshop.length}</span>
                    <Link href="/workshops">
                      <Button variant="outline" size="sm">
                        查看详情
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection delay={0.3}>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50/50 to-amber-50/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">评估系统</h3>
                      <p className="text-sm text-muted-foreground">成熟度分析</p>
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="text-3xl font-bold">{agentGroups.assessment.length}</span>
                    <Link href="/maturity">
                      <Button variant="outline" size="sm">
                        查看详情
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* 竞价系统 Agents */}
      <section className="py-12 border-b">
        <div className="container">
          <AnimatedSection>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
                  <Target className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">竞价系统 - AI竞价师</h2>
                  <p className="text-muted-foreground">多角度评估创意，提供专业竞价服务</p>
                </div>
              </div>
              <Link href="/marketplace/bidding">
                <Button variant="outline">
                  查看所有
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {agentGroups.bidding.map((agent, index) => renderBiddingAgentCard(agent, index))}
          </div>
        </div>
      </section>

      {/* 工作坊系统 Agents */}
      <section className="py-12 border-b bg-secondary/10">
        <div className="container">
          <AnimatedSection>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">工作坊系统 - 专业导师</h2>
                  <p className="text-muted-foreground">为您的项目提供全方位指导和支持</p>
                </div>
              </div>
              <Link href="/workshops">
                <Button variant="outline">
                  查看所有
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agentGroups.workshop.map((agent, index) => renderWorkshopAgentCard(agent, index))}
          </div>
        </div>
      </section>

      {/* 评估系统 Agents */}
      <section className="py-12">
        <div className="container">
          <AnimatedSection>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">评估系统 - 成熟度分析</h2>
                  <p className="text-muted-foreground">专业评估，助力创意优化</p>
                </div>
              </div>
              <Link href="/maturity">
                <Button variant="outline">
                  开始评估
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agentGroups.assessment.map((agent, index) => renderAssessmentAgentCard(agent, index))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-agent-500/5">
        <div className="container">
          <AnimatedSection>
            <div className="text-center max-w-2xl mx-auto">
              <Lightbulb className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">准备好开始了吗？</h2>
              <p className="text-lg text-muted-foreground mb-8">
                选择适合您的AI Agent，开启智能化创意孵化之旅
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/marketplace/bidding">
                  <Button size="lg" className="w-full sm:w-auto">
                    <Target className="mr-2 w-5 h-5" />
                    开始竞价
                  </Button>
                </Link>
                <Link href="/workshops">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    <BookOpen className="mr-2 w-5 h-5" />
                    进入工作坊
                  </Button>
                </Link>
                <Link href="/maturity">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    <BarChart3 className="mr-2 w-5 h-5" />
                    评估创意
                  </Button>
                </Link>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  )
}

export default AgentCenterPage
