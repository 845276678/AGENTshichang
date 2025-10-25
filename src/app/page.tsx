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
import {
  ArrowRight,
  Sparkles,
  Zap,
  Brain,
  Briefcase,
  Building2,
  Star,
  TrendingUp,
  PlayCircle,
  Lightbulb,
  Target,
  BarChart3,
  CheckCircle
} from 'lucide-react'

const categories = [
  { name: '创意分享', count: '活跃', icon: Sparkles, gradient: 'from-pink-500 to-rose-500' },
  { name: '创意竞价', count: '实时', icon: TrendingUp, gradient: 'from-purple-500 to-violet-500' },
  { name: '专业工作坊', count: '丰富', icon: Briefcase, gradient: 'from-blue-500 to-cyan-500' },
  { name: '一人公司', count: '智能', icon: Building2, gradient: 'from-green-500 to-emerald-500' },
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
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {categories.map((categoryItem, index) => (
            <AnimatedSection key={categoryItem.name} delay={0.1 + index * 0.05}>
              <Link href={
                categoryItem.name === '创意竞价' ? '/marketplace' :
                categoryItem.name === '专业工作坊' ? '/workshops' :
                categoryItem.name === '一人公司' ? '/solo-company' :
                categoryItem.name === '创意分享' ? '/categories' :
                categoryItem.name === '积分经济' ? '/payment' :
                `/categories/${categoryItem.name.toLowerCase()}`
              }>
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
              为什么选择AI创意竞价？
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

const HowItWorksSection = () => {
  const steps = [
    {
      number: '01',
      title: '提交创意',
      description: '输入您的创意想法，进入AI竞价环节。5位专业AI竞价师会对您的创意进行评估和竞价。',
      icon: Lightbulb,
      color: 'from-purple-500 to-violet-500',
      link: '/marketplace',
      linkText: '开始竞价'
    },
    {
      number: '02',
      title: '专业工作坊',
      description: '竞价成功后，通过4个专业工作坊完善您的创意：需求验证、MVP构建、增长策略、盈利模式。',
      icon: Target,
      color: 'from-blue-500 to-cyan-500',
      link: '/workshops',
      linkText: '进入工作坊'
    },
    {
      number: '03',
      title: '一人公司',
      description: '获得个性化的商业计划和执行路线图，启动您的独立创业项目，成为独立创业者。',
      icon: Building2,
      color: 'from-green-500 to-emerald-500',
      link: '/solo-company',
      linkText: '启动公司'
    },
    {
      number: '04',
      title: '项目复盘',
      description: '记录项目进展，总结经验教训，持续优化改进。(功能即将上线)',
      icon: BarChart3,
      color: 'from-orange-500 to-amber-500',
      link: '#',
      linkText: '敬请期待',
      comingSoon: true
    }
  ]

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-br from-background via-secondary/10 to-background">
      <div className="container">
        <AnimatedSection>
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              <CheckCircle className="w-4 h-4 mr-2" />
              4步实现创意
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              从想法到现实的完整路径
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              跟随我们的4步指导流程，将您的创意想法转化为可执行的商业项目。
            </p>
          </div>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {steps.map((step, index) => (
            <AnimatedSection key={step.number} delay={0.1 + index * 0.1}>
              <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-background to-secondary/20 relative overflow-hidden group">
                {/* Step number badge */}
                <div className="absolute top-4 right-4 text-6xl font-bold text-primary/5 group-hover:text-primary/10 transition-colors">
                  {step.number}
                </div>

                <CardContent className="p-6 relative z-10">
                  <motion.div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <step.icon className="w-7 h-7 text-white" />
                  </motion.div>

                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                    {step.title}
                  </h3>

                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed min-h-[80px]">
                    {step.description}
                  </p>

                  {step.comingSoon ? (
                    <Badge variant="secondary" className="w-full justify-center py-2">
                      {step.linkText}
                    </Badge>
                  ) : (
                    <Link href={step.link}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full group/btn"
                      >
                        {step.linkText}
                        <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  )}
                </CardContent>

                {/* Connection line (except for last item) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-primary/50 to-transparent z-20" />
                )}
              </Card>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection delay={0.5}>
          <div className="text-center text-sm text-muted-foreground">
            <p>💡 提示：每个步骤都有专业的AI助手为您提供指导和建议</p>
          </div>
        </AnimatedSection>
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
      <HowItWorksSection />
      <CategoriesSection />
      <FeaturesSection />
      <CTASection />
    </Layout>
  )
}