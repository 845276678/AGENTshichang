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
  Target,
  Play,
  Trophy,
  Calendar,
  CheckCircle,
  Lightbulb,
  Users,
  TrendingUp,
  DollarSign,
  ArrowDown,
  Clock,
  Star,
  Sparkles
} from 'lucide-react'

export default function WorkshopRoadmapPage() {
  // 工作坊路线图配置
  const roadmap = [
    {
      id: 'demand-validation',
      step: 1,
      title: '创意完善计划书',
      subtitle: '需求验证实验室',
      duration: '45-60分钟',
      difficulty: '初级',
      icon: Target,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      description: '通过科学方法验证您的商业想法是否有市场需求，明确目标客户和核心价值',
      outcomes: [
        '明确目标客户群体画像',
        '识别客户核心痛点和需求',
        '设计市场验证方案',
        '制定需求验证行动计划'
      ],
      prerequisites: [],
      nextSteps: ['mvp-builder'],
      keyQuestions: [
        '谁会使用你的产品/服务?',
        '他们目前如何解决这个问题?',
        '你的方案为什么更好?',
        '如何验证真实需求?'
      ],
      tools: ['客户画像模板', '访谈问题清单', '验证计划表', 'AI需求分析助手']
    },
    {
      id: 'mvp-builder',
      step: 2,
      title: 'MVP构建工作坊',
      subtitle: '最小可行产品设计',
      duration: '80-100分钟',
      difficulty: '中级',
      icon: Play,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      description: '快速构建最小可行产品原型,验证核心价值假设,包含中国市场合规指导',
      outcomes: [
        '定义MVP核心功能和范围',
        '设计产品架构和技术方案',
        '制定前端开发实施计划',
        '完成MVP可行性评估',
        '确保中国市场合规性'
      ],
      prerequisites: ['demand-validation'],
      nextSteps: ['growth-hacking'],
      keyQuestions: [
        '核心功能是什么?(只做最重要的)',
        '如何快速验证价值假设?',
        '需要哪些技术栈?',
        '如何确保合规性?'
      ],
      tools: ['功能优先级矩阵', 'MVP画布', '技术选型指南', 'AI原型生成器']
    },
    {
      id: 'growth-hacking',
      step: 3,
      title: '推广工具',
      subtitle: '增长黑客训练营',
      duration: '90-120分钟',
      difficulty: '高级',
      icon: Trophy,
      color: 'from-purple-500 to-violet-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      description: '掌握数据驱动的增长策略和实验方法,快速扩大用户基础和业务规模',
      outcomes: [
        '设定SMART增长目标',
        '构建AARRR增长漏斗',
        '设计增长实验方案',
        '建立增长引擎机制'
      ],
      prerequisites: ['mvp-builder'],
      nextSteps: ['profit-model'],
      keyQuestions: [
        '当前的增长瓶颈在哪里?',
        '哪个渠道ROI最高?',
        '如何提高留存率?',
        '病毒式传播如何设计?'
      ],
      tools: ['增长漏斗分析', '实验设计模板', '渠道效果追踪', 'AI增长策略顾问']
    },
    {
      id: 'profit-model',
      step: 4,
      title: '盈利平台',
      subtitle: '商业模式设计',
      duration: '120-150分钟',
      difficulty: '高级',
      icon: Calendar,
      color: 'from-orange-500 to-amber-500',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      description: '构建可持续盈利的商业模式,实现从创意到收益的完整转化',
      outcomes: [
        '完成商业模式画布',
        '设计多元化收入模型',
        '规划盈利增长路径',
        '识别关键业务风险'
      ],
      prerequisites: ['growth-hacking'],
      nextSteps: [],
      keyQuestions: [
        '如何从用户获取价值?',
        '定价策略是什么?',
        '成本结构如何优化?',
        '现金流如何管理?'
      ],
      tools: ['商业画布', '财务模型模板', '定价策略分析', 'AI盈利顾问']
    }
  ]

  const advantages = [
    {
      icon: Sparkles,
      title: 'AI全程辅助',
      description: '每个工作坊都配备专业AI助手,提供实时指导和智能建议'
    },
    {
      icon: Users,
      title: '实战案例',
      description: '结合3000+真实创业案例,提供可借鉴的成功经验'
    },
    {
      icon: CheckCircle,
      title: '可交付成果',
      description: '每个工作坊都生成专业文档,可直接用于融资或执行'
    },
    {
      icon: TrendingUp,
      title: '渐进式学习',
      description: '从验证需求到盈利模式,系统化学习创业全流程'
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
              <Target className="w-4 h-4 mr-2" />
              工作坊学习路线图
            </Badge>

            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              从创意到盈利的
              <span className="bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
                {' '}完整路径
              </span>
            </motion.h1>

            <motion.p
              className="text-xl text-muted-foreground mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              4个专业工作坊 · 系统化学习 · AI全程辅助 · 可交付成果
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Button size="lg" asChild className="group">
                <Link href="/workshops">
                  开始第一个工作坊
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/marketplace">
                  <Lightbulb className="mr-2 h-5 w-5" />
                  先进行创意竞价
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Roadmap Timeline */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            {roadmap.map((workshop, index) => (
              <motion.div
                key={workshop.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative"
              >
                {/* Connection Line */}
                {index < roadmap.length - 1 && (
                  <div className="absolute left-8 top-24 w-0.5 h-24 bg-gradient-to-b from-primary/50 to-transparent" />
                )}

                <Card className={`mb-8 border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${workshop.bgColor}`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-6">
                      {/* Step Indicator */}
                      <div className="flex flex-col items-center">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${workshop.color} flex items-center justify-center shadow-lg`}>
                          <workshop.icon className="w-8 h-8 text-white" />
                        </div>
                        <div className="mt-2 text-sm font-bold text-primary">
                          STEP {workshop.step}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-2xl">{workshop.title}</CardTitle>
                          <Badge variant="secondary" className="text-xs">
                            {workshop.difficulty}
                          </Badge>
                        </div>
                        <CardDescription className="text-base mb-4">
                          {workshop.subtitle}
                        </CardDescription>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{workshop.duration}</span>
                          </div>
                          {workshop.prerequisites.length > 0 && (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span>需要完成前置工作坊</span>
                            </div>
                          )}
                        </div>

                        <p className="text-muted-foreground leading-relaxed mb-6">
                          {workshop.description}
                        </p>

                        {/* Outcomes */}
                        <div className="grid md:grid-cols-2 gap-4 mb-6">
                          <div>
                            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                              <Star className="w-4 h-4 text-yellow-600" />
                              核心成果
                            </h4>
                            <div className="space-y-2">
                              {workshop.outcomes.map((outcome, i) => (
                                <div key={i} className="flex items-start gap-2 text-sm">
                                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                                  <span>{outcome}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                              <Lightbulb className="w-4 h-4 text-blue-600" />
                              关键问题
                            </h4>
                            <div className="space-y-2">
                              {workshop.keyQuestions.map((question, i) => (
                                <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                  <span className="text-primary font-medium shrink-0">{i + 1}.</span>
                                  <span>{question}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Tools */}
                        <div className="mb-4">
                          <h4 className="font-semibold text-sm mb-2">配套工具:</h4>
                          <div className="flex flex-wrap gap-2">
                            {workshop.tools.map((tool, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {tool}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* CTA */}
                        <div className="flex items-center gap-3">
                          <Button asChild className="group">
                            <Link href={`/workshops/${workshop.id}`}>
                              进入工作坊
                              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                          </Button>
                          {workshop.nextSteps.length > 0 && (
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <ArrowDown className="w-4 h-4" />
                              完成后进入下一步
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="py-20 bg-secondary/20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              为什么选择我们的工作坊?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              结合AI技术和实战经验,提供最高效的创业学习路径
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {advantages.map((advantage, index) => (
              <motion.div
                key={advantage.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="h-full border-0 shadow-sm hover:shadow-md transition-all duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                      <advantage.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{advantage.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {advantage.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              准备开始您的创业之旅了吗?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              从第一个工作坊开始,系统化学习创业知识,AI全程辅助您的每一步。
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="group">
                <Link href="/workshops">
                  开始第一个工作坊
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/creative-hub">
                  <Sparkles className="mr-2 h-5 w-5" />
                  了解完整创意中心
                </Link>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mt-6">
              💡 提示: 建议先完成<Link href="/marketplace" className="text-primary underline">创意竞价</Link>获得专业评估后,再开始工作坊学习
            </p>
          </div>
        </div>
      </section>
    </Layout>
  )
}
