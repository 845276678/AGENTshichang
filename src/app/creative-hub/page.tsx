'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Layout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowRight,
  Sparkles,
  TrendingUp,
  Target,
  Building2,
  Users,
  Trophy,
  Zap,
  BookOpen,
  Rocket,
  BarChart3,
  CheckCircle
} from 'lucide-react'

export default function CreativeHubPage() {
  const sections = [
    {
      id: 'bidding',
      title: '创意竞价',
      subtitle: 'AI专家团队为您的创意竞价',
      description: '提交您的创意想法，让5位专业AI竞价师进行实时评估和竞价。获得专业的市场价值分析和改进建议。',
      icon: TrendingUp,
      iconBg: 'from-purple-500 to-violet-500',
      stats: [
        { label: '专业AI竞价师', value: '5位' },
        { label: '平均评估时间', value: '60秒' },
        { label: '成功率', value: '98%' }
      ],
      features: [
        '实时AI竞价系统',
        '专业市场评估',
        '多维度创意分析',
        '竞价结果报告'
      ],
      link: '/marketplace',
      linkText: '开始竞价',
      badge: '热门'
    },
    {
      id: 'workshops',
      title: '专业工作坊',
      subtitle: '4个专业工作坊完善您的创意',
      description: '通过系统化的工作坊流程，从需求验证到盈利模式，全方位完善您的创意项目。',
      icon: Target,
      iconBg: 'from-blue-500 to-cyan-500',
      stats: [
        { label: '工作坊数量', value: '4个' },
        { label: '专业导师', value: '6位' },
        { label: '平均完成时间', value: '90分钟' }
      ],
      features: [
        '需求验证实验室',
        'MVP构建工作坊',
        '增长黑客训练营',
        '盈利模式设计'
      ],
      link: '/workshops',
      linkText: '进入工作坊',
      badge: '推荐'
    },
    {
      id: 'solo-company',
      title: '一人公司',
      subtitle: '从创意到独立创业',
      description: '获得个性化的商业计划和执行路线图，启动您的独立创业项目，成为独立创业者。',
      icon: Building2,
      iconBg: 'from-green-500 to-emerald-500',
      stats: [
        { label: '商业计划生成', value: '自动' },
        { label: '日程规划系统', value: '智能' },
        { label: '成功案例', value: '200+' }
      ],
      features: [
        '个性化商业计划',
        '智能日程规划',
        '资源对接平台',
        '创业指导服务'
      ],
      link: '/solo-company',
      linkText: '启动公司',
      badge: '新上线'
    }
  ]

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 py-20">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-500/20 to-primary/20 blur-3xl" />

        <div className="container relative">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              创意中心 · 一站式创业服务
            </Badge>

            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              从创意到现实的
              <span className="bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent">
                {' '}完整旅程
              </span>
            </motion.h1>

            <motion.p
              className="text-xl text-muted-foreground mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              AI竞价评估 → 专业工作坊打磨 → 独立公司启动
            </motion.p>

            <motion.div
              className="flex flex-wrap justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>12位AI专家</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>4个专业工作坊</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>全程AI辅助</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Sections */}
      <section className="py-20">
        <div className="container">
          <div className="space-y-16">
            {sections.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <CardHeader className="bg-gradient-to-br from-background to-secondary/20 pb-8">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${section.iconBg} flex items-center justify-center shadow-lg`}>
                          <section.icon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-2xl">{section.title}</CardTitle>
                            {section.badge && (
                              <Badge variant="secondary" className="text-xs">
                                {section.badge}
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="text-base">
                            {section.subtitle}
                          </CardDescription>
                        </div>
                      </div>

                      <Button size="lg" asChild className="group">
                        <Link href={section.link}>
                          {section.linkText}
                          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                      {/* Description */}
                      <div className="md:col-span-2">
                        <p className="text-muted-foreground leading-relaxed mb-6">
                          {section.description}
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                          {section.features.map((feature) => (
                            <div
                              key={feature}
                              className="flex items-center gap-2 text-sm"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="space-y-3">
                        {section.stats.map((stat) => (
                          <div
                            key={stat.label}
                            className="bg-secondary/30 rounded-lg p-4"
                          >
                            <div className="text-2xl font-bold text-primary mb-1">
                              {stat.value}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {stat.label}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-secondary/20">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              准备开始您的创业旅程了吗？
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              从提交创意到启动公司，我们为您提供全程AI辅助和专业指导。
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="group">
                <Link href="/marketplace">
                  开始创意竞价
                  <Rocket className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/workshops">
                  <BookOpen className="mr-2 h-5 w-5" />
                  浏览工作坊
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}
