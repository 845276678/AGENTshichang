'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Layout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AnimatedSection } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { AgentCard } from '@/components/agent/AgentCard'
import {
  ArrowRight,
  Sparkles,
  Zap,
  Brain,
  Briefcase,
  Star,
  TrendingUp,
  PlayCircle,
  Users,
  Activity
} from 'lucide-react'
import { getAgentsGroupedByModule } from '@/lib/agent-registry'
import type { Agent } from '@/lib/agent-registry'

const categories = [
  { name: '创意分享', count: '活跃', icon: Sparkles, gradient: 'from-pink-500 to-rose-500' },
  { name: 'AI竞价市场', count: '实时', icon: TrendingUp, gradient: 'from-purple-500 to-violet-500' },
  { name: '创意商店', count: '丰富', icon: Briefcase, gradient: 'from-blue-500 to-cyan-500' },
  { name: '积分经济', count: '循环', icon: Zap, gradient: 'from-orange-500 to-amber-500' },
]

const stats = [
  { label: '创意想法', value: '2,340+', icon: Sparkles },
  { label: 'AI助手', value: '12位', icon: Brain },
  { label: '积分流通', value: '50万+', icon: Zap },
  { label: '成功率', value: '87.3%', icon: Star },
]

const HeroSection = () => {
  const { isAuthenticated } = useAuth()

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
      <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-primary/20 to-agent-500/20 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-agent-500/20 to-primary/20 blur-3xl" />

      <div className="container relative">
        <div className="flex flex-col items-center text-center py-24 lg:py-32">
          <AnimatedSection delay={0.1}>
            <Badge variant="outline" className="mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              创意即财富 · 想法需行动
            </Badge>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <motion.h1
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 max-w-4xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              创意即财富{' '}
              <span className="bg-gradient-to-r from-primary via-agent-500 to-purple-600 bg-clip-text text-transparent">
                想法需行动
              </span>
            </motion.h1>
          </AnimatedSection>

          <AnimatedSection delay={0.3}>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl leading-relaxed">
              在创意竞价市场提交您的想法，让AI智能体为您的创意竞价，
              竞价成功后自动生成专业的创意实现建议，助力您的创意商业化。
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.4}>
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button
                size="lg"
                className="text-lg px-8 py-4 h-auto group"
                asChild
              >
                <Link href="/marketplace">
                  进入创意竞价市场
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-4 h-auto group"
                asChild
              >
                <Link href={isAuthenticated ? "/business-plan" : "/auth/register"}>
                  <PlayCircle className="mr-2 h-5 w-5" />
                  {isAuthenticated ? "查看实现建议" : "注册开始体验"}
                </Link>
              </Button>
            </div>
          </AnimatedSection>

          {/* Trust indicators */}
          <AnimatedSection delay={0.5}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="flex flex-col items-center"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}

const AgentCapabilityCenter = () => {
  const [agentStats, setAgentStats] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)

  // 获取Agent统计数据
  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/agent/stats')
        const data = await response.json()

        // 将统计数据转换为agentId -> stats映射
        const statsMap: Record<string, any> = {}
        if (data.stats) {
          data.stats.forEach((stat: any) => {
            if (!statsMap[stat.agentId]) {
              statsMap[stat.agentId] = {}
            }
            statsMap[stat.agentId][stat.module] = {
              totalUses: stat.totalUses,
              uniqueUsers: stat.uniqueUsers
            }
          })
        }

        setAgentStats(statsMap)
      } catch (error) {
        console.error('获取Agent统计失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  // 获取所有Agents并按模块分组
  const agentGroups = getAgentsGroupedByModule()

  // 计算Agent使用统计
  const getAgentUsageStats = (agent: Agent) => {
    const stats = agentStats[agent.id]
    if (!stats) {
      // 返回模拟数据以展示UI
      return {
        todayCount: Math.floor(Math.random() * 50) + 10,
        trending: Math.random() > 0.7
      }
    }

    const moduleStats = stats[agent.module]
    return {
      todayCount: moduleStats?.totalUses || 0,
      trending: moduleStats?.totalUses > 50
    }
  }

  // 计算总体统计
  const totalAgents = agentGroups.bidding.length + agentGroups.workshop.length + agentGroups.assessment.length
  const totalUsesToday = Object.values(agentStats).reduce((sum: number, stat: any) => {
    return sum + Object.values(stat as Record<string, any>).reduce((s: number, m: any) => s + (m.totalUses || 0), 0)
  }, 0)

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container">
        <AnimatedSection>
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <Brain className="w-4 h-4 mr-2" />
              Agent能力中心
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              认识我们的AI智能助手团队
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              从创意竞价到工作坊指导，从成熟度评估到专业咨询，AI助手团队为您的创意旅程提供全方位支持。
            </p>
          </div>
        </AnimatedSection>

        {/* 统计面板 */}
        <AnimatedSection delay={0.1}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">AI助手</p>
                    <p className="text-2xl font-bold">{totalAgents}位</p>
                    <p className="text-xs text-muted-foreground mt-1">专业角色</p>
                  </div>
                  <Brain className="w-10 h-10 text-primary/20" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">今日服务</p>
                    <p className="text-2xl font-bold">{loading ? '--' : totalUsesToday}</p>
                    <p className="text-xs text-green-600 mt-1">实时统计</p>
                  </div>
                  <Activity className="w-10 h-10 text-green-500/20" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">用户满意度</p>
                    <p className="text-2xl font-bold">98.5%</p>
                    <p className="text-xs text-muted-foreground mt-1">好评率</p>
                  </div>
                  <Star className="w-10 h-10 text-yellow-500/20" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">最受欢迎</p>
                    <p className="text-2xl font-bold truncate">艾克斯</p>
                    <p className="text-xs text-red-600 mt-1">🔥 本周冠军</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-red-500/20" />
                </div>
              </CardContent>
            </Card>
          </div>
        </AnimatedSection>

        {/* 竞价系统 - 5位AI竞价师 */}
        <AnimatedSection delay={0.2}>
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-1 bg-gradient-to-b from-purple-500 to-violet-500 rounded-full" />
              <div>
                <h3 className="text-2xl font-bold">🏆 竞价系统</h3>
                <p className="text-sm text-muted-foreground">5位AI竞价师为您的创意提供专业评估和竞价</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agentGroups.bidding.map((agent, index) => (
                <AnimatedSection key={agent.id} delay={0.1 + index * 0.05}>
                  <AgentCard
                    agent={agent}
                    usageStats={getAgentUsageStats(agent)}
                  />
                </AnimatedSection>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* 工作坊顾问 - 6位专业导师 */}
        <AnimatedSection delay={0.3}>
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-1 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full" />
              <div>
                <h3 className="text-2xl font-bold">🎓 工作坊顾问</h3>
                <p className="text-sm text-muted-foreground">6位专业导师在4个工作坊中提供全方位指导</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agentGroups.workshop.map((agent, index) => (
                <AnimatedSection key={agent.id} delay={0.1 + index * 0.05}>
                  <AgentCard
                    agent={agent}
                    usageStats={getAgentUsageStats(agent)}
                  />
                </AnimatedSection>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* 评估系统 - 1位综合分析师 */}
        <AnimatedSection delay={0.4}>
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-1 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full" />
              <div>
                <h3 className="text-2xl font-bold">📊 评估系统</h3>
                <p className="text-sm text-muted-foreground">基于10分制进行5维度综合评估</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agentGroups.assessment.map((agent) => (
                <AnimatedSection key={agent.id} delay={0.1}>
                  <AgentCard
                    agent={agent}
                    usageStats={getAgentUsageStats(agent)}
                  />
                </AnimatedSection>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* CTA 按钮 */}
        <AnimatedSection delay={0.5}>
          <div className="mt-12 text-center">
            <Link href="/agent-center">
              <Button size="lg" variant="outline" className="group">
                <Users className="mr-2 w-5 h-5" />
                查看完整Agent能力中心
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-4">
              📊 统计数据每日18:00更新 · 最后更新：今天18:00
            </p>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}

const CategoriesSection = () => {
  return (
    <section className="py-20 lg:py-28 bg-secondary/20">
      <div className="container">
        <AnimatedSection>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              平台生态循环
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              从创意分享到AI竞价，从专业改造到商店购买，体验完整的创意价值转换生态链。
            </p>
          </div>
        </AnimatedSection>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((categoryItem, index) => (
            <AnimatedSection key={categoryItem.name} delay={0.1 + index * 0.05}>
              <Link href={`/categories/${categoryItem.name.toLowerCase()}`}>
                <Card className="h-full group cursor-pointer hover:shadow-xl transition-all duration-300 border-0 bg-background/50 backdrop-blur">
                  <CardContent className="p-6 text-center">
                    <motion.div 
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${categoryItem.gradient} flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300`}
                      whileHover={{ rotate: 5 }}
                    >
                      <categoryItem.icon className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                      {categoryItem.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {categoryItem.count}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}

const FeaturesSection = () => {
  const features = [
    {
      icon: Sparkles,
      title: '创意即刻变现',
      description: '提交想法立即获得积分奖励，AI投资者实时竞价，让每个创意都有价值回报。'
    },
    {
      icon: Brain,
      title: 'AI智能评估',
      description: '多个AI投资者各具特色，用专业眼光评估创意价值，确保公平透明的竞价机制。'
    },
    {
      icon: TrendingUp,
      title: '价值螺旋上升',
      description: 'AI改造升级原创意，形成更完整方案，创造更高价值的创意产品生态。'
    }
  ]

  return (
    <section className="py-20 lg:py-28">
      <div className="container">
        <AnimatedSection>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              为什么选择创意交易市场？
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              加入数千名创意者的生态社区，体验前所未有的创意价值转换模式，让想法真正产生回报。
            </p>
          </div>
        </AnimatedSection>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <AnimatedSection key={feature.title} delay={0.1 + index * 0.1}>
              <Card className="h-full text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-background to-secondary/20">
                <CardHeader className="pb-4">
                  <motion.div 
                    className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 mx-auto"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <feature.icon className="w-8 h-8 text-primary" />
                  </motion.div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}

const CTASection = () => {
  const { isAuthenticated } = useAuth()

  return (
    <section className="py-20 lg:py-28">
      <div className="container">
        <AnimatedSection>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-agent-500/10 to-purple-500/10 p-8 md:p-16 text-center border">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br from-primary/30 to-agent-500/30 blur-2xl" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-gradient-to-br from-agent-500/30 to-purple-500/30 blur-2xl" />

            <div className="relative">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mb-6"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-agent-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
              </motion.div>

              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                准备体验创意竞价了吗？
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                立即进入创意竞价市场，提交您的创意想法，让AI智能体为您竞价，获得专业的创意实现建议！
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg px-8 py-4 h-auto group" asChild>
                  <Link href="/marketplace">
                    进入创意竞价市场
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-4 h-auto" asChild>
                  <Link href="/business-plan">
                    查看实现建议示例
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <Layout>
      <HeroSection />
      <AgentCapabilityCenter />
      <CategoriesSection />
      <FeaturesSection />
      <CTASection />
    </Layout>
  )
}